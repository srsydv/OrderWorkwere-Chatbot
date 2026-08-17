import { eq } from "drizzle-orm";
import { db } from "../config/db.js";
import { messages } from "../models/message.js";
import { chatUsers } from "../models/user.js";
import { io, userSocketMap } from "../config/socket.js";

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiver = req.params.id;
    const sender = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Message text or image is required" });
    }

    const [message] = await db
      .insert(messages)
      .values({ text, image, sender, receiver })
      .returning();

    const messageResponse = { ...message, _id: message.id };

    // SOCKET EMITS TO RECEIVER
    const receiverSocket = userSocketMap[String(receiver)];
    if (receiverSocket) {
      // Chat window: append this message if B has that chat open
      io.to(receiverSocket).emit("newMessage", messageResponse);

      // Sidebar: add/move A to the top of B's contact list live
      const [senderUser] = await db
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
        .where(eq(chatUsers.id, sender));

      const senderUserResponse = { ...senderUser, _id: senderUser.id };

      io.to(receiverSocket).emit("sidebarUpdate", {
        user: senderUserResponse,
        message: messageResponse,
      });
    }

    res.status(200).json({ success: true, message: messageResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
