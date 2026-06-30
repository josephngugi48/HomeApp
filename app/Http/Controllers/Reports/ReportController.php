<?php

namespace App\Http\Controllers\Reports;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Invoice;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\Payment;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class ReportController extends Controller
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

    /**
     * Financial report – billed, collected, outstanding, revenue trend,
     * payment methods, debt ageing, and detailed payments list.
     *
     * @param  Request  $request
     * @return Response
     *
     * @phpstan-return Response<array{
     * kpis: array{billed: float, collected: float, outstanding: float},
     * revenueTrend: array<int, array{m: string, billed: float, collected: float}>,
     * paymentMethods: array<string, int>,
     * ageing: array<int, array{bucket: string, value: float}>,
     * payments: \Illuminate\Contracts\Pagination\LengthAwarePaginator,
     * filters: array{date_from?: string, date_to?: string, method?: string}
     * }>
     */
    public function financial(Request $request): Response
    {
        Gate::authorize('viewAny', Invoice::class);
        Gate::authorize('viewAny', Payment::class);

        $request->validate([
            'date_from' => 'nullable|date',
            'date_to'   => 'nullable|date|after_or_equal:date_from',
        ]);

        $companyId = $this->resolveCompanyId();
        $dateFrom = $request->date('date_from') ?? now()->subMonths(6)->startOfMonth();
        $dateTo = $request->date('date_to') ?? now()->endOfMonth();
        $dateTo = $dateTo->endOfDay(); // ✅ critical fix

        $kpis = $this->calculateFinancialKpis($companyId, $dateFrom, $dateTo);
        $trend = $this->buildRevenueTrend($companyId, $dateFrom, $dateTo);
        $paymentMethods = $this->getPaymentMethodCounts($companyId, $dateFrom, $dateTo);
        $ageing = $this->buildDebtAgeing($companyId);
        $payments = $this->getFilteredPayments($request, $companyId, $dateFrom, $dateTo);

        return Inertia::render('reports/financial', [
            'kpis' => $kpis,
            'revenueTrend' => $trend,
            'paymentMethods' => $paymentMethods,
            'ageing' => $ageing,
            'payments' => $payments,
            'filters' => $request->only(['date_from', 'date_to', 'method']),
        ]);
    }

    /**
     * @param  int  $companyId
     * @param  \Carbon\Carbon  $from
     * @param  \Carbon\Carbon  $to
     * @return array{billed: float, collected: float, outstanding: float}
     */
    private function calculateFinancialKpis(int $companyId, $from, $to): array
    {
        return [
            'billed' => (float) Invoice::query()
                ->where('company_id', $companyId)
                ->whereBetween('issue_date', [$from, $to])
                ->sum('total'),
            'collected' => (float) Payment::query()
                ->where('company_id', $companyId)
                ->whereNull('reversed_at')
                ->whereBetween('paid_at', [$from, $to])
                ->sum('amount'),
            'outstanding' => (float) Invoice::query()
                ->where('company_id', $companyId)
                ->where('balance', '>', 0)
                ->sum('balance'),
        ];
    }

    /**
     * @param  int  $companyId
     * @param  \Carbon\Carbon  $from
     * @param  \Carbon\Carbon  $to
     * @return array<int, array{m: string, billed: float, collected: float}>
     */
    private function buildRevenueTrend(int $companyId, $from, $to): array
    {
        $trendStart = $from->copy()->startOfMonth();
        $trendEnd = $to->copy()->startOfMonth();
        $monthCount = max(1, $trendStart->diffInMonths($trendEnd) + 1);
        $monthCount = min($monthCount, 24);

        return collect(range(0, $monthCount - 1))->map(function ($i) use ($companyId, $trendStart) {
            $month = $trendStart->copy()->addMonths($i);
            $start = $month->copy()->startOfMonth();
            $end = $month->copy()->endOfMonth();

            return [
                'm' => $month->format('M Y'),
                'billed' => (float) Invoice::query()
                    ->where('company_id', $companyId)
                    ->whereBetween('issue_date', [$start, $end])
                    ->sum('total'),
                'collected' => (float) Payment::query()
                    ->where('company_id', $companyId)
                    ->whereNull('reversed_at')
                    ->whereBetween('paid_at', [$start, $end])
                    ->sum('amount'),
            ];
        })->values()->toArray();
    }

    /**
     * @param  int  $companyId
     * @param  \Carbon\Carbon  $from
     * @param  \Carbon\Carbon  $to
     * @return array<string, int>
     */
    private function getPaymentMethodCounts(int $companyId, $from, $to): array
    {
        return Payment::query()
            ->where('company_id', $companyId)
            ->whereNull('reversed_at')
            ->whereBetween('paid_at', [$from, $to])
            ->select('method', DB::raw('COUNT(*) as count'))
            ->groupBy('method')
            ->pluck('count', 'method')
            ->toArray();
    }

    /**
     * @param  int  $companyId
     * @return array<int, array{bucket: string, value: float}>
     */
    private function buildDebtAgeing(int $companyId): array
    {
        $agingRows = Invoice::query()
            ->where('company_id', $companyId)
            ->where('balance', '>', 0)
            ->whereIn('status', ['unpaid', 'partial', 'overdue'])
            ->get(['due_date', 'balance']);

        $ageing = ['0-30 days' => 0.0, '31-60 days' => 0.0, '60+ days' => 0.0];
        foreach ($agingRows as $inv) {
            $daysOverdue = $inv->due_date->isPast()
                ? now()->startOfDay()->diffInDays($inv->due_date->copy()->startOfDay())
                : 0;
            $bucket = $daysOverdue <= 30 ? '0-30 days' : ($daysOverdue <= 60 ? '31-60 days' : '60+ days');
            $ageing[$bucket] += (float) $inv->balance;
        }

        return collect($ageing)
            ->map(fn ($v, $k) => ['bucket' => $k, 'value' => $v])
            ->values()
            ->toArray();
    }

    /**
     * @param  Request  $request
     * @param  int  $companyId
     * @param  \Carbon\Carbon  $from
     * @param  \Carbon\Carbon  $to
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator
     */
    private function getFilteredPayments(Request $request, int $companyId, $from, $to)
    {
        $query = Payment::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name', 'invoice:id,number'])
            ->whereBetween('paid_at', [$from, $to])
            ->orderByDesc('paid_at');

        if ($method = $request->string('method')->toString()) {
            $query->where('method', $method);
        }

        return $query->paginate($request->integer('per_page', 15))->withQueryString();
    }

    // ───────────────────────────────────────────────────────────────────────
    //  OCCUPANCY REPORT
    // ───────────────────────────────────────────────────────────────────────

    /**
     * @param  Request  $request
     * @return Response
     */
    public function occupancy(Request $request): Response
    {
        Gate::authorize('viewAny', Apartment::class);

        $companyId = $this->resolveCompanyId();

        $apartments = Apartment::query()
            ->where('company_id', $companyId)
            ->withCount('units')
            ->with(['units' => function ($q) use ($companyId) {
                $q->withCount(['leases as active_lease_count' => fn ($q) => $q->where('company_id', $companyId)->where('status', 'active')]);
            }])
            ->get();

        $byApartment = $apartments->map(function ($apt) {
            $occupied = $apt->units->filter(fn ($u) => $u->active_lease_count > 0)->count();
            return [
                'id' => $apt->id,
                'name' => $apt->name,
                'units' => $apt->units_count,
                'occupied' => $occupied,
                'vacant' => $apt->units_count - $occupied,
            ];
        });

        $totalUnits = $byApartment->sum('units');
        $totalOccupied = $byApartment->sum('occupied');

        $occupancyTrend = collect(range(6, 0))->map(function ($monthsAgo) use ($companyId, $totalUnits) {
            $month = now()->subMonths($monthsAgo);
            $monthEnd = $month->copy()->endOfMonth();

            $occupiedThatMonth = Lease::query()
                ->where('company_id', $companyId)
                ->where('start_date', '<=', $monthEnd)
                ->where(function ($q) use ($monthEnd) {
                    $q->whereNull('end_date')->orWhere('end_date', '>=', $monthEnd);
                })
                ->distinct('unit_id')
                ->count('unit_id');

            return [
                'm' => $month->format('M'),
                'pct' => $totalUnits > 0 ? round(($occupiedThatMonth / $totalUnits) * 100, 1) : 0,
            ];
        })->values();

        return Inertia::render('reports/occupancy', [
            'kpis' => [
                'totalUnits' => $totalUnits,
                'occupied' => $totalOccupied,
                'vacant' => $totalUnits - $totalOccupied,
                'occupancyPct' => $totalUnits > 0 ? round(($totalOccupied / $totalUnits) * 100, 1) : 0,
            ],
            'byApartment' => $byApartment,
            'occupancyTrend' => $occupancyTrend,
        ]);
    }

    // ───────────────────────────────────────────────────────────────────────
    //  TENANT REPORT
    // ───────────────────────────────────────────────────────────────────────

    /**
     * @param  Request  $request
     * @return Response
     */
    public function tenant(Request $request): Response
    {
        Gate::authorize('viewAny', Lease::class);

        $companyId = $this->resolveCompanyId();

        $tenants = User::query()
            ->role('tenant')
            ->whereHas('companies', fn ($q) => $q->where('companies.id', $companyId))
            ->with(['leases' => fn ($q) => $q->where('company_id', $companyId)->latest('start_date')->limit(1)->with('unit:id,unit_no,apartment_id', 'unit.apartment:id,name')])
            ->get(['id', 'name', 'email']);

        $breakdown = ['active' => 0, 'no_active_lease' => 0];

        $rows = $tenants->map(function ($tenant) use ($companyId, &$breakdown) {
            $latestLease = $tenant->leases->first();
            $isActive = $latestLease && $latestLease->status === 'active';
            $breakdown[$isActive ? 'active' : 'no_active_lease']++;

            $balance = Invoice::query()
                ->where('company_id', $companyId)
                ->where('tenant_id', $tenant->id)
                ->sum('balance');

            return [
                'id' => $tenant->id,
                'name' => $tenant->name,
                'unit' => $latestLease?->unit?->unit_no,
                'apartment' => $latestLease?->unit?->apartment?->name,
                'lease_status' => $latestLease?->status,
                'move_in' => $latestLease?->start_date,
                'balance' => (float) $balance,
            ];
        });

        return Inertia::render('reports/tenant', [
            'breakdown' => [
                ['name' => 'Active Lease', 'value' => $breakdown['active']],
                ['name' => 'No Active Lease', 'value' => $breakdown['no_active_lease']],
            ],
            'tenants' => $rows->values(),
        ]);
    }

    // ───────────────────────────────────────────────────────────────────────
    //  MAINTENANCE REPORT
    // ───────────────────────────────────────────────────────────────────────

    /**
     * @param  Request  $request
     * @return Response
     */
    public function maintenance(Request $request): Response
    {
        Gate::authorize('viewAny', MaintenanceRequest::class);

        $companyId = $this->resolveCompanyId();

        $statusBreakdown = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->select('status', DB::raw('COUNT(*) as count'))
            ->groupBy('status')
            ->get()
            ->map(fn ($r) => ['name' => ucfirst(str_replace('_', ' ', $r->status)), 'value' => $r->count]);

        $categoryBreakdown = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->select('category', DB::raw('COUNT(*) as count'))
            ->groupBy('category')
            ->get()
            ->map(fn ($r) => ['name' => ucfirst($r->category), 'value' => $r->count]);

        $requests = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name', 'unit:id,unit_no', 'assignee:id,name'])
            ->orderByDesc('raised_at')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('reports/maintenance', [
            'statusBreakdown' => $statusBreakdown,
            'categoryBreakdown' => $categoryBreakdown,
            'requests' => $requests,
        ]);
    }
}