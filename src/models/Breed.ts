import mongoose from "mongoose";

export interface IBreed extends mongoose.Document {
  name: string;
  animal: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const breedSchema = new mongoose.Schema<IBreed>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    animal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBreed>("Breed", breedSchema);