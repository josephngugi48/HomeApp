<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class _SystemSetting extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
    protected $fillable = [
        'app_name',
        'app_logo',
        'primary_color',
        'secondary_color',
        'accent_color',
        'footer_text',
        'is_mfa_enabled',
    ];

    public static function current()
    {
        return static::firstOrCreate([], [
            'app_name' => config('app.name'),
            'primary_color' => '#006738',
            'secondary_color' => '#FDB913',
            'accent_color' => '#FDB913',
            'is_mfa_enabled' => false,
        ]);
    }
}
