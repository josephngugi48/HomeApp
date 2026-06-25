<?php

namespace App\Traits;

use App\Models\Scopes\CompanyScope;
use App\Models\Company;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

trait BelongsToCompany
{
    protected static function bootBelongsToCompany(): void
    {
        static::addGlobalScope(new CompanyScope);

        static::creating(function ($model) {
            if (empty($model->company_id) && app()->bound('currentCompany')) {
                $model->company_id = app('currentCompany')->id;
            }
        });
    }

    public function company(): BelongsTo
    {
        return $this->belongsTo(Company::class);
    }
}