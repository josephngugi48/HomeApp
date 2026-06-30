<?php

namespace App\Policies;

use App\Models\User;
use App\Models\MaintenanceRequest;

class MaintenanceRequestPolicy
{
    public function view(User $user, MaintenanceRequest $maintenance): bool
    {
        return $user->can('module maintenance');
    }

    public function viewAny(User $user): bool
    {
        return $user->can('module maintenance');
    }

    public function create(User $user): bool
    {
        return $user->can('module maintenance') && $user->can('create maintenance');
    }

    public function update(User $user, MaintenanceRequest $maintenance): bool
    {
        return $user->can('module maintenance') && $user->can('edit maintenance');
    }

    public function delete(User $user, MaintenanceRequest $maintenance): bool
    {
        return $user->can('module maintenance') && $user->can('delete maintenance');
    }
}
