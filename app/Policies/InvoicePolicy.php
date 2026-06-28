<?php

namespace App\Policies;

use App\Models\Invoice;
use App\Models\User;

class InvoicePolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('module invoices');
    }

    public function view(User $user, Invoice $invoice): bool
    {
        return $user->can('module invoices');
    }

    public function create(User $user): bool
    {
        return $user->can('module invoices') && $user->can('create invoices');
    }

    public function update(User $user, Invoice $invoice): bool
    {
        return $user->can('module invoices') && $user->can('edit invoices');
    }

    public function delete(User $user, Invoice $invoice): bool
    {
        return $user->can('module invoices') && $user->can('delete invoices');
    }
}