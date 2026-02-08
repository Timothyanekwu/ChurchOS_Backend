import mongoose from "mongoose";

const branchSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please provide a branch name"],
      trim: true,
    },
    church: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Church",
      required: true,
    },
    isHQ: {
      type: Boolean,
      default: false,
    },
    address: {
      country: String,
      state: String,
      city: String,
      street: String,
      postalCode: String,
    },
    contact: {
      email: String,
      phone: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Branch = mongoose.model("Branch", branchSchema);

export default Branch;
