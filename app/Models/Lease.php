<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Lease extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'uuid', 'tenant_id', 'unit_id',
        'start_date', 'end_date', 'rent', 'service_charge',
        'deposit', 'status', 'vacate_notice_at', 'created_by',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'vacate_notice_at' => 'date',
        'rent' => 'decimal:2',
        'service_charge' => 'decimal:2',
        'deposit' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($lease) {
            if (empty($lease->uuid)) {
                $lease->uuid = (string) Str::uuid();
            }
        });
    }

    public function company()
    {
        return $this->belongsTo(Company::class);
    }

    public function tenant()
    {
        return $this->belongsTo(User::class, 'tenant_id');
    }

    public function unit()
    {
        return $this->belongsTo(Unit::class);
    }

    public function createdBy()
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function invoices()
    {
        return $this->hasMany(Invoice::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function issues()
    {
        return $this->hasMany(Issue::class);
    }

    public function notices()
    {
        return $this->hasMany(Notice::class);
    }

    public function maintenanceRequests()
    {
        return $this->hasMany(MaintenanceRequest::class);
    }
}