import "dotenv/config";
import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.DATABASE_URL;
// RDS: skip CA verify for local drizzle-kit (staging/learning)
const urlWithSsl = databaseUrl.includes("sslmode=")
  ? databaseUrl
  : `${databaseUrl}${databaseUrl.includes("?") ? "&" : "?"}sslmode=no-verify`;

export default defineConfig({
  dialect: "postgresql",
  schema: "./models/index.js",
  out: "./drizzle",
  // Only manage chat tables — never drop other staging app tables
  tablesFilter: ["chat_users", "messages"],
  dbCredentials: {
    url: urlWithSsl,
  },
});
