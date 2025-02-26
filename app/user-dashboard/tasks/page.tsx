'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, writeBatch, getDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { FiTrash2, FiEdit2 } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  status: string;
  deadline: string;
  userId: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  availability: 'all' | 'free' | 'premium';
  createdAt: string;
}

export default function TasksPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editedTask, setEditedTask] = useState<Task | null>(null);

  const handleEditClick = (task: Task) => {
    setEditedTask(task);
    setIsModalOpen(true);
  };

  const handleCancelEdit = () => {
    setIsModalOpen(false);
    setEditedTask(null);
  };

  const handleSaveEdit = async () => {
    if (!editedTask || !auth.currentUser) return;

    try {
      // First check if the task document exists
      const taskRef = doc(db, 'users', auth.currentUser.uid, 'tasks', editedTask.id);
      const taskDoc = await getDoc(taskRef);

      if (!taskDoc.exists()) {
        throw new Error('Task not found');
      }

      // Update the task document directly
      await updateDoc(taskRef, {
        ...editedTask,
        updatedAt: new Date().toISOString()
      });

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === editedTask.id ? editedTask : task
        )
      );

      setIsModalOpen(false);
      setEditedTask(null);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg';
      successMessage.textContent = 'Tâche mise à jour avec succès';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (error) {
      console.error('Error updating task:', error);
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue lors de la mise à jour de la tâche.';
      alert(errorMessage);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) {
          router.push('/login');
          return;
        }

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Category[];
        setCategories(categoriesData);

        // Fetch user's tasks
        const userTasksRef = collection(db, 'users', auth.currentUser.uid, 'tasks');
        const tasksSnapshot = await getDocs(userTasksRef);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await writeBatch(db)
          .delete(doc(db, 'users', auth.currentUser?.uid || '', 'tasks', taskId))
          .commit();

        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Une erreur est survenue lors de la suppression de la tâche.');
      }
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filterStatus !== 'all' && task.status !== filterStatus) return false;
    if (filterCategory !== 'all' && task.categoryId !== filterCategory) return false;
    return true;
  });

  // Calculate pagination
  const indexOfLastTask = currentPage * itemsPerPage;
  const indexOfFirstTask = indexOfLastTask - itemsPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Mes tâches</h1>
        <p className="text-gray-600">Gérez et suivez vos tâches</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="mb-6 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              disabled={loading}
            >
              <option value="all">Tous les états</option>
              <option value="pending">En cours</option>
              <option value="completed">Terminée</option>
            </select>

            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
              disabled={loading}
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">État</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date limite</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FAD92]"></div>
                      <span className="ml-2 text-gray-500">Chargement...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucune tâche trouvée
                  </td>
                </tr>
              ) : (
                currentTasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {task.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {task.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getCategoryName(task.categoryId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          task.status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {task.status === 'completed' ? 'Terminée' : 'En cours'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(task.deadline).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditClick(task)}
                        className="text-[#1FAD92] hover:text-[#178a74] mr-3"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          {filteredTasks.length > 0 && (
            <div className="flex justify-center items-center space-x-2 mt-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Précédent
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded-md ${
                    currentPage === page
                      ? 'bg-[#1FAD92] text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 rounded-md bg-gray-100 text-gray-700 disabled:opacity-50"
              >
                Suivant
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier la tâche</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={editedTask?.title || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editedTask?.description || ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={editedTask?.categoryId || ''}
                    onChange={(e) => setEditedTask(prev => prev ? { ...prev, categoryId: e.target.value } : null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">État</label>
                  <select
                    value={editedTask?.status || ''}
                    onChange={(e) => setEditedTask(prev => prev ? { ...prev, status: e.target.value } : null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  >
                    <option value="pending">En cours</option>
                    <option value="completed">Terminée</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
                <input
                  type="datetime-local"
                  value={editedTask?.deadline ? new Date(editedTask.deadline).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setEditedTask(prev => prev ? { ...prev, deadline: new Date(e.target.value).toISOString() } : null)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1FAD92]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1FAD92] border border-transparent rounded-md shadow-sm hover:bg-[#178a74] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1FAD92]"
                >
                  Enregistrer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}