import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const sql = `
CREATE TABLE IF NOT EXISTS chat_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) NOT NULL UNIQUE,
  fullname varchar(255) NOT NULL,
  password varchar(255) NOT NULL,
  profile_pic text DEFAULT 'https://via.placeholder.com/150',
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender uuid NOT NULL REFERENCES chat_users(id),
  receiver uuid NOT NULL REFERENCES chat_users(id),
  text text,
  image text,
  seen boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
`;

try {
  await pool.query(sql);
  console.log("Created chat_users and messages (if they did not already exist).");
} catch (error) {
  console.error("Failed to create chat tables:", error.message);
  process.exit(1);
} finally {
  await pool.end();
}
