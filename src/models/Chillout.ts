import mongoose from "mongoose";

export interface IChillout extends mongoose.Document {
  date: Date;
  batch: mongoose.Types.ObjectId;
  count: number;
  price: number;
  customer: string;
  createdAt: Date;
  updatedAt: Date;
}

const chilloutSchema = new mongoose.Schema<IChillout>(
  {
    date: {
      type: Date,
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    count: {
      type: Number,
      required: true,
      min: 1,
    },

    price: {
      type: Number,
      default: 0,
      min: 0,
    },

    customer: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IChillout>("Chillout", chilloutSchema);