# ChurchOS API Consumption Guide

This guide details the workflows and best practices for integrating the ChurchOS Backend API with the Frontend.

## 🌐 Base Configuration

- **Base URL**: `http://localhost:5000/api` (Local Dev)
- **Content-Type**: `application/json`
- **Authentication Header**:
  ```
  Authorization: Bearer <your_access_token>
  ```

---

## 🔐 1. Authentication Flow

The system uses **JWT (JSON Web Tokens)** for secure access.

### A. Login & Token Storage

1.  **Frontend**: Send `POST /auth/login` with `email` and `password`.
2.  **Backend Response**:
    ```json
    {
      "success": true,
      "token": "eyJhbGciOi...", // Access Token (Expires in 15m)
      "refreshToken": "ud8..." // HTTP-Only Cookie (Expires in 7d)
    }
    ```
3.  **Frontend Action**:
    - Store `token` in memory (e.g., React Context/Zustand) or `localStorage`.
    - The `refreshToken` is automatically handled by the browser as an `HttpOnly` cookie.

### B. Accessing Protected Routes

Attach the token to every request header:

```javascript
const response = await fetch("/api/auth/me", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

### C. Token Refresh (Silent Auth)

When an API call returns `401 Unauthorized`:

1.  Call `POST /auth/refresh` (no body needed, it uses the cookie).
2.  If successful, you get a new `token`.
3.  Retry the original failed request with the new token.

---

## ⛪ 2. Church Onboarding Workflow

This is the critical path for new users signing up their organization.

### Step 1: User Registration

- **Endpoint**: `POST /auth/register`
- **Action**: User creates a personal account first.
- **Result**: User is created with `role: "Church Staff"` but `church: undefined`.

### Step 2: Church Registration

- **Endpoint**: `POST /church/register`
- **Header**: Required `Authorization` token from Step 1.
- **Payload**:
  ```json
  {
    "church": { "name": "Grace Chapel", "website": "..." },
    "contact": { "email": "info@grace.com", "phone": "..." },
    "address": { "street": "...", "city": "...", "country": "..." },
    "settings": { "currency": "USD", "timezone": "UTC" }
  }
  ```
- **Backend Action**:
  1.  Creates `Church` entity.
  2.  Links `Church` ID to the User's profile.
  3.  **Crucial**: You must reload/refetch the User Profile (`GET /auth/me`) after this step to see the updated `user.church` field.

### Step 3: Check Status (Optional)

- **Endpoint**: `GET /church/registration/status`
- **Response**: `NOT_REGISTERED` or `COMPLETED`.

---

## 📧 3. Verification Workflow

Verification is now **Church-Centric**, not User-Centric.

### Email Verification

1.  **Send**: `POST /church/verify-email/send` -> Sends link to Church Contact Email.
2.  **Confirm**: `POST /church/verify-email/confirm` with `{ "token": "..." }`.

### Phone Verification

1.  **Send**: `POST /church/verify-phone/send` -> Sends OTP to Church Contact Phone.
2.  **Confirm**: `POST /church/verify-phone/confirm` with `{ "otp": "123456" }`.

---

## 🏢 4. Branch Management

Every church starts with a "Headquarters" (conceptually). You can explicitly create it or manage generic branches.

- **Create HQ**: `POST /church/:id/branches/hq`
- **Create Branch**: `POST /church/:id/branches`
- **List Branches**: `GET /church/:id/branches`

---

## ⚠️ Error Handling

All API errors follow this format:

```json
{
  "success": false,
  "message": "Human readable error message"
}
```

- **400**: Bad Request (Missing fields, invalid data).
- **401**: Unauthorized (Missing/Expired token).
- **403**: Forbidden (User lacks permission/role).
- **404**: Not Found (Resource doesn't exist).
- **500**: Server Error (Something went wrong on our end).
