import mongoose from "mongoose";

export interface IAnimal extends mongoose.Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const animalSchema = new mongoose.Schema<IAnimal>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IAnimal>("Animal", animalSchema);