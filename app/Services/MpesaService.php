<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * ============================================================================
 * VERIFICATION REQUIRED BEFORE PRODUCTION USE
 * ============================================================================
 * This class implements Safaricom Daraja's OAuth + STK Push flow per their
 * published API documentation. It has NOT been tested against a live
 * sandbox or production Daraja app — I do not have credentials or a way
 * to make real HTTP calls to Safaricom's servers from this environment.
 *
 * Before relying on this in any real flow, verify:
 *   1. config('services.mpesa.*') values are correct for your app
 *      (consumer key/secret, shortcode, passkey, env).
 *   2. The OAuth token request actually returns a valid token against
 *      your app (sandbox: https://sandbox.safaricom.co.ke, prod: https://api.safaricom.co.ke).
 *   3. The STK push request succeeds and you receive a real
 *      CheckoutRequestID back.
 *   4. Your callback URL (MPESA_CALLBACK_URL) is publicly reachable
 *      from the internet (Safaricom's servers must be able to POST to it —
     *      this will NOT work against localhost without a tunnel like ngrok).
 *   5. The actual callback payload shape matches what handleCallback()
 *      in MpesaController expects — Safaricom's docs and real payloads
 *      have historically had minor discrepancies; log the raw payload
 *      and inspect it on your first real test before trusting the parser.
 * ============================================================================
 */
class MpesaService
{
    private function baseUrl(): string
    {
        return config('services.mpesa.env') === 'production'
            ? 'https://api.safaricom.co.ke'
            : 'https://sandbox.safaricom.co.ke';
    }

    /**
     * Fetch (and cache) an OAuth access token. Daraja tokens are valid
     * for ~3600 seconds; caching avoids hitting the token endpoint on
     * every STK push.
     */
    private function getAccessToken(): string
    {
        return Cache::remember('mpesa_access_token', 3500, function () {
            $response = Http::withBasicAuth(
                config('services.mpesa.consumer_key'),
                config('services.mpesa.consumer_secret'),
            )->get($this->baseUrl().'/oauth/v1/generate', [
                'grant_type' => 'client_credentials',
            ]);

            if (! $response->successful()) {
                Log::error('M-Pesa OAuth token request failed', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);
                throw new \RuntimeException('Unable to authenticate with M-Pesa Daraja API.');
            }

            return $response->json('access_token');
        });
    }

    private function timestamp(): string
    {
        return now()->format('YmdHis');
    }

    private function password(string $timestamp): string
    {
        return base64_encode(
            config('services.mpesa.shortcode').
            config('services.mpesa.passkey').
            $timestamp
        );
    }

    /**
     * Initiate an STK Push request. Returns the raw Daraja response
     * (contains CheckoutRequestID/MerchantRequestID on success, or
     * an error code/message on failure).
     *
     * @throws \RuntimeException on transport/auth failure
     */
    public function stkPush(string $phone, float $amount, string $accountReference, string $description): array
    {
        $timestamp = $this->timestamp();

        $response = Http::withToken($this->getAccessToken())
            ->post($this->baseUrl().'/mpesa/stkpush/v1/processrequest', [
                'BusinessShortCode' => config('services.mpesa.shortcode'),
                'Password' => $this->password($timestamp),
                'Timestamp' => $timestamp,
                'TransactionType' => 'CustomerPayBillOnline',
                'Amount' => (int) round($amount), // Daraja expects a whole-number amount
                'PartyA' => $this->normalizePhone($phone),
                'PartyB' => config('services.mpesa.shortcode'),
                'PhoneNumber' => $this->normalizePhone($phone),
                'CallBackURL' => config('services.mpesa.callback_url'),
                'AccountReference' => $accountReference,
                'TransactionDesc' => $description,
            ]);

        Log::info('M-Pesa STK push request', [
            'request' => ['phone' => $phone, 'amount' => $amount, 'account_reference' => $accountReference],
            'response_status' => $response->status(),
            'response_body' => $response->json(),
        ]);

        if (! $response->successful()) {
            throw new \RuntimeException('M-Pesa STK push request failed: '.$response->body());
        }

        return $response->json();
    }

    /**
     * Normalize a Kenyan phone number to the 2547XXXXXXXX format Daraja
     * expects. Handles common input variants: 07XXXXXXXX, +2547XXXXXXXX,
     * 2547XXXXXXXX.
     */
    private function normalizePhone(string $phone): string
    {
        $digits = preg_replace('/\D/', '', $phone);

        if (str_starts_with($digits, '0')) {
            return '254'.substr($digits, 1);
        }

        if (str_starts_with($digits, '254')) {
            return $digits;
        }

        if (str_starts_with($digits, '7') || str_starts_with($digits, '1')) {
            return '254'.$digits;
        }

        return $digits;
    }
}