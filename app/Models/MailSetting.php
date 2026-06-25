<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class MailSetting extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontLogIfAttributesChangedOnly(['password'])
            ->dontSubmitEmptyLogs();
    }
    protected $fillable = [
        'mailer',
        'host',
        'port',
        'username',
        'password',
        'from_address',
        'from_name',
        'encryption',
    ];

    public static function current()
    {
        return static::firstOrCreate([], [
            'mailer' => 'smtp',
        ]);
    }
}
