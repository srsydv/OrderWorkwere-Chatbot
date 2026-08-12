import Message from "../models/message.js";
import User from "../models/user.js";
import { generateToken, verifyToken } from "../config/utils.js";
import { io, userSocketMap } from "../app.js";
import { protectRoute } from "../middleware/auth.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const filteredUsers = await User.find({
      _id: { $ne: req.user._id },
    }).select("fullname profilePic");
    // count number of messages not seen by the user
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
    res.status(200).json({ users: filteredUsers, unseenMessages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Get all messages between two users
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
      { sender: myId, receiver: selectedUserId, seen: false },
      { seen: true }
    );
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//api to mark message as seen using message id
export const markMessageAsSeen = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const message = await Message.findByIdAndUpdate(messageId, { seen: true }, { new: true });
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//send message to selected user
export const sendMessage = async (req, res) => {
  try {
    const { text, image } = req.body;
    const receiver = req.params.id;
    const sender = req.user._id;
    const message = await Message.create({ text, image, sender, receiver });
    //emit message to the receiver's socket
    const receiverSocket = userSocketMap[receiver];
    if (receiverSocket) {
      io.to(receiverSocket).emit("newMessage", message);
    }
    //emit message to the sender's socket
    const senderSocket = userSocketMap[sender];
    if (senderSocket) {
      io.to(senderSocket).emit("newMessage", message);
    }
    res.status(200).json({ message });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
