<?php

namespace App\Http\Controllers\Broadcasts;

use App\Http\Controllers\Controller;
use App\Models\BroadcastRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WhatsAppWebhookController extends Controller
{
    /**
     * Meta requires this exact verification handshake on first webhook
     * setup — a GET request with hub.mode/hub.verify_token/hub.challenge.
     * Your verify token must match config('services.whatsapp.verify_token').
     */
    public function verify(Request $request)
    {
        if ($request->get('hub_mode') === 'subscribe'
            && $request->get('hub_verify_token') === config('services.whatsapp.verify_token')) {
            return response($request->get('hub_challenge'), 200);
        }
        return response('Forbidden', 403);
    }

    public function handle(Request $request)
    {
        $payload = $request->all();
        Log::info('WhatsApp webhook received', ['payload' => $payload]);

        $statuses = $payload['entry'][0]['changes'][0]['value']['statuses'] ?? [];

        foreach ($statuses as $statusUpdate) {
            $phone = $statusUpdate['recipient_id'] ?? null;
            $status = $statusUpdate['status'] ?? null; // sent, delivered, read, failed

            if (! $phone || ! $status) {
                continue;
            }

            $mappedStatus = in_array($status, ['delivered', 'read']) ? 'delivered' : ($status === 'failed' ? 'failed' : 'sent');

            $recipient = BroadcastRecipient::query()
                ->where('resolved_phone', $phone)
                ->whereJsonContains('channel_statuses->whatsapp->status', 'sent')
                ->latest('id')
                ->first();

            if ($recipient) {
                $recipient->setChannelStatus('whatsapp', $mappedStatus, ['webhook_payload' => $statusUpdate]);
                $recipient->broadcast->refreshCounts();
            }
        }

        return response()->json(['status' => 'received']);
    }
}