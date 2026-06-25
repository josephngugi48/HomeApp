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

    /**
     * Boot the model methods
     */
    protected static function booted(): void
    {
        // 1. Always keep your local model events clean
        static::creating(function (Location $location) {
            // Fix the missing UUID issue
            if (empty($location->uuid)) {
                $location->uuid = (string) Str::uuid();
            }

            // Fallback safety check if the trait isn't catching it
            if (empty($location->company_id) && app()->has('currentCompany')) {
                $location->company_id = app('currentCompany')->id;
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

    public function units()
    {
        return $this->hasManyThrough(
            Unit::class,
            Apartment::class,
            'location_id', 
            'apartment_id', 
            'id',           
            'id'            
        );
    }
}
