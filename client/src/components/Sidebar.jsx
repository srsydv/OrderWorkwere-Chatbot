import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import assets from "../assets/assets.js";
import { api } from "../lib/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { useChat } from "../context/ChatContext.jsx";

const Sidebar = () => {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [dbResults, setDbResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState("");

  const navigate = useNavigate();
  const { onlineUsers, logout, authUser } = useAuth();
  const {
    users,
    usersLoading,
    unseenMessages,
    selectedUser,
    setSelectedUser,
  } = useChat();

  const q = search.trim();
  const isSearching = q.length > 0;

  const conversationIds = useMemo(
    () => new Set(users.map((u) => String(u._id))),
    [users]
  );

  const searchFromDb = async (value) => {
    setSearch(value);
    const trimmed = value.trim();

    if (!trimmed) {
      setDbResults([]);
      setSearchLoading(false);
      setSearchError("");
      return;
    }

    setSearchLoading(true);
    setSearchError("");

    try {
      const data = await api(
        `/api/users/search?query=${encodeURIComponent(trimmed)}`
      );
      const list = Array.isArray(data?.users) ? data.users : [];
      setDbResults(list);
      if (list.length === 0) {
        // keep empty — UI shows "No users found"
      }
    } catch (error) {
      console.error("Search error:", error);
      setDbResults([]);
      setSearchError(error.message || "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const conversationMatches = useMemo(() => {
    if (!isSearching) return users;
    return dbResults.filter((user) => conversationIds.has(String(user._id)));
  }, [isSearching, users, dbResults, conversationIds]);

  const newChatMatches = useMemo(() => {
    if (!isSearching) return [];
    return dbResults.filter((user) => !conversationIds.has(String(user._id)));
  }, [isSearching, dbResults, conversationIds]);

  const unreadOf = (userId) =>
    unseenMessages[userId] || unseenMessages[String(userId)] || 0;

  const handleSelect = (user) => {
    setSelectedUser(user);
    setSearch("");
    setDbResults([]);
    setSearchError("");
  };

  const renderUserRow = (user, { showEmail = false } = {}) => {
    const isSelected = String(selectedUser?._id) === String(user._id);
    const isOnline = onlineUsers.includes(String(user._id));
    const unread = unreadOf(user._id);

    return (
      <div
        key={user._id}
        onClick={() => handleSelect(user)}
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
          <p className="text-white text-sm font-medium truncate">{user.fullname}</p>
          <p className="text-xs text-gray-400 truncate">
            {showEmail ? user.email : isOnline ? "Online" : "Offline"}
          </p>
        </div>
        {!showEmail && unread > 0 && (
          <span className="bg-purple-600 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center">
            {unread}
          </span>
        )}
      </div>
    );
  };

  return (
    <div
      className={`w-full md:w-[320px] min-w-[280px] h-full flex flex-col border-r border-white/10 p-4 ${
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
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => searchFromDb(e.target.value)}
          className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-lg py-2.5 pl-10 pr-4 outline-none border border-white/5 focus:border-purple-500/40"
        />
      </div>

      <div className="flex-1 overflow-y-auto space-y-1">
        {usersLoading && !isSearching && (
          <p className="text-gray-400 text-sm text-center py-4">Loading chats...</p>
        )}

        {!usersLoading && !isSearching && users.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4 px-2">
            No conversations yet. Search a name or email to start chatting.
          </p>
        )}

        {isSearching && searchLoading && (
          <p className="text-gray-400 text-sm text-center py-2">Searching...</p>
        )}

        {isSearching && searchError && (
          <p className="text-red-400 text-sm text-center py-2 px-2">{searchError}</p>
        )}

        {!isSearching &&
          users.map((user) => renderUserRow(user, { showEmail: false }))}

        {isSearching && !searchLoading && dbResults.length > 0 && (
          <>
            {conversationMatches.length > 0 && (
              <>
                <p className="text-gray-500 text-xs uppercase tracking-wide px-2 pb-1">
                  Your chats
                </p>
                {conversationMatches.map((user) =>
                  renderUserRow(user, { showEmail: true })
                )}
              </>
            )}

            {newChatMatches.length > 0 && (
              <>
                <p className="text-gray-500 text-xs uppercase tracking-wide px-2 pt-3 pb-1">
                  Start new chat
                </p>
                {newChatMatches.map((user) =>
                  renderUserRow(user, { showEmail: true })
                )}
              </>
            )}
          </>
        )}

        {isSearching &&
          !searchLoading &&
          !searchError &&
          dbResults.length === 0 && (
            <p className="text-gray-400 text-sm text-center py-4">No users found</p>
          )}
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
