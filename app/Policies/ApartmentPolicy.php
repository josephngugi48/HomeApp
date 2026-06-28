<?php

namespace App\Policies;

use App\Models\Apartment;
use App\Models\User;

class ApartmentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module apartments');
    }

    public function view(User $user, Apartment $apartment): bool
    {
        return $user->can('module apartments');
    }

    public function create(User $user): bool
    {
        return $user->can('module apartments') && $user->can('create apartments');
    }

    public function update(User $user, Apartment $apartment): bool
    {
        return $user->can('module apartments') && $user->can('edit apartments');
    }

    public function delete(User $user, Apartment $apartment): bool
    {
        return $user->can('module apartments') && $user->can('delete apartments');
    }
}