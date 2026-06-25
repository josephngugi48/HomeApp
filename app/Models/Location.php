<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Location extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'uuid', 'name', 'code', 'status',
    ];

    protected static function booted()
    {
        static::creating(function ($location) {
            if (empty($location->uuid)) {
                $location->uuid = (string) Str::uuid();
            }
        });
    }

    public function apartments()
    {
        return $this->hasMany(Apartment::class);
    }
}