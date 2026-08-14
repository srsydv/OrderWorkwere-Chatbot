import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../models/index.js";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // RDS requires SSL; rejectUnauthorized:false is fine for staging/learning
  ssl: {
    rejectUnauthorized: false,
  },
});

export const db = drizzle(pool, { schema });

const connectDB = async (retries = 5, delayMs = 3000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const client = await pool.connect();
      console.log("PostgreSQL connected");
      client.release();
      return;
    } catch (error) {
      console.error(
        `PostgreSQL connection error (attempt ${attempt}/${retries}): ${error.message}`
      );
      if (attempt === retries) {
        console.error("Could not connect to PostgreSQL. Exiting.");
        process.exit(1);
      }
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

export default connectDB;
