import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(null)

  return (
    <div className="w-full h-screen px-[5%] py-[3%] sm:px-[8%] sm:py-[4%]">
      <div className="h-full flex bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        <Sidebar selectedUser={selectedUser} setSelectedUser={setSelectedUser} />
        <ChatContainer selectedUser={selectedUser} />
        <RightSidebar selectedUser={selectedUser} />
      </div>
    </div>
  )
}

export default HomePage
