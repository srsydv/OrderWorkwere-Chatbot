import Message from "../models/message.js";
import User from "../models/user.js";
import { io, userSocketMap } from "../config/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const myId = req.user._id;

    // SIDEBAR USERS = only people I have already chatted with
    // 1) All messages where I participated
    const messages = await Message.find({
      $or: [{ sender: myId }, { receiver: myId }],
    }).select("sender receiver");

    // 2) Unique partner ids (everyone I talked to, excluding myself)
    const partnerIds = [
      ...new Set(
        messages.map((msg) => {
          const senderId = String(msg.sender);
          const receiverId = String(msg.receiver);
          return senderId === String(myId) ? receiverId : senderId;
        })
      ),
    ];

    // 3) Load partner profiles (empty array if I have no chats yet)
    const users = await User.find({ _id: { $in: partnerIds } }).select(
      "-password"
    );

    // 4) Unseen counts: messages FROM that partner TO me that are unseen
    const unseenMessages = {};
    await Promise.all(
      users.map(async (user) => {
        const count = await Message.countDocuments({
          sender: user._id,
          receiver: myId,
          seen: false,
        });
        if (count > 0) {
          unseenMessages[user._id] = count;
        }
      })
    );

    res.status(200).json({ success: true, users, unseenMessages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: selectedUserId } = req.params;
    const myId = req.user._id;
    const messages = await Message.find({
      $or: [
        { sender: myId, receiver: selectedUserId },
        { sender: selectedUserId, receiver: myId },
      ],
    }).sort("createdAt");

    await Message.updateMany(
      { sender: selectedUserId, receiver: myId, seen: false },
      { seen: true }
    );

    res.status(200).json({ success: true, messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const message = await Message.findByIdAndUpdate(
      messageId,
      { seen: true },
      { new: true }
    );
    res.status(200).json({ success: true, message });
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

    const message = await Message.create({ text, image, sender, receiver });

    // SOCKET EMITS TO RECEIVER
    const receiverSocket = userSocketMap[String(receiver)];
    if (receiverSocket) {
      // Chat window: append this message if B has that chat open
      io.to(receiverSocket).emit("newMessage", message);

      // Sidebar: add/move A to the top of B's contact list live
      const senderUser = await User.findById(sender).select("-password");
      io.to(receiverSocket).emit("sidebarUpdate", {
        user: senderUser,
        message,
      });
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
