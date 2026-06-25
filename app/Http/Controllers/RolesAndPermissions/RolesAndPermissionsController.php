<?php

namespace App\Http\Controllers\RolesAndPermissions;

use App\Http\Controllers\Controller;
use Inertia\Inertia;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;

class RolesAndPermissionsController extends Controller
{
    public function index()
    {
        $perPage = request('per_page', 10);
        $search = request('search');
        $guardName = request('guard_name');
        $sortBy = request('sort_by'); // No default - can be null
        $sortDirection = request('sort_direction', 'asc');

        $query = Role::query();

        // Apply search filter
        if ($search) {
            $query->where('name', 'like', "%{$search}%");
        }

        // Apply guard_name filter
        if ($guardName) {
            if (is_array($guardName)) {
                $query->whereIn('guard_name', $guardName);
            } else {
                $query->where('guard_name', $guardName);
            }
        }

        // Load permissions count
        $query->withCount('permissions');

        // Apply sorting only if sort_by is provided
        if ($sortBy) {
            $allowedSortColumns = ['id', 'name', 'guard_name', 'created_at', 'updated_at', 'permissions_count'];

            if (in_array($sortBy, $allowedSortColumns)) {
                $query->orderBy($sortBy, $sortDirection);
            }
        }
        // If no sorting specified, data comes in default database order

        $roles = $query->paginate($perPage);

        return Inertia::render('roles/roles', [
            'roles' => $roles,
            'filters' => [
                'search' => $search,
                'guard_name' => $guardName,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
        ]);
    }
    public function bulkDelete(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:roles,id',
        ]);

        // Prevent deleting super-admin role
        $roles = Role::whereIn('id', $request->ids)
            ->where('name', '!=', 'super-admin')
            ->get();

        foreach ($roles as $role) {
            $role->delete();
        }

        return redirect()->back()->with('success', 'Roles deleted successfully');
    }
    public function create()
    {
        return Inertia::render('roles/create', [
            'permissions' => Permission::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255', 'unique:roles,name'],
            'guard_name' => ['required', 'string'],
            'permissions' => ['array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role = Role::create([
            'name' => $validated['name'],
            'guard_name' => $validated['guard_name'],
        ]);

        if (!empty($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role created successfully.');
    }
    public function destroy($id)
    {
        $role = Role::findOrFail($id);

        // Prevent deleting super-admin
        if ($role->name === 'super-admin') {
            return redirect()->back()->with('error', 'Cannot delete super-admin role');
        }

        $role->delete();

        return redirect()->back()->with('success', 'Role deleted successfully');
    }
    public function edit($id)
    {
        $role = Role::with('permissions')->findOrFail($id);

        return Inertia::render('roles/edit', [
            'role' => $role,
            'permissions' => Permission::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        // Prevent updating super-admin name
        $nameRule = $role->name === 'super-admin'
            ? ['required', 'string', 'max:255']
            : ['required', 'string', 'max:255', 'unique:roles,name,' . $id];

        $validated = $request->validate([
            'name' => $nameRule,
            'guard_name' => ['required', 'string'],
            'permissions' => ['array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        // Only update name if not super-admin
        if ($role->name !== 'super-admin') {
            $role->update([
                'name' => $validated['name'],
            ]);
        }

        // Always allow permission updates
        if (isset($validated['permissions'])) {
            $role->syncPermissions($validated['permissions']);
        }

        return redirect()
            ->route('roles.index')
            ->with('success', 'Role updated successfully.');
    }

    // Optional: Dedicated permissions management page
    public function managePermissions($id)
    {
        $role = Role::with('permissions')->findOrFail($id);

        return Inertia::render('roles/manage-permissions', [
            'role' => $role,
            'permissions' => Permission::orderBy('name')->get(),
        ]);
    }

    public function updatePermissions(Request $request, $id)
    {
        $role = Role::findOrFail($id);

        $validated = $request->validate([
            'permissions' => ['required', 'array'],
            'permissions.*' => ['exists:permissions,id'],
        ]);

        $role->syncPermissions($validated['permissions']);

        return redirect()
            ->route('roles.index')
            ->with('success', 'Permissions updated successfully.');
    }
}