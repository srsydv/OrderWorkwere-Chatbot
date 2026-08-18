import { eq, and, or, asc, inArray, count } from "drizzle-orm";
import { db } from "../config/db.js";
import { messages } from "../models/message.js";
import { chatUsers } from "../models/user.js";
import { io, userSocketMap } from "../config/socket.js";
import { uploadChatImage, getReadableImageUrl } from "../config/s3.js";

const publicUserColumns = {
  id: chatUsers.id,
  email: chatUsers.email,
  fullname: chatUsers.fullname,
  profilePic: chatUsers.profilePic,
  bio: chatUsers.bio,
  createdAt: chatUsers.createdAt,
  updatedAt: chatUsers.updatedAt,
};

export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    // SIDEBAR USERS = only people I have already chatted with
    // 1) All messages where I participated
    const chatMessages = await db
      .select({
        sender: messages.sender,
        receiver: messages.receiver,
      })
      .from(messages)
      .where(or(eq(messages.sender, myId), eq(messages.receiver, myId)));

    // 2) Unique partner ids (everyone I talked to, excluding myself)
    const partnerIds = [
      ...new Set(
        chatMessages.map((msg) => {
          const senderId = String(msg.sender);
          const receiverId = String(msg.receiver);
          return senderId === String(myId) ? receiverId : senderId;
        })
      ),
    ];

    // 3) Load partner profiles (empty array if I have no chats yet)
    let users = [];
    if (partnerIds.length > 0) {
      users = await db
        .select(publicUserColumns)
        .from(chatUsers)
        .where(inArray(chatUsers.id, partnerIds));
    }

    const usersResponse = users.map((user) => ({ ...user, _id: user.id }));

    // 4) Unseen counts: messages FROM that partner TO me that are unseen
    const unseenMessages = {};
    await Promise.all(
      usersResponse.map(async (user) => {
        const [result] = await db
          .select({ value: count() })
          .from(messages)
          .where(
            and(
              eq(messages.sender, user.id),
              eq(messages.receiver, myId),
              eq(messages.seen, false)
            )
          );

        if (result.value > 0) {
          unseenMessages[user._id] = result.value;
        }
      })
    );

    res.status(200).json({
      success: true,
      users: usersResponse,
      unseenMessages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;

    const chatMessages = await db
      .select()
      .from(messages)
      .where(
        or(
          and(eq(messages.sender, myId), eq(messages.receiver, selectedUserId)),
          and(eq(messages.sender, selectedUserId), eq(messages.receiver, myId))
        )
      )
      .orderBy(asc(messages.createdAt));

    await db
      .update(messages)
      .set({ seen: true, updatedAt: new Date() })
      .where(
        and(
          eq(messages.sender, selectedUserId),
          eq(messages.receiver, myId),
          eq(messages.seen, false)
        )
      );

    const messagesResponse = await Promise.all(
      chatMessages.map(async (msg) => ({
        ...msg,
        _id: msg.id,
        image: msg.image ? await getReadableImageUrl(msg.image) : msg.image,
      }))
    );

    res.status(200).json({ success: true, messages: messagesResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;

    const [message] = await db
      .update(messages)
      .set({ seen: true, updatedAt: new Date() })
      .where(eq(messages.id, messageId))
      .returning();

    if (!message) {
      return res.status(404).json({ message: "Message not found" });
    }

    const messageResponse = { ...message, _id: message.id };
    res.status(200).json({ success: true, message: messageResponse });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiver = req.params.id;
    const sender = req.user._id;

    if (!text && !image) {
      return res.status(400).json({ message: "Message text or image is required" });
    }

    // Client sends base64; upload to S3 and store the URL in Postgres
    const imageUrl = image ? await uploadChatImage(image) : null;

    const [message] = await db
      .insert(messages)
      .values({ text, image: imageUrl, sender, receiver })
      .returning();

    const readableImage = message.image
      ? await getReadableImageUrl(message.image)
      : null;

    const messageResponse = {
      ...message,
      _id: message.id,
      image: readableImage,
    };

    // SOCKET EMITS TO RECEIVER
    const receiverSocket = userSocketMap[String(receiver)];
    if (receiverSocket) {
      // Chat window: append this message if B has that chat open
      io.to(receiverSocket).emit("newMessage", messageResponse);

      // Sidebar: add/move A to the top of B's contact list live
      const [senderUser] = await db
        .select(publicUserColumns)
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
