import { pgTable, uuid, varchar, text, timestamp } from "drizzle-orm/pg-core";

export const chatUsers = pgTable("chat_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  fullname: varchar("fullname", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  profilePic: text("profile_pic").default("https://via.placeholder.com/150"),
  bio: text("bio"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
