# Role-Based Access Control (RBAC) Permissions

This document outlines the delegation of permissions across the specific roles in the ChurchOS system.

## Roles Overview

1. **Super Admin**: Full system access, including system configuration, logs, and global oversight.
2. **Church Admin**: Core administrator for the church, managing users, branches, departments, and members.
3. **Member**: Regular user with access to view events, mark personal/assigned attendance, and communicate.

## Permissions Delegation Table

| Permission | Super Admin | Church Admin | Member |
| :--- | :---: | :---: | :---: |
| **System Permissions** | | | |
| `system.view` | ✅ | ✅ | |
| `system.configure` | ✅ | | |
| `system.logs` | ✅ | | |
| **User Management** | | | |
| `user.view` | ✅ | ✅ | |
| `user.create` | ✅ | ✅ | |
| `user.update` | ✅ | ✅ | |
| `user.delete` | ✅ | ✅ | |
| `user.assign_role` | ✅ | ✅ | |
| **Church & Branch** | | | |
| `church.view` | ✅ | ✅ | ✅ |
| `church.update` | ✅ | ✅ | |
| `branch.view` | ✅ | ✅ | ✅ |
| `branch.create` | ✅ | ✅ | |
| `branch.update` | ✅ | ✅ | |
| `branch.delete` | ✅ | ✅ | |
| **Member Management** | | | |
| `member.view` | ✅ | ✅ | |
| `member.create` | ✅ | ✅ | |
| `member.update` | ✅ | ✅ | |
| `member.delete` | ✅ | ✅ | |
| `member.export` | ✅ | ✅ | |
| **Event Management** | | | |
| `event.view` | ✅ | ✅ | ✅ |
| `event.create` | ✅ | ✅ | |
| `event.update` | ✅ | ✅ | |
| `event.delete` | ✅ | ✅ | |
| **Attendance Management**| | | |
| `attendance.view` | ✅ | ✅ | |
| `attendance.mark` | ✅ | ✅ | ✅ |
| `attendance.edit` | ✅ | ✅ | |
| `attendance.export` | ✅ | ✅ | |
| **Communication** | | | |
| `message.create` | ✅ | ✅ | |
| `message.send` | ✅ | ✅ | |
| `message.view` | ✅ | ✅ | ✅ |
| **Analytics & Reporting** | | | |
| `analytics.view` | ✅ | ✅ | |
| `analytics.export` | ✅ | ✅ | |
| **Settings Management** | | | |
| `settings.view` | ✅ | ✅ | |
| `settings.update` | ✅ | ✅ | |

---

## Detailed Permission Descriptions

### System Permissions
- `system.view`: View system-level overview (dashboards, status).
- `system.configure`: Modify global system settings (SuperAdmin only).
- `system.logs`: View system-wide audit logs and error logs.

### User Management
- `user.view`: View user profiles and login history.
- `user.create`: Register new users/staff.
- `user.update`: Modify user details or status.
- `user.delete`: Remove users from the system.
- `user.assign_role`: Change roles assigned to users.

### Church & Branch Management
- `church.view`: View church profile and details.
- `church.update`: Modify church information.
- `branch.view`: View list of branches and their details.
- `branch.create`: Create new branches under the church.
- `branch.update`: Update branch-specific details.
- `branch.delete`: Remove a branch.

### Member Management
- `member.view`: View member database and profiles.
- `member.create`: Add new members to the database.
- `member.update`: Update member details.
- `member.delete`: Remove members.
- `member.export`: Export member list to CSV/Excel.

### Event Management
- `event.view`: View scheduled services and events.
- `event.create`: Schedule new events or services.
- `event.update`: Modify event details.
- `event.delete`: Cancel or delete an event.

### Attendance Management
- `attendance.view`: View attendance records.
- `attendance.mark`: Take attendance (Members can mark their own or as assigned).
- `attendance.edit`: Correct attendance errors.
- `attendance.export`: Generate attendance reports and exports.

### Communication System
- `message.create`: Compose messages or announcements.
- `message.send`: Trigger sending of SMS/Email/Push notifications.
- `message.view`: View message history and delivery status.

### Analytics & Reporting
- `analytics.view`: Access graphical reports and growth trends.
- `analytics.export`: Export statistics and financial reports.

### Settings Management
- `settings.view`: View configuration settings.
- `settings.update`: Update configuration settings.
