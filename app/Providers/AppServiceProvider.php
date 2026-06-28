<?php

namespace App\Providers;

use App\Policies\UserPolicy;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use App\Models\User;
use App\Policies\TenantPolicy;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        if (config('app.env') === 'production') {
            URL::forceScheme('https');
        }

        Gate::define('viewLogViewer', function (User $user) {
            return $user->hasRole('admin');
        });

        // TenantPolicy:
        Gate::define('tenants.viewAny', [TenantPolicy::class, 'viewAny']);
        Gate::define('tenants.view', [TenantPolicy::class, 'view']);
        Gate::define('tenants.create', [TenantPolicy::class, 'create']);
        Gate::define('tenants.update', [TenantPolicy::class, 'update']);
        Gate::define('tenants.delete', [TenantPolicy::class, 'delete']);

    }
}
