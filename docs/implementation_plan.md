# Backend Project Setup with Express and Mongoose

This plan outlines the steps to initialize a robust Node.js backend using Express and Mongoose for MongoDB Atlas integration.

## Proposed Changes

### Project Initialization
- Initialize `package.json` with ESM support.
- Install core dependencies: `express`, `mongoose`, `dotenv`, `cors`.
- Install development dependency: `nodemon`.

### Directory Structure
```
server/
├── src/
│   ├── config/       # Configuration (DB, etc.)
│   ├── controllers/  # Request handlers
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── index.js      # Server entry point
├── .env              # Environment variables
├── .gitignore        # Git ignore rules
└── package.json
```

### Core Components

#### [NEW] `src/config/db.js`
Responsible for establishing a connection to MongoDB Atlas using Mongoose.

#### [NEW] `src/index.js`
Main entry point that:
- Loads environment variables.
- Connects to the database.
- Sets up Express middleware (CORS, JSON parsing).
- Defines a basic health check route.
- Listens on a specified port.

### [NEW] Authentication Feature
Implementing a robust JWT-based authentication system for the SuperAdmin platform.

#### Dependencies
- `bcryptjs`: For password hashing.
- `jsonwebtoken`: For creating and verifying JWTs.

#### [NEW] `src/models/User.js`
- Schema: `name`, `email` (unique), `password`, `role` (superAdmin/admin/user).
- Static methods:
  - `User.register(userData)`: Hashes password and creates a user.
  - `User.login(email, password)`: Verifies credentials and returns user.
  - `User.generateToken(payload, type)`: Generates Access or Refresh token.

#### [NEW] `src/controllers/authController.js`
- `register`: Handles `POST /auth/register`.
- `login`: Handles `POST /auth/login`.
- `refresh`: Handles `POST /auth/refresh`.
- `getMe`: Handles `GET /auth/me`.

#### [NEW] `src/middleware/authMiddleware.js`
- `protect`: Middleware to verify Access JWT and attach user to `req.user`.

### [NEW] Delete User Feature
Allowing administrators or users to delete accounts.

#### [MODIFY] `src/models/User.js`
- Static method: `User.deleteUser(userId)` - Finds and deletes a user by ID.

#### [MODIFY] `src/controllers/authController.js`
- `deleteAccount`: Handles `DELETE /auth/delete/:id`.

#### [MODIFY] `src/routes/authRoutes.js`
- `DELETE /delete/:id`: Protected route to delete a user.

### [NEW] Email Verification & OTP
Implementing secure email verification and One-Time Password (OTP) functionality.

#### Dependencies
- `nodemailer`: For sending emails.
- `otp-generator`: For generating numeric OTPs.
- `crypto`: Built-in Node.js module for hashing tokens.

#### [MODIFY] `src/models/sup_model/User.js`
- **Fields**:
  - `isEmailVerified`: Boolean, default false.
  - `emailVerificationToken`: String (hashed).
  - `emailVerificationExpire`: Date.
  - `otp`: String (hashed).
  - `otpExpire`: Date.
- **Methods**:
  - `generateEmailVerificationToken()`: Generates random bytes, hashes them, sets expiry.
  - `generateOTP()`: Generates 6-digit code, hashes it, sets expiry.

#### [NEW] `src/utils/sendEmail.js`
- Reusable function to send emails using `nodemailer` and SMTP credentials from `.env`.

#### [MODIFY] `src/controllers/sup_controller/authController.js`
- `sendEmailVerification`: Generates token, saves user, sends email.
- `verifyEmail`: Validates token, updates `isEmailVerified`.
- `sendOTP`: Generates OTP, saves user, sends email.
- `verifyOTP`: Validates OTP against stored hash.

#### [MODIFY] `src/routes/sup_authRoutes/authRoutes.js`
- `POST /send-email-verification`
- `POST /verify-email`
- `POST /send-otp`
- `POST /verify-otp`

## Verification Plan

### Manual Verification
- **Register**: `POST /auth/register` with name, email, password. Success -> 201 + tokens.
- **Login**: `POST /auth/login` with credentials. Success -> 200 + tokens.
- **Get Me**: `GET /auth/me` with Authorization header. Success -> 200 + user data.
- **Refresh**: `POST /auth/refresh` with refresh token. Success -> 200 + new access token.
- **Delete**: `DELETE /auth/delete/:id` with Authorization header. Success -> 200 + success message.
- **Send Verify**: `POST /auth/send-email-verification`. Check console for "Email sent" (mocked if no SMTP).
- **Verify Email**: `POST /auth/verify-email` with token. Success -> 200.
- **Send OTP**: `POST /auth/send-otp`. Check console for OTP.
- **Verify OTP**: `POST /auth/verify-otp` with OTP. Success -> 200.



