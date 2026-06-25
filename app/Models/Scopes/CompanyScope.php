<?php

namespace App\Models\Scopes;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;
use Illuminate\Support\Facades\Auth;

class CompanyScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        // Super-admin bypass – they see everything
        if (Auth::check() && Auth::user()->hasRole('super-admin')) {
            return;
        }

        // If a company is resolved in the container, apply the scope
        if (app()->bound('currentCompany')) {
            $builder->where($model->getTable().'.company_id', app('currentCompany')->id);
        }
        // If no company is bound, we could optionally add a guard or allow no results.
        // But typically the middleware ensures a company is set for non-super-admins.
    }
}