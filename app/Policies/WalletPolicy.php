<?php

namespace App\Policies;

use App\Models\User;
use App\Models\Wallet;

class WalletPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module wallet');
    }

    public function view(User $user, Wallet $wallet): bool
    {
        return $user->can('module wallet');
    }

    public function deposit(User $user): bool
    {
        return $user->can('module wallet') && $user->can('deposit wallet');
    }

    public function applyToInvoice(User $user): bool
    {
        return $user->can('module wallet') && $user->can('apply wallet');
    }
}