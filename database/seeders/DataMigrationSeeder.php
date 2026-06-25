<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;
use App\Models\SystemSetting;
use App\Models\MailSetting;
use App\Models\SmsSetting;
use App\Models\WhatsappSetting;

class DataMigrationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // 1. Migrate System Settings
        SystemSetting::updateOrCreate([], [
            'app_name' => Setting::get('app_name'),
            'app_logo' => Setting::get('app_logo'),
            'primary_color' => Setting::get('primary_color', '#006738'),
            'secondary_color' => Setting::get('secondary_color', '#FDB913'),
            'accent_color' => Setting::get('accent_color', '#FDB913'),
            'footer_text' => Setting::get('footer_text'),
        ]);

        // 2. Migrate Mail Settings
        MailSetting::updateOrCreate([], [
            'mailer' => Setting::get('mail_mailer', 'smtp'),
            'host' => Setting::get('mail_host'),
            'port' => Setting::get('mail_port'),
            'username' => Setting::get('mail_username'),
            'password' => Setting::get('mail_password'),
            'from_address' => Setting::get('mail_from_address'),
            'from_name' => Setting::get('mail_from_name'),
            'encryption' => Setting::get('mail_encryption'),
        ]);

        // 3. Migrate SMS Settings
        SmsSetting::updateOrCreate([], [
            'provider' => Setting::get('sms_provider'),
            'api_key' => Setting::get('sms_api_key'),
            'api_username' => Setting::get('sms_api_username'),
            'sender_id' => Setting::get('sms_sender_id'),
            'is_enabled' => Setting::get('sms_enabled') === '1',
        ]);

        // 4. Migrate WhatsApp Settings
        WhatsappSetting::updateOrCreate([], [
            'provider' => Setting::get('whatsapp_provider'),
            'api_key' => Setting::get('whatsapp_api_key'),
            'api_secret' => Setting::get('whatsapp_api_secret'),
            'sender_number' => Setting::get('whatsapp_sender_number'),
            'is_enabled' => Setting::get('whatsapp_enabled') === '1',
        ]);
    }
}
