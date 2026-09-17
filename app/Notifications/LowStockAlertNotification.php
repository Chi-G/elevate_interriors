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
        $name = $notifiable->name ?? 'Team Member';
        $productUrl = route('dashboard');

        return (new MailMessage)
            ->subject("⚠️ Low Stock Alert: {$this->product->name} ({$this->product->sku})")
            ->greeting("Hello {$name},")
            ->line('An item in your inventory has dropped to or below its designated minimum threshold.')
            ->line("**Product Name:** {$this->product->name}")
            ->line("**SKU:** {$this->product->sku}")
            ->line("**Current Remaining Stock:** {$this->product->current_stock} units")
            ->line("**Minimum Alert Threshold:** {$this->product->alert_threshold} units")
            ->when($this->movement, function (MailMessage $message) {
                $type = $this->movement->type ?? 'Movement';
                $qty = abs($this->movement->quantity ?? 0);

                return $message->line("**Triggered By:** {$type} transaction (-{$qty} units)");
            })
            ->action('Review Inventory in Dashboard', $productUrl)
            ->line('Please restock this item soon to prevent order delays and stock-out disruptions.');
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
