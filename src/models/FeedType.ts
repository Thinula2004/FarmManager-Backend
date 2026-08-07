import mongoose from "mongoose";

export interface IFeedType extends mongoose.Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedTypeSchema = new mongoose.Schema<IFeedType>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IFeedType>(
  "FeedType",
  feedTypeSchema
);