<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>⚠️ Low Stock Alert - Elevate Interiors</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 36px 16px; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);">
    
    <!-- Brand Header -->
    <div style="background-color: #0f172a; padding: 30px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
        Elevate Interiors
      </h1>
      <p style="color: #f59e0b; margin: 8px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;">
        ⚠️ INVENTORY ALERT
      </p>
    </div>

    <!-- Content Body -->
    <div style="padding: 32px 26px;">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 19px; font-weight: 700;">Product Low in Stock</h2>
      
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 6px;">
        Hello <strong>{{ $notifiable->name ?? 'Team Member' }}</strong>,<br>
        An item in your inventory has dropped to or below its designated minimum alert threshold.
      </p>

      <!-- Key Details Card -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin: 22px 0;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Product Name:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 700; color: #0f172a;">{{ $product->name }}</td>
          </tr>
          <tr>
            <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Product SKU:</td>
            <td style="padding: 7px 0; text-align: right; font-family: monospace; font-weight: 600; color: #0284c7;">{{ $product->sku }}</td>
          </tr>
          <tr>
            <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Current Stock:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 800; color: #dc2626; font-size: 14px;">{{ $product->current_stock }} units</td>
          </tr>
          <tr>
            <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Alert Threshold:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 600; color: #475569;">{{ $product->alert_threshold }} units</td>
          </tr>
          @if(isset($movement) && $movement)
          <tr style="border-top: 1px dashed #cbd5e1;">
            <td style="padding: 9px 0 0 0; color: #64748b; font-weight: 500;">Trigger Event:</td>
            <td style="padding: 9px 0 0 0; text-align: right; font-weight: 600; color: #dc2626;">
              {{ $movement->type ?? 'Movement' }} ({{ $movement->quantity < 0 ? $movement->quantity : '-' . $movement->quantity }} units)
            </td>
          </tr>
          @endif
        </table>
      </div>

      <!-- Action Button -->
      <div style="margin: 30px 0; text-align: center;">
        <a href="{{ $actionUrl ?? url('/dashboard') }}" style="background-color: #0f172a; color: #ffffff; padding: 14px 34px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); letter-spacing: 0.3px;">
          Review Inventory in Dashboard
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-bottom: 0;">
        Please restock this item soon to prevent fulfillment delays. This is an automated notification from the Elevate Interiors management platform.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
      © {{ date('Y') }} Elevate Interiors. All rights reserved.
    </div>
  </div>
</body>
</html>
