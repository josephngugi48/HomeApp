<?php

namespace App\Policies;

use App\Models\Location;
use App\Models\User;

class LocationPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module locations');
    }

    public function view(User $user, Location $location): bool
    {
        return $user->can('module locations');
    }

    public function create(User $user): bool
    {
        return $user->can('module locations') && $user->can('create locations');
    }

    public function update(User $user, Location $location): bool
    {
        return $user->can('module locations') && $user->can('edit locations');
    }

    public function delete(User $user, Location $location): bool
    {
        return $user->can('module locations') && $user->can('delete locations');
    }
}