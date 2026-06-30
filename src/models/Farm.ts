import mongoose from "mongoose";

export interface IFarm extends mongoose.Document {
  name: string;
  city: string;
  address: string;
  activeChicks: number;
  mortalityToday: number;
  avgWeight: number;
  lastVisit: string;
  healthStatus: "Good" | "Fair" | "Poor";
  batchAge: number;
}

const farmSchema = new mongoose.Schema<IFarm>(
  {
    name: {
      type: String,
      required: true,
    },
    city: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    activeChicks: {
      type: Number,
      required: true,
    },
    mortalityToday: {
      type: Number,
      required: true,
    },
    avgWeight: {
      type: Number,
      required: true,
    },
    lastVisit: {
      type: String,
      required: true,
    },
    healthStatus: {
      type: String,
      enum: ["Good", "Fair", "Poor"],
      required: true,
    },
    batchAge: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFarm>("Farm", farmSchema);