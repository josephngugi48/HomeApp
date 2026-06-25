<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Unit extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'apartment_id', 'uuid', 'unit_no', 'floor',
        'bedrooms', 'rent', 'service_charge', 'status',
    ];

    protected $casts = [
        'rent' => 'decimal:2',
        'service_charge' => 'decimal:2',
    ];

    protected static function booted()
    {
        static::creating(function ($unit) {
            if (empty($unit->uuid)) {
                $unit->uuid = (string) Str::uuid();
            }
        });
    }

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }

    public function leases()
    {
        return $this->hasMany(Lease::class);
    }

    public function activeLease()
    {
        return $this->hasOne(Lease::class)->where('status', 'active');
    }
}