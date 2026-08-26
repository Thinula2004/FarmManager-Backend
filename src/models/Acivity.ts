import mongoose from "mongoose";
import { ActivityAction } from "../enums/ActivityAction";
import { ActivityEntity } from "../enums/ActivityEntity";

export interface IActivity extends mongoose.Document {
  user: mongoose.Types.ObjectId;
  action: ActivityAction;
  entity: ActivityEntity;
  entityId?: mongoose.Types.ObjectId;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

const activitySchema = new mongoose.Schema<IActivity>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: true,
    },
    entity: {
      type: String,
      enum: Object.values(ActivityEntity),
      required: true,
    },

    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
    }
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IActivity>(
  "Activity",
  activitySchema
);