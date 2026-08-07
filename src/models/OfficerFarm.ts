import mongoose from "mongoose";

export interface IOfficerFarm extends mongoose.Document {
  officer: mongoose.Types.ObjectId;
  farm: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const officerFarmSchema = new mongoose.Schema<IOfficerFarm>(
  {
    officer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    farm: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Farm",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);


officerFarmSchema.index(
  {
    officer: 1,
    farm: 1,
  },
  {
    unique: true,
  }
);


export default mongoose.model<IOfficerFarm>(
  "OfficerFarm",
  officerFarmSchema
);