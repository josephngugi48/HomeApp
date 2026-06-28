<?php

namespace App\Http\Controllers\Apartments;

use App\Http\Controllers\Controller;
use App\Models\Apartment;
use App\Models\Location;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class ApartmentController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Apartment::class);

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $locationId = $request->integer('location_id');
        $status = $request->string('status')->toString();
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $query = Apartment::query()
            ->with(['location:id,name,code', 'landlord:id,name', 'caretaker:id,name'])
            ->withCount('units');

        // 🔍 Search (name or code)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        // 🟢 Filter by location
        if ($locationId) {
            $query->where('location_id', $locationId);
        }

        // 🟢 Filter by status
        if ($status) {
            $query->where('status', $status);
        }

        // ↕ Sorting (safe)
        $allowedSorts = ['id', 'name', 'code', 'status', 'created_at'];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $apartments = $query->paginate($perPage)->withQueryString();
        $apartments->getCollection()->transform(function ($apartment) {
            $apartment->can = [
                'update' => Gate::allows('update', $apartment),
                'delete' => Gate::allows('delete', $apartment),
            ];
            return $apartment;
        });

        return Inertia::render('apartments/index', [
            'apartments' => $apartments,
            'filters' => [
                'search' => $search,
                'location_id' => $locationId,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'locationOptions' => Location::query()
                ->where('status', 'Active')
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'can' => [
                'create' => Gate::allows('create', Apartment::class),
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Apartment::class);

        return Inertia::render('apartments/create', [
            'locations' => Location::query()
                ->where('status', 'Active')
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'landlords' => User::role('landlord')->orderBy('name')->get(['id', 'name', 'email']),
            'caretakers' => User::role('caretaker')->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Apartment::class);

        // 🛡️ Safe check: check service container, fallback to user's company, default to 1 if all else fails
        if (app()->has('currentCompany')) {
            $resolved = app('currentCompany');
            $currentCompany = is_numeric($resolved) ? $resolved : ($resolved->id ?? 1);
        } else {
            $currentCompany = auth()->user()->company_id ?? 1; 
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:32',
                Rule::unique('apartments', 'code')
                    ->where(function ($query) use ($currentCompany) {
                        if ($currentCompany) {
                            $query->where('company_id', $currentCompany);
                        }
                    })
                    ->whereNull('deleted_at'),
            ],
            'location_id' => [
                'required',
                Rule::exists('locations', 'id')->where(function ($query) use ($currentCompany) {
                    if ($currentCompany) {
                        $query->where('company_id', $currentCompany);
                    }
                }),
            ],
            'landlord_id' => [
                'nullable',
                Rule::exists('users', 'id'),
            ],
            'caretaker_id' => [
                'nullable',
                Rule::exists('users', 'id'),
            ],
            'status' => 'required|in:Active,Inactive',
        ]);

        // ✨ Force inject the valid fallback company id into the creation array
        $validated['company_id'] = $currentCompany;

        Apartment::create($validated);

        return redirect()->route('apartments.index')->with('success', 'Apartment created successfully.');
    }

    public function edit(Apartment $apartment)
    {
        Gate::authorize('update', $apartment);

        $apartment->load(['location', 'landlord', 'caretaker']);

        return Inertia::render('apartments/edit', [
            'apartment' => $apartment,
            'locations' => Location::query()
                ->orderBy('name')
                ->get(['id', 'name', 'code']),
            'landlords' => User::role('landlord')->orderBy('name')->get(['id', 'name', 'email']),
            'caretakers' => User::role('caretaker')->orderBy('name')->get(['id', 'name', 'email']),
        ]);
    }

    public function update(Request $request, Apartment $apartment)
    {
        Gate::authorize('update', $apartment);

        // Safely check if currentCompany is bound, fallback if missing
        $currentCompany = app()->has('currentCompany') ? app('currentCompany')->id : null;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:32',
                Rule::unique('apartments', 'code')
                    ->where(function ($query) use ($currentCompany) {
                        if ($currentCompany) {
                            $query->where('company_id', $currentCompany);
                        }
                    })
                    ->whereNull('deleted_at')
                    ->ignore($apartment->id),
            ],
            'location_id' => [
                'required',
                Rule::exists('locations', 'id')->where(function ($query) use ($currentCompany) {
                    if ($currentCompany) {
                        $query->where('company_id', $currentCompany);
                    }
                }),
            ],
            'landlord_id' => ['nullable', Rule::exists('users', 'id')],
            'caretaker_id' => ['nullable', Rule::exists('users', 'id')],
            'status' => 'required|in:Active,Inactive',
        ]);

        $apartment->update($validated);

        return redirect()->route('apartments.index')->with('success', 'Apartment updated successfully.');
    }

    public function destroy(Apartment $apartment)
    {
        Gate::authorize('delete', $apartment);

        if ($apartment->units()->exists()) {
            return back()->with('error', 'Cannot delete an apartment that still has units assigned to it.');
        }

        $apartment->delete();

        return redirect()->route('apartments.index')->with('success', 'Apartment deleted successfully.');
    }
}