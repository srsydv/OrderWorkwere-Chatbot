import { createContext, useContext, useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { api, BASE_URL } from "../lib/api.js";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authUser, setAuthUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef(null);

  const connectSocket = (userData) => {
    if (!userData) return;

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    const newSocket = io(BASE_URL, {
      query: { userId: userData._id },
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      setOnlineUsers(userIds);
    });

    socketRef.current = newSocket;
    setSocket(newSocket);
  };

  const checkAuth = async () => {
    try {
      if (!localStorage.getItem("token")) {
        setLoading(false);
        return;
      }
      const data = await api("/api/users/check-auth");
      setAuthUser(data.user);
      connectSocket(data.user);
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setAuthUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    const data = await api("/api/users/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    localStorage.setItem("token", data.Token);
    setToken(data.Token);
    setAuthUser(data.user);
    connectSocket(data.user);
    return data;
  };

  const signup = async (credentials) => {
    const data = await api("/api/users/signup", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
    localStorage.setItem("token", data.Token);
    setToken(data.Token);
    setAuthUser(data.user);
    connectSocket(data.user);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setAuthUser(null);
    setOnlineUsers([]);
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    setSocket(null);
  };

  const updateProfile = async (body) => {
    const data = await api("/api/users/update-profile", {
      method: "PUT",
      body: JSON.stringify(body),
    });
    setAuthUser(data.user);
    return data;
  };

  useEffect(() => {
    checkAuth();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    authUser,
    token,
    onlineUsers,
    socket,
    loading,
    login,
    signup,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
