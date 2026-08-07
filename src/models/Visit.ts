import mongoose from "mongoose";

export interface IVisit extends mongoose.Document {
  visitNumber: number;
  visitedDate: Date;
  batch: mongoose.Types.ObjectId;
  feedEntry: mongoose.Types.ObjectId;
  remainingFeed: number;
  mortality: number;
  avgWeight: number;
  FCR: number;
  officer: mongoose.Types.ObjectId;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}

const visitSchema = new mongoose.Schema<IVisit>(
  {
    visitNumber: {
      type: Number,
      required: true,
    },

    visitedDate: {
      type: Date,
      required: true,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },

    feedEntry: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedEntry",
      required: true,
    },

    remainingFeed: {
      type: Number,
      required: true,
      min: 0,
    },

    mortality: {
      type: Number,
      required: true,
      min: 0,
    },

    avgWeight: {
      type: Number,
      required: true,
      min: 0,
    },

    FCR: {
      type: Number,
      required: true,
      min: 0,
    },

    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    note: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IVisit>("Visit", visitSchema);