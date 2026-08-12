import React from 'react'
import { imagesDummyData } from '../assets/assets.js'

const RightSidebar = ({ selectedUser }) => {
  if (!selectedUser) return null

  return (
    <div className="hidden lg:flex w-[280px] min-w-[260px] h-full flex-col border-l border-white/10 p-5">
      {/* Profile */}
      <div className="flex flex-col items-center text-center pt-4 pb-6">
        <img
          src={selectedUser.profilePic}
          alt={selectedUser.fullName}
          className="w-24 h-24 rounded-full object-cover mb-4 ring-2 ring-purple-500/30"
        />
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-white font-medium text-lg">{selectedUser.fullName}</h3>
          <span
            className={`w-2 h-2 rounded-full ${selectedUser.isOnline ? 'bg-green-400' : 'bg-gray-500'}`}
          />
        </div>
        <p className="text-gray-400 text-xs leading-relaxed px-2">{selectedUser.bio}</p>
      </div>

      {/* Media */}
      <div className="flex-1">
        <h4 className="text-white text-sm font-medium mb-3">Media</h4>
        <div className="grid grid-cols-2 gap-2">
          {imagesDummyData.slice(0, 4).map((img, i) => (
            <img
              key={i}
              src={img}
              alt={`Media ${i + 1}`}
              className="w-full h-20 object-cover rounded-lg"
            />
          ))}
        </div>
      </div>

      {/* Logout */}
      <button className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium py-3 rounded-full transition-colors mt-4">
        Logout
      </button>
    </div>
  )
}

export default RightSidebar
