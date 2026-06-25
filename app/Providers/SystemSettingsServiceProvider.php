<?php

namespace App\Providers;

use App\Models\MailSetting;
use App\Models\SmsSetting;
use App\Models\SystemSetting;
use App\Models\WhatsappSetting;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\ServiceProvider;

class SystemSettingsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        try {
            if (!Schema::hasTable('system_settings')) {
                return;
            }

            // 1. App Configuration
            $systemSettings = SystemSetting::current();
            if ($systemSettings) {
                config([
                    'app.name' => $systemSettings->app_name ?? config('app.name'),
                    'app.logo' => $systemSettings->app_logo,
                    'app.primary_color' => $systemSettings->primary_color,
                    'app.secondary_color' => $systemSettings->secondary_color,
                    'app.accent_color' => $systemSettings->accent_color,
                ]);
            }

            // 2. Mail Configuration
            if (Schema::hasTable('mail_settings')) {
                $mailSettings = MailSetting::current();
                if ($mailSettings && $mailSettings->mailer) {
                    config(['mail.default' => $mailSettings->mailer]);

                    if ($mailSettings->mailer === 'smtp') {
                        config([
                            'mail.mailers.smtp.host' => $mailSettings->host ?? config('mail.mailers.smtp.host'),
                            'mail.mailers.smtp.port' => $mailSettings->port ?? config('mail.mailers.smtp.port'),
                            'mail.mailers.smtp.username' => $mailSettings->username ?? config('mail.mailers.smtp.username'),
                            'mail.mailers.smtp.password' => $mailSettings->password ?? config('mail.mailers.smtp.password'),
                            'mail.mailers.smtp.encryption' => $mailSettings->encryption ?? config('mail.mailers.smtp.encryption'),
                        ]);
                    }

                    if ($mailSettings->from_address) {
                        config(['mail.from.address' => $mailSettings->from_address]);
                    }

                    if ($mailSettings->from_name) {
                        config(['mail.from.name' => $mailSettings->from_name]);
                    }
                }
            }

            // 3. SMS Configuration (Africa's Talking)
            if (Schema::hasTable('sms_settings')) {
                $smsSettings = SmsSetting::current();
                if ($smsSettings) {
                    config([
                        'services.africastalking.username' => $smsSettings->api_username ?? config('services.africastalking.username'),
                        'services.africastalking.key' => $smsSettings->api_key ?? config('services.africastalking.key'),
                        'services.africastalking.sender_id' => $smsSettings->sender_id ?? config('services.africastalking.sender_id'),
                    ]);
                }
            }

            // 4. WhatsApp Configuration (Beem)
            if (Schema::hasTable('whatsapp_settings')) {
                $whatsappSettings = WhatsappSetting::current();
                if ($whatsappSettings) {
                    config([
                        'services.beem.key' => $whatsappSettings->api_key ?? config('services.beem.key'),
                        'services.beem.secret' => $whatsappSettings->api_secret ?? config('services.beem.secret'),
                        'services.beem.sender' => $whatsappSettings->sender_number ?? config('services.beem.sender'),
                    ]);
                }
            }
        } catch (\Exception $e) {
            // Silently fail if database is not available during early boot
            return;
        }
    }
}
