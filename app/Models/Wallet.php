<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

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
}