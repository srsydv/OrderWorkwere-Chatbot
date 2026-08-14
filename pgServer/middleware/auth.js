import { eq } from "drizzle-orm";
import { verifyToken } from "../config/utils.js";
import { db } from "../config/db.js";
import { chatUsers } from "../models/user.js";

const findUserByToken = async (token) => {
  const decoded = verifyToken(token);
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
    .where(eq(chatUsers.id, decoded.userId));

  if (!user) return null;

  // Same shape as Mongo for controllers/client (_id)
  return { ...user, _id: user.id };
};

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

export const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await findUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
