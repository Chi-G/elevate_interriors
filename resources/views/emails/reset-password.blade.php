<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password - Elevate Interiors</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 36px 16px; color: #1e293b;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);">
    
    <!-- Brand Header -->
    <div style="background-color: #0f172a; padding: 30px 24px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">
        Elevate Interiors
      </h1>
      <p style="color: #C9A24B; margin: 8px 0 0 0; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.2px;">
        🔐 PASSWORD RECOVERY
      </p>
    </div>

    <!-- Content Body -->
    <div style="padding: 32px 26px;">
      <h2 style="color: #0f172a; margin-top: 0; font-size: 19px; font-weight: 700;">Password Reset Request</h2>
      
      <p style="font-size: 14px; color: #475569; line-height: 1.6; margin-top: 6px;">
        Hello <strong>{{ $notifiable->name ?? 'Team Member' }}</strong>,<br>
        We received a request to reset the password for your Elevate Interiors account. Click the button below to choose a new password.
      </p>

      <!-- Key Details Card -->
      <div style="background-color: #f8fafc; border-radius: 12px; padding: 20px; border: 1px solid #e2e8f0; margin: 22px 0;">
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr>
            <td style="padding: 7px 0; color: #64748b; font-weight: 500;">Account:</td>
            <td style="padding: 7px 0; text-align: right; font-weight: 600; color: #0284c7;">{{ $notifiable->email ?? 'your email' }}</td>
          </tr>
          <tr style="border-top: 1px dashed #cbd5e1;">
            <td style="padding: 9px 0 0 0; color: #64748b; font-weight: 500;">Link Validity:</td>
            <td style="padding: 9px 0 0 0; text-align: right; font-weight: 700; color: #d97706;">
              Expires in 60 minutes
            </td>
          </tr>
        </table>
      </div>

      <!-- Action Button -->
      <div style="margin: 30px 0; text-align: center;">
        <a href="{{ $resetUrl }}" style="background-color: #0f172a; color: #ffffff; padding: 14px 34px; border-radius: 10px; text-decoration: none; font-weight: 700; font-size: 14px; display: inline-block; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.25); letter-spacing: 0.3px;">
          Reset Password
        </a>
      </div>

      <p style="font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-bottom: 0;">
        ⚠️ If you did not request a password reset, no further action is required. Your account remains secure and your password has not been changed.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 16px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #94a3b8;">
      © {{ date('Y') }} Elevate Interiors. All rights reserved.
    </div>
  </div>
</body>
</html>
