<?php

use App\Http\Controllers\Auth\EmailVerificationController;
use App\Http\Controllers\Dashboard\DashboardRouterController;
use App\Http\Controllers\Locations\LocationController;
use App\Http\Controllers\Apartments\ApartmentController;
use App\Http\Controllers\Units\UnitController;
use App\Http\Controllers\Tenants\TenantController;
use App\Http\Controllers\Leases\LeaseController;
use App\Http\Controllers\Invoices\InvoiceController;
use App\Http\Controllers\Payments\PaymentController;
use App\Http\Controllers\Payments\MpesaController;
use App\Http\Controllers\Wallet\WalletController;
use App\Http\Controllers\Issues\IssueController;
use App\Http\Controllers\Notices\NoticeController;
use App\Http\Controllers\Maintenance\MaintenanceRequestController;
use App\Http\Controllers\RolesAndPermissions\RolesAndPermissionsController;
use App\Http\Controllers\Settings\SystemSettingsController;
use App\Http\Controllers\Users\UsersController;
use App\Http\Controllers\Admin\ActivityLogController;
use App\Http\Controllers\Notifications\NotificationsController;
use App\Http\Controllers\Reports\ReportController;
//
use App\Http\Controllers\Broadcasts\BroadcastController;
use App\Http\Controllers\Broadcasts\SmsDeliveryController;
use App\Http\Controllers\Broadcasts\WhatsAppWebhookController;
//
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

// Public webhook — Safaricom
// Safaricom's POST with a 419 before your controller code even runs.
Route::post('/mpesa/callback', [MpesaController::class, 'callback'])->name('mpesa.callback');

// Initiate an STK push for an invoice 
Route::middleware('auth')->group(function () {
    Route::post('/mpesa/stk-push', [MpesaController::class, 'stkPush'])->name('mpesa.stk-push');
});

// Public webhooks - Broadcast
Route::post('/webhooks/sms/delivery', [SmsDeliveryController::class, 'handle'])->name('webhooks.sms.delivery');
Route::get('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'verify']);
Route::post('/webhooks/whatsapp', [WhatsAppWebhookController::class, 'handle'])->name('webhooks.whatsapp');

Route::middleware(['auth', 'verified'])->group(function () {

    Route::get('/tfa_prompt', [DashboardTwoFactorAuthenticationController::class, 'tfa_notice'])
        ->name('tfa_prompt');

    Route::post('/mfa/skip', [DashboardTwoFactorAuthenticationController::class, 'skip_tfa'])
        ->middleware(['auth'])
        ->name('mfa.skip');

    // Dashboard routes
    Route::middleware(['auth', 'verified'])->group(function () {
        Route::get('/dashboard', [DashboardRouterController::class, 'index'])
            ->middleware('mfa')
            ->name('dashboard');
        // ... other routes ...
    });
    // Route::middleware('permission:module dashboard')->group(function () {
        
    //     // Dashboard route
    //     Route::get('/dashboard', [DashboardRouterController::class, 'index'])
    //     ->middleware('mfa')
    //     ->name('dashboard');

    // });
    
    // Locations management routes
    Route::middleware('permission:module locations')->group(function () {
        Route::get('/locations', [LocationController::class, 'index'])->name('locations.index');
        Route::get('/locations/create', [LocationController::class, 'create'])->name('locations.create');
        Route::post('/locations', [LocationController::class, 'store'])->name('locations.store');
        Route::get('/locations/{location}/edit', [LocationController::class, 'edit'])->name('locations.edit');
        Route::put('/locations/{location}', [LocationController::class, 'update'])->name('locations.update');
        Route::delete('/locations/{location}', [LocationController::class, 'destroy'])->name('locations.destroy');
    });

    // Apartments 
    Route::middleware('permission:module apartments')->group(function () {
        Route::get('/apartments', [ApartmentController::class, 'index'])->name('apartments.index');
        Route::get('/apartments/create', [ApartmentController::class, 'create'])->name('apartments.create');
        Route::post('/apartments', [ApartmentController::class, 'store'])->name('apartments.store');
        Route::get('/apartments/{apartment}/edit', [ApartmentController::class, 'edit'])->name('apartments.edit');
        Route::put('/apartments/{apartment}', [ApartmentController::class, 'update'])->name('apartments.update');
        Route::delete('/apartments/{apartment}', [ApartmentController::class, 'destroy'])->name('apartments.destroy');
    });

    // Units:
    Route::middleware('permission:module units')->group(function () {
        Route::get('/units', [UnitController::class, 'index'])->name('units.index');
        Route::get('/units/create', [UnitController::class, 'create'])->name('units.create');
        Route::post('/units', [UnitController::class, 'store'])->name('units.store');
        Route::get('/units/{unit}/edit', [UnitController::class, 'edit'])->name('units.edit');
        Route::put('/units/{unit}', [UnitController::class, 'update'])->name('units.update');
        Route::delete('/units/{unit}', [UnitController::class, 'destroy'])->name('units.destroy');
    });

    // Tenants:
    Route::middleware('permission:module tenants')->group(function () {
        Route::get('/tenants', [TenantController::class, 'index'])->name('tenants.index');
        Route::get('/tenants/create', [TenantController::class, 'create'])->name('tenants.create');
        Route::post('/tenants', [TenantController::class, 'store'])->name('tenants.store');
        Route::get('/tenants/{tenant}/edit', [TenantController::class, 'edit'])->name('tenants.edit');
        Route::put('/tenants/{tenant}', [TenantController::class, 'update'])->name('tenants.update');
        Route::delete('/tenants/{tenant}', [TenantController::class, 'destroy'])->name('tenants.destroy');
    });

    // Leases
    Route::middleware('permission:module leases')->group(function () {
        Route::get('/leases', [LeaseController::class, 'index'])->name('leases.index');
        Route::get('/leases/create', [LeaseController::class, 'create'])->name('leases.create');
        Route::post('/leases', [LeaseController::class, 'store'])->name('leases.store');
        Route::get('/leases/{lease}/edit', [LeaseController::class, 'edit'])->name('leases.edit');
        Route::put('/leases/{lease}', [LeaseController::class, 'update'])->name('leases.update');
        Route::post('/leases/{lease}/terminate', [LeaseController::class, 'terminate'])->name('leases.terminate');
        Route::delete('/leases/{lease}', [LeaseController::class, 'destroy'])->name('leases.destroy');
    });

    // Invoices
    Route::middleware('permission:module invoices')->group(function () {
        Route::get('/invoices', [InvoiceController::class, 'index'])->name('invoices.index');
        Route::get('/invoices/create', [InvoiceController::class, 'create'])->name('invoices.create');
        Route::post('/invoices', [InvoiceController::class, 'store'])->name('invoices.store');
        Route::get('/invoices/{invoice}', [InvoiceController::class, 'show'])->name('invoices.show');
        Route::delete('/invoices/{invoice}', [InvoiceController::class, 'destroy'])->name('invoices.destroy');
    });

    // Payments 
    Route::middleware('permission:module payments')->group(function () {
        Route::get('/payments', [PaymentController::class, 'index'])->name('payments.index');
        Route::get('/payments/create', [PaymentController::class, 'create'])->name('payments.create');
        Route::post('/payments', [PaymentController::class, 'store'])->name('payments.store');
        Route::post('/payments/{payment}/reverse', [PaymentController::class, 'reverse'])->name('payments.reverse');
    });

    // Wallet
    Route::middleware('permission:module wallet')->group(function () {
        Route::get('/wallet', [WalletController::class, 'index'])->name('wallet.index');
        Route::get('/wallet/{wallet}', [WalletController::class, 'show'])->name('wallet.show');
        Route::post('/wallet/{wallet}/deposit', [WalletController::class, 'deposit'])->name('wallet.deposit');
        Route::post('/wallet/{wallet}/apply', [WalletController::class, 'applyToInvoice'])->name('wallet.apply');
    });

    // Issues
    Route::middleware('permission:module issues')->group(function () {
        Route::get('/issues', [IssueController::class, 'index'])->name('issues.index');
        Route::get('/issues/create', [IssueController::class, 'create'])->name('issues.create');
        Route::post('/issues', [IssueController::class, 'store'])->name('issues.store');
        Route::put('/issues/{issue}', [IssueController::class, 'update'])->name('issues.update');
        Route::delete('/issues/{issue}', [IssueController::class, 'destroy'])->name('issues.destroy');
    });

    // Notices
    Route::middleware('permission:module notices')->group(function () {
        Route::get('/notices', [NoticeController::class, 'index'])->name('notices.index');
        Route::get('/notices/create', [NoticeController::class, 'create'])->name('notices.create');
        Route::post('/notices', [NoticeController::class, 'store'])->name('notices.store');
        Route::put('/notices/{notice}', [NoticeController::class, 'update'])->name('notices.update');
        Route::post('/notices/{notice}/act', [NoticeController::class, 'actOn'])->name('notices.act');
        Route::delete('/notices/{notice}', [NoticeController::class, 'destroy'])->name('notices.destroy');
    });

    // Maintenance
    Route::middleware('permission:module maintenance')->group(function () {
        Route::get('/maintenance', [MaintenanceRequestController::class, 'index'])->name('maintenance.index');
        Route::get('/maintenance/create', [MaintenanceRequestController::class, 'create'])->name('maintenance.create');
        Route::post('/maintenance', [MaintenanceRequestController::class, 'store'])->name('maintenance.store');
        Route::get('/maintenance/{maintenanceRequest}', [MaintenanceRequestController::class, 'show'])->name('maintenance.show');
        Route::put('/maintenance/{maintenanceRequest}', [MaintenanceRequestController::class, 'update'])->name('maintenance.update');
        Route::delete('/maintenance/{maintenanceRequest}', [MaintenanceRequestController::class, 'destroy'])->name('maintenance.destroy');
    });

    // Broadcast:
    Route::middleware('permission:module broadcasts')->group(function () {
        Route::get('/broadcasts', [BroadcastController::class, 'index'])->name('broadcasts.index');
        Route::get('/broadcasts/create', [BroadcastController::class, 'create'])->name('broadcasts.create');
        Route::post('/broadcasts/preview', [BroadcastController::class, 'preview'])->name('broadcasts.preview');
        Route::post('/broadcasts', [BroadcastController::class, 'store'])->name('broadcasts.store');
        Route::get('/broadcasts/{broadcast}', [BroadcastController::class, 'show'])->name('broadcasts.show');
        Route::post('/broadcasts/contact-lists/upload', [BroadcastController::class, 'uploadContactList'])->name('broadcasts.contact-lists.upload');
    });

    // Reports:
    Route::middleware('auth')->prefix('reports')->name('reports.')->group(function () {
        Route::get('/financial', [ReportController::class, 'financial'])->name('financial-report');
        Route::get('/occupancy', [ReportController::class, 'occupancy'])->name('occupancy-report');
        Route::get('/tenant', [ReportController::class, 'tenant'])->name('tenant-report');
        Route::get('/maintenance', [ReportController::class, 'maintenance'])->name('maintenance-report');
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