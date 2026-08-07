import mongoose from "mongoose";
import { UserRole } from "../enums/UserRole";

export interface IUser extends mongoose.Document {
  name: string;
  phone: string;
  password: string;
  role: UserRole;
  tokenVersion: number;
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
    },

    password: {
      type: String,
      required: true,
    },

    role: {
      type: String,
      enum: ["owner", "officer"],
      default: "officer",
    },

    tokenVersion: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);