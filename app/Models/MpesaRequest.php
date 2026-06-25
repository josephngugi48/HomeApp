<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class MpesaRequest extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'tenant_id', 'invoice_id',
        'checkout_request_id', 'merchant_request_id',
        'phone', 'amount', 'status', 'result_payload',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'result_payload' => 'json',
    ];

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}