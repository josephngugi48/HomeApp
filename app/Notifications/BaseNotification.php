<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

abstract class BaseNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * The notification message.
     */
    protected string $message;

    /**
     * Optional action URL.
     */
    protected ?string $actionUrl;

    /**
     * Optional icon name (Lucide).
     */
    protected string $icon;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $message, string $icon = 'bell', ?string $actionUrl = null)
    {
        $this->message = $message;
        $this->icon = $icon;
        $this->actionUrl = $actionUrl;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'message' => $this->message,
            'icon' => $this->icon,
            'action_url' => $this->actionUrl,
            'type' => static::class,
        ];
    }
}
