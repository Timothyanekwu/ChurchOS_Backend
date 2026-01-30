# Future Concept: Church Entity & Invite Flow

This document outlines a proposed architectural change for ChurchOS role management, inspired by WhatsApp Communities and GitHub Organizations.

## Core Concept
Instead of a single global signup, the system would distinguish between "Platform Users" and "Church Members".

### 1. The "Platform User"
- Users sign up as generic accounts (no specific permissions initially).
- They exist globally on the platform.

### 2. Creating a Church (The Trigger)
- Any validated user can create a "Church Entity".
- **Trigger**: The moment a user creates a Church, they automatically become the **Super Admin** of that specific Church Entity.
- They gain full control over that Church's data and settings.

### 3. The Invite System
- The Super Admin cannot just "assign" anyone. They must **Invite** them.
- **Workflow**:
  1. Super Admin generates an invite link or sends an email invite.
  2. The invite specifies the target Role (e.g., "Join as Church Admin", "Join as Choir Member").
  3. The recipient receives the link.
  4. **Acceptance**:
     - If existing user: Accepts and is added to the Church's member list with the specified role.
     - If new user: Signs up first, then is automatically linked.

### Benefits
- **Scalability**: Supports multi-tenancy (SaaS) where one user can belong to multiple churches with different roles.
- **Security**: Prevents unauthorized role escalation; roles are strictly scoped to the Church context.
- **User Experience**: Mirrors familiar flows (GitHub, Slack, Discord).

### Implementation Requirements
- `Church` Model with `members` array (User Reference + Role Reference).
- `Invite` Model (Token, Email, Role, Expiry).
- Middleware to check scope (e.g., `req.churchId`).
