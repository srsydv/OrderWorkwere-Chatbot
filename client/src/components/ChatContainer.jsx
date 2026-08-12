import React, { useState } from 'react'
import assets, {
  messagesDummyData,
  CURRENT_USER_ID,
  userDummyData,
} from '../assets/assets.js'

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

const getUserById = (id) => userDummyData.find((u) => u._id === id)

const ChatContainer = ({ selectedUser }) => {
  const [message, setMessage] = useState('')

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-4">
        <img src={assets.logo_big} alt="QuickChat" className="w-24 h-24 opacity-90" />
        <p className="text-white text-lg font-light tracking-wide">Chat anytime, anywhere</p>
      </div>
    )
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!message.trim()) return
    setMessage('')
  }

  return (
    <div className="flex-1 flex flex-col h-full min-w-0">
      {/* Chat header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <img
            src={selectedUser.profilePic}
            alt={selectedUser.fullName}
            className="w-10 h-10 rounded-full object-cover"
          />
          <div>
            <p className="text-white font-medium">{selectedUser.fullName}</p>
            <p className={`text-xs ${selectedUser.isOnline ? 'text-green-400' : 'text-gray-400'}`}>
              {selectedUser.isOnline ? 'Online' : 'Offline'}
            </p>
          </div>
        </div>
        <img
          src={assets.help_icon}
          alt="Info"
          className="w-8 h-8 cursor-pointer opacity-70 hover:opacity-100"
        />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messagesDummyData.map((msg) => {
          const isSent = msg.senderId === CURRENT_USER_ID
          const sender = getUserById(msg.senderId) || selectedUser

          return (
            <div
              key={msg._id}
              className={`flex items-end gap-2 ${isSent ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <img
                src={sender.profilePic}
                alt={sender.fullName}
                className="w-8 h-8 rounded-full object-cover shrink-0"
              />
              <div className={`max-w-[70%] ${isSent ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                {msg.text && (
                  <div
                    className={`px-4 py-2.5 rounded-2xl text-sm text-gray-200 leading-relaxed ${
                      isSent
                        ? 'bg-[#3D4F7C]/80 rounded-br-sm'
                        : 'bg-[#28334D]/90 rounded-bl-sm'
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
          )
        })}
      </div>

      {/* Message input */}
      <form onSubmit={handleSubmit} className="px-6 py-4 border-t border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Send a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full bg-[#28334D]/80 text-white text-sm placeholder:text-gray-400 rounded-full py-3 pl-5 pr-12 outline-none border border-white/5 focus:border-purple-500/40"
            />
            <img
              src={assets.gallery_icon}
              alt="Attach"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 cursor-pointer opacity-50 hover:opacity-80"
            />
          </div>
          <button type="submit" className="shrink-0">
            <img src={assets.send_button} alt="Send" className="w-10 h-10 cursor-pointer hover:opacity-80" />
          </button>
        </div>
      </form>
    </div>
  )
}

export default ChatContainer
