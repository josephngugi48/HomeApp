<?php

namespace App\Http\Controllers\Locations;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class LocationController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Location::class);

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $status = $request->string('status')->toString();
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $query = Location::query()
            ->withCount(['apartments', 'units']);

        // 🔍 Search (name or code)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
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

        $locations = $query->paginate($perPage)->withQueryString();
        $locations->getCollection()->transform(function ($location) {
            $location->can = [
                'update' => Gate::allows('update', $location),
                'delete' => Gate::allows('delete', $location),
            ];
            return $location;
        });

        return Inertia::render('locations/index', [
            'locations' => $locations,
            'filters' => [
                'search' => $search,
                'status' => $status,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'can' => [
                'create' => Gate::allows('create', Location::class),
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Location::class);

        return Inertia::render('locations/create');
    }

    // public function store(Request $request)
    // {
    //     Gate::authorize('create', Location::class);

    //     $validated = $request->validate([
    //         'name' => 'required|string|max:255',
    //         'code' => [
    //             'required',
    //             'string',
    //             'max:32',
    //             \Illuminate\Validation\Rule::unique('locations', 'code')
    //                 ->where('company_id', app('currentCompany')->id)
    //                 ->whereNull('deleted_at'),
    //         ],
    //         'status' => 'required|in:Active,Inactive',
    //     ]);

    //     Location::create($validated);

    //     return redirect()->route('locations.index')->with('success', 'Location created successfully.');
    // }
    
    public function store(Request $request)
    {
        Gate::authorize('create', Location::class);
        
        // Safely check if currentCompany is bound, otherwise fallback to null or user's company
        $currentCompany = app()->has('currentCompany') ? app('currentCompany') : 1;

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:32',
                \Illuminate\Validation\Rule::unique('locations', 'code')
                    ->where(function ($query) use ($currentCompany) {
                        if ($currentCompany) {
                            $query->where('company_id', $currentCompany);
                        }
                    })
                    ->whereNull('deleted_at'),
            ],
            'status' => 'required|in:Active,Inactive',
        ]);

        // Force inject the company id since it's not in the $validated fields
        if ($currentCompany) {
            $validated['company_id'] = $currentCompany;
        }

        Location::create($validated);

        return redirect()->route('locations.index')->with('success', 'Location created successfully.');
    }

    public function edit(Location $location)
    {
        Gate::authorize('update', $location);

        return Inertia::render('locations/edit', [
            'location' => $location,
        ]);
    }

    public function update(Request $request, Location $location)
    {
        Gate::authorize('update', $location);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'code' => [
                'required',
                'string',
                'max:32',
                \Illuminate\Validation\Rule::unique('locations', 'code')
                    ->where('company_id', app('currentCompany')->id)
                    ->whereNull('deleted_at')
                    ->ignore($location->id),
            ],
            'status' => 'required|in:Active,Inactive',
        ]);

        $location->update($validated);

        return redirect()->route('locations.index')->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location)
    {
        Gate::authorize('delete', $location);

        if ($location->apartments()->exists()) {
            return back()->with('error', 'Cannot delete a location that still has apartments assigned to it.');
        }

        $location->delete();

        return redirect()->route('locations.index')->with('success', 'Location deleted successfully.');
    }
}