<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class Notice extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'lease_id', 'tenant_id', 'unit_id',
        'type', 'submitted_at', 'effective_at', 'status',
    ];

    protected $casts = [
        'submitted_at' => 'datetime',
        'effective_at' => 'date',
    ];

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
}