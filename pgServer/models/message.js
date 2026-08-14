import { pgTable, uuid, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { chatUsers } from "./user.js";

export const messages = pgTable("messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  sender: uuid("sender")
    .notNull()
    .references(() => chatUsers.id),
  receiver: uuid("receiver")
    .notNull()
    .references(() => chatUsers.id),
  text: text("text"),
  image: text("image"),
  seen: boolean("seen").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
