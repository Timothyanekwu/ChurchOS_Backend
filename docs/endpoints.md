# API Endpoints

This document lists all available API endpoints in the ChurchOS SuperAdmin Platform.

## Master List (Summary)

- `GET /` - Root / API Status
- `GET /api/health` - System Health Check
- `POST /api/auth/register` - User Registration
- `POST /api/auth/login` - User Login
- `POST /api/auth/refresh` - Refresh Tokens
- `GET /api/auth/me` - Get Current User
- `DELETE /api/auth/delete/:id` - Delete User Account
- `POST /api/auth/send-email-verification` - Send Email Verification
- `POST /api/auth/verify-email` - Verify Email
- `POST /api/auth/send-otp` - Send SMS OTP
- `POST /api/auth/verify-otp` - Verify SMS OTP
- `POST /api/auth/forgot-password` - Forgot Password
- `POST /api/auth/reset-password` - Reset Password
- `POST /api/auth/change-password` - Change Password
- `POST /api/users` - Create User (Admin)
- `GET /api/users` - Get All Users (Admin)
- `GET /api/roles` - Get All Roles (RBAC)
- `GET /api/permissions` - Get All Permissions (RBAC)
- `POST /api/church/register` - Register Church (Onboarding)
- `POST /api/church/validate` - Validate Church Registration
- `GET /api/church/registration/status` - Get Registration Status
- `POST /api/church/registration/cancel` - Cancel Registration
- `POST /api/church/registration/restart` - Restart Registration
- `POST /api/church/verify-email/send` - Send Church Email Verification
- `POST /api/church/verify-email/confirm` - Confirm Church Email
- `POST /api/church/resend-email` - Resend Church Verification Email
- `POST /api/church/verify-phone/send` - Send Church Phone OTP
- `POST /api/church/verify-phone/confirm` - Confirm Church Phone OTP
- `POST /api/church/resend-otp` - Resend Church Phone OTP
- `POST /api/church/:id/assign-super-admin` - Assign Super Admin to Church
- `GET /api/church/:id/admins` - Get Church Admins
- `POST /api/church/:id/branches/hq` - Create HQ Branch
- `GET /api/church/:id/branches` - Get Church Branches
- `GET /api/church/:id` - Get Church Entity
- `PUT /api/church/:id` - Update Church Entity

---

## Endpoint Details

### Public & System

- **GET /**: Verify API status.
- **GET /api/health**: Verify server health.

### Authentication (`/api/auth`)

- **POST /register**: Public registration (Default role: Church Staff).
- **POST /login**: Authenticate and receive tokens.
- **POST /refresh**: Refresh access tokens using refresh token.
- **GET /me**: Get current user profile (Protected).
- **DELETE /delete/:id**: Delete account by ID (Protected).
- **POST /send-email-verification**: Trigger verification email.
- **POST /verify-email**: Verify email via token.
- **POST /send-otp**: Trigger SMS OTP.
- **POST /verify-otp**: Verify SMS OTP code.
- **POST /forgot-password**: Trigger reset password email.
- **POST /reset-password**: Reset password via token.
- **POST /change-password**: Update password (Protected).

### User Management (`/api/users`)

- **POST /**: Admin-only user creation (Protected, `user.create`).
- **GET /**: List all users (Protected, `user.view`).

### RBAC (`/api`)

- **GET /roles**: List all available roles (Protected, `system.view`).
- **GET /permissions**: List all available permissions (Protected, `system.view`).

### Church Management (`/api/church`)

- **POST /register**: Initiate church onboarding.
  - **Body**:
    ```json
    {
      "church": {
        "name": "Church Name",
        "website": "https://...",
        "foundedYear": 2000
      },
      "contact": {
        "email": "church@example.com",
        "phone": "+1234567890"
      },
      "address": {
        "country": "Country Name",
        "state": "State Name",
        "city": "City Name",
        "street": "123 Street Name",
        "postalCode": "00000"
      },
      "settings": {
        "timezone": "UTC",
        "currency": "USD",
        "language": "en"
      }
    }
    ```
- **POST /validate**: Check name availability.
  - **Body**: `{ "name": "Church Name" }`
- **POST /verify-email/confirm**: Confirm email verification.
  - **Body**: `{ "token": "verification-token" }`
- **POST /verify-phone/confirm**: Confirm phone OTP.
  - **Body**: `{ "otp": "123456" }`
- **POST /:id/assign-super-admin**: Link a user as Super Admin.
  - **Body**: `{ "userId": "user_mongo_id" }`
- **POST /:id/branches/hq**: Create HQ branch.
  - **Body**: `{ "name": "HQ Name", "address": "...", "contact": "..." }`
- **PUT /:id**: Update church entity.
  - **Body**: `{ "church": { "name": "New Name" }, "address": { ... } }` (Any schema field)
- **GET /registration/status**: Check current progress.
- **POST /registration/cancel**: Cancel ongoing registration.
- **POST /registration/restart**: Reset registration progress.
- **POST /verify-email/send**: Send church-specific verification email.
- **POST /resend-email**: Resend verification email.
- **POST /verify-phone/send**: Send church-specific Phone OTP.
- **POST /resend-otp**: Resend phone OTP.
- **GET /:id/admins**: List all admins for a specific church.
- **GET /:id/branches**: List all branches for a church.
- **GET /:id**: Fetch church details.
