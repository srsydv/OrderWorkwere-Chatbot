import mongoose from "mongoose";

const connectDB = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const conn = await mongoose.connect(process.env.MONGODB_URI);
      console.log(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (error) {
      console.error(
        `MongoDB connection error (attempt ${attempt}/${retries}): ${error.message}`
      );
      if (attempt === retries) {
        console.error("Could not connect to MongoDB. Exiting.");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export default connectDB;
