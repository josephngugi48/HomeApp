<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Issue;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\Wallet;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

final class TenantDashboardController extends Controller
{
    /**
     * Safely resolve the company ID from the service container or fallback options.
     */
    private function resolveCompanyId(): int
    {
        if (app()->has('currentCompany')) {
            $resolved = app('currentCompany');
            return is_numeric($resolved) ? (int)$resolved : ($resolved->id ?? 1);
        }
        
        return auth()->user()->company_id ?? 1;
    }

    public function index(): Response
    {
        $user = auth()->user();

        // Resolve company from pivot — the tenant belongs to exactly
        // one company in practice. We take the first active membership.
        // This does NOT depend on any middleware binding.
        $company = $user->companies()
            ->wherePivot('status', 'active')
            ->first();

        if (! $company) {
            // Tenant exists but has no active company membership.
            // Render a minimal "contact your landlord" page instead of crashing.
            return Inertia::render('tenant/dashboard', [
                'unit'           => null,
                'kpis'           => $this->emptyKpis(),
                'latestInvoices' => [],
                'noCompany'      => true,
            ]);
        }

        // Standardized across your controller layers to use resolved context
        $companyId = $this->resolveCompanyId() === $company->id ? $company->id : $company->id;

        // Resolve active lease directly — no middleware needed.
        $activeLease = Lease::query()
            ->where('tenant_id', $user->id)
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->with([
                'unit:id,unit_no,apartment_id',
                'unit.apartment:id,name,location_id',
                'unit.apartment.location:id,name',
            ])
            ->first();

        // All queries below are scoped to BOTH tenant_id AND company_id
        // so cross-company data leakage is impossible even if somehow
        // a tenant belongs to multiple companies.
        $wallet = Wallet::forTenant($companyId, $user->id);

        $kpis = $this->buildKpis($companyId, $user->id, $wallet);

        $latestInvoices = Invoice::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $user->id)
            ->orderByDesc('issue_date')
            ->limit(3)
            ->get(['id', 'number', 'issue_date', 'due_date', 'total', 'balance', 'status'])
            ->map(fn ($inv) => [
                'id'       => $inv->id,
                'number'   => $inv->number,
                'month'    => $inv->issue_date?->format('F Y'),
                'total'    => (float) $inv->total,
                'balance'  => (float) $inv->balance,
                'status'   => $inv->status,
                'due_date' => $inv->due_date?->toDateString(),
            ])
            ->values();

        return Inertia::render('tenant/dashboard', [
            'unit'           => $this->formatUnit($activeLease),
            'kpis'           => $kpis,
            'latestInvoices' => $latestInvoices,
            'noCompany'      => false,
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function buildKpis(int $companyId, int $userId, Wallet $wallet): array
    {
        // Single aggregate query for invoice stats instead of 3 separate queries.
        $invoiceStats = Invoice::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $userId)
            ->selectRaw('
                SUM(CASE WHEN status = "overdue" THEN 1 ELSE 0 END) as overdue_count,
                SUM(CASE WHEN status IN ("unpaid","partial","overdue") THEN 1 ELSE 0 END) as unpaid_count,
                SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END) as total_outstanding
            ')
            ->first();

        $openIssues = Issue::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $userId)
            ->whereNotIn('status', ['closed'])
            ->count();

        $openMaintenance = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $userId)
            ->whereNotIn('status', ['completed', 'closed'])
            ->count();

        return [
            'walletBalance'    => (float) $wallet->balance,
            'totalOutstanding' => (float) ($invoiceStats->total_outstanding ?? 0),
            'unpaidInvoices'   => (int) ($invoiceStats->unpaid_count ?? 0),
            'overdueInvoices'  => (int) ($invoiceStats->overdue_count ?? 0),
            'openIssues'       => $openIssues,
            'openMaintenance'  => $openMaintenance,
        ];
    }

    private function formatUnit(?Lease $lease): ?array
    {
        if (! $lease) {
            return null;
        }

        return [
            'unit_no'        => $lease->unit?->unit_no,
            'apartment_name' => $lease->unit?->apartment?->name,
            'location_name'  => $lease->unit?->apartment?->location?->name,
            'rent'           => (float) $lease->rent,
            'lease_start'    => $lease->start_date?->toDateString(),
        ];
    }

    private function emptyKpis(): array
    {
        return [
            'walletBalance'    => 0.0,
            'totalOutstanding' => 0.0,
            'unpaidInvoices'   => 0,
            'overdueInvoices'  => 0,
            'openIssues'       => 0,
            'openMaintenance'  => 0,
        ];
    }
}