import mongoose from "mongoose";
import dotenv from "dotenv";
import { syncExistingReportsToUsers } from "../utils/migrationReport.js";

dotenv.config();

const run = async () => {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("Connected.");

    await syncExistingReportsToUsers();
  } catch (err) {
    console.error("Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected.");
    process.exit(0); 
  }
};

run();
