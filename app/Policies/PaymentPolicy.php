<?php

namespace App\Policies;

use App\Models\Payment;
use App\Models\User;

class PaymentPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module payments');
    }

    public function view(User $user, Payment $payment): bool
    {
        return $user->can('module payments');
    }

    public function create(User $user): bool
    {
        return $user->can('module payments') && $user->can('create payments');
    }

    public function reverse(User $user, Payment $payment): bool
    {
        return $user->can('module payments') && $user->can('reverse payments');
    }
}