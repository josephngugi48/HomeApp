<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Invoice;
use App\Models\Issue;
use App\Models\MaintenanceRequest;
use App\Models\Wallet;
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
        $user      = auth()->user();
        $companyId = $this->resolveCompanyId();
        $lease     = app('tenantLease');

        $wallet = Wallet::forTenant($companyId, $user->id);

        $overdueCount = Invoice::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $user->id)
            ->where('status', 'overdue')
            ->count();

        $unpaidCount = Invoice::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $user->id)
            ->whereIn('status', ['unpaid', 'partial', 'overdue'])
            ->count();

        $totalOutstanding = (float) Invoice::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $user->id)
            ->where('balance', '>', 0)
            ->sum('balance');

        $openIssues = Issue::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $user->id)
            ->whereNotIn('status', ['closed'])
            ->count();

        $openMaintenance = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $user->id)
            ->whereNotIn('status', ['completed', 'closed'])
            ->count();

        $latestInvoices = Invoice::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $user->id)
            ->orderByDesc('issue_date')
            ->limit(3)
            ->get(['id', 'number', 'issue_date', 'due_date', 'total', 'balance', 'status']);

        return Inertia::render('tenant/dashboard', [
            'unit' => $lease ? [
                'unit_no'        => $lease->unit?->unit_no,
                'apartment_name' => $lease->unit?->apartment?->name,
                'location_name'  => $lease->unit?->apartment?->location?->name,
                'rent'           => (float) $lease->rent,
                'lease_start'    => $lease->start_date?->toDateString(),
            ] : null,
            'kpis' => [
                'walletBalance'    => (float) $wallet->balance,
                'totalOutstanding' => $totalOutstanding,
                'unpaidInvoices'   => $unpaidCount,
                'overdueInvoices'  => $overdueCount,
                'openIssues'       => $openIssues,
                'openMaintenance'  => $openMaintenance,
            ],
            'latestInvoices' => $latestInvoices->map(fn ($inv) => [
                'id'      => $inv->id,
                'number'  => $inv->number,
                'month'   => $inv->issue_date?->format('F Y'),
                'total'   => (float) $inv->total,
                'balance' => (float) $inv->balance,
                'status'  => $inv->status,
            ])->values(),
        ]);
    }
}