<?php

namespace App\Services\Broadcasting;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ============================================================================
 * VERIFICATION REQUIRED BEFORE PRODUCTION USE
 * ============================================================================
 * Implements Meta's WhatsApp Business Cloud API per their published docs.
 * NOT tested against a live Meta app. Verify:
 *   1. config('services.whatsapp.*') — phone_number_id, access_token,
 *      and that the token hasn't expired (Meta's long-lived tokens still
 *      expire and need rotation).
 *   2. Your recipients must have messaged your business number first
 *      OR you must use an approved message template — Meta blocks
     *      free-form outbound messages to numbers with no prior opt-in.
     *      This is the single most common reason a "broadcast" silently
     *      fails on WhatsApp: it is NOT like SMS/email, you cannot just
     *      blast arbitrary numbers without a pre-approved template.
 *   3. The webhook verification handshake (GET with hub.challenge) is
 *      separate from the actual status-update POST webhook — both need
 *      to be registered in the Meta App dashboard.
 * ============================================================================
 */
class WhatsAppService
{
    public function sendTemplateMessage(string $to, string $templateName, array $params = []): array
    {
        $response = Http::withToken(config('services.whatsapp.access_token'))
            ->post('https://graph.facebook.com/v19.0/'.config('services.whatsapp.phone_number_id').'/messages', [
                'messaging_product' => 'whatsapp',
                'to' => $this->normalizePhone($to),
                'type' => 'template',
                'template' => [
                    'name' => $templateName,
                    'language' => ['code' => 'en'],
                    'components' => empty($params) ? [] : [[
                        'type' => 'body',
                        'parameters' => array_map(fn ($p) => ['type' => 'text', 'text' => $p], $params),
                    ]],
                ],
            ]);

        Log::info('WhatsApp send', ['to' => $to, 'status' => $response->status(), 'body' => $response->json()]);

        if (! $response->successful()) {
            throw new \RuntimeException('WhatsApp send failed: '.$response->body());
        }

        return $response->json();
    }

    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);
        if (str_starts_with($digits, '0')) {
            return '254'.substr($digits, 1);
        }
        return $digits;
    }
}