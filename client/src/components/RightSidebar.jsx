import React from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";

const RightSidebar = () => {
  const navigate = useNavigate();
  const { onlineUsers, logout } = useAuth();
  const { selectedUser, messages } = useChat();

  if (!selectedUser) return null;

  const isOnline = onlineUsers.includes(String(selectedUser._id));
  const mediaImages = messages.filter((m) => m.image).map((m) => m.image);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="hidden lg:flex w-[280px] min-w-[260px] h-full flex-col border-l border-white/10 p-5">
      <div className="flex flex-col items-center text-center pt-4 pb-6">
        <img
          src={selectedUser.profilePic || assets.avatar_icon}
          alt={selectedUser.fullname}
          className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-purple-500/30"
        />
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-white font-medium text-lg">{selectedUser.fullname}</h3>
          <span
            className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-400" : "bg-gray-500"}`}
          />
        </div>
        <p className="text-gray-400 text-xs leading-relaxed px-2">
          {selectedUser.bio || "No bio yet"}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h4 className="text-white text-sm font-medium mb-3">Media</h4>
        {mediaImages.length === 0 ? (
          <p className="text-gray-500 text-xs">No media shared yet</p>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {mediaImages.map((img, i) => (
              <img
                key={`${img.slice(0, 20)}-${i}`}
                src={img}
                alt={`Media ${i + 1}`}
                className="w-full h-20 object-cover rounded-lg cursor-pointer"
                onClick={() => window.open(img)}
              />
            ))}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-3 rounded-full transition-colors mt-4"
      >
        Logout
      </button>
    </div>
  );
};

export default RightSidebar;
