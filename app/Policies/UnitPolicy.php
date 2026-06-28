<?php

namespace App\Policies;

use App\Models\Unit;
use App\Models\User;

class UnitPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module units');
    }

    public function view(User $user, Unit $unit): bool
    {
        return $user->can('module units');
    }

    public function create(User $user): bool
    {
        return $user->can('module units') && $user->can('create units');
    }

    public function update(User $user, Unit $unit): bool
    {
        return $user->can('module units') && $user->can('edit units');
    }

    public function delete(User $user, Unit $unit): bool
    {
        return $user->can('module units') && $user->can('delete units');
    }
}