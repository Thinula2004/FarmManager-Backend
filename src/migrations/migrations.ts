import mongoose from "mongoose";
import Batch from "../models/Batch";
import dotenv from "dotenv";

dotenv.config();

const migrate = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGODB_URI is not defined");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB");

    const result = await Batch.updateMany(
      {},
      {
        $set: {
          finalFeedRemaining: null
        },
      }
    );

    console.log(
      `Migration completed. Updated ${result.modifiedCount} batches.`
    );

    await mongoose.disconnect();

    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Migration failed:", error);

    await mongoose.disconnect();

    process.exit(1);
  }
};

migrate();