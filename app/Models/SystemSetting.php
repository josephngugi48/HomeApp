<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Models\Activity;

class SystemSetting extends Model
{
    use LogsActivity, BelongsToCompany;

    protected $fillable = [
        'company_id',
        'app_name',
        'app_logo',
        'primary_color',
        'secondary_color',
        'accent_color',
        'footer_text',
        'is_mfa_enabled',
    ];

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

    protected function tapActivity(Activity $activity, string $eventName): void
    {
        if (app()->bound('currentCompany')) {
            $activity->company_id = app('currentCompany')->id;
        }
    }

    public static function current(): self
    {
        // Return a dummy instance when no company context exists (e.g., guests, console)
        if (! app()->bound('currentCompany')) {
            return new static([
                'app_name' => config('app.name'),
                'primary_color' => '#006738',
                'secondary_color' => '#FDB913',
                'accent_color' => '#FDB913',
                'is_mfa_enabled' => false,
            ]);
        }

        return static::firstOrCreate(
            ['company_id' => app('currentCompany')->id],
            [
                'app_name' => config('app.name'),
                'primary_color' => '#006738',
                'secondary_color' => '#FDB913',
                'accent_color' => '#FDB913',
                'is_mfa_enabled' => false,
            ]
        );
    }
}