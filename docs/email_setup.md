# Email Setup & Usage Guide

## Current Implementation
The system uses `nodemailer` for sending emails, located in `src/utils/sendEmail.js`. This is a robust, industry-standard library that supports any SMTP provider.

## Recommended API: Resend
We recommend using **Resend** (resend.com) as your email provider. It is developer-first, has an excellent free tier, and works seamlessly with Nodemailer via SMTP.

### 1. Configuration
To use Resend (or any SMTP provider), update your `.env` file with the following credentials:

```env
# Email Configuration (Resend SMTP Example)
SMTP_HOST=smtp.resend.com
SMTP_PORT=465
SMTP_EMAIL=resend
SMTP_PASSWORD=re_123456789...  <-- Your Resend API Key
FROM_EMAIL=onboarding@resend.dev
FROM_NAME=ChurchOS
```

### 2. Usage in Code
You can import and use the `sendEmail` utility in any controller.

```javascript
import sendEmail from '../utils/sendEmail.js';

const sendNotification = async (userEmail) => {
  try {
    await sendEmail({
      email: userEmail,
      subject: 'Welcome to ChurchOS',
      message: 'We are glad to have you with us!',
      // html: '<h1>Welcome!</h1>' // Optional HTML support
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Email failed:', error);
  }
};
```

## Existing Helper Functions
The `authController` already uses this for:
- Email Verification (`/api/auth/send-email-verification`)
- OTP Codes (`/api/auth/send-otp`)
- Password Reset (`/api/auth/forgot-password`)

## Testing
in `development` mode (`NODE_ENV=development`), if the email fails to send (e.g., wrong credentials), the system currently "mocks" the email by returning the token/OTP in the API response. This allows you to test flows without sending real emails.
