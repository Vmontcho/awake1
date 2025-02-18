'use client';

import Image from 'next/image';
import { FiHome, FiList, FiGift, FiUser, FiLogOut } from 'react-icons/fi';

interface SidebarProps {
  onLogout: () => void;
}

export default function Sidebar({ onLogout }: SidebarProps) {
  return (
    <nav className="bg-[#1FAD92] fixed bottom-0 left-0 right-0 lg:sticky lg:top-0 lg:left-0 lg:w-64 lg:h-screen border-t lg:border-t-0 lg:border-r border-gray-200 z-10">
      <div className="flex lg:flex-col items-center justify-around lg:justify-start p-4 lg:p-6 h-16 lg:h-full gap-4">
        <div className="hidden lg:block mb-8 w-full text-center">
          <Image
            src="/awakening-logo.png"
            alt="Awakening Logo"
            width={100}
            height={100}
            className="mx-auto mb-4"
          />
          <h1 className="text-xl font-bold text-white mb-1">Awakening Lifeplanner</h1>
          <p className="text-sm text-white/80">User dashboard</p>
        </div>
        <a href="/user-dashboard" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
          <FiHome className="w-6 h-6" />
          <span className="inline text-sm lg:text-base">Home</span>
        </a>
        <a href="/user-dashboard/tasks" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
          <FiList className="w-6 h-6" />
          <span className="inline text-sm lg:text-base">Tasks</span>
        </a>
        <a href="/user-dashboard/gifts" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
          <FiGift className="w-6 h-6" />
          <span className="inline text-sm lg:text-base">Gifts</span>
        </a>
        <a href="/user-dashboard/profile" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
          <FiUser className="w-6 h-6" />
          <span className="inline text-sm lg:text-base">Profile</span>
        </a>
        <button
          onClick={onLogout}
          className="flex items-center space-x-2 text-white hover:text-red-300 transition-colors w-full lg:mt-auto"
        >
          <FiLogOut className="w-6 h-6" />
          <span className="inline text-sm lg:text-base">Logout</span>
        </button>
      </div>
    </nav>
  );
}