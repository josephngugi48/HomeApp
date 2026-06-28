<?php

namespace App\Policies;

use App\Models\Lease;
use App\Models\User;

class LeasePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module leases');
    }

    public function view(User $user, Lease $lease): bool
    {
        return $user->can('module leases');
    }

    public function create(User $user): bool
    {
        return $user->can('module leases') && $user->can('create leases');
    }

    public function update(User $user, Lease $lease): bool
    {
        return $user->can('module leases') && $user->can('edit leases');
    }

    public function delete(User $user, Lease $lease): bool
    {
        return $user->can('module leases') && $user->can('delete leases');
    }

    public function terminate(User $user, Lease $lease): bool
    {
        return $user->can('module leases') && $user->can('edit leases');
    }
}