import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  name: string;
  phone: string;
  password: string;
  role: "owner" | "officer";
}

const userSchema = new mongoose.Schema<IUser>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["owner", "officer"], default: "officer" },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>("User", userSchema);