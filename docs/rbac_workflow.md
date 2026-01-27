# Role-Based Access Control (RBAC) Workflow

This document explains the dynamic RBAC system implemented in ChurchOS.

## Overview
The system uses a flexible, database-driven RBAC model involving `Users`, `Roles`, and `Permissions`.
- **User**: Has a reference to a single `Role`.
- **Role**: Has a name, description, and a list of `Permissions`.
- **Permission**: Represents a specific action or access right (e.g., `create_user`, `delete_post`).

## Workflow

### 1. Setup (One-time)
Initial roles are seeded into the database. By default, the system initializes:
- `Super Admin`
- `Admin`
- `Church Staff`

You can run the seed script if these are missing:
```bash
node seedRoles.js
```

### 2. Managing Roles (SuperAdmin)
A SuperAdmin can manage roles dynamically via the API.
- **Create Role**: Define a new role (e.g., 'Manager') and assign permissions to it.
- **Update Role**: Change a role's permissions or name.
- **Delete Role**: Remove a role (ensure no users are assigned to it first).

### 3. User Registration / Assignment
When a user is created (registered), they must be assigned a role.
- The `POST /api/auth/register` endpoint accepts a `role` parameter (Role Name, e.g., "Church Staff").
- The system looks up the role by name.
- If found, the user is linked to that Role ID.
- If not found, the registration fails (or falls back to a default if configured).

### 4. Access Control
When a user logs in, their access token identifies them.
- Protected routes can check `req.user.role`.
- Since `role` is a reference, the backend populates it to check the role's name or its associated permissions.
- Middleware (e.g., `authorize('create_user')`) can verify if the user's role has the required permission.

## Example Flow: Creating a 'Moderator' Role

1. **Create Permissions** (if they don't exist):
   `POST /api/permissions`
   ```json
   { "name": "moderate_comments", "module": "comments" }
   ```

2. **Create Role**:
   `POST /api/roles`
   ```json
   {
     "name": "Moderator",
     "permissions": ["<permission_id_1>", "<permission_id_2>"]
   }
   ```

3. **Assign Role**:
   Register a new user as 'Moderator':
   `POST /api/auth/register`
   ```json
   {
     "name": "Mod User",
     "email": "mod@test.com",
     "password": "123",
     "role": "Moderator"
   }
   ```
