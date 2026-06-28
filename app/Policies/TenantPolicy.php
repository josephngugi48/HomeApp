<?php

namespace App\Policies;

use App\Models\User;

class TenantPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module tenants');
    }

    public function view(User $user, User $tenant): bool
    {
        return $user->can('module tenants');
    }

    public function create(User $user): bool
    {
        return $user->can('module tenants') && $user->can('create tenants');
    }

    public function update(User $user, User $tenant): bool
    {
        return $user->can('module tenants') && $user->can('edit tenants');
    }

    public function delete(User $user, User $tenant): bool
    {
        return $user->can('module tenants') && $user->can('delete tenants');
    }
}