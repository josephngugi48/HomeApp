<?php

namespace App\Models;

use App\Models\Apartment;
use App\Models\Unit;
use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Location extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany, LogsActivity;

    protected $fillable = [
        'company_id', 'uuid', 'name', 'code', 'status',
    ];

    protected static function booted(): void
    {
        static::creating(function (Location $location) {
            if (empty($location->uuid)) {
                $location->uuid = (string) Str::uuid();
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

    public function apartments()
    {
        return $this->hasMany(Apartment::class);
    }

    /**
     * Units belonging to this location, via apartments.
     * Used for the units_count aggregate — not a direct FK relation.
     */
    public function units()
    {
        return $this->hasManyThrough(
            Unit::class,
            Apartment::class,
            'location_id', // FK on apartments
            'apartment_id', // FK on units
            'id',           // local key on locations
            'id'            // local key on apartments
        );
    }
}