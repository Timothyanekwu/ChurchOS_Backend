# Current Authentication & Role Workflow

## Overview
This document explains the current behavior of the authentication system following the "Super Admin Default" update.

## 1. User Registration (Public)
**Endpoint**: `POST /api/auth/register`

- **Input**: Name, Email, Password, Phone Number.
- **Process**:
  1. System checks if user exists.
  2. System looks for the **'Super Admin'** role.
  3. **Auto-Correction**: If the 'Super Admin' role does not exist (e.g., database was wiped), the system **automatically creates it** to prevent errors.
  4. User is assigned the 'Super Admin' role.
  5. Tokens (Access/Refresh) are generated.

> **Note**: This means *every* new public signup currently becomes a Super Admin. This is intended for the initial setup phase or single-tenant deployments.

## 2. Invitation Logic (Planned/Partial)
- In the future, or via specific Admin endpoints, users can be created with specific roles.
- `req.body.role` is currently ignored during public registration to enforce the default policy, but the controller is resilient.

## 3. Improvements & Best Practices
To make this system more effective for production:

### A. Environment Configuration
Instead of hardcoding `'Super Admin'`, use an environment variable:
```env
DEFAULT_PUBLIC_ROLE='Super Admin'
```
This allows you to change the default behavior (e.g., to 'Member') without changing code.

### B. Startup Seeding
Ensure `seedRoles.js` is run automatically or checked on server startup (`server.js`). Reliance on manual seeding is error-prone.

### C. Role Constants
Use a constants file (`src/config/roles.js`) to avoid typo-related bugs:
```javascript
export const ROLE_SUPER_ADMIN = 'Super Admin';
export const ROLE_STAFF = 'Church Staff';
```

### D. disablePublicSignup Setting
For strict internal tools, add a setting to disable `POST /register` entirely, forcing all users to be added by an existing Admin via `POST /users`.
