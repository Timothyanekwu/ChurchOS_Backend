import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../src/models/sup_model/Role.js';
import Permission from '../src/models/sup_model/Permission.js';

dotenv.config();

// --- PERMISSIONS LIST (Reflecting docs/rbac_permissions.md) ---
const PERMISSIONS_LIST = [
  // System
  { name: 'system.view', description: 'View system-level overview', module: 'system' },
  { name: 'system.configure', description: 'Modify global system settings', module: 'system' },
  { name: 'system.logs', description: 'View system audit logs', module: 'system' },

  // User Management
  { name: 'user.view', description: 'View user profiles', module: 'users' },
  { name: 'user.create', description: 'Register new users', module: 'users' },
  { name: 'user.update', description: 'Modify user details', module: 'users' },
  { name: 'user.delete', description: 'Remove users', module: 'users' },
  { name: 'user.assign_role', description: 'Change user roles', module: 'users' },

  // Church & Branch
  { name: 'church.view', description: 'View church profile', module: 'church' },
  { name: 'church.update', description: 'Modify church info', module: 'church' },
  { name: 'branch.view', description: 'View branches', module: 'branch' },
  { name: 'branch.create', description: 'Create new branches', module: 'branch' },
  { name: 'branch.update', description: 'Update branch details', module: 'branch' },
  { name: 'branch.delete', description: 'Delete branches', module: 'branch' },

  // Member Management
  { name: 'member.view', description: 'View member database', module: 'members' },
  { name: 'member.create', description: 'Add new members', module: 'members' },
  { name: 'member.update', description: 'Update member details', module: 'members' },
  { name: 'member.delete', description: 'Remove members', module: 'members' },
  { name: 'member.export', description: 'Export member list', module: 'members' },

  // Event Management
  { name: 'event.view', description: 'View scheduled events', module: 'events' },
  { name: 'event.create', description: 'Schedule new events', module: 'events' },
  { name: 'event.update', description: 'Modify event details', module: 'events' },
  { name: 'event.delete', description: 'Cancel events', module: 'events' },

  // Attendance Management
  { name: 'attendance.view', description: 'View attendance records', module: 'attendance' },
  { name: 'attendance.mark', description: 'Take/Mark attendance', module: 'attendance' },
  { name: 'attendance.edit', description: 'Correct attendance', module: 'attendance' },
  { name: 'attendance.export', description: 'Export attendance', module: 'attendance' },

  // Communication
  { name: 'message.create', description: 'Compose messages', module: 'communication' },
  { name: 'message.send', description: 'Send notifications', module: 'communication' },
  { name: 'message.view', description: 'View message history', module: 'communication' },

  // Analytics
  { name: 'analytics.view', description: 'Access report analytics', module: 'analytics' },
  { name: 'analytics.export', description: 'Export stats', module: 'analytics' },

  // Settings
  { name: 'settings.view', description: 'View configuration', module: 'settings' },
  { name: 'settings.update', description: 'Update configuration', module: 'settings' },
];

// --- ROLE DEFINITIONS ---
const ROLES_CONFIG = {
  'Super Admin': [
    'system.view', 'system.configure', 'system.logs',
    'user.view', 'user.create', 'user.update', 'user.delete', 'user.assign_role',
    'church.view', 'church.update',
    'branch.view', 'branch.create', 'branch.update', 'branch.delete',
    'member.view', 'member.create', 'member.update', 'member.delete', 'member.export',
    'event.view', 'event.create', 'event.update', 'event.delete',
    'attendance.view', 'attendance.mark', 'attendance.edit', 'attendance.export',
    'message.create', 'message.send', 'message.view',
    'analytics.view', 'analytics.export',
    'settings.view', 'settings.update'
  ],
  'Church Admin': [
    'system.view',
    'user.view', 'user.create', 'user.update', 'user.delete', 'user.assign_role',
    'church.view', 'church.update',
    'branch.view', 'branch.create', 'branch.update', 'branch.delete',
    'member.view', 'member.create', 'member.update', 'member.delete', 'member.export',
    'event.view', 'event.create', 'event.update', 'event.delete',
    'attendance.view', 'attendance.mark', 'attendance.edit', 'attendance.export',
    'message.create', 'message.send', 'message.view',
    'analytics.view', 'analytics.export',
    'settings.view', 'settings.update'
  ],
  'Member': [
    'church.view',
    'branch.view',
    'event.view',
    'attendance.mark',
    'message.view'
  ]
};

const seedRBAC = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Seed Permissions
    console.log('Seeding Permissions...');
    const permissionMap = new Map(); // name -> _id

    for (const perm of PERMISSIONS_LIST) {
      // Upsert permission
      const updatedPerm = await Permission.findOneAndUpdate(
        { name: perm.name },
        perm,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      permissionMap.set(perm.name, updatedPerm._id);
      // console.log(`Verified Permission: ${perm.name}`);
    }
    console.log(`Seeded ${permissionMap.size} permissions.`);

    // 2. Seed Roles with assigned Permissions
    console.log('Seeding Roles...');
    
    // Helper to get permission IDs
    const getPermissionIds = (names) => {
      const ids = [];
      names.forEach(name => {
         const id = permissionMap.get(name);
         if (id) ids.push(id);
         else console.warn(`Warning: Permission '${name}' not found for role assignment.`);
      });
      return ids;
    };

    for (const [roleName, assignedPerms] of Object.entries(ROLES_CONFIG)) {
      const permissionIds = getPermissionIds(assignedPerms);

      await Role.findOneAndUpdate(
        { name: roleName },
        { 
          description: `Role: ${roleName}`,
          permissions: permissionIds
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      console.log(`Updated Role: ${roleName} with ${permissionIds.length} permissions`);
    }

    console.log('RBAC Seeding Complete.');
    process.exit();
  } catch (error) {
    console.error('Error seeding RBAC:', error);
    process.exit(1);
  }
};

seedRBAC();
