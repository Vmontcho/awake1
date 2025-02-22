'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/firebase';
import { FiPlus } from 'react-icons/fi';
import { signOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { FiHome, FiUsers, FiSettings, FiLogOut, FiList } from 'react-icons/fi';
import Image from 'next/image';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  availability: 'all' | 'free' | 'premium';
  createdAt: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    icon: '',
    description: '',
    availability: 'all'
  });
  const [createError, setCreateError] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Category[];
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    setCreateError('');

    try {
      const categoryRef = doc(collection(db, 'categories'));
      await setDoc(categoryRef, {
        ...newCategory,
        createdAt: new Date().toISOString()
      });

      // Refresh categories list
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(categoriesData);

      // Reset form and close modal
      setNewCategory({
        name: '',
        icon: '',
        description: '',
        availability: 'all'
      });
      setIsModalOpen(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    
    setIsCreating(true);
    setCreateError('');

    try {
      await setDoc(doc(db, 'categories', editingCategory.id), {
        name: newCategory.name,
        icon: newCategory.icon,
        description: newCategory.description,
        availability: newCategory.availability,
        createdAt: editingCategory.createdAt
      });

      // Refresh categories list
      const querySnapshot = await getDocs(collection(db, 'categories'));
      const categoriesData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Category[];
      setCategories(categoriesData);

      // Reset form and close modal
      setNewCategory({
        name: '',
        icon: '',
        description: '',
        availability: 'all'
      });
      setEditingCategory(null);
      setIsModalOpen(false);
    } catch (error) {
      setCreateError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsCreating(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      icon: category.icon,
      description: category.description,
      availability: category.availability
    });
    setIsModalOpen(true);
  };

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
          <Link href="/dashboard" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiHome className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Home</span>
          </Link>
          <Link href="/dashboard/users" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiUsers className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Users</span>
          </Link>
          <Link href="/dashboard/categories" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiList className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Categories</span>
          </Link>
          <Link href="/dashboard/settings" className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors w-full lg:mb-4">
            <FiSettings className="w-6 h-6" />
            <span className="inline text-sm lg:text-base">Settings</span>
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
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Catégories</h1>
            <p className="text-gray-600">Gérez les catégories de l'application</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#1FAD92] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Créer une catégorie</span>
          </button>
        </div>

        {/* Categories Table */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icône</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de création</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Chargement...
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      Aucune catégorie trouvée
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {category.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="text-2xl">{category.icon}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {category.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {category.availability === 'all' ? 'Tous les utilisateurs' :
                         category.availability === 'free' ? 'Compte gratuit' : 'Compte premium'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(category.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => startEditing(category)}
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
          </div>
        </div>

        {/* Create Category Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCategory ? 'Modifier la catégorie' : 'Créer une catégorie'}
              </h2>
              
              <form className="space-y-6" onSubmit={editingCategory ? handleEditCategory : handleCreateCategory}>
                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                      required
                    />
                  </div>

                  {/* Icon */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Icône (emoji)</label>
                    <input
                      type="text"
                      value={newCategory.icon}
                      onChange={(e) => setNewCategory({...newCategory, icon: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                      value={newCategory.description}
                      onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                      rows={3}
                      required
                    />
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Disponibilité</label>
                    <select
                      value={newCategory.availability}
                      onChange={(e) => setNewCategory({...newCategory, availability: e.target.value as 'all' | 'free' | 'premium'})}
                      className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                    >
                      <option value="all">Tous les utilisateurs</option>
                      <option value="free">Compte gratuit</option>
                      <option value="premium">Compte premium</option>
                    </select>
                  </div>
                </div>

                {createError && (
                  <div className="text-red-600 text-sm">{createError}</div>
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
                    {isCreating ? 'Enregistrement...' : editingCategory ? 'Modifier la catégorie' : 'Créer la catégorie'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}