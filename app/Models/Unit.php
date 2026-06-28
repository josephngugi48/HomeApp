<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Unit extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany, LogsActivity;

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

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function apartment()
    {
        return $this->belongsTo(Apartment::class);
    }

    public function leases()
    {
        return $this->hasMany(Lease::class);
    }

    /**
     * TEMPORARY CAVEAT: until the Leases module ships, `status` is a
     * manually-set field on this model and has no relationship to
     * activeLease() below — it can drift from reality (e.g. marked
     * "Occupied" with no actual lease record). Once Leases exists,
     * revisit whether `status` should become a computed accessor
     * derived from activeLease()->exists() instead of a stored column,
     * or whether lease creation/termination should auto-sync this column.
     */
    public function activeLease()
    {
        return $this->hasOne(Lease::class)->where('status', 'active');
    }
}