<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class WhatsappSetting extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['api_key', 'api_secret'])
            ->dontSubmitEmptyLogs();
    }
    protected $fillable = [
        'provider',
        'api_key',
        'api_secret',
        'sender_number',
        'is_enabled',
    ];

    protected $casts = [
        'is_enabled' => 'boolean',
    ];

    public static function current()
    {
        return static::firstOrCreate([], [
            'is_enabled' => false,
        ]);
    }
}
