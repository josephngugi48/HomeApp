<?php

namespace App\Http\Controllers\Users;

use App\Http\Controllers\Controller;
use App\Models\Status;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class UsersController extends Controller
{
    public function index(Request $request)
    {
        Gate::authorize('viewAny', User::class);

        $perPage = $request->integer('per_page', 10);
        $search = $request->string('search')->toString();
        $statusId = $request->integer('status_id');
        $role = $request->string('role')->toString();
        $sortBy = $request->string('sort_by')->toString();
        $sortDirection = $request->string('sort_direction', 'asc')->toString();

        $query = User::query()
            ->with(['status', 'roles']);

        // 🔍 Search (name or email)
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // 🟢 Filter by status
        if ($statusId) {
            $query->where('status_id', $statusId);
        }

        // 🛡 Filter by role (Spatie)
        if ($role) {
            $query->whereHas('roles', function ($q) use ($role) {
                $q->where('name', $role);
            });
        }

        // ↕ Sorting (safe)
        $allowedSorts = [
            'id',
            'name',
            'email',
            'created_at',
        ];

        if ($sortBy && in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDirection === 'desc' ? 'desc' : 'asc');
        }

        $users = $query->paginate($perPage)->withQueryString();
        $users->getCollection()->transform(function ($user) {
            $user->can = [
                'update' => Gate::allows('update', $user),
                'delete' => Gate::allows('delete', $user),
            ];
            return $user;
        });
        return Inertia::render('users/index', [
            'users' => $users,
            'filters' => [
                'search' => $search,
                'status_id' => $statusId,
                'role' => $role,
                'sort_by' => $sortBy,
                'sort_direction' => $sortDirection,
            ],
            'can' => [
                'create' => Gate::allows('create', User::class),
            ]
        ]);
    }

    public function create()
    {
        Gate::authorize('create', User::class);
        return Inertia::render('users/create', [
            'roles' => Role::select('id', 'name')->get(),
            'statuses' => Status::select('id', 'name', 'color')->get(),
        ]);
    }

    public function store(Request $request)
    {
        Gate::authorize('create', User::class);

        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users',
            'password' => 'required|confirmed|min:8',
            'status_id' => 'required|exists:statuses,id',
            'roles' => 'array',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'status_id' => $validated['status_id'],
        ]);

        $user->syncRoles($validated['roles'] ?? []);
        event(new Registered($user));

        return redirect()->route('users.index');
    }

    public function edit(User $user)
    {
        Gate::authorize('update', $user);

        // Load the user with their relationships
        $user->load(['status', 'roles']);

        return Inertia::render('users/edit', [
            'user' => $user,
            'roles' => Role::select('id', 'name')->get(),
            'statuses' => Status::select('id', 'name', 'color')->get(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        // Prevent editing super-admin 
        Gate::authorize('update', $user);


        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|confirmed|min:8',
            'status_id' => 'required|exists:statuses,id',
            'roles' => 'array',
        ]);

        // Update user basic info
        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'status_id' => $validated['status_id'],
        ]);

        // Update password only if provided
        if (!empty($validated['password'])) {
            $user->update([
                'password' => $validated['password'],
            ]);
        }

        // Sync roles
        $user->syncRoles($validated['roles'] ?? []);

        return redirect()->route('users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {

        Gate::authorize('delete', $user);


        $user->delete();

        return redirect()->route('users.index')->with('success', 'User deleted successfully.');
    }
}