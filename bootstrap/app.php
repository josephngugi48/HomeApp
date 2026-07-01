<?php

use App\Http\Middleware\EnsureMFAEnabled;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
            'mfa' => EnsureMFAEnabled::class,
            'tenant.portal' => \App\Http\Middleware\EnsureTenantPortalAccess::class,
            'resolve.company' => \App\Http\Middleware\ResolveCurrentCompany::class,
        ]);

        // CSRF exclusions: (Safaricom, AfricaStalking, Meta)
        $middleware->validateCsrfTokens(except: [
            'mpesa/callback',
            'webhooks/sms/delivery',
            'webhooks/whatsapp',
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
