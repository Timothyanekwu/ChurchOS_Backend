import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './src/models/sup_model/Role.js';
import Permission from './src/models/sup_model/Permission.js';

dotenv.config();

// --- MOCK PERMISSIONS LIST (Developer Controlled) ---
const MOCK_PERMISSIONS = [
  // User Management
  { name: 'user.create', description: 'Can create new users', module: 'users' },
  { name: 'user.read', description: 'Can view user details', module: 'users' },
  { name: 'user.update', description: 'Can update user details', module: 'users' },
  { name: 'user.delete', description: 'Can delete users', module: 'users' },
  
  // Access Control (Read Only for now)
  { name: 'role.read', description: 'Can view roles and permissions', module: 'rbac' },
  
  // Example Future Modules
  { name: 'finance.view', description: 'Can view financial records', module: 'finance' },
  { name: 'finance.manage', description: 'Can manage finances', module: 'finance' },
];

// --- ROLE DEFINITIONS (Developer Controlled) ---
const ROLES_CONFIG = {
  'Super Admin': ['*'], // '*' implies ALL permissions
  'Admin': [
    'user.create', 
    'user.read', 
    'user.update', 
    'role.read',
    'finance.view',
    'finance.manage'
  ],
  'Church Staff': [
    'user.read',
    'finance.view'
  ]
};

const seedRBAC = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Seed Permissions
    console.log('Seeding Permissions...');
    const permissionMap = new Map(); // name -> _id

    for (const perm of MOCK_PERMISSIONS) {
      // Upsert permission
      const updatedPerm = await Permission.findOneAndUpdate(
        { name: perm.name },
        perm,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      permissionMap.set(perm.name, updatedPerm._id);
      console.log(`Verified Permission: ${perm.name}`);
    }

    // 2. Seed Roles with assigned Permissions
    console.log('Seeding Roles...');
    
    // Helper to get permission IDs
    const getAllPermissionIds = () => Array.from(permissionMap.values());
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
      let permissionIds = [];
      
      if (assignedPerms.includes('*')) {
        permissionIds = getAllPermissionIds();
      } else {
        permissionIds = getPermissionIds(assignedPerms);
      }

      await Role.findOneAndUpdate(
        { name: roleName },
        { 
          description: `Rigid Role: ${roleName}`,
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
