import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    uid: { type: String, required: true, unique: true, index: true },
    email: { type: String, required: true, unique: true, index: true },
    username: { type: String, required: true, unique: true, index: true },
    displayName: { type: String },
    bio: { type: String, default: "" },
    avatarUrl: { type: String, default: null },
    followers: { type: [String], default: [] }, // array of uids
    following: { type: [String], default: [] }, // array of uids
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
