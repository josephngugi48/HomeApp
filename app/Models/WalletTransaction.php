<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    public const TYPES = ['deposit', 'payment', 'refund', 'adjustment'];

    public $timestamps = false;

    protected $fillable = [
        'wallet_id', 'type', 'amount', 'ref', 'occurred_at', 'meta',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'occurred_at' => 'datetime',
        'meta' => 'json',
    ];

    public function wallet()
    {
        return $this->belongsTo(Wallet::class);
    }
}