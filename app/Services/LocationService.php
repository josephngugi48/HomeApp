<?php

namespace App\Services;

use App\Models\Location;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\Request;

class LocationService
{
    private const ALLOWED_SORTS = ['name', 'code', 'status', 'created_at'];

    public function paginate(Request $request): LengthAwarePaginator
    {
        $query = Location::query()
            ->withCount(['apartments', 'units']);

        $this->applyFilters($query, $request);
        $this->applySort($query, $request);

        return $query->paginate($request->integer('per_page', 25))
            ->withQueryString();
    }

    public function create(array $data): Location
    {
        return Location::create($data);
    }

    public function update(Location $location, array $data): Location
    {
        $location->update($data);

        return $location;
    }

    public function delete(Location $location): void
    {
        // Guard: don't allow deleting a location that still has apartments —
        // mirrors the "can't delete super-admin role" style guard already in
        // RolesAndPermissionsController. Adjust if you'd rather cascade.
        if ($location->apartments()->exists()) {
            abort(422, 'Cannot delete a location that still has apartments assigned to it.');
        }

        $location->delete();
    }

    private function applyFilters($query, Request $request): void
    {
        $query->when($request->filled('search'), function ($q) use ($request) {
            $search = $request->string('search')->toString();
            $q->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        });

        $query->when($request->filled('status') && $request->string('status') !== 'all', function ($q) use ($request) {
            $q->where('status', $request->string('status')->toString());
        });
    }

    private function applySort($query, Request $request): void
    {
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString() === 'desc' ? 'desc' : 'asc';

        if ($sortBy && in_array($sortBy, self::ALLOWED_SORTS, true)) {
            $query->orderBy($sortBy, $sortDirection);
        } else {
            $query->orderBy('name', 'asc');
        }
    }
}