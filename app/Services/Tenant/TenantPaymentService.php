<?php
// app/Services/Tenant/TenantPaymentService.php

namespace App\Services\Tenant;

use App\Models\Payment;
use App\Models\User;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Collection;
use Symfony\Component\HttpFoundation\StreamedResponse;

class TenantPaymentService
{
    public function __construct(private readonly User $tenant)
    {
    }

    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Payment::query()
            ->where('tenant_id', $this->tenant->id)
            ->whereNull('reversed_at')
            ->with('invoice:id,number')
            ->orderByDesc('paid_at')
            ->paginate($perPage)
            ->withQueryString();
    }

    public function exportCsv(): StreamedResponse
    {
        $payments = Payment::query()
            ->where('tenant_id', $this->tenant->id)
            ->whereNull('reversed_at')
            ->with('invoice:id,number')
            ->orderByDesc('paid_at')
            ->get();

        return response()->streamDownload(function () use ($payments) {
            $handle = fopen('php://output', 'w');
            fputcsv($handle, ['Payment ID', 'Amount (KES)', 'Reference', 'Invoice', 'Method', 'Date']);
            foreach ($payments as $p) {
                fputcsv($handle, [
                    $p->ref,
                    number_format((float) $p->amount, 2),
                    $p->external_ref ?? '',
                    $p->invoice?->number ?? '',
                    strtoupper($p->method),
                    $p->paid_at?->toDateString() ?? '',
                ]);
            }
            fclose($handle);
        }, 'payments-export.csv');
    }
}