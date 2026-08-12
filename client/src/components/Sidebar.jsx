import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";

const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { onlineUsers, logout, authUser } = useAuth();
  const { users, usersLoading, unseenMessages, selectedUser, setSelectedUser } =
    useChat();

  const filteredUsers = users.filter((user) =>
    user.fullname?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div
      className={`w-full md:w-[320px] min-w-[280px] h-full flex-col border-r border-white/10 p-4 ${
        selectedUser ? "hidden md:flex" : "flex"
      }`}
    >
      <div className="flex items-center justify-between mb-6 relative">
        <div className="flex items-center gap-2">
          <img src={assets.logo_icon} alt="QuickChat" className="w-8 h-8" />
          <span className="text-white text-xl font-medium">QuickChat</span>
        </div>
        <button type="button" onClick={() => setMenuOpen((v) => !v)}>
          <img
            src={assets.menu_icon}
            alt="Menu"
            className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100"
          />
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-10 z-20 bg-[#1c2333] border border-white/10 rounded-lg overflow-hidden shadow-xl min-w-[140px]">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                navigate("/profile");
              }}
              className="w-full text-left text-white text-sm px-4 py-2.5 hover:bg-white/5"
            >
              Edit profile
            </button>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
                navigate("/login");
              }}
              className="w-full text-left text-white text-sm px-4 py-2.5 hover:bg-white/5"
            >
              Logout
            </button>
          </div>
        )}
      </div>

      <div className="relative mb-4">
        <img
          src={assets.search_icon}
          alt="Search"
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50"
        />
        <input
          type="text"
          placeholder="Search User..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-2.5 pl-10 pr-4 outline-none border border-white/5 focus:border-purple-500/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {usersLoading && (
          <p className="text-gray-400 text-sm text-center py-4">Loading users...</p>
        )}
        {!usersLoading && filteredUsers.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No users found</p>
        )}
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id;
          const isOnline = onlineUsers.includes(String(user._id));
          const unread = unseenMessages[user._id] || 0;

          return (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                isSelected
                  ? "bg-purple-600/30 border border-purple-500/30"
                  : "hover:bg-white/5"
              }`}
            >
              <img
                src={user.profilePic || assets.avatar_icon}
                alt={user.fullname}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">
                  {user.fullname}
                </p>
                <p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
                  {isOnline ? "Online" : "Offline"}
                </p>
              </div>
              {unread > 0 && (
                <span className="bg-purple-600 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center">
                  {unread}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {authUser && (
        <div className="pt-3 border-t border-white/10 mt-2 flex items-center gap-3">
          <img
            src={authUser.profilePic || assets.avatar_icon}
            alt={authUser.fullname}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-white text-sm truncate">{authUser.fullname}</p>
            <p className="text-gray-500 text-xs truncate">{authUser.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
