<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

use App\Models\SystemSetting;
use App\Models\MailSetting;
use App\Models\SmsSetting;
use App\Models\WhatsappSetting;

class SystemSettingsController extends Controller
{
    /**
     * Display the general system settings page.
     */
    public function indexGeneral()
    {
        try {
            $settings = SystemSetting::current();
            return Inertia::render('admin/settings/General', [
                'settings' => $settings,
            ]);
        } catch (\Exception $e) {
            \Log::error('Settings Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Display the email settings page.
     */
    public function indexEmail()
    {
        $settings = MailSetting::current();
        return Inertia::render('admin/settings/Email', [
            'settings' => $settings,
        ]);
    }

    /**
     * Display the SMS settings page.
     */
    public function indexSMS()
    {
        $settings = SmsSetting::current();
        return Inertia::render('admin/settings/SMS', [
            'settings' => $settings,
        ]);
    }

    /**
     * Display the WhatsApp settings page.
     */
    public function indexWhatsApp()
    {
        $settings = WhatsappSetting::current();
        return Inertia::render('admin/settings/WhatsApp', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update general system settings.
     */
    public function updateGeneral(Request $request)
    {
        $settings = SystemSetting::current();
        $settings->update($request->all());

        return back()->with('success', 'General settings saved successfully.');
    }

    /**
     * Update email settings.
     */
    public function updateEmail(Request $request)
    {
        $settings = MailSetting::current();
        $data = $request->all();

        // Don't overwrite password with empty value
        if (empty($data['password'])) {
            unset($data['password']);
        }

        $settings->update($data);

        return back()->with('success', 'Email settings saved successfully.');
    }

    /**
     * Update SMS settings.
     */
    public function updateSMS(Request $request)
    {
        $settings = SmsSetting::current();
        $data = $request->all();

        if (empty($data['api_key'])) {
            unset($data['api_key']);
        }

        $settings->update($data);

        return back()->with('success', 'SMS settings saved successfully.');
    }

    /**
     * Update WhatsApp settings.
     */
    public function updateWhatsApp(Request $request)
    {
        $settings = WhatsappSetting::current();
        $data = $request->all();

        if (empty($data['api_key'])) {
            unset($data['api_key']);
        }
        if (empty($data['api_secret'])) {
            unset($data['api_secret']);
        }

        $settings->update($data);

        return back()->with('success', 'WhatsApp settings saved successfully.');
    }

    /**
     * Upload app logo.
     */
    public function uploadLogo(Request $request)
    {
        $request->validate([
            'logo' => 'required|image|mimes:png,jpg,jpeg,svg,webp|max:2048',
        ]);

        $settings = SystemSetting::current();

        // Delete old logo if exists
        if ($settings->app_logo && Storage::disk('public')->exists($settings->app_logo)) {
            Storage::disk('public')->delete($settings->app_logo);
        }

        $path = $request->file('logo')->store('logos', 'public');

        $settings->update(['app_logo' => $path]);

        return back()->with('success', 'Logo uploaded successfully.');
    }
}
