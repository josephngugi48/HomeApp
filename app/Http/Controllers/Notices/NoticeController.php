<?php

namespace App\Http\Controllers\Notices;

use App\Http\Controllers\Controller;
use App\Models\Lease;
use App\Models\Notice;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class NoticeController extends Controller
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
        Gate::authorize('viewAny', Notice::class);

        $companyId = $this->resolveCompanyId();

        $query = Notice::query()
            ->where('company_id', $companyId)
            ->with(['tenant:id,name', 'unit:id,unit_no', 'lease:id,status']);

        if ($search = $request->string('search')->toString()) {
            $query->whereHas('tenant', fn ($q) => $q->where('name', 'like', "%{$search}%"));
        }

        if ($type = $request->string('type')->toString()) {
            $query->where('type', $type);
        }

        if ($status = $request->string('status')->toString()) {
            $query->where('status', $status);
        }

        $notices = $query->orderByDesc('submitted_at')
            ->paginate($request->integer('per_page', 10))
            ->withQueryString();

        $notices->getCollection()->transform(function ($notice) {
            $notice->needs_action = $notice->needsAction();
            $notice->can = [
                'update' => Gate::allows('update', $notice),
                'delete' => Gate::allows('delete', $notice),
            ];
            return $notice;
        });

        // The surfaced "action needed" list — this is the entire
        // replacement for auto-termination. Staff see this every time
        // they load the page; nothing fires without them clicking
        // through to LeaseController::terminate().
        $actionNeededCount = Notice::query()
            ->where('company_id', $companyId)
            ->actionNeeded()
            ->count();

        return Inertia::render('notices/index', [
            'notices' => $notices,
            'filters' => $request->only(['search', 'type', 'status']),
            'typeOptions' => Notice::TYPES,
            'statusOptions' => Notice::STATUSES,
            'actionNeededCount' => $actionNeededCount,
            'can' => ['create' => Gate::allows('create', Notice::class)],
        ]);
    }

    public function create()
    {
        Gate::authorize('create', Notice::class);

        $companyId = $this->resolveCompanyId();

        return Inertia::render('notices/create', [
            'leases' => Lease::query()
                ->where('company_id', $companyId)
                ->where('status', 'active')
                ->with(['tenant:id,name', 'unit:id,unit_no'])
                ->get(['id', 'tenant_id', 'unit_id']),
            'typeOptions' => Notice::TYPES,
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', Notice::class);

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'lease_id' => ['required', Rule::exists('leases', 'id')->where('company_id', $companyId)],
            'type' => ['required', Rule::in(Notice::TYPES)],
            'effective_at' => 'required|date|after_or_equal:today',
        ]);

        $lease = Lease::query()->where('company_id', $companyId)->findOrFail($validated['lease_id']);

        Notice::create([
            'company_id' => $companyId,
            'lease_id' => $lease->id,
            'tenant_id' => $lease->tenant_id,
            'unit_id' => $lease->unit_id,
            'type' => $validated['type'],
            'submitted_at' => now(),
            'effective_at' => $validated['effective_at'],
            'status' => 'open',
        ]);

        return redirect()->route('notices.index')->with('success', 'Notice recorded.');
    }

    public function update(Request $request, Notice $notice)
    {
        Gate::authorize('update', $notice);

        $companyId = $this->resolveCompanyId();

        if ($notice->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $validated = $request->validate([
            'status' => ['required', Rule::in(Notice::STATUSES)],
        ]);

        $notice->update($validated);

        return back()->with('success', 'Notice updated.');
    }

    /**
     * The explicit, human-triggered action a "needs action" notice
     * resolves to. Reuses LeaseController's termination logic exactly
     * — this is the one-click confirm the surfaced-not-automatic
     * decision calls for. No scheduled job calls this; only a person
     * clicking a button in the UI does.
     */
    public function actOn(Notice $notice)
    {
        Gate::authorize('update', $notice);

        $companyId = $this->resolveCompanyId();

        if ($notice->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        if (! $notice->needsAction()) {
            return back()->with('error', 'This notice does not require lease termination action.');
        }

        app(\App\Http\Controllers\Leases\LeaseController::class)
            ->terminate(request()->merge(['reason' => 'Vacating notice fulfilled']), $notice->lease);

        $notice->update(['status' => 'closed']);

        return back()->with('success', 'Lease terminated and notice closed.');
    }

    public function destroy(Notice $notice)
    {
        Gate::authorize('delete', $notice);

        $companyId = $this->resolveCompanyId();

        if ($notice->company_id !== $companyId) {
            abort(403, 'Unauthorized action.');
        }

        $notice->delete();
        
        return redirect()->route('notices.index')->with('success', 'Notice deleted.');
    }
}