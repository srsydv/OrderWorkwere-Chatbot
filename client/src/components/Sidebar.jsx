import React, { useState } from 'react'
import assets, { userDummyData } from '../assets/assets.js'

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [search, setSearch] = useState('')

  const filteredUsers = userDummyData.filter((user) =>
    user.fullName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full md:w-[320px] min-w-[280px] h-full flex flex-col border-r border-white/10 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <img src={assets.logo_icon} alt="QuickChat" className="w-8 h-8" />
          <span className="text-white text-xl font-medium">QuickChat</span>
        </div>
        <img src={assets.menu_icon} alt="Menu" className="w-5 h-5 cursor-pointer opacity-70 hover:opacity-100" />
      </div>

      {/* Search */}
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

      {/* Contact list */}
      <div className="flex-1 overflow-y-auto space-y-1">
        {filteredUsers.map((user) => {
          const isSelected = selectedUser?._id === user._id
          return (
            <div
              key={user._id}
              onClick={() => setSelectedUser(user)}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                isSelected
                  ? 'bg-purple-600/30 border border-purple-500/30'
                  : 'hover:bg-white/5'
              }`}
            >
              <img
                src={user.profilePic}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-medium truncate">{user.fullName}</p>
                <p className={`text-xs ${user.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
                  {user.isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
              {user.unreadCount > 0 && (
                <span className="bg-purple-600 text-white text-xs font-medium w-6 h-6 rounded-full flex items-center justify-center">
                  {user.unreadCount}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar
