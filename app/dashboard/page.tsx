'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, db } from '../firebase';
import { signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'next/navigation';
// First install the package:
// npm install react-icons
// or
// yarn add react-icons

import { FiHome, FiUsers, FiSettings, FiLogOut, FiPlus, FiDownload, FiList } from 'react-icons/fi';
import * as XLSX from 'xlsx';

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

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  availability: 'all' | 'free' | 'premium';
  createdAt: string;
  taskCount?: number;
}

import { getCurrentUser } from '../utils/auth';

export default function DashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [categories, setCategories] = useState([
    { name: 'Vie spirituelle', icon: '🕊️', count: 150 },
    { name: 'Vie affective', icon: '❤️', count: 120 },
    { name: 'Vie professionnelle', icon: '💼', count: 200 },
    { name: 'Vie familiale', icon: '👨‍👩‍👧‍👦', count: 180 },
    { name: 'Vie sociale', icon: '🤝', count: 90 },
    { name: 'Santé', icon: '🏃‍♂️', count: 160 },
    { name: 'Finances', icon: '💰', count: 110 },
    { name: 'Personnel', icon: '🎯', count: 140 },
    { name: 'Intellect', icon: '🎓', count: 130 },
  ]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [filterType, setFilterType] = useState('all');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    phoneNumber: '',
    role: 'user',
    status: 'activated'
  });
  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Calculate pagination
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as User[];
        setUsers(usersData);
        setFilteredUsers(usersData);

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesData.map(category => ({
          name: category.name,
          icon: category.icon || '📋',
          count: category.taskCount || 0
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const userData = await getCurrentUser();
        setCurrentUser(userData);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
    };

    fetchCurrentUser();
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
  }, [filterRole, filterStatus, users]);

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
      {/* Sidebar - Bottom for mobile/tablet, Left for desktop */}
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
          <a href="/dashboard" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiHome className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Home</span>
          </a>
          <a href="/dashboard/users" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiUsers className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Users</span>
          </a>
          <a href="/dashboard/categories" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiList className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Categories</span>
          </a>
          <a href="/dashboard/settings" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiSettings className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Settings</span>
          </a>
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
        {/* Welcome Section */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {currentUser?.name || 'Admin'}</h1>
            <p className="text-gray-600">Voici un aperçu de votre tableau de bord</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1FAD92] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Ajouter un utilisateur</span>
          </button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">Utilisateurs</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">{users.length}</span>
              <span className="ml-2 text-sm text-green-500">+10%</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">Comptes activés</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">{users.filter(user => user.status === 'activated').length}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">Tâches créées</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">20000</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">Tâches effectuées</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">5308</span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category, index) => (
              <div key={index} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{category.icon}</span>
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500">{category.count || 0} tâches</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Users List */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">Liste des utilisateurs</h2>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => {
                  // Prepare data for export
                  const exportData = filteredUsers.map(user => ({
                    'Nom': user.name,
                    'Prénom': user.surname,
                    'Email': user.email,
                    'Téléphone': user.phoneNumber,
                    'Role': user.role === 'admin' ? 'Admin' : 'Utilisateur',
                    'État': user.status === 'activated' ? 'Activé' : 'Désactivé',
                    'Date de création': new Date(user.createdAt).toLocaleDateString('fr-FR')
                  }));

                  // Create workbook and worksheet
                  const wb = XLSX.utils.book_new();
                  const ws = XLSX.utils.json_to_sheet(exportData);
                  XLSX.utils.book_append_sheet(wb, ws, 'Users');

                  // Generate and download file
                  XLSX.writeFile(wb, 'users_export.xlsx');
                }}
                className="flex items-center space-x-2 bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
              >
                <FiDownload className="w-4 h-4" />
                <span>Exporter</span>
              </button>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              >
                <option value="all">Par Role</option>
                <option value="admin">Admin</option>
                <option value="user">Utilisateur</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              >
                <option value="all">Par état</option>
                <option value="activated">Activé</option>
                <option value="deactivated">Désactivé</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom, Prénom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name} {user.surname}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role === 'admin' ? 'Admin' : 'Utilisateur'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.status === 'activated'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.status === 'activated' ? 'Activé' : 'Désactivé'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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

            {/* Pagination Controls */}
            <div className="flex justify-center items-center space-x-2 mt-4 pb-4">
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
          </div>
        </div>
      </div>
      {/* User Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un utilisateur</h2>
            
            <form className="space-y-6" onSubmit={async (e) => {
              e.preventDefault();
              setIsCreating(true);
              setCreateError('');
              
              try {
                // Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, newUser.email, newUser.password);
                const user = userCredential.user;

                // Upload profile picture if provided
                let profilePictureUrl = '';
                if (profilePicture) {
                  const storage = getStorage();
                  const storageRef = ref(storage, `profile-pictures/${user.uid}`);
                  await uploadBytes(storageRef, profilePicture);
                  profilePictureUrl = await getDownloadURL(storageRef);
                }

                // Store user data in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                  name: newUser.name,
                  surname: newUser.surname,
                  email: newUser.email,
                  phoneNumber: newUser.phoneNumber,
                  role: newUser.role,
                  status: newUser.status,
                  profilePicture: profilePictureUrl || "",
                  createdAt: new Date().toISOString()
                });

                // Update users list
                const querySnapshot = await getDocs(collection(db, 'users'));
                const usersData = querySnapshot.docs.map(doc => ({
                  id: doc.id,
                  ...doc.data(),
                })) as User[];
                setUsers(usersData);
                setFilteredUsers(usersData);

                // Reset form and close modal
                setNewUser({
                  name: '',
                  surname: '',
                  email: '',
                  password: '',
                  phoneNumber: '',
                  role: 'user',
                  status: 'activated'
                });
                setProfilePicture(null);
                setIsModalOpen(false);
              } catch (error) {
                setCreateError(error instanceof Error ? error.message : 'An error occurred');
              } finally {
                setIsCreating(false);
              }
            }}>
              <div className="space-y-4">
                {/* Profile Picture Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photo de profil</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProfilePicture(e.target.files?.[0] || null)}
                    className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1FAD92] file:text-white hover:file:bg-opacity-90"
                  />
                </div>

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom</label>
                  <input
                    type="text"
                    value={newUser.name}
                    onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    required
                  />
                </div>

                {/* Surname */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Prénom</label>
                  <input
                    type="text"
                    value={newUser.surname}
                    onChange={(e) => setNewUser({...newUser, surname: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    required
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    required
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    required
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact</label>
                  <input
                    type="tel"
                    value={newUser.phoneNumber}
                    onChange={(e) => setNewUser({...newUser, phoneNumber: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    required
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  >
                    <option value="user">Utilisateur</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Super Admin</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">État</label>
                  <select
                    value={newUser.status}
                    onChange={(e) => setNewUser({...newUser, status: e.target.value})}
                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  >
                    <option value="activated">Activé</option>
                    <option value="deactivated">Désactivé</option>
                  </select>
                </div>
              </div>

              {createError && (
                <div className="text-red-600 text-sm mt-2">{createError}</div>
              )}

              <div className="flex justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                >
                  {isCreating ? 'Création...' : 'Créer l\'utilisateur'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}