<?php

namespace App\Policies;

use App\Models\Issue;
use App\Models\User;

class IssuePolicy
{
    public function viewAny(User $user): bool { return $user->can('module issues'); }
    public function view(User $user, Issue $issue): bool { return $user->can('module issues'); }
    public function create(User $user): bool { return $user->can('module issues') && $user->can('create issues'); }
    public function update(User $user, Issue $issue): bool { return $user->can('module issues') && $user->can('edit issues'); }
    public function delete(User $user, Issue $issue): bool { return $user->can('module issues') && $user->can('delete issues'); }
}