<?php
// app/Http/Controllers/Tenant/TenantMaintenanceController.php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\TenantMaintenanceResource;
use App\Models\MaintenanceRequest;
use App\Services\Tenant\TenantMaintenanceService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TenantMaintenanceController extends Controller
{
    public function index(): \Inertia\Response
    {
        $service = new TenantMaintenanceService(auth()->user());

        return Inertia::render('tenant/maintenance/index', [
            'requests' => TenantMaintenanceResource::collection($service->paginate()),
        ]);
    }

    public function create(): \Inertia\Response
    {
        return Inertia::render('tenant/maintenance/create', [
            'categoryOptions' => MaintenanceRequest::CATEGORIES,
            'priorityOptions' => MaintenanceRequest::PRIORITIES,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'category' => ['required', Rule::in(MaintenanceRequest::CATEGORIES)],
            'priority' => ['required', Rule::in(MaintenanceRequest::PRIORITIES)],
            'description' => 'required|string|max:1000',
            'photos' => 'nullable|array|max:6',
            'photos.*' => 'image|max:5120',
        ]);

        $service = new TenantMaintenanceService(auth()->user());
        $service->create($validated, app('currentCompany')->id, $request->file('photos', []));

        return redirect()->route('tenant.maintenance.index')->with('success', 'Request submitted successfully.');
    }

    public function show(int $id): \Inertia\Response
    {
        $service = new TenantMaintenanceService(auth()->user());

        return Inertia::render('tenant/maintenance/show', [
            'request' => new TenantMaintenanceResource($service->findForTenant($id)),
        ]);
    }
}