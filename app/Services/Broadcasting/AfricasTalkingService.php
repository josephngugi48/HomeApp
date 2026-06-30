<?php

namespace App\Services\Broadcasting;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ============================================================================
 * VERIFICATION REQUIRED BEFORE PRODUCTION USE
 * ============================================================================
 * Implements Africa's Talking's Bulk SMS send + delivery report webhook
 * per their published API. NOT tested against a live AT account — verify:
 *   1. config('services.africastalking.*') is correct for your account.
 *   2. The /version1/messaging endpoint accepts your request shape
 *      (sandbox uses a different base URL than production — check
 *      AT's docs for the current sandbox endpoint, which has changed
 *      over time).
 *   3. Your delivery report callback URL is registered in the AT
 *      dashboard — AT does NOT call an arbitrary URL you pass per-request
     *      the way Daraja does; it's configured once in your account settings.
 *   4. The actual delivery report payload shape matches what
 *      SmsDeliveryController expects below.
 * ============================================================================
 */
class AfricasTalkingService
{
    public function sendBulk(array $recipients, string $message): array
    {
        $response = Http::asForm()
            ->withHeaders(['apikey' => config('services.africastalking.key'), 'Accept' => 'application/json'])
            ->post('https://api.africastalking.com/version1/messaging', [
                'username' => config('services.africastalking.username'),
                'to' => implode(',', $recipients),
                'message' => $message,
                'from' => config('services.africastalking.sender_id'),
            ]);

        Log::info('AfricasTalking bulk SMS send', [
            'recipient_count' => count($recipients),
            'status' => $response->status(),
            'body' => $response->json(),
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException('Africa\'s Talking SMS send failed: '.$response->body());
        }

        return $response->json('SMSMessageData.Recipients', []);
    }
}