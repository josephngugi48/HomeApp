<?php

namespace App\Http\Controllers\Maintenance;

use App\Http\Controllers\Controller;
use App\Models\DocumentCounter;
use App\Models\Lease;
use App\Models\MaintenanceRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class MaintenanceRequestController extends Controller
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
        Gate::authorize('viewAny', MaintenanceRequest::class);

        $companyId = $this->resolveCompanyId();

        $query = MaintenanceRequest::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name', 'unit:id,unit_no', 'assignee:id,name']);

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                    ->orWhereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        foreach (['category', 'priority', 'status'] as $field) {
            if ($value = $request->string($field)->toString()) {
                $query->where($field, $value);
            }
        }

        // Emergency-first default ordering — this is the one place
        // across all three modules where "best practice" means the
        // default sort itself should reflect urgency, not just give
        // staff the tools to sort manually. A caretaker opening this
        // page should see emergencies first without having to think
        // about it.
        $sortBy = $request->string('sort_by')->toString();
        if ($sortBy) {
            $query->orderBy($sortBy, $request->string('sort_direction', 'desc')->toString() === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderByRaw("CASE priority
                WHEN 'emergency' THEN 0 WHEN 'high' THEN 1 WHEN 'medium' THEN 2 ELSE 3 END")
                ->orderByDesc('raised_at');
        }

        $requests = $query->paginate($request->integer('per_page', 10))->withQueryString();
        $requests->getCollection()->transform(function ($req) {
            $req->can = [
                'update' => Gate::allows('update', $req),
                'delete' => Gate::allows('delete', $req),
            ];
            return $req;
        });

        return Inertia::render('maintenance/index', [
            'requests' => $requests,
            'filters' => $request->only(['search', 'category', 'priority', 'status']),
            'categoryOptions' => MaintenanceRequest::CATEGORIES,
            'priorityOptions' => MaintenanceRequest::PRIORITIES,
            'statusOptions' => MaintenanceRequest::STATUSES,
            'can' => ['create' => Gate::allows('create', MaintenanceRequest::class)],
        ]);
    }

    public function show(MaintenanceRequest $maintenanceRequest)
    {
        Gate::authorize('view', $maintenanceRequest);

        $companyId = $this->resolveCompanyId();

        if ($maintenanceRequest->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $maintenanceRequest->load(['tenant:id,name,email', 'unit:id,unit_no', 'assignee:id,name', 'photos']);

        return Inertia::render('maintenance/show', [
            'request' => $maintenanceRequest,
            'caretakers' => User::role('caretaker')
                ->whereHas('companies', fn($q) => $q->where('company_id', $companyId))
                ->orderBy('name')
                ->get(['id', 'name']),
            'statusOptions' => MaintenanceRequest::STATUSES,
        ]);
    }

    public function create()
    {
        Gate::authorize('create', MaintenanceRequest::class);

        $companyId = $this->resolveCompanyId();

        return Inertia::render('maintenance/create', [
            'tenants' => User::role('tenant')
                ->whereHas('companies', fn($q) => $q->where('company_id', $companyId))
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'caretakers' => User::role('caretaker')
                ->whereHas('companies', fn($q) => $q->where('company_id', $companyId))
                ->orderBy('name')
                ->get(['id', 'name']),
            'categoryOptions' => MaintenanceRequest::CATEGORIES,
            'priorityOptions' => MaintenanceRequest::PRIORITIES,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', MaintenanceRequest::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'tenant_id' => ['required', Rule::exists('company_user', 'user_id')->where('company_id', $companyId)],
            'category' => ['required', Rule::in(MaintenanceRequest::CATEGORIES)],
            'priority' => ['required', Rule::in(MaintenanceRequest::PRIORITIES)],
            'description' => 'required|string|max:1000',
            'assignee_id' => ['nullable', Rule::exists('company_user', 'user_id')->where('company_id', $companyId)],
            'photos' => 'nullable|array|max:6',
            'photos.*' => 'image|max:5120', // 5MB per photo
        ]);

        $activeLease = Lease::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $validated['tenant_id'])
            ->where('status', 'active')
            ->first();

        $number = sprintf(
            'MNT-%d-%04d',
            now()->year,
            DocumentCounter::nextNumber($companyId, 'maintenance')
        );

        $maintenanceRequest = MaintenanceRequest::create([
            'company_id' => $companyId,
            'number' => $number,
            'lease_id' => $activeLease?->id,
            'tenant_id' => $validated['tenant_id'],
            'unit_id' => $activeLease?->unit_id,
            'category' => $validated['category'],
            'priority' => $validated['priority'],
            'description' => $validated['description'],
            'assignee_id' => $validated['assignee_id'] ?? null,
            'raised_at' => now(),
            'status' => $validated['assignee_id'] ? 'assigned' : 'open',
        ]);

        foreach ($request->file('photos', []) as $photo) {
            $path = $photo->store("maintenance/{$maintenanceRequest->id}", 'public');
            $maintenanceRequest->photos()->create(['path' => $path, 'kind' => 'before']);
        }

        return redirect()->route('maintenance.index')->with('success', "Request {$maintenanceRequest->number} logged.");
    }

    public function update(Request $request, MaintenanceRequest $maintenanceRequest)
    {
        Gate::authorize('update', $maintenanceRequest);

        $companyId = $this->resolveCompanyId();

        if ($maintenanceRequest->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(MaintenanceRequest::STATUSES)],
            'assignee_id' => ['nullable', Rule::exists('company_user', 'user_id')->where('company_id', $companyId)],
            'after_photos' => 'nullable|array|max:6',
            'after_photos.*' => 'image|max:5120',
        ]);

        $maintenanceRequest->update([
            'status' => $validated['status'],
            'assignee_id' => $validated['assignee_id'] ?? $maintenanceRequest->assignee_id,
        ]);

        foreach ($request->file('after_photos', []) as $photo) {
            $path = $photo->store("maintenance/{$maintenanceRequest->id}", 'public');
            $maintenanceRequest->photos()->create(['path' => $path, 'kind' => 'after']);
        }

        return back()->with('success', 'Request updated.');
    }

    public function destroy(MaintenanceRequest $maintenanceRequest)
    {
        Gate::authorize('delete', $maintenanceRequest);

        $companyId = $this->resolveCompanyId();

        if ($maintenanceRequest->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        foreach ($maintenanceRequest->photos as $photo) {
            Storage::disk('public')->delete($photo->path);
        }

        $maintenanceRequest->delete();

        return redirect()->route('maintenance.index')->with('success', 'Request deleted.');
    }
}