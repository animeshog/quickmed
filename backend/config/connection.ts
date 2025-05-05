import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectDatabse = async () => {
  try {
    const DB_URL = process.env.DB_URL;

    if (!DB_URL) {
      throw new Error("DB_URL is not defined in environment variables");
    }

    await mongoose.connect(DB_URL);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("MongoDB disconnected, attempting to reconnect...");
    });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database connection error:", error);
    process.exit(1);
  }
};
