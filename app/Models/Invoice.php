<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Invoice extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'uuid', 'number', 'lease_id', 'tenant_id', 'unit_id',
        'issue_date', 'due_date', 'subtotal', 'total', 'balance', 'status',
        'created_by',
    ];

    protected $casts = [
        'issue_date' => 'date',
        'due_date' => 'date',
        'subtotal' => 'decimal:2',
        'total' => 'decimal:2',
        'balance' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($invoice) {
            if (empty($invoice->uuid)) {
                $invoice->uuid = (string) Str::uuid();
            }
        });
    }

    public function lease()
    {
        return $this->belongsTo(Lease::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function items()
    {
        return $this->hasMany(InvoiceItem::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}