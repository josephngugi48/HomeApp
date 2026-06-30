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
use Illuminate\Support\Facades\DB;
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
            return is_numeric($resolved) ? (int) $resolved : ($resolved->id ?? 1);
        }

        return auth()->user()->company_id ?? 1;
    }

    public function index()
    {
        $companyId = $this->resolveCompanyId();

        $kpis = $this->buildKpis($companyId);
        $attention = $this->buildNeedsAttention($companyId);

        // Filter attention items by permissions
        $attention['items'] = array_values(array_filter($attention['items'], function ($item) {
            return match ($item['type']) {
                'overdue_invoice' => Gate::allows('viewAny', Invoice::class),
                'vacating_notice' => Gate::allows('viewAny', Notice::class),
                'maintenance'     => Gate::allows('viewAny', MaintenanceRequest::class),
                default           => true,
            };
        }));

        // Chart data
        $revenueTrend = $this->getRevenueTrend($companyId);
        $paymentMethods = $this->getPaymentMethods($companyId);
        $occupancyTrend = $this->getOccupancyTrend($companyId);
        $maintenanceStatus = $this->getMaintenanceStatus($companyId);

        return Inertia::render('dashboard', [
            'kpis'            => $kpis,
            'needsAttention'  => $attention, // full object with 'items' and totals
            'can'             => [
                'viewFinancial'   => Gate::allows('viewAny', Invoice::class),
                'viewOccupancy'   => Gate::allows('viewAny', Apartment::class),
                'viewMaintenance' => Gate::allows('viewAny', MaintenanceRequest::class),
            ],
            'charts'          => [
                'revenueTrend'      => $revenueTrend,
                'paymentMethods'    => $paymentMethods,
                'occupancyTrend'    => $occupancyTrend,
                'maintenanceStatus' => $maintenanceStatus,
            ],
        ]);
    }

    /**
     * Build current‑state KPIs (no historical calculations).
     */
    private function buildKpis(int $companyId): array
    {
        $totalUnits = Unit::query()->where('company_id', $companyId)->count();

        $occupiedUnits = Lease::query()
            ->where('company_id', $companyId)
            ->where('status', 'active')
            ->distinct('unit_id')
            ->count('unit_id');

        $totalApartments = Apartment::query()->where('company_id', $companyId)->count();
        $totalLocations  = Location::query()->where('company_id', $companyId)->count();

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
            'totalLocations'        => $totalLocations,
            'totalApartments'       => $totalApartments,
            'totalUnits'            => $totalUnits,
            'occupiedUnits'         => $occupiedUnits,
            'vacantUnits'           => $totalUnits - $occupiedUnits,
            'occupancyPct'          => $totalUnits > 0 ? round(($occupiedUnits / $totalUnits) * 100, 1) : 0,
            'activeTenants'         => $activeTenants,
            'monthlyBilling'        => (float) $monthlyBilling,
            'collectedThisMonth'    => (float) $collectedThisMonth,
            'outstandingDebt'       => (float) $outstandingDebt,
            'walletBalance'         => (float) $walletBalance,
            'openMaintenance'       => (int) ($maintenanceCounts->open_count ?? 0),
            'inProgressMaintenance' => (int) ($maintenanceCounts->in_progress_count ?? 0),
            'resolvedMaintenance'   => (int) ($maintenanceCounts->resolved_count ?? 0),
        ];
    }

    /**
     * Build "Needs Attention" items with totals.
     */
    private function buildNeedsAttention(int $companyId): array
    {
        $items = [];

        // Overdue invoices
        $overdueInvoicesQuery = Invoice::query()
            ->where('company_id', $companyId)
            ->where('status', 'overdue');
        $overdueTotal = $overdueInvoicesQuery->clone()->count();
        $overdueInvoices = $overdueInvoicesQuery
            ->with('tenant:id,name')
            ->orderBy('due_date')
            ->limit(5)
            ->get(['id', 'number', 'tenant_id', 'balance', 'due_date']);

        foreach ($overdueInvoices as $inv) {
            $items[] = [
                'type'     => 'overdue_invoice',
                'title'    => "{$inv->number} — {$inv->tenant?->name}",
                'subtitle' => 'KES ' . number_format((float) $inv->balance) . ' overdue since ' . $inv->due_date->format('d M Y'),
                'href'     => "/invoices/{$inv->id}",
                'severity' => 'high',
            ];
        }

        // Vacating notices
        $noticesQuery = Notice::query()
            ->where('company_id', $companyId)
            ->actionNeeded();
        $noticesTotal = $noticesQuery->clone()->count();
        $pendingNotices = $noticesQuery
            ->with('tenant:id,name', 'unit:id,unit_no')
            ->limit(5)
            ->get();

        foreach ($pendingNotices as $notice) {
            $items[] = [
                'type'     => 'vacating_notice',
                'title'    => "{$notice->tenant?->name} — Unit {$notice->unit?->unit_no}",
                'subtitle' => 'Vacating notice effective ' . $notice->effective_at->format('d M Y') . ' — lease termination pending',
                'href'     => '/notices',
                'severity' => 'medium',
            ];
        }

        // Urgent / unassigned maintenance
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
                'type'     => 'maintenance',
                'title'    => "{$req->number} — Unit {$req->unit?->unit_no}",
                'subtitle' => $req->priority === 'emergency'
                    ? 'Emergency request, ' . ($req->assignee_id ? 'assigned' : 'UNASSIGNED')
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

    /**
     * Revenue trend: last 7 months, billed (invoice total) and collected (payments).
     */
    private function getRevenueTrend(int $companyId): array
    {
        $months = collect(range(6, 0))->map(function ($i) {
            return now()->subMonths($i)->format('Y-m');
        });

        $billed = Invoice::query()
            ->where('company_id', $companyId)
            ->whereIn(DB::raw("DATE_FORMAT(issue_date, '%Y-%m')"), $months)
            ->selectRaw("DATE_FORMAT(issue_date, '%Y-%m') as month, SUM(total) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        $collected = Payment::query()
            ->where('company_id', $companyId)
            ->whereNull('reversed_at')
            ->whereIn(DB::raw("DATE_FORMAT(paid_at, '%Y-%m')"), $months)
            ->selectRaw("DATE_FORMAT(paid_at, '%Y-%m') as month, SUM(amount) as total")
            ->groupBy('month')
            ->pluck('total', 'month');

        return $months->map(function ($month) use ($billed, $collected) {
            return [
                'month'     => $month,
                'billed'    => (float) ($billed[$month] ?? 0),
                'collected' => (float) ($collected[$month] ?? 0),
            ];
        })->values()->toArray();
    }

    /**
     * Payment methods for the current month (share of collections).
     */
    private function getPaymentMethods(int $companyId): array
    {
        return Payment::query()
            ->where('company_id', $companyId)
            ->whereNull('reversed_at')
            ->whereBetween('paid_at', [now()->startOfMonth(), now()->endOfMonth()])
            ->selectRaw('method, SUM(amount) as total')
            ->groupBy('method')
            ->orderByDesc('total')
            ->pluck('total', 'method')
            ->map(function ($total, $method) {
                return ['method' => $method, 'total' => (float) $total];
            })
            ->values()
            ->toArray();
            // method is payment_method
    }

    /**
     * Occupancy trend: last 7 months, percentage of occupied units.
     */
    private function getOccupancyTrend(int $companyId): array
    {
        $months = collect(range(6, 0))->map(function ($i) {
            return now()->subMonths($i)->startOfMonth();
        });

        $totalUnits = Unit::query()->where('company_id', $companyId)->count();

        return $months->map(function ($start) use ($companyId, $totalUnits) {
            $end = $start->copy()->endOfMonth();

            $occupied = Lease::query()
                ->where('company_id', $companyId)
                ->where('status', 'active')
                ->where(function ($q) use ($start, $end) {
                    $q->whereBetween('start_date', [$start, $end])
                      ->orWhereBetween('end_date', [$start, $end])
                      ->orWhere(function ($q2) use ($start, $end) {
                          $q2->where('start_date', '<=', $start)
                             ->where('end_date', '>=', $end);
                      });
                })
                ->distinct('unit_id')
                ->count('unit_id');

            $pct = $totalUnits > 0 ? round(($occupied / $totalUnits) * 100, 1) : 0;

            return [
                'month'     => $start->format('M'),
                'occupancy' => $pct,
            ];
        })->toArray();
    }

    /**
     * Maintenance status breakdown.
     * Adjust status mapping to match your actual status values.
     */
    private function getMaintenanceStatus(int $companyId): array
    {
        // Map your statuses to display labels
        $statusMap = [
            'open'        => 'Open',
            'assigned'    => 'Assigned',    // if you have this status
            'in_progress' => 'In Progress',
            'completed'   => 'Completed',
            'closed'      => 'Completed',   // group closed with completed
        ];

        $counts = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->selectRaw('status, COUNT(*) as count')
            ->groupBy('status')
            ->pluck('count', 'status');

        $result = [];
        foreach ($statusMap as $dbStatus => $label) {
            if (isset($counts[$dbStatus])) {
                // If multiple DB statuses map to the same label, sum them
                $existing = array_search($label, array_column($result, 'status'));
                if ($existing !== false) {
                    $result[$existing]['count'] += $counts[$dbStatus];
                } else {
                    $result[] = ['status' => $label, 'count' => (int) $counts[$dbStatus]];
                }
            }
        }

        // Ensure all labels appear even if count is zero
        $labels = array_unique($statusMap);
        foreach ($labels as $label) {
            $found = false;
            foreach ($result as $item) {
                if ($item['status'] === $label) {
                    $found = true;
                    break;
                }
            }
            if (!$found) {
                $result[] = ['status' => $label, 'count' => 0];
            }
        }

        return $result;
    }
}