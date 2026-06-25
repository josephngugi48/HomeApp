<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Apartment extends Model
{
    use HasFactory, SoftDeletes, BelongsToCompany;

    protected $fillable = [
        'company_id', 'uuid', 'location_id', 'name', 'code',
        'landlord_id', 'caretaker_id', 'status',
    ];

    protected static function booted()
    {
        static::creating(function ($apartment) {
            if (empty($apartment->uuid)) {
                $apartment->uuid = (string) Str::uuid();
            }
        });
    }

    public function location()
    {
        return $this->belongsTo(Location::class);
    }

    public function landlord()
    {
        return $this->belongsTo(User::class, 'landlord_id');
    }

    public function caretaker()
    {
        return $this->belongsTo(User::class, 'caretaker_id');
    }

    public function units()
    {
        return $this->hasMany(Unit::class);
    }
}