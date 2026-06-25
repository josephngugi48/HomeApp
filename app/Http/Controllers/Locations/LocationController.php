<?php

namespace App\Http\Controllers\Locations;

use App\Http\Controllers\Controller;
use App\Http\Requests\Locations\StoreLocationRequest;
use App\Http\Requests\Locations\UpdateLocationRequest;
use App\Http\Resources\LocationResource;
use App\Models\Location;
use App\Services\LocationService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Inertia\Response;

class LocationController extends Controller
{
    public function __construct(private readonly LocationService $locations)
    {
    }

    public function index(Request $request): Response
    {
        Gate::authorize('viewAny', Location::class);

        $locations = $this->locations->paginate($request);

        return Inertia::render('locations/index', [
            'locations' => LocationResource::collection($locations),
            'filters' => $request->only(['search', 'status', 'sort_by', 'sort_direction']),
            'can' => [
                'create' => Gate::allows('create', Location::class),
            ],
        ]);
    }

    public function store(StoreLocationRequest $request): RedirectResponse
    {
        $this->locations->create($request->validated());

        return redirect()->route('locations.index')->with('success', 'Location created successfully.');
    }

    public function update(UpdateLocationRequest $request, Location $location): RedirectResponse
    {
        $this->locations->update($location, $request->validated());

        return redirect()->route('locations.index')->with('success', 'Location updated successfully.');
    }

    public function destroy(Location $location): RedirectResponse
    {
        Gate::authorize('delete', $location);

        $this->locations->delete($location);

        return redirect()->route('locations.index')->with('success', 'Location deleted successfully.');
    }
}