import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from '../src/models/sup_model/Role.js';
import User from '../src/models/sup_model/User.js';

dotenv.config();

const fixRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to DB');

    // 1. Get correct Role IDs
    const superAdminRole = await Role.findOne({ name: 'Super Admin' });
    const churchAdminRole = await Role.findOne({ name: 'Church Admin' });
    const memberRole = await Role.findOne({ name: 'Member' });

    if (!superAdminRole) {
      console.error('Super Admin role not found. Run seedRoles.js first.');
      process.exit(1);
    }

    console.log('Found Roles:');
    console.log(`- Super Admin ID: ${superAdminRole._id}`);
    console.log(`- Church Admin ID: ${churchAdminRole ? churchAdminRole._id : 'N/A'}`);

    // 2. Fix Users with "superAdmin" string
    console.log('Fixing users with string roles...');

    // Use native collection to bypass schema validation during query
    const resultSuper = await User.collection.updateMany(
      { role: 'superAdmin' }, 
      { $set: { role: superAdminRole._id } }
    );
    console.log(`Fixed "superAdmin" string: ${resultSuper.modifiedCount} users updated.`);

    // Fix "admin" -> Church Admin
    if (churchAdminRole) {
      const resultAdmin = await User.collection.updateMany(
        { role: 'admin' }, 
        { $set: { role: churchAdminRole._id } }
      );
      console.log(`Fixed "admin" string: ${resultAdmin.modifiedCount} users updated.`);
    }

    // Fix "user" or "member" -> Member
    if (memberRole) {
        const resultMember = await User.collection.updateMany(
          { role: { $in: ['user', 'member'] } }, 
          { $set: { role: memberRole._id } }
        );
        console.log(`Fixed "user/member" string: ${resultMember.modifiedCount} users updated.`);
    }

    // Default fallback: If any user still has a string role that we missed?
    // We can find them by looking for role type 'string'
    const resultRemaining = await User.collection.updateMany(
        { role: { $type: "string" } },
        { $set: { role: churchAdminRole ? churchAdminRole._id : superAdminRole._id } } // Fallback to safe role
    );
    if(resultRemaining.modifiedCount > 0) {
        console.log(`Fixed remaining string roles: ${resultRemaining.modifiedCount} users updated to default.`);
    }

    console.log('Role Fix Complete.');
    process.exit();
  } catch (error) {
    console.error('Error fixing roles:', error);
    process.exit(1);
  }
};

fixRoles();
