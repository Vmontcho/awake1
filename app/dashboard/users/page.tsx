'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { auth, db } from '@/app/firebase';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FiHome, FiUsers, FiSettings, FiLogOut, FiList } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; // Changed to 10 items per page

  const router = useRouter();

  // Calculate pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    let filtered = [...users];

    if (filterRole !== 'all') {
      filtered = filtered.filter(user => user.role === filterRole);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(user => user.status === filterStatus);
    }

    setFilteredUsers(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [filterRole, filterStatus, users]);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
      {/* Sidebar */}
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
            <p className="text-sm text-white/80">Admin dashboard</p>
          </div>
          <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiHome className="w-6 h-6" />
            <span className="hidden lg:inline text-sm lg:text-base">Home</span>
          </Link>
          <Link href="/dashboard/users" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiUsers className="w-6 h-6" />
            <span className="hidden lg:inline text-sm lg:text-base">Users</span>
          </Link>
          <Link href="/dashboard/categories" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiList className="w-6 h-6" />
            <span className="hidden lg:inline text-sm lg:text-base">Categories</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiSettings className="w-6 h-6" />
            <span className="hidden lg:inline text-sm lg:text-base">Settings</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 text-white hover:text-red-300 transition-colors w-full lg:mt-auto"
          >
            <FiLogOut className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Logout</span>
          </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 p-8 pb-24 lg:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
          <p className="text-gray-600">Manage all users of the application</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-wrap gap-4">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
            >
              <option value="all">All Status</option>
              <option value="activated">Activated</option>
              <option value="deactivated">Deactivated</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      Loading...
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name} {user.surname}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'activated' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                        >
                          {user.status === 'activated' ? 'Activated' : 'Deactivated'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => router.push(`/dashboard/users/${user.id}`)}
                          className="text-[#1FAD92] hover:text-[#178a74]"
                        >
                          Modifier
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {!loading && filteredUsers.length > 0 && (
              <div className="flex justify-center items-center space-x-2 mt-4">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Previous
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md ${currentPage === page ? 'bg-[#1FAD92] text-white' : 'bg-gray-100 text-gray-700'}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}