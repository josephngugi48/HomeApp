<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Spatie\Activitylog\Traits\LogsActivity;
use Spatie\Activitylog\LogOptions;

class Setting extends Model
{
    use LogsActivity;

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }
    protected $fillable = ['key', 'value'];

    /**
     * Get a setting value by key.
     */
    public static function get(string $key, mixed $default = null): mixed
    {
        $setting = Cache::rememberForever("setting.{$key}", function () use ($key) {
            return static::where('key', $key)->first();
        });

        return ($setting instanceof self) ? $setting->value : $default;
    }

    /**
     * Set a setting value by key.
     */
    public static function set(string $key, mixed $value): void
    {
        static::updateOrCreate(
            ['key' => $key],
            ['value' => $value]
        );

        Cache::forget("setting.{$key}");
    }

    /**
     * Get multiple settings at once.
     */
    public static function getMany(array $keys): array
    {
        $settings = static::whereIn('key', $keys)->pluck('value', 'key')->toArray();

        $result = [];
        foreach ($keys as $key) {
            $result[$key] = $settings[$key] ?? null;
        }

        return $result;
    }

    /**
     * Set multiple settings at once.
     */
    public static function setMany(array $data): void
    {
        foreach ($data as $key => $value) {
            static::set($key, $value);
        }
    }
}
