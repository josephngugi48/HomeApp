<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Payment extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'uuid', 'ref', 'tenant_id', 'invoice_id',
        'amount', 'method', 'external_ref', 'paid_at',
        'reversed_at', 'reversed_by', 'created_by',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'paid_at' => 'datetime',
        'reversed_at' => 'datetime',
    ];

    protected static function booted()
    {
        static::creating(function ($payment) {
            if (empty($payment->uuid)) {
                $payment->uuid = (string) Str::uuid();
            }
        });
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }

    public function reversedBy()
    {
        return $this->belongsTo(User::class, 'reversed_by');
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}