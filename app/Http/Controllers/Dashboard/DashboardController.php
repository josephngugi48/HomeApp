<?php

namespace App\Http\Controllers\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\Location;
use App\Models\MaintenanceRequest;
use App\Models\Notice;
use App\Models\Payment;
use App\Models\Unit;
use App\Models\User;
use App\Models\Wallet;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class DashboardController extends Controller
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

    public function index()
    {
        $companyId = $this->resolveCompanyId();
        
        // In index(), pass through and filter buildNeedsAttention's items by what
        // the viewing user can actually see:
        $attention = $this->buildNeedsAttention($companyId);
        $attention['items'] = array_values(array_filter($attention['items'], function ($item) {
            return match ($item['type']) {
                'overdue_invoice' => Gate::allows('viewAny', Invoice::class),
                'vacating_notice' => Gate::allows('module-notices-check'), // see note below
                'maintenance' => Gate::allows('viewAny', MaintenanceRequest::class),
                default => true,
            };
        }));

        return Inertia::render('dashboard', [
            'kpis' => $this->buildKpis($companyId),
            'needsAttention' => $attention['items'],
            'can' => [
                'viewFinancial' => Gate::allows('viewAny', Invoice::class),
                'viewOccupancy' => Gate::allows('viewAny', Apartment::class),
                'viewMaintenance' => Gate::allows('viewAny', MaintenanceRequest::class),
            ],
        ]);
    }

    /**
     * Cheap, current-state aggregates only — no month-by-month loops.
     * This page loads on every login; anything resembling Reports'
     * trend reconstruction belongs in Reports, not here. If a number
     * needs history, it gets a "View full report" link instead.
     */
    private function buildKpis(int $companyId): array
    {
        $totalUnits = Unit::query()->where('company_id', $companyId)->count();

        // Occupancy via active leases — same rule established in the
        // Occupancy report, never the manually-set Unit::status column.
        $occupiedUnits = Lease::query()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->distinct('unit_id')
            ->count('unit_id');

        $totalApartments = Apartment::query()->where('company_id', $companyId)->count();
        $totalLocations = Location::query()->where('company_id', $companyId)->count();

        $activeTenants = User::query()
            ->role('tenant')
            ->whereHas('companies', fn ($q) => $q->where('companies.id', $companyId))
            ->whereHas('leases', fn ($q) => $q->where('status', 'active')->where('company_id', $companyId))
            ->count();

        $monthlyBilling = Invoice::query()
            ->where('company_id', $companyId)
            ->whereBetween('issue_date', [now()->startOfMonth(), now()->endOfMonth()])
            ->sum('total');

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

        $maintenanceCounts = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->selectRaw("
                SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_count,
                SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress_count,
                SUM(CASE WHEN status IN ('completed','closed') THEN 1 ELSE 0 END) as resolved_count
            ")
            ->first();

        return [
            'totalLocations' => $totalLocations,
            'totalApartments' => $totalApartments,
            'totalUnits' => $totalUnits,
            'occupiedUnits' => $occupiedUnits,
            'vacantUnits' => $totalUnits - $occupiedUnits,
            'occupancyPct' => $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0,
            'activeTenants' => $activeTenants,
            'monthlyBilling' => (float) $monthlyBilling,
            'collectedThisMonth' => (float) $collectedThisMonth,
            'outstandingDebt' => (float) $outstandingDebt,
            'walletBalance' => (float) $walletBalance,
            'openMaintenance' => (int) ($maintenanceCounts->open_count ?? 0),
            'inProgressMaintenance' => (int) ($maintenanceCounts->in_progress_count ?? 0),
            'resolvedMaintenance' => (int) ($maintenanceCounts->resolved_count ?? 0),
        ];
    }

    /**
     * The consolidated cross-module action list. Each item type mirrors
     * a check that already exists somewhere else in the app (Notice::
     * scopeActionNeeded, Invoice overdue status, MaintenanceRequest
     * emergency/unassigned) — this method aggregates, it does not
     * reimplement any of that logic.
     */
    private function buildNeedsAttention(int $companyId): array
    {
        $items = [];

        $overdueInvoicesQuery = Invoice::query()->where('company_id', $companyId)->where('status', 'overdue');
        $overdueTotal = $overdueInvoicesQuery->clone()->count();
        $overdueInvoices = $overdueInvoicesQuery->with('tenant:id,name')->orderBy('due_date')->limit(5)->get(['id', 'number', 'tenant_id', 'balance', 'due_date']);

        foreach ($overdueInvoices as $inv) {
            $items[] = [
                'type' => 'overdue_invoice',
                'title' => "{$inv->number} — {$inv->tenant?->name}",
                'subtitle' => 'KES '.number_format((float) $inv->balance).' overdue since '.$inv->due_date->format('d M Y'),
                'href' => "/invoices/{$inv->id}",
                'severity' => 'high',
            ];
        }

        $noticesQuery = Notice::query()->where('company_id', $companyId)->actionNeeded();
        $noticesTotal = $noticesQuery->clone()->count();
        $pendingNotices = $noticesQuery->with('tenant:id,name', 'unit:id,unit_no')->limit(5)->get();

        foreach ($pendingNotices as $notice) {
            $items[] = [
                'type' => 'vacating_notice',
                'title' => "{$notice->tenant?->name} — Unit {$notice->unit?->unit_no}",
                'subtitle' => 'Vacating notice effective '.$notice->effective_at->format('d M Y').' — lease termination pending',
                'href' => '/notices',
                'severity' => 'medium',
            ];
        }

        $maintenanceQuery = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->where(fn ($q) => $q->where('priority', 'emergency')->orWhereNull('assignee_id'))
            ->whereNotIn('status', ['completed', 'closed']);
        $maintenanceTotal = $maintenanceQuery->clone()->count();
        $urgentMaintenance = $maintenanceQuery
            ->with('tenant:id,name', 'unit:id,unit_no')
            ->orderByRaw("CASE priority WHEN 'emergency' THEN 0 ELSE 1 END")
            ->limit(5)
            ->get();

        foreach ($urgentMaintenance as $req) {
            $items[] = [
                'type' => 'maintenance',
                'title' => "{$req->number} — Unit {$req->unit?->unit_no}",
                'subtitle' => $req->priority === 'emergency'
                    ? 'Emergency request, '.($req->assignee_id ? 'assigned' : 'UNASSIGNED')
                    : 'Unassigned request',
                'href' => "/maintenance/{$req->id}",
                'severity' => $req->priority === 'emergency' ? 'high' : 'medium',
            ];
        }

        return [
            'items' => $items,
            'totalOverdueInvoices' => $overdueTotal,
            'totalPendingNotices' => $noticesTotal,
            'totalUrgentMaintenance' => $maintenanceTotal,
        ];
    }
}