<?php

namespace App\Http\Controllers\Broadcasts;

use App\Http\Controllers\Controller;
use App\Models\BroadcastRecipient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class SmsDeliveryController extends Controller
{
    /**
     * Public webhook — Africa's Talking posts delivery reports here.
     * Registered once in the AT dashboard, not passed per-request.
     */
    public function handle(Request $request)
    {
        $payload = $request->all();
        Log::info('AT delivery report received', ['payload' => $payload]);

        $phone = $payload['phoneNumber'] ?? null;
        $status = strtolower($payload['status'] ?? '');

        if (! $phone) {
            return response('OK');
        }

        $mappedStatus = match (true) {
            str_contains($status, 'success') => 'delivered',
            str_contains($status, 'fail') => 'failed',
            default => 'sent',
        };

        // AT's report doesn't carry our internal recipient ID, only the
        // phone number — match against recent pending SMS sends to that
        // number. This is a best-effort match, not a guaranteed one;
        // if the same number appears in two broadcasts close together
        // this could attribute the report to the wrong one.
        $recipient = BroadcastRecipient::query()
            ->where('resolved_phone', $phone)
            ->whereJsonContains('channel_statuses->sms->status', 'sent')
            ->latest('id')
            ->first();

        if ($recipient) {
            $recipient->setChannelStatus('sms', $mappedStatus, ['delivery_report' => $payload]);
            $recipient->broadcast->refreshCounts();
        }

        return response('OK');
    }
}
