'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import Sidebar from './components/Sidebar';

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <nav className="bg-[#1FAD92] fixed bottom-0 left-0 right-0 lg:sticky lg:top-0 lg:left-0 lg:w-64 lg:h-screen border-t lg:border-t-0 lg:border-r border-gray-200 z-50">
        <Sidebar onLogout={handleLogout} />
      </nav>
      <main className="flex-1 pb-16 lg:pb-0">
        {children}
      </main>
    </div>
  );
}