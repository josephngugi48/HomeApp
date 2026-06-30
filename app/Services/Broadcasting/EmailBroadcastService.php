<?php

namespace App\Services\Broadcasting;

use Illuminate\Support\Facades\Mail;
use App\Mail\BroadcastMail;

class EmailBroadcastService
{
    public function send(string $toEmail, string $subject, string $body): void
    {
        Mail::to($toEmail)->send(new BroadcastMail($subject, $body));
    }
}