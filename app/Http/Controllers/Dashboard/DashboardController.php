<?php

declare(strict_types=1);

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Invoice;
use App\Models\MaintenanceRequest;
use App\Models\Notice;
use App\Models\Payment;
use App\Models\Wallet;
use App\Models\Location;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin/staff dashboard — only reached by non-tenant roles.
 * Requires the 'module dashboard' Spatie permission (enforced on the route).
 */
final class DashboardController extends Controller
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
        $companyId = $this->resolveCompanyId();

        $needsAttention = $this->buildNeedsAttention($companyId);

        // Filter items by what the viewing user can actually see.
        $needsAttention['items'] = array_values(
            array_filter($needsAttention['items'], function (array $item): bool {
                return match ($item['type']) {
                    'overdue_invoice' => Gate::allows('viewAny', Invoice::class),
                    'vacating_notice' => Gate::allows('viewAny', Notice::class),
                    'maintenance'     => Gate::allows('viewAny', MaintenanceRequest::class),
                    default           => true,
                };
            })
        );

        return Inertia::render('dashboard', [
            'kpis'           => $this->buildKpis($companyId),
            'needsAttention' => $needsAttention,
            'can'            => [
                'viewFinancial'   => Gate::allows('viewAny', Invoice::class),
                'viewOccupancy'   => Gate::allows('viewAny', Apartment::class),
                'viewMaintenance' => Gate::allows('viewAny', MaintenanceRequest::class),
            ],
        ]);
    }

    // ─────────────────────────────────────────────────────────────────────────

    private function buildKpis(int $companyId): array
    {
        $totalUnits = \App\Models\Unit::query()->where('company_id', $companyId)->count();

        $occupiedUnits = \App\Models\Lease::query()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->distinct('unit_id')
            ->count('unit_id');

        $monthlyStats = Invoice::query()
            ->where('company_id', $companyId)
            ->whereBetween('issue_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->selectRaw('SUM(total) as billed')
            ->first();

        $collectedThisMonth = Payment::query()
            ->where('company_id', $companyId)
            ->whereNull('reversed_at')
            ->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('amount');

        $outstandingDebt = Invoice::query()
            ->where('company_id', $companyId)
            ->where('balance', '>', 0)
            ->sum('balance');

        $walletBalance = Wallet::query()
            ->where('company_id', $companyId)
            ->sum('balance');

        $maintenanceCounts = \App\Models\MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->selectRaw("
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as resolved_count
            ")
            ->first();

        $activeTenants = \App\Models\User::query()
            ->role('tenant')
            ->whereHas('companies', fn ($q) => $q->where('companies.id', $companyId))
            ->whereHas('leases', fn ($q) => $q->where('status', 'active'))
            ->count();

        return [
            'totalLocations'      => Location::query()->where('company_id', $companyId)->count(),
            'totalApartments'     => Apartment::query()->where('company_id', $companyId)->count(),
            'totalUnits'          => $totalUnits,
            'occupiedUnits'       => $occupiedUnits,
            'vacantUnits'         => $totalUnits - $occupiedUnits,
            'occupancyPct'        => $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0,
            'activeTenants'       => $activeTenants,
            'monthlyBilling'      => (float) ($monthlyStats->billed ?? 0),
            'collectedThisMonth'  => (float) $collectedThisMonth,
            'outstandingDebt'     => (float) $outstandingDebt,
            'walletBalance'       => (float) $walletBalance,
            'openMaintenance'     => (int) ($maintenanceCounts->open_count ?? 0),
            'inProgressMaintenance' => (int) ($maintenanceCounts->in_progress_count ?? 0),
            'resolvedMaintenance' => (int) ($maintenanceCounts->resolved_count ?? 0),
        ];
    }

    private function buildNeedsAttention(int $companyId): array
    {
        $items = [];

        $overdueQuery = Invoice::query()->where('company_id', $companyId)->where('status', 'overdue');
        $overdueTotal = $overdueQuery->clone()->count();
        $overdueInvoices = $overdueQuery->clone()
            ->with('tenant:id,name')
            ->orderBy('due_date')
            ->limit(5)
            ->get(['id', 'number', 'tenant_id', 'balance', 'due_date']);

        foreach ($overdueInvoices as $inv) {
            $items[] = [
                'type'     => 'overdue_invoice',
                'title'    => "{$inv->number} — {$inv->tenant?->name}",
                'subtitle' => 'KES '.number_format((float) $inv->balance)
                    .' overdue since '.$inv->due_date->format('d M Y'),
                'href'     => "/invoices/{$inv->id}",
                'severity' => 'high',
            ];
        }

        $noticesQuery = Notice::query()->where('company_id', $companyId)->actionNeeded();
        $noticesTotal = $noticesQuery->clone()->count();
        $pendingNotices = $noticesQuery->clone()
            ->with('tenant:id,name', 'unit:id,unit_no')
            ->limit(5)
            ->get();

        foreach ($pendingNotices as $notice) {
            $items[] = [
                'type'     => 'vacating_notice',
                'title'    => "{$notice->tenant?->name} — Unit {$notice->unit?->unit_no}",
                'subtitle' => 'Vacating notice effective '
                    .$notice->effective_at->format('d M Y')
                    .' — lease termination pending',
                'href'     => '/notices',
                'severity' => 'medium',
            ];
        }

        $maintenanceQuery = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->where(fn ($q) => $q->where('priority', 'emergency')->orWhereNull('assignee_id'))
            ->whereNotIn('status', ['completed', 'closed']);

        $maintenanceTotal = $maintenanceQuery->clone()->count();
        $urgentMaintenance = $maintenanceQuery->clone()
            ->with('tenant:id,name', 'unit:id,unit_no')
            ->orderByRaw("CASE priority WHEN 'emergency' THEN 0 ELSE 1 END")
            ->limit(5)
            ->get();

        foreach ($urgentMaintenance as $req) {
            $items[] = [
                'type'     => 'maintenance',
                'title'    => "{$req->number} — Unit {$req->unit?->unit_no}",
                'subtitle' => $req->priority === 'emergency'
                    ? 'Emergency request, '.($req->assignee_id ? 'assigned' : 'UNASSIGNED')
                    : 'Unassigned request',
                'href'     => "/maintenance/{$req->id}",
                'severity' => $req->priority === 'emergency' ? 'high' : 'medium',
            ];
        }

        return [
            'items'                  => $items,
            'totalOverdueInvoices'   => $overdueTotal,
            'totalPendingNotices'    => $noticesTotal,
            'totalUrgentMaintenance' => $maintenanceTotal,
        ];
    }
}