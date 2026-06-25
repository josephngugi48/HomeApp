<?php

namespace App\Notifications\Channels;

use App\Models\Setting;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SmsChannel
{
    /**
     * Send the given notification.
     */
    public function send(object $notifiable, Notification $notification): void
    {
        if (!method_exists($notification, 'toSms')) {
            return;
        }

        $message = $notification->toSms($notifiable);
        $phone = $notifiable->phone ?? $notifiable->phone_number;

        if (!$phone || !$message) {
            return;
        }

        $apiKey = config('services.africastalking.key');
        $username = config('services.africastalking.username');
        $senderId = config('services.africastalking.sender_id');

        if (!$apiKey || !$username) {
            Log::info("SMS notification skipped: Missing credentials");
            return;
        }

        try {
            $response = Http::asForm()
                ->withHeaders(['Accept' => 'application/json', 'apikey' => $apiKey])
                ->post('https://api.africastalking.com/version1/messaging', [
                    'username' => $username,
                    'to' => $phone,
                    'message' => $message,
                    'from' => $senderId,
                ]);

            if (!$response->successful()) {
                Log::error("SMS Sending failed: " . $response->body());
            }
        } catch (\Exception $e) {
            Log::error("SMS Sending exception: " . $e->getMessage());
        }
    }
}
