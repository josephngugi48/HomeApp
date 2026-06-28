<?php

namespace App\Http\Controllers\Units;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Unit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UnitController extends Controller
{
    private const STATUSES = ['Occupied', 'Vacant', 'Reserved'];

    public function index(Request $request)
    {
        Gate::authorize('viewAny', Unit::class);

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $apartmentId = $request->integer('apartment_id');
        $status = $request->string('status')->toString();
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $query = Unit::query()
            ->with(['apartment:id,name,code']);

        // 🔍 Search by unit number (apartment name searched via relation)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('unit_no', 'like', "%{$search}%")
                    ->orWhereHas('apartment', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%");
                    });
            });
        }

        // 🟢 Filter by apartment
        if ($apartmentId) {
            $query->where('apartment_id', $apartmentId);
        }

        // 🟢 Filter by occupancy status
        if ($status) {
            $query->where('status', $status);
        }

        // ↕ Sorting (safe)
        $allowedSorts = ['id', 'unit_no', 'floor', 'bedrooms', 'rent', 'status', 'created_at'];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('unit_no', 'asc');
        }

        $units = $query->paginate($perPage)->withQueryString();
        $units->getCollection()->transform(function ($unit) {
            $unit->can = [
                'update' => Gate::allows('update', $unit),
                'delete' => Gate::allows('delete', $unit),
            ];
            return $unit;
        });

        return Inertia::render('units/index', [
            'units' => $units,
            'filters' => [
                'search' => $search,
                'apartment_id' => $apartmentId,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'apartmentOptions' => Apartment::query()
                ->where('status', 'Active')
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'statusOptions' => self::STATUSES,
            'can' => [
                'create' => Gate::allows('create', Unit::class),
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Unit::class);

        return Inertia::render('units/create', [
            'apartments' => Apartment::query()
                ->where('status', 'Active')
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'statusOptions' => self::STATUSES,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Unit::class);

        // 🛡️ Safely fetch the current company ID
        if (app()->has('currentCompany')) {
            $resolved = app('currentCompany');
            $currentCompany = is_numeric($resolved) ? (int)$resolved : ($resolved->id ?? 1);
        } else {
            $currentCompany = auth()->user()->company_id ?? 1;
        }

        $validated = $request->validate([
            'apartment_id' => [
                'required',
                Rule::exists('apartments', 'id')->where(function ($query) use ($currentCompany) {
                    if ($currentCompany) {
                        $query->where('company_id', $currentCompany);
                    }
                }),
            ],
            'unit_no' => [
                'required',
                'string',
                'max:32',
                Rule::unique('units', 'unit_no')
                    ->where('apartment_id', $request->input('apartment_id'))
                    ->whereNull('deleted_at'),
            ],
            'floor' => 'nullable|integer|min:0|max:200',
            'bedrooms' => 'nullable|integer|min:0|max:20',
            'rent' => 'required|numeric|min:0|max:99999999.99',
            'service_charge' => 'nullable|numeric|min:0|max:99999999.99',
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        // ✨ Explicitly inject the company id to satisfy the NOT NULL foreign key constraint
        $validated['company_id'] = $currentCompany;

        Unit::create($validated);

        return redirect()->route('units.index')->with('success', 'Unit created successfully.');
    }

    public function edit(Unit $unit)
    {
        Gate::authorize('update', $unit);

        $unit->load('apartment');

        return Inertia::render('units/edit', [
            'unit' => $unit,
            'apartments' => Apartment::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'statusOptions' => self::STATUSES,
        ]);
    }

    public function update(Request $request, Unit $unit)
    {
        Gate::authorize('update', $unit);

        // 🛡️ Safely fetch the current company ID
        if (app()->has('currentCompany')) {
            $resolved = app('currentCompany');
            $currentCompany = is_numeric($resolved) ? $resolved : ($resolved->id ?? 1);
        } else {
            $currentCompany = auth()->user()->company_id ?? 1;
        }

        $validated = $request->validate([
            'apartment_id' => [
                'required',
                Rule::exists('apartments', 'id')->where(function ($query) use ($currentCompany) {
                    if ($currentCompany) {
                        $query->where('company_id', $currentCompany);
                    }
                }),
            ],
            'unit_no' => [
                'required',
                'string',
                'max:32',
                Rule::unique('units', 'unit_no')
                    ->where('apartment_id', $request->input('apartment_id'))
                    ->whereNull('deleted_at')
                    ->ignore($unit->id),
            ],
            'floor' => 'nullable|integer|min:0|max:200',
            'bedrooms' => 'nullable|integer|min:0|max:20',
            'rent' => 'required|numeric|min:0|max:99999999.99',
            'service_charge' => 'nullable|numeric|min:0|max:99999999.99',
            'status' => ['required', Rule::in(self::STATUSES)],
        ]);

        $unit->update($validated);

        return redirect()->route('units.index')->with('success', 'Unit updated successfully.');
    }

    public function destroy(Unit $unit)
    {
        Gate::authorize('delete', $unit);

        if ($unit->leases()->exists()) {
            return back()->with('error', 'Cannot delete a unit that has lease history.');
        }

        $unit->delete();

        return redirect()->route('units.index')->with('success', 'Unit deleted successfully.');
    }
}