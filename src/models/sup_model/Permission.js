import mongoose from 'mongoose';

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a permission name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
    },
    module: {
      type: String,
      required: [true, 'Please provide a module name for grouping'],
      trim: true,
    },
  },
  { timestamps: true }
);

const Permission = mongoose.model('Permission', permissionSchema);

export default Permission;
