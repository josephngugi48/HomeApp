<?php

namespace App\Notifications\Channels;

use App\Models\Setting;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class WhatsAppChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toWhatsApp')) {
            return;
        }

        $message = $notification->toWhatsApp($notifiable);
        $phone = $notifiable->phone ?? $notifiable->phone_number;

        if (!$phone || !$message) {
            return;
        }

        $apiKey = Setting::get('whatsapp_api_key');
        $apiSecret = Setting::get('whatsapp_api_secret');
        $senderNumber = Setting::get('whatsapp_sender_number');
        $enabled = Setting::get('whatsapp_enabled', false);

        if (!$enabled || !$apiKey || !$apiSecret) {
            Log::info("WhatsApp notification skipped: " . (!$enabled ? "Disabled" : "Missing credentials"));
            return;
        }

        // Standardize phone for Beem (usually needs country code without +)
        $phone = str_replace('+', '', $phone);

        try {
            // Beem API endpoint for WhatsApp depends on their specific integration
            // Using a generic structure common for such APIs
            $response = Http::withBasicAuth($apiKey, $apiSecret)
                ->post('https://whatsapp.beem.africa/v1/send', [
                    'from' => $senderNumber,
                    'to' => $phone,
                    'type' => 'text',
                    'content' => [
                        'text' => $message
                    ]
                ]);

            if (!$response->successful()) {
                Log::error("WhatsApp Sending failed: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("WhatsApp Sending exception: " . $e->getMessage());
        }
    }
}
