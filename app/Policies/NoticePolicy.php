<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Notice;

class NoticePolicy
{
    public function viewAny(User $user): bool { return $user->can('module notices'); }
    public function view(User $user, Notice $issue): bool { return $user->can('module notices'); }
    public function create(User $user): bool { return $user->can('module notices') && $user->can('create notices'); }
    public function update(User $user, Notice $issue): bool { return $user->can('module notices') && $user->can('edit notices'); }
    public function delete(User $user, Notice $issue): bool { return $user->can('module notices') && $user->can('delete notices'); }
}
