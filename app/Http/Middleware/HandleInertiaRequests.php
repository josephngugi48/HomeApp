<?php

namespace App\Http\Middleware;

use App\Services\MenuService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        //   [$message, $author] = str(Inspiring::quotes()->random())->explode('-');
        $user = $request->user();
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            // 'quote' => ['message' => trim($message), 'author' => trim($author)],
            'auth' => [
                'user' => fn() => $user
                    ? [
                        // 'id' => $request->user()->id,
                        'mfa_status' => $user->intial_two_factor,
                        'name' => $user->name,
                        'roles' => $user->getRoleNames(),
                        // 'permissions' => fn() => $user->getAllPermissions()->pluck('name'),
                        'menu' => fn() => MenuService::getUserMenu($user),
                    ]
                    : null,
            ],
            'sidebarOpen' => !$request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
            'site' => function () {
                $settings = \App\Models\SystemSetting::current();
                return [
                    'app_name' => $settings->app_name ?? config('app.name'),
                    'app_logo' => $settings->app_logo ? asset('storage/' . $settings->app_logo) : null,
                    'primary_color' => $settings->primary_color ?? '#006738',
                    'secondary_color' => $settings->secondary_color ?? '#FDB913',
                    'accent_color' => $settings->accent_color ?? '#FDB913',
                    'footer_text' => $settings->footer_text,
                ];
            },
        ];
    }
}
