import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../lib/api.js";
import { useAuth } from "./AuthContext.jsx";

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { socket, authUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [unseenMessages, setUnseenMessages] = useState({});
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const getUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await api("/api/messages/users");
      setUsers(data.users || []);
      setUnseenMessages(data.unseenMessages || {});
    } catch (error) {
      console.error(error.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const getMessages = async (userId) => {
    try {
      const data = await api(`/api/messages/${userId}`);
      setMessages(data.messages || []);
      setUnseenMessages((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  const sendMessage = async ({ text, image }) => {
    if (!selectedUser) return;
    const data = await api(`/api/messages/send/${selectedUser._id}`, {
      method: "POST",
      body: JSON.stringify({ text, image }),
    });
    setMessages((prev) => [...prev, data.message]);
    return data.message;
  };

  const markAsSeen = async (messageId) => {
    try {
      await api(`/api/messages/mark-as-seen/${messageId}`, { method: "PUT" });
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    if (authUser) getUsers();
  }, [authUser]);

  useEffect(() => {
    if (selectedUser) {
      getMessages(selectedUser._id);
    } else {
      setMessages([]);
    }
  }, [selectedUser?._id]);

  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (newMessage) => {
      const senderId = String(newMessage.sender);
      const receiverId = String(newMessage.receiver);
      const selectedId = selectedUser ? String(selectedUser._id) : null;
      const myId = authUser ? String(authUser._id) : null;

      const isChatOpen =
        selectedId && (senderId === selectedId || receiverId === selectedId);

      if (isChatOpen) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === newMessage._id)) return prev;
          return [...prev, newMessage];
        });
        if (senderId === selectedId) {
          markAsSeen(newMessage._id);
        }
      } else if (senderId !== myId) {
        setUnseenMessages((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
    };

    socket.on("newMessage", handleNewMessage);
    return () => socket.off("newMessage", handleNewMessage);
  }, [socket, selectedUser, authUser]);

  const value = {
    users,
    usersLoading,
    unseenMessages,
    selectedUser,
    setSelectedUser,
    messages,
    getUsers,
    getMessages,
    sendMessage,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChat must be used within ChatProvider");
  return ctx;
};
