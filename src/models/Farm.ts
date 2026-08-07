import mongoose from "mongoose";

export interface IFarm extends mongoose.Document {
  name: string;
  city: string;
  address: string;
  customer: string;
  tel: string;
  createdAt: Date;
  updatedAt: Date;
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
    customer: {
      type: String,
      required: true,
    },
    tel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFarm>("Farm", farmSchema);