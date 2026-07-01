<?php
// app/Services/Tenant/TenantWalletService.php

namespace App\Services\Tenant;

use App\Models\User;
use App\Models\Wallet;
use App\Models\DocumentCounter;
use Illuminate\Support\Facades\DB;

class TenantWalletService
{
    public function __construct(private readonly User $tenant)
    {
    }

    public function getOrCreate(int $companyId): Wallet
    {
        return Wallet::forTenant($companyId, $this->tenant->id);
    }

    public function getWithTransactions(int $companyId): Wallet
    {
        $wallet = $this->getOrCreate($companyId);

        $wallet->load(['transactions' => fn ($q) => $q->orderByDesc('occurred_at')->limit(20)]);

        return $wallet;
    }

    /**
     * Tenant initiates a wallet top-up via M-Pesa STK push.
     * The actual payment application happens via the existing
     * MpesaController callback — this method creates the pending
     * MpesaRequest record. The wallet credit is added only on
     * confirmed success, never on initiation.
     */
    public function initiateTopUp(int $companyId, string $phone, float $amount): \App\Models\MpesaRequest
    {
        return DB::transaction(function () use ($companyId, $phone, $amount) {
            $wallet = $this->getOrCreate($companyId);

            return \App\Models\MpesaRequest::create([
                'company_id' => $companyId,
                'tenant_id' => $this->tenant->id,
                'invoice_id' => null, // wallet top-up, not invoice payment
                'phone' => $phone,
                'amount' => $amount,
                'status' => 'pending',
            ]);
        });
    }
}