import mongoose from "mongoose";

export interface ISupply extends mongoose.Document {
  name: string;
  quantity: number;
  unit: string;
  type: mongoose.Types.ObjectId;
  batch: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const supplySchema = new mongoose.Schema<ISupply>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 0,
    },

    unit: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SupplyType",
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISupply>("Supply", supplySchema);