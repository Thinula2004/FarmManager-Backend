import mongoose from "mongoose";
import { BatchStatus } from "../enums/BatchStatus";

export interface IBatch extends mongoose.Document {
  name: string;
  farm: mongoose.Types.ObjectId;
  inDate: Date;
  initialCount: number;
  breed: mongoose.Types.ObjectId;
  subBreed: string;
  totalCost: number;
  status: BatchStatus;
  createdAt: Date;
  updatedAt: Date;
}

const batchSchema = new mongoose.Schema<IBatch>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },

    inDate: {
      type: Date,
      required: true,
    },

    initialCount: {
      type: Number,
      required: true,
      min: 1,
    },

    breed: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Breed",
      required: true,
    },

    subBreed: {
      type: String,
      required: false,
      trim: true,
    },

    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["ONGOING", "PARTIALLY_SOLD", "COMPLETED"],
      default: "ONGOING",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBatch>("Batch", batchSchema);