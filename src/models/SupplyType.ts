import mongoose from "mongoose";

export interface ISupplyType extends mongoose.Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const supplyTypeSchema = new mongoose.Schema<ISupplyType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISupplyType>(
  "SupplyType",
  supplyTypeSchema
);