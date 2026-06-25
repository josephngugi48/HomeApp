<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Dashboard\DashboardController;
use App\Http\Controllers\Locations\LocationController;
use App\Http\Controllers\RolesAndPermissions\RolesAndPermissionsController;
use App\Http\Controllers\Settings\SystemSettingsController;
use App\Http\Controllers\Users\UsersController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Notifications\NotificationsController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\WelcomeController;
use Illuminate\Support\Facades\URL;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Dashboard\TwoFactorAuthentication as DashboardTwoFactorAuthenticationController;

// Welcome route
Route::get('/', [WelcomeController::class, 'index'])->name('home');

Route::get('/email/verify/{id}/{hash}', [EmailVerificationController::class, 'verify_email_link'])
    ->middleware(['signed', 'throttle:6,1'])
    ->name('verification.verify');

// Email verification routes
Route::middleware('auth')->group(function () {

    Route::get('/email/verify', [EmailVerificationController::class, 'get_verification_notice'])
        ->name('verification.notice');

    Route::post('/email/verification-notification', [EmailVerificationController::class, 'send_verification_email'])
        ->middleware(['throttle:6,1'])
        ->name('verification.send');

});

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/tfa_prompt', [DashboardTwoFactorAuthenticationController::class, 'tfa_notice'])
        ->name('tfa_prompt');

    Route::post('/mfa/skip', [DashboardTwoFactorAuthenticationController::class, 'skip_tfa'])
        ->middleware(['auth'])
        ->name('mfa.skip');

    // Dashboard routes
    Route::middleware('permission:module dashboard')->group(function () {

        Route::get('/dashboard', [DashboardController::class, 'index'])
            ->middleware('mfa')
            ->name('dashboard');

    });
    
    // Locations management routes
    Route::middleware('permission:module locations')->group(function () {
        Route::get('/locations', [LocationController::class, 'index'])->name('locations.index');
        Route::post('/locations', [LocationController::class, 'store'])->name('locations.store');
        Route::put('/locations/{location}', [LocationController::class, 'update'])->name('locations.update');
        Route::delete('/locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');
    });

    // Roles and permissions management routes
    Route::middleware('permission:module roles')->group(function () {

        Route::get('/roles', [RolesAndPermissionsController::class, 'index'])
            ->name('roles.index');

        Route::get('/roles/create', [RolesAndPermissionsController::class, 'create'])
            ->name('roles.create');
        Route::post('/roles', [RolesAndPermissionsController::class, 'store'])
            ->name('roles.store');

        Route::get('/roles/{id}/edit', [RolesAndPermissionsController::class, 'edit'])
            ->name('roles.edit');
        Route::put('/roles/{id}', [RolesAndPermissionsController::class, 'update'])
            ->name('roles.update');

        Route::get('/roles/{id}/permissions', [RolesAndPermissionsController::class, 'managePermissions'])
            ->name('roles.permissions');
        Route::put('/roles/{id}/permissions', [RolesAndPermissionsController::class, 'updatePermissions'])
            ->name('roles.permissions.update');

        Route::delete('/roles/{id}', [RolesAndPermissionsController::class, 'destroy'])
            ->name('roles.destroy');

        Route::delete('/roles/bulk-delete', [RolesAndPermissionsController::class, 'bulkDelete'])
            ->name('roles.bulk-delete');
    });

    // User management routes
    Route::middleware('permission:module users')->group(function () {

        Route::get('/users', [UsersController::class, 'index'])
            ->name('users.index');

        Route::get('/users/create', [UsersController::class, 'create'])
            ->name('users.create');

        Route::post('/users', [UsersController::class, 'store'])
            ->name('users.store');

        Route::get('/users/{user}/edit', [UsersController::class, 'edit'])
            ->name('users.edit');

        Route::put('/users/{user}', [UsersController::class, 'update'])
            ->name('users.update');

        Route::delete('/users/{user}', [UsersController::class, 'destroy'])
            ->name('users.destroy');
        // Notification Routes
        Route::prefix('notifications')->name('notifications.')->group(function () {
            Route::get('/', [NotificationsController::class, 'index'])->name('index');
            Route::get('/recent', [NotificationsController::class, 'getRecent'])->name('recent');
            Route::patch('/{id}/read', [NotificationsController::class, 'markAsRead'])->name('read');
            Route::post('/mark-all-read', [NotificationsController::class, 'markAllAsRead'])->name('mark-all-read');
            Route::delete('/{id}', [NotificationsController::class, 'destroy'])->name('destroy');
        });
    });

    // System settings (admin)
    Route::middleware('permission:module settings')->group(function () {
        Route::middleware('permission:view general settings')->group(function () {
            Route::get('/admin/settings/general', [SystemSettingsController::class, 'indexGeneral'])->name('admin.settings.general');
            Route::middleware('permission:edit general settings')->group(function () {
                Route::put('/admin/settings/general', [SystemSettingsController::class, 'updateGeneral'])->name('admin.settings.general.update');
                Route::post('/admin/settings/logo', [SystemSettingsController::class, 'uploadLogo'])->name('admin.settings.logo');
            });
        });

        Route::middleware('permission:view email settings')->group(function () {
            Route::get('/admin/settings/email', [SystemSettingsController::class, 'indexEmail'])->name('admin.settings.email');
            Route::middleware('permission:edit email settings')->group(function () {
                Route::put('/admin/settings/email', [SystemSettingsController::class, 'updateEmail'])->name('admin.settings.email.update');
            });
        });

        Route::middleware('permission:view sms settings')->group(function () {
            Route::get('/admin/settings/sms', [SystemSettingsController::class, 'indexSMS'])->name('admin.settings.sms');
            Route::middleware('permission:edit sms settings')->group(function () {
                Route::put('/admin/settings/sms', [SystemSettingsController::class, 'updateSMS'])->name('admin.settings.sms.update');
            });
        });

        Route::middleware('permission:view whatsapp settings')->group(function () {
            Route::get('/admin/settings/whatsapp', [SystemSettingsController::class, 'indexWhatsApp'])->name('admin.settings.whatsapp');
            Route::middleware('permission:edit whatsapp settings')->group(function () {
                Route::put('/admin/settings/whatsapp', [SystemSettingsController::class, 'updateWhatsApp'])->name('admin.settings.whatsapp.update');
            });
        });
    });

    Route::middleware('permission:module logs')->group(function () {
        Route::get('/admin/activity-log', [ActivityLogController::class, 'index'])->name('admin.activity-log.index');
    });

    require __DIR__ . '/settings.php';
});

// Include auth routes
require __DIR__ . '/auth.php';