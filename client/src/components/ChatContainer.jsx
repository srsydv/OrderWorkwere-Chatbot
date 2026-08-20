import React, { useEffect, useRef, useState } from "react";
import assets from "../assets/assets.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";

const formatTime = (dateStr) => {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

const ChatContainer = () => {
  const [message, setMessage] = useState("");
  const [pendingImages, setPendingImages] = useState([]);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);
  const imageRef = useRef(null);

  const { authUser, onlineUsers } = useAuth();
  const { selectedUser, setSelectedUser, messages, sendMessage } = useChat();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Clear draft when switching chats
  useEffect(() => {
    setMessage("");
    setPendingImages([]);
  }, [selectedUser?._id]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <img src={assets.logo_big} alt="QuickChat" className="w-24 h-24 opacity-90" />
        <p className="text-white text-lg font-light tracking-wide">
          Chat anytime, anywhere
        </p>
      </div>
    );
  }

  const isOnline = onlineUsers.includes(String(selectedUser._id));

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingImages((prev) => [
          ...prev,
          {
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            dataUrl: reader.result,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = "";
  };

  const removePendingImage = (id) => {
    setPendingImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (sending) return;

    const text = message.trim();
    if (!text && pendingImages.length === 0) return;

    setSending(true);
    try {
      if (pendingImages.length === 0) {
        await sendMessage({ text });
      } else {
        // Caption goes with the first image (WhatsApp-style)
        await sendMessage({
          text: text || undefined,
          image: pendingImages[0].dataUrl,
        });
        for (let i = 1; i < pendingImages.length; i++) {
          await sendMessage({ image: pendingImages[i].dataUrl });
        }
      }
      setMessage("");
      setPendingImages([]);
    } catch (err) {
      console.error(err.message);
      alert(err.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSelectedUser(null)}
            className="md:hidden opacity-70 hover:opacity-100"
          >
            <img src={assets.arrow_icon} alt="Back" className="w-5 h-5 rotate-180" />
          </button>
          <img
            src={selectedUser.profilePic || assets.avatar_icon}
            alt={selectedUser.fullname}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-white font-medium">{selectedUser.fullname}</p>
            <p className={`text-xs ${isOnline ? "text-green-400" : "text-gray-400"}`}>
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>
        <img
          src={assets.help_icon}
          alt="Info"
          className="w-8 h-8 cursor-pointer opacity-70 hover:opacity-100"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4">
        {messages.map((msg) => {
          const isSent =
            String(msg.sender?._id || msg.sender) === String(authUser?._id);
          const avatar = isSent
            ? authUser?.profilePic || assets.avatar_icon
            : selectedUser.profilePic || assets.avatar_icon;

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isSent ? "flex-row-reverse" : "flex-row"}`}
            >
              <img
                src={avatar}
                alt=""
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div
                className={`max-w-[70%] ${isSent ? "items-end" : "items-start"} flex flex-col gap-1`}
              >
                {msg.text && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm text-gray-200 leading-relaxed ${
                      isSent
                        ? "bg-[#3D4F7C]/80 rounded-br-sm"
                        : "bg-[#28334D]/90 rounded-bl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                )}
                {msg.image && (
                  <img
                    src={msg.image}
                    alt="Shared"
                    className="max-w-[220px] rounded-xl object-cover"
                  />
                )}
                <span className="text-[10px] text-gray-500 px-1">
                  {formatTime(msg.createdAt)}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="px-4 sm:px-6 py-4 border-t border-white/10">
        {pendingImages.length > 0 && (
          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            {pendingImages.map((img) => (
              <div key={img.id} className="relative shrink-0">
                <img
                  src={img.dataUrl}
                  alt="Preview"
                  className="h-20 w-20 rounded-lg object-cover border border-white/10"
                />
                <button
                  type="button"
                  onClick={() => removePendingImage(img.id)}
                  disabled={sending}
                  className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[11px] font-bold text-white"
                  aria-label="Remove image"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              disabled={sending}
              className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/20 text-2xl text-gray-400 hover:border-white/40 hover:text-gray-200"
              aria-label="Add more images"
            >
              +
            </button>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={
                pendingImages.length > 0 ? "Add a caption..." : "Send a message"
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={sending}
              className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-full py-3 pl-5 pr-12 outline-none border border-white/5 focus:border-violet-500/40"
            />
            <button
              type="button"
              onClick={() => imageRef.current?.click()}
              disabled={sending}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <img
                src={assets.gallery_icon}
                alt="Attach"
                className="w-5 h-5 cursor-pointer opacity-50 hover:opacity-80"
              />
            </button>
            <input
              ref={imageRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleImageSelect}
            />
          </div>
          <button
            type="submit"
            disabled={sending || (!message.trim() && pendingImages.length === 0)}
            className="shrink-0 disabled:opacity-40"
          >
            <img
              src={assets.send_button}
              alt="Send"
              className="w-10 h-10 cursor-pointer hover:opacity-80"
            />
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatContainer;
