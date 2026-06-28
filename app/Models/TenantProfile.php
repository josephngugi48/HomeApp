<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class TenantProfile extends Model
{
    use LogsActivity;

    protected $fillable = [
        'user_id', 'national_id', 'kra_pin', 'date_of_birth', 'marital_status',
        'photo_path', 'next_of_kin_name', 'next_of_kin_phone',
        'next_of_kin_relationship', 'next_of_kin_address',
    ];

    protected $casts = [
        'date_of_birth' => 'date',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}