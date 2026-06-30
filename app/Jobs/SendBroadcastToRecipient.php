<?php

namespace App\Jobs;

use App\Models\Broadcast;
use App\Models\BroadcastRecipient;
use App\Services\Broadcasting\AfricasTalkingService;
use App\Services\Broadcasting\EmailBroadcastService;
use App\Services\Broadcasting\WhatsAppService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class SendBroadcastToRecipient implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 30;

    public function __construct(public BroadcastRecipient $recipient, public string $channel)
    {
    }

    public function handle(
        AfricasTalkingService $sms,
        EmailBroadcastService $email,
        WhatsAppService $whatsapp,
    ): void {
        $broadcast = $this->recipient->broadcast;

        try {
            match ($this->channel) {
                'sms' => $this->sendSms($sms, $broadcast),
                'email' => $this->sendEmail($email, $broadcast),
                'whatsapp' => $this->sendWhatsApp($whatsapp, $broadcast),
            };

            $this->recipient->setChannelStatus($this->channel, 'sent', ['sent_at' => now()->toIso8601String()]);
        } catch (\Throwable $e) {
            Log::error('Broadcast send failed', [
                'recipient_id' => $this->recipient->id,
                'channel' => $this->channel,
                'error' => $e->getMessage(),
            ]);
            $this->recipient->setChannelStatus($this->channel, 'failed', ['error' => $e->getMessage()]);
        }

        $broadcast->refreshCounts();
    }

    private function sendSms(AfricasTalkingService $sms, Broadcast $broadcast): void
    {
        if (! $this->recipient->resolved_phone) {
            throw new \RuntimeException('No phone number on file for this recipient.');
        }
        $sms->sendBulk([$this->recipient->resolved_phone], $broadcast->body);
    }

    private function sendEmail(EmailBroadcastService $email, Broadcast $broadcast): void
    {
        if (! $this->recipient->resolved_email) {
            throw new \RuntimeException('No email on file for this recipient.');
        }
        $email->send($this->recipient->resolved_email, $broadcast->title, $broadcast->body);
    }

    private function sendWhatsApp(WhatsAppService $whatsapp, Broadcast $broadcast): void
    {
        if (! $this->recipient->resolved_phone) {
            throw new \RuntimeException('No phone number on file for this recipient.');
        }
        // NOTE: 'broadcast_notice' is a placeholder template name —
        // this MUST exist as an approved template in your Meta Business
        // Manager before this will work. See WhatsAppService docblock.
        $whatsapp->sendTemplateMessage($this->recipient->resolved_phone, 'broadcast_notice', [$broadcast->body]);
    }
}