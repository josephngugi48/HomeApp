<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class MaintenanceRequest extends Model
{
    use SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'number', 'lease_id', 'tenant_id', 'unit_id',
        'category', 'priority', 'assignee_id', 'raised_at', 'status',
    ];

    protected $casts = [
        'raised_at' => 'datetime',
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

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assignee_id');
    }

    public function photos()
    {
        return $this->hasMany(MaintenancePhoto::class);
    }
}