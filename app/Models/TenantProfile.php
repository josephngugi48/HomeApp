<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TenantProfile extends Model
{
    protected $fillable = [
        'user_id', 'national_id', 'kra_pin', 'date_of_birth', 'marital_status',
        'photo_path', 'next_of_kin_name', 'next_of_kin_phone',
        'next_of_kin_relationship', 'next_of_kin_address',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}