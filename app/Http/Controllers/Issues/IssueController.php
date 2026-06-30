<?php

namespace App\Http\Controllers\Issues;

use App\Http\Controllers\Controller;
use App\Models\Issue;
use App\Models\User;
use App\Models\Lease;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class IssueController extends Controller
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
        Gate::authorize('viewAny', Issue::class);

        $companyId = $this->resolveCompanyId();

        $query = Issue::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name', 'unit:id,unit_no', 'assignee:id,name']);

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"));
            });
        }

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $allowedSorts = ['id', 'title', 'category', 'status', 'raised_at'];
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'desc')->toString();

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'asc' ? 'asc' : 'desc');
        } else {
            $query->orderByDesc('raised_at');
        }

        $issues = $query->paginate($request->integer('per_page', 10))->withQueryString();
        $issues->getCollection()->transform(function ($issue) {
            $issue->can = [
                'update' => Gate::allows('update', $issue),
                'delete' => Gate::allows('delete', $issue),
            ];
            return $issue;
        });

        return Inertia::render('issues/index', [
            'issues' => $issues,
            'filters' => $request->only(['search', 'category', 'status', 'sort_by', 'sort_direction']),
            'categoryOptions' => Issue::CATEGORIES,
            'statusOptions' => Issue::STATUSES,
            'can' => ['create' => Gate::allows('create', Issue::class)],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Issue::class);

        $companyId = $this->resolveCompanyId();

        return Inertia::render('issues/create', [
            'tenants' => User::role('tenant')
                ->whereHas('companies', fn($q) => $q->where('company_id', $companyId))
                ->orderBy('name')
                ->get(['id', 'name', 'email']),
            'caretakers' => User::role('caretaker')
                ->whereHas('companies', fn($q) => $q->where('company_id', $companyId))
                ->orderBy('name')
                ->get(['id', 'name']),
            'categoryOptions' => Issue::CATEGORIES,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Issue::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'tenant_id' => ['required', Rule::exists('company_user', 'user_id')->where('company_id', $companyId)],
            'category' => ['required', Rule::in(Issue::CATEGORIES)],
            'title' => 'required|string|max:255',
            'body' => 'required|string|max:2000',
            'assignee_id' => ['nullable', Rule::exists('company_user', 'user_id')->where('company_id', $companyId)],
        ]);

        // Derive unit_id/lease_id from the tenant's active lease, if any
        // — an issue can exist even without an active lease (e.g. a
        // tenant who just vacated reporting something left behind),
        // so this is best-effort, not required.
        $activeLease = Lease::query()
            ->where('company_id', $companyId)
            ->where('tenant_id', $validated['tenant_id'])
            ->where('status', 'active')
            ->first();

        Issue::create([
            'company_id' => $companyId,
            'lease_id' => $activeLease?->id,
            'tenant_id' => $validated['tenant_id'],
            'unit_id' => $activeLease?->unit_id,
            'category' => $validated['category'],
            'title' => $validated['title'],
            'body' => $validated['body'],
            'assignee_id' => $validated['assignee_id'] ?? null,
            'status' => $validated['assignee_id'] ? 'assigned' : 'open',
            'raised_at' => now(),
        ]);

        return redirect()->route('issues.index')->with('success', 'Issue logged successfully.');
    }

    public function update(Request $request, Issue $issue)
    {
        Gate::authorize('update', $issue);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'status' => ['required', Rule::in(Issue::STATUSES)],
            'assignee_id' => ['nullable', Rule::exists('company_user', 'user_id')->where('company_id', $companyId)],
        ]);

        $issue->update($validated);

        return back()->with('success', 'Issue updated.');
    }

    public function destroy(Issue $issue)
    {
        Gate::authorize('delete', $issue);
        
        $issue->delete();
        
        return redirect()->route('issues.index')->with('success', 'Issue deleted.');
    }
}