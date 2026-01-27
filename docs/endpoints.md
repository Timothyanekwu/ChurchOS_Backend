# API Endpoints

This document lists all available API endpoints in the ChurchOS SuperAdmin Platform.

## All Endpoints
- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `GET /api/auth/me`
- `DELETE /api/auth/delete/:id`
- `POST /api/auth/send-email-verification`
- `POST /api/auth/verify-email`
- `POST /api/auth/send-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `POST /api/auth/change-password`
- `POST /api/users`
- `GET /api/users`
- `GET /api/roles`
- `GET /api/permissions`

## Public Endpoints

### Health Check
- **URL**: `/api/health`
- **Method**: `GET`
- **Description**: Verify that the server is running and healthy.
- **Response**: `200 OK`

### Authentication (Public)

#### Register
- **URL**: `/api/auth/register`
- **Method**: `POST`
- **Description**: Register a new user.
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "secretpassword"
  }
  ```
- **Note**: This public endpoint prevents assigning specific roles. All new users are assigned 'Church Staff' by default. Use `/api/users` (Admin) for custom role assignment.

#### Login
- **URL**: `/api/auth/login`
- **Method**: `POST`
- **Description**: Authenticate a user and receive access/refresh tokens.
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "secretpassword"
  }
  ```

#### Forgot Password
- **URL**: `/api/auth/forgot-password`
- **Method**: `POST`
- **Body**: `{"email": "john@example.com"}`
- **Description**: Sends a password reset email.

#### Reset Password
- **URL**: `/api/auth/reset-password`
- **Method**: `POST`
- **Body**: `{"token": "...", "password": "newpassword"}`
- **Description**: Sets a new password using the reset token.

### Email Verification & OTP

#### Send Email Verification
- **URL**: `/api/auth/send-email-verification`
- **Method**: `POST`
- **Body**: `{"email": "john@example.com"}`

#### Verify Email
- **URL**: `/api/auth/verify-email`
- **Method**: `POST`
- **Body**: `{"token": "..."}`

#### Send OTP
- **URL**: `/api/auth/send-otp`
- **Method**: `POST`
- **Body**: `{"email": "john@example.com"}`

#### Verify OTP
- **URL**: `/api/auth/verify-otp`
- **Method**: `POST`
- **Body**: `{"email": "john@example.com", "otp": "123456"}`

## Protected Endpoints

### User Account (Self)

#### Get Current User
- **URL**: `/api/auth/me`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <accessToken>`

#### Change Password
- **URL**: `/api/auth/change-password`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Body**: `{"currentPassword": "...", "newPassword": "..."}`

#### Delete User Account
- **URL**: `/api/auth/delete/:id`
- **Method**: `DELETE`
- **Headers**: `Authorization: Bearer <accessToken>`

#### Refresh Token
- **URL**: `/api/auth/refresh`
- **Method**: `POST`
- **Body**: `{"refreshToken": "..."}`

---

## Admin Endpoints

### User Management
*Requires `user.create` or `user.read` permissions.*

#### Create User
- **URL**: `/api/users`
- **Method**: `POST`
- **Headers**: `Authorization: Bearer <accessToken>`
- **Body**:
  ```json
  {
    "name": "Staff Name",
    "email": "staff@test.com",
    "password": "password123",
    "role": "Admin" // "Super Admin", "Admin", or "Church Staff"
  }
  ```

#### Get All Users
- **URL**: `/api/users`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <accessToken>`

### RBAC (Read-Only)
*Roles and Permissions are rigid and defined by developers in `seedRoles.js`.*

#### Get All Roles
- **URL**: `/api/roles`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <accessToken>`

#### Get All Permissions
- **URL**: `/api/permissions`
- **Method**: `GET`
- **Headers**: `Authorization: Bearer <accessToken>`
