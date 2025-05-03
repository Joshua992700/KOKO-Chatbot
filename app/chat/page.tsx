'use client'
import React, { useState } from 'react'
import ChatInterface from '@/components/home/ChatInterface'
import Sidebar from '@/components/home/Sidebar'
import Header from '@/components/home/Header'
import { Menu } from 'lucide-react'

export default function Page() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  return (
    <div className="flex flex-col h-screen bg-white dark:bg-gray-800">
      {/* Header Section */}
      <div className="sticky top-0 z-50 border-b border-gray-200 dark:border-gray-700">
        <Header onMenuClick={toggleSidebar} />
        {/* Remove the duplicate menu button since it's now handled in Header */}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - responsive */}
        <div
          className={`${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } fixed md:static inset-y-0 left-0 z-40 w-64 lg:w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 transition-transform duration-300`}
        >
          <Sidebar />
        </div>

        {/* Overlay for mobile */}
        {isSidebarOpen && (
          <div
            className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
            onClick={toggleSidebar}
          />
        )}

        {/* Chat Interface */}
        <div 
          className={`flex-1 flex overflow-hidden transition-all duration-300 ${
            isSidebarOpen ? 'md:ml-64 lg:ml-80' : 'ml-0'
          }`}
        >
          <ChatInterface />
        </div>
      </div>
    </div>
  )
}