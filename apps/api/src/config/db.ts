import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  const mongoUri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/paw_track";

  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB Connected successfully: ${mongoose.connection.host}`);
  } catch (error: any) {
    console.warn(`⚠️  MongoDB connection warning: ${error.message}`);
    console.warn(
      "💡 Tip: Set a valid MONGODB_URI in apps/api/.env (e.g. MongoDB Atlas cluster string) or ensure local MongoDB is running on port 27017."
    );
  }
};
