<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;

class Wallet extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'tenant_id', 'balance',
    ];

    protected $casts = [
        'balance' => 'decimal:2',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function transactions()
    {
        return $this->hasMany(WalletTransaction::class);
    }

    /**
     * Get-or-create the wallet for a tenant within a company. Every
     * tenant gets exactly one wallet per company (matches the
     * migration's unique(['company_id','tenant_id'])) — this is the
     * single entry point other modules should use rather than calling
     * Wallet::create() directly, so the unique constraint is never
     * raced against.
     */
    public static function forTenant(int $companyId, int $tenantId): self
    {
        return static::query()->firstOrCreate(
            ['company_id' => $companyId, 'tenant_id' => $tenantId],
            ['balance' => 0]
        );
    }

    /**
     * Record a ledger entry and update balance — the SAME chokepoint
     * discipline as Invoice::applyPayment(). No code outside this
     * method should ever write to wallet_transactions or mutate
     * $wallet->balance directly.
     *
     * @param string $type one of WalletTransaction::TYPES
     * @param float $amount signed — positive for deposit/refund, negative for payment/adjustment-out
     */
    public function recordTransaction(string $type, float $amount, ?string $ref, ?array $meta = null): WalletTransaction
    {
        return DB::transaction(function () use ($type, $amount, $ref, $meta) {
            $this->lockForUpdate()->refresh();

            $transaction = $this->transactions()->create([
                'type' => $type,
                'amount' => $amount,
                'ref' => $ref ?? \Illuminate\Support\Str::uuid()->toString(),
                'occurred_at' => now(),
                'meta' => $meta,
            ]);

            $this->balance = round((float) $this->balance + $amount, 2);
            $this->save();

            return $transaction;
        });
    }
}