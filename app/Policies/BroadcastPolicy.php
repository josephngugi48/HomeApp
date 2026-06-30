<?php

namespace App\Policies;

use App\Models\Broadcast;
use App\Models\User;

class BroadcastPolicy
{
    public function viewAny(User $user): bool { return $user->can('module broadcasts'); }
    public function view(User $user, Broadcast $broadcast): bool { return $user->can('module broadcasts'); }
    public function create(User $user): bool { return $user->can('module broadcasts') && $user->can('create broadcasts'); }
    public function delete(User $user, Broadcast $broadcast): bool { return $user->can('module broadcasts') && $user->can('delete broadcasts'); }
}