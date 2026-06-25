<?php

namespace App\Models;

use App\Traits\BelongsToCompany;
use Illuminate\Database\Eloquent\Model;

class DocumentCounter extends Model
{
    use BelongsToCompany;

    protected $fillable = [
        'company_id', 'document_type', 'year', 'last_number',
    ];

    protected $casts = [
        'last_number' => 'integer',
    ];

    public static function boot()
    {
        parent::boot();
        static::creating(function ($counter) {
            if (! $counter->year) {
                $counter->year = now()->year;
            }
            if (! $counter->last_number) {
                $counter->last_number = 0;
            }
        });
    }
}