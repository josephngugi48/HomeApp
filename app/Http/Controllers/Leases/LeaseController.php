<?php

namespace App\Http\Controllers\Leases;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class LeaseController extends Controller
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

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Lease::class);

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $unitId = $request->integer('unit_id');
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $companyId = $this->resolveCompanyId();

        $query = Lease::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name,email', 'unit:id,unit_no,apartment_id', 'unit.apartment:id,name']);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->whereHas('tenant', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%");
                })->orWhereHas('unit', function ($q) use ($search) {
                    $q->where('unit_no', 'like', "%{$search}%");
                });
            });
        }

        if ($status) {
            $query->where('status', $status);
        }

        if ($unitId) {
            $query->where('unit_id', $unitId);
        }

        $allowedSorts = ['id', 'start_date', 'end_date', 'rent', 'status', 'created_at'];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('start_date', 'desc');
        }

        $leases = $query->paginate($perPage)->withQueryString();
        $leases->getCollection()->transform(function ($lease) {
            $lease->can = [
                'update' => Gate::allows('update', $lease),
                'terminate' => Gate::allows('terminate', $lease) && $lease->status === 'active',
                'delete' => Gate::allows('delete', $lease),
            ];
            return $lease;
        });

        return Inertia::render('leases/index', [
            'leases' => $leases,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'unit_id' => $unitId,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'statusOptions' => Lease::STATUSES,
            'can' => [
                'create' => Gate::allows('create', Lease::class),
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Lease::class);

        return Inertia::render('leases/create', [
            'tenants' => User::role('tenant')
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            // Only units with no active lease are eligible — the hard
            // "one active lease per unit" rule, enforced not just at
            // validation time but reflected in the options the admin
            // even sees.
            'units' => Unit::query()
                ->whereDoesntHave('leases', fn ($q) => $q->where('status', 'active'))
                ->with('apartment:id,name')
                ->orderBy('unit_no')
                ->get(['id', 'apartment_id', 'unit_no', 'rent', 'service_charge']),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Lease::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'tenant_id' => [
                'required',
                Rule::exists('company_user', 'user_id')->where('company_id', $companyId),
            ],
            'unit_id' => [
                'required',
                Rule::exists('units', 'id')->where('company_id', $companyId),
            ],
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'rent' => 'required|numeric|min:0|max:99999999.99',
            'service_charge' => 'nullable|numeric|min:0|max:99999999.99',
            'deposit' => 'nullable|numeric|min:0|max:99999999.99',
        ]);

        $lease = DB::transaction(function () use ($validated, $companyId) {
            // Hard block: re-check inside the transaction, not just at the
            // options-list stage in create(), to close the race condition
            // where two admins try to lease the same unit concurrently.
            $unit = Unit::query()->lockForUpdate()->findOrFail($validated['unit_id']);

            $hasActiveLease = $unit->leases()->where('status', 'active')->exists();

            if ($hasActiveLease) {
                abort(422, 'This unit already has an active lease. End or terminate it before creating a new one.');
            }

            $lease = Lease::create([
                ...$validated,
                'company_id' => $companyId,
                'status' => 'active',
                'created_by' => auth()->id(),
            ]);

            $unit->update(['status' => 'Occupied']);

            return $lease;
        });

        return redirect()->route('leases.index')->with('success', 'Lease created and unit marked occupied.');
    }

    public function edit(Lease $lease)
    {
        Gate::authorize('update', $lease);

        $lease->load(['tenant:id,name,email', 'unit:id,apartment_id,unit_no']);

        return Inertia::render('leases/edit', [
            'lease' => $lease,
        ]);
    }

    public function update(Request $request, Lease $lease)
    {
        Gate::authorize('update', $lease);

        // Deliberately NOT allowing tenant_id/unit_id/status changes here —
        // those are structural facts that should only change via create
        // (new lease) or terminate() (explicit lifecycle action). This
        // endpoint only edits the commercial terms of an existing lease.
        $validated = $request->validate([
            'start_date' => 'required|date',
            'end_date' => 'nullable|date|after:start_date',
            'rent' => 'required|numeric|min:0|max:99999999.99',
            'service_charge' => 'nullable|numeric|min:0|max:99999999.99',
            'deposit' => 'nullable|numeric|min:0|max:99999999.99',
        ]);

        $lease->update($validated);

        return redirect()->route('leases.index')->with('success', 'Lease updated successfully.');
    }

    /**
     * Explicit lifecycle action: end or terminate a lease and free up the unit.
     * Kept separate from update() because this has a real side effect
     * (unit status flip) that shouldn't be reachable through a generic
     * "edit any field" form submission.
     */
    public function terminate(Request $request, Lease $lease)
    {
        Gate::authorize('terminate', $lease);

        if ($lease->status !== 'active') {
            return back()->with('error', 'Only active leases can be terminated.');
        }

        $validated = $request->validate([
            'reason' => 'nullable|string|max:500',
            'end_date' => 'nullable|date',
        ]);

        DB::transaction(function () use ($lease, $validated) {
            $lease->update([
                'status' => 'terminated',
                'end_date' => $validated['end_date'] ?? now()->toDateString(),
            ]);

            $lease->unit->update(['status' => 'Vacant']);
        });

        return redirect()->route('leases.index')->with('success', 'Lease terminated and unit marked vacant.');
    }

    public function destroy(Lease $lease)
    {
        Gate::authorize('delete', $lease);

        if ($lease->status === 'active') {
            return back()->with('error', 'Cannot delete an active lease. Terminate it first.');
        }

        $lease->delete();

        return redirect()->route('leases.index')->with('success', 'Lease record deleted.');
    }
}