<?php

namespace App\Http\Controllers\Tenants;

use App\Http\Controllers\Controller;
use App\Models\TenantProfile;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class TenantController extends Controller
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
        Gate::authorize('tenants.viewAny');

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $companyId = $this->resolveCompanyId();

        $query = User::query()
            ->role('tenant')
            ->whereHas('companies', function ($q) use ($companyId) {
                $q->where('companies.id', $companyId);
            })
            ->with('tenantProfile');

        // 🔍 Search (name, email, or national ID)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%")
                    ->orWhereHas('tenantProfile', function ($q) use ($search) {
                        $q->where('national_id', 'like', "%{$search}%");
                    });
            });
        }

        // ↕ Sorting (safe — only on the users table directly)
        $allowedSorts = ['id', 'name', 'email', 'created_at'];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc');
        } else {
            $query->orderBy('name', 'asc');
        }

        $tenants = $query->paginate($perPage)->withQueryString();
        $tenants->getCollection()->transform(function ($tenant) {
            $tenant->can = [
                'update' => Gate::allows('tenants.update', $tenant),
                'delete' => Gate::allows('tenants.delete', $tenant),
            ];
            return $tenant;
        });

        return Inertia::render('tenants/index', [
            'tenants' => $tenants,
            'filters' => [
                'search' => $search,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'can' => [
                'create' => Gate::allows('tenants.create'),
            ],
        ]);
    }

    public function create()
    {
        Gate::authorize('tenants.create');

        return Inertia::render('tenants/create');
    }

    public function store(Request $request)
    {
        Gate::authorize('tenants.create');

        $companyId = $this->resolveCompanyId();

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email'),
            ],
            'phone' => 'nullable|string|max:32',
            'password' => ['required', 'confirmed', Password::defaults()],
            'national_id' => [
                'required', 'string', 'max:64',
                Rule::unique('tenant_profiles', 'national_id'),
            ],
            'kra_pin' => 'nullable|string|max:32',
            'date_of_birth' => 'nullable|date|before:today',
            'marital_status' => 'nullable|string|max:32',
            'next_of_kin_name' => 'nullable|string|max:255',
            'next_of_kin_phone' => 'nullable|string|max:32',
            'next_of_kin_relationship' => 'nullable|string|max:64',
            'next_of_kin_address' => 'nullable|string|max:500',
        ]);

        $tenant = DB::transaction(function () use ($validated, $companyId) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'password' => $validated['password'], // hashed via cast on User model
            ]);

            // Attach to the current company via the pivot — this is the
            // membership record, not a column on users.
            $user->companies()->attach($companyId, [
                'status' => 'active',
                'joined_at' => now(),
                'invited_by' => auth()->id(),
            ]);

            // Assign the tenant role, team-scoped to this company. Spatie's
            // team context is already set by ResolveCurrentCompany middleware
            // for this request, so assignRole() scopes correctly.
            $user->assignRole('tenant');

            TenantProfile::create([
                'user_id' => $user->id,
                'national_id' => $validated['national_id'],
                'kra_pin' => $validated['kra_pin'] ?? null,
                'date_of_birth' => $validated['date_of_birth'] ?? null,
                'marital_status' => $validated['marital_status'] ?? null,
                'next_of_kin_name' => $validated['next_of_kin_name'] ?? null,
                'next_of_kin_phone' => $validated['next_of_kin_phone'] ?? null,
                'next_of_kin_relationship' => $validated['next_of_kin_relationship'] ?? null,
                'next_of_kin_address' => $validated['next_of_kin_address'] ?? null,
            ]);

            return $user;
        });

        return redirect()->route('tenants.index')->with('success', 'Tenant created successfully.');
    }

    public function edit(User $tenant)
    {
        Gate::authorize('tenants.update', $tenant);

        $tenant->load('tenantProfile');

        return Inertia::render('tenants/edit', [
            'tenant' => $tenant,
        ]);
    }

    public function update(Request $request, User $tenant)
    {
        Gate::authorize('tenants.update', $tenant);

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($tenant->id),
            ],
            'phone' => 'nullable|string|max:32',
            'password' => ['nullable', 'confirmed', Password::defaults()],
            'national_id' => [
                'required', 'string', 'max:64',
                Rule::unique('tenant_profiles', 'national_id')
                    ->ignore($tenant->tenantProfile?->id),
            ],
            'kra_pin' => 'nullable|string|max:32',
            'date_of_birth' => 'nullable|date|before:today',
            'marital_status' => 'nullable|string|max:32',
            'next_of_kin_name' => 'nullable|string|max:255',
            'next_of_kin_phone' => 'nullable|string|max:32',
            'next_of_kin_relationship' => 'nullable|string|max:64',
            'next_of_kin_address' => 'nullable|string|max:500',
        ]);

        DB::transaction(function () use ($validated, $tenant) {
            $tenant->update([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
            ]);

            if (!empty($validated['password'])) {
                $tenant->update(['password' => $validated['password']]);
            }

            $tenant->tenantProfile()->updateOrCreate(
                ['user_id' => $tenant->id],
                [
                    'national_id' => $validated['national_id'],
                    'kra_pin' => $validated['kra_pin'] ?? null,
                    'date_of_birth' => $validated['date_of_birth'] ?? null,
                    'marital_status' => $validated['marital_status'] ?? null,
                    'next_of_kin_name' => $validated['next_of_kin_name'] ?? null,
                    'next_of_kin_phone' => $validated['next_of_kin_phone'] ?? null,
                    'next_of_kin_relationship' => $validated['next_of_kin_relationship'] ?? null,
                    'next_of_kin_address' => $validated['next_of_kin_address'] ?? null,
                ]
            );
        });

        return redirect()->route('tenants.index')->with('success', 'Tenant updated successfully.');
    }

    public function destroy(User $tenant)
    {
        Gate::authorize('tenants.delete', $tenant);

        $companyId = $this->resolveCompanyId();

        DB::transaction(function () use ($tenant, $companyId) {
            $tenant->companies()->detach($companyId);
        });

        return redirect()->route('tenants.index')->with('success', 'Tenant removed from this company.');
    }
}