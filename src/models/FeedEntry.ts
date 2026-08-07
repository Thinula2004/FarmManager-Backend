import mongoose from "mongoose";

export interface IFeedEntry extends mongoose.Document {
  feedType: mongoose.Types.ObjectId;
  weight: number;
  cost: number;
  batch: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const feedEntrySchema = new mongoose.Schema<IFeedEntry>(
  {
    feedType: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "FeedType",
      required: true,
    },

    weight: {
      type: Number,
      required: true,
      min: 0,
    },

    cost: {
      type: Number,
      required: true,
      min: 0,
    },

    batch: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Batch",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFeedEntry>(
  "FeedEntry",
  feedEntrySchema
);