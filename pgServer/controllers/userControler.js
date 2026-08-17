import { eq } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { chatUsers } from "../models/user.js";
import { generateToken } from "../config/utils.js";
import { io } from "../config/socket.js";

export const signup = async (req, res) => {
  const { fullname, email, password, bio } = req.body;
  try {
    if (!fullname || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [existingUser] = await db
      .select()
      .from(chatUsers)
      .where(eq(chatUsers.email, email));

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [newUser] = await db
      .insert(chatUsers)
      .values({
        fullname,
        email,
        password: hashedPassword,
        bio: bio || "Hi Everyone, I am Using QuickChat",
      })
      .returning();

    const token = generateToken(newUser.id);

    const { password: _, ...userWithoutPassword } = newUser;
    const userResponse = { ...userWithoutPassword, _id: newUser.id };

    // Tell every online client a new account exists so search can find them
    // without refreshing the page
    if (io) {
      io.emit("newUser", userResponse);
    }

    res.status(201).json({ success: true, user: userResponse, Token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
