<?php
// app/Http/Controllers/Tenant/TenantIssueController.php

namespace App\Http\Controllers\Tenant;

use App\Http\Controllers\Controller;
use App\Http\Resources\Tenant\TenantIssueResource;
use App\Models\Issue;
use App\Services\Tenant\TenantIssueService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class TenantIssueController extends Controller
{
    public function index(): \Inertia\Response
    {
        $service = new TenantIssueService(auth()->user());

        return Inertia::render('tenant/issues/index', [
            'issues' => TenantIssueResource::collection($service->paginate()),
        ]);
    }

    public function create(): \Inertia\Response
    {
        return Inertia::render('tenant/issues/create', [
            'categoryOptions' => Issue::CATEGORIES,
        ]);
    }

    public function store(Request $request): \Illuminate\Http\RedirectResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:2000',
            'category' => ['required', Rule::in(Issue::CATEGORIES)],
        ]);

        $service = new TenantIssueService(auth()->user());
        $service->create($validated, app('currentCompany')->id);

        return redirect()->route('tenant.issues.index')->with('success', 'Issue submitted successfully.');
    }

    public function show(int $id): \Inertia\Response
    {
        $service = new TenantIssueService(auth()->user());

        return Inertia::render('tenant/issues/show', [
            'issue' => new TenantIssueResource($service->findForTenant($id)),
        ]);
    }
}