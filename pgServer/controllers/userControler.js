import { eq, ne, or, and, ilike } from "drizzle-orm";
import bcrypt from "bcrypt";
import { db } from "../config/db.js";
import { chatUsers } from "../models/user.js";
import { generateToken } from "../config/utils.js";
import { io } from "../config/socket.js";

const publicUserColumns = {
  id: chatUsers.id,
  email: chatUsers.email,
  fullname: chatUsers.fullname,
  profilePic: chatUsers.profilePic,
  bio: chatUsers.bio,
  createdAt: chatUsers.createdAt,
  updatedAt: chatUsers.updatedAt,
};

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

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const [userData] = await db
      .select()
      .from(chatUsers)
      .where(eq(chatUsers.email, email));

    if (!userData) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isPasswordCorrect = await bcrypt.compare(password, userData.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const token = generateToken(userData.id);
    const { password: _, ...userWithoutPassword } = userData;
    const userResponse = { ...userWithoutPassword, _id: userData.id };

    res.status(200).json({ success: true, user: userResponse, Token: token });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { fullname, profilePic, bio } = req.body;
    const updateData = {
      fullname,
      bio,
      updatedAt: new Date(),
    };
    if (profilePic) {
      updateData.profilePic = profilePic;
    }

    const [updatedUser] = await db
      .update(chatUsers)
      .set(updateData)
      .where(eq(chatUsers.id, req.user._id))
      .returning({
        id: chatUsers.id,
        email: chatUsers.email,
        fullname: chatUsers.fullname,
        profilePic: chatUsers.profilePic,
        bio: chatUsers.bio,
        createdAt: chatUsers.createdAt,
        updatedAt: chatUsers.updatedAt,
      });

    const userResponse = { ...updatedUser, _id: updatedUser.id };
    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const [user] = await db
      .select({
        id: chatUsers.id,
        email: chatUsers.email,
        fullname: chatUsers.fullname,
        profilePic: chatUsers.profilePic,
        bio: chatUsers.bio,
        createdAt: chatUsers.createdAt,
        updatedAt: chatUsers.updatedAt,
      })
      .from(chatUsers)
      .where(eq(chatUsers.id, req.user._id));

    const userResponse = { ...user, _id: user.id };
    res.status(200).json({ success: true, user: userResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// All users except me — used only to START a new chat (not the sidebar list)
export const getAllUsers = async (req, res) => {
  try {
    const users = await db
      .select(publicUserColumns)
      .from(chatUsers)
      .where(ne(chatUsers.id, req.user._id));

    const usersResponse = users.map((user) => ({ ...user, _id: user.id }));
    res.status(200).json({ success: true, users: usersResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Search users in DB by name or email (excludes me)
export const searchUsers = async (req, res) => {
  try {
    const raw = (req.query.query || "").trim();
    if (!raw) {
      return res.status(200).json({ success: true, users: [] });
    }

    // Escape LIKE wildcards so % and _ are treated as normal characters
    const query = raw.replace(/[%_\\]/g, "\\$&");

    const users = await db
      .select(publicUserColumns)
      .from(chatUsers)
      .where(
        and(
          ne(chatUsers.id, req.user._id),
          or(
            ilike(chatUsers.fullname, `%${query}%`),
            ilike(chatUsers.email, `%${query}%`)
          )
        )
      )
      .limit(20);

    const usersResponse = users.map((user) => ({ ...user, _id: user.id }));
    res.status(200).json({ success: true, users: usersResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
