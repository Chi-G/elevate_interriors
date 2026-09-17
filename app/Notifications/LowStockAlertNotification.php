<?php

namespace App\Notifications;

use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class LowStockAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Product $product,
        public ?StockMovement $movement = null
    ) {}

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        $actionUrl = route('dashboard');

        return (new MailMessage)
            ->subject("⚠️ Low Stock Alert: {$this->product->name} ({$this->product->sku})")
            ->view('emails.low-stock', [
                'product' => $this->product,
                'movement' => $this->movement,
                'notifiable' => $notifiable,
                'actionUrl' => $actionUrl,
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'product_id' => $this->product->id,
            'sku' => $this->product->sku,
            'name' => $this->product->name,
            'current_stock' => $this->product->current_stock,
            'alert_threshold' => $this->product->alert_threshold,
        ];
    }
}
