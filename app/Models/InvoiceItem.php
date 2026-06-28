<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class InvoiceItem extends Model
{
    public const TYPES = ['rent', 'service', 'water', 'electricity', 'penalty', 'misc'];

    protected $fillable = [
        'invoice_id', 'type', 'description', 'quantity', 'unit_price', 'amount',
    ];

    protected $casts = [
        'quantity' => 'decimal:2',
        'unit_price' => 'decimal:2',
        'amount' => 'decimal:2',
    ];

    public function invoice()
    {
        return $this->belongsTo(Invoice::class);
    }
}