import Message from "../models/message.js";
import User from "../models/user.js";
import { io, userSocketMap } from "../config/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const filteredUsers = await User.find({
      _id: { $ne: req.user._id },
    }).select("-password");

    const unseenMessages = {};
    const promises = filteredUsers.map(async (user) => {
      const messages = await Message.find({
        sender: user._id,
        receiver: req.user._id,
        seen: false,
      });
      if (messages.length > 0) {
        unseenMessages[user._id] = messages.length;
      }
    });
    await Promise.all(promises);
    res.status(200).json({ success: true, users: filteredUsers, unseenMessages });
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

    const receiverSocket = userSocketMap[String(receiver)];
    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", message);
    }

    res.status(200).json({ success: true, message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
