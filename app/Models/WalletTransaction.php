<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class WalletTransaction extends Model
{
    use BelongsToCompany;

    public $timestamps = false; // only created_at

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