'use client';

import React, { useState, useRef, useEffect } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '@/app/firebase';
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

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, categories, onEdit, onDelete }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [taskInput, setTaskInput] = useState('');
  const [generatedTasks, setGeneratedTasks] = useState<Task[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  const handleSaveEdit = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user || !editingTask) return;

      const taskRef = doc(db, 'users', user.uid, 'tasks', editingTask.id);
      await updateDoc(taskRef, {
        ...editingTask,
        updatedAt: new Date().toISOString()
      });

      setIsModalOpen(false);
      setEditingTask(null);
      onEdit('refresh');
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Failed to update task: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  };

  const router = useRouter();
  useEffect(() => {
    // Check and maintain authentication state
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        // Add a more robust check for auth persistence
        const checkAuth = async () => {
          try {
            // Wait for auth state to initialize
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Get current user state
            const currentUser = auth.currentUser;
            
            // Check if user is not authenticated
            if (!currentUser) {
              console.log('User not authenticated, redirecting to login...');
              router.push('/login');
              return;
            }

            // Verify user's token
            try {
              await currentUser.getIdToken(true);
            } catch (tokenError: any) {
              if (tokenError?.code?.includes('auth/')) {
                console.error('Token verification failed:', tokenError.code);
                router.push('/login');
              }
            }
          } catch (error: any) {
            console.error('Auth check error:', error);
            if (error?.code?.includes('auth/')) {
              router.push('/login');
            }
          }
        };
        checkAuth();
      }
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setIsModalOpen(false);
        setTaskInput('');
        setGeneratedTasks([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      unsubscribe(); // Cleanup auth listener
    };
  }, [router]);




  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Mes tâches</h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-[#1FAD92] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Créer une tâche</span>
        </button>
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
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucune tâche trouvée
                </td>
              </tr>
            ) : (
              tasks.map((task) => (
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
                      onClick={() => {
                        setEditingTask(task);
                        setIsModalOpen(true);
                      }}
                      className="text-[#1FAD92] hover:text-[#178a74] mr-3"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
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
      </div>

      {/* Task Creation/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {editingTask ? 'Modifier la tâche' : 'Créer une tâche'}
            </h2>
            
            {editingTask ? (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                  <input
                    type="text"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                    <select
                      value={editingTask.categoryId}
                      onChange={(e) => setEditingTask({ ...editingTask, categoryId: e.target.value })}
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
                      value={editingTask.status}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value })}
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
                    type="date"
                    value={editingTask.deadline.split('T')[0]}
                    onChange={(e) => setEditingTask({ ...editingTask, deadline: new Date(e.target.value).toISOString() })}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setEditingTask(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Enregistrer les modifications
                  </button>
                </div>
              ) : (
                <div className="max-h-[60vh] overflow-y-auto pr-2">
                  {generatedTasks.map((task, index) => (
                    <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50 relative">
                      <div className="absolute top-4 right-4">
                        <button
                          onClick={() => {
                            const updatedTasks = generatedTasks.filter((_, i) => i !== index);
                            setGeneratedTasks(updatedTasks);
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                          <input
                            type="text"
                            value={task.title}
                            onChange={(e) => {
                              const updatedTasks = [...generatedTasks];
                              updatedTasks[index] = { ...task, title: e.target.value };
                              setGeneratedTasks(updatedTasks);
                            }}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={task.description}
                            onChange={(e) => {
                              const updatedTasks = [...generatedTasks];
                              updatedTasks[index] = { ...task, description: e.target.value };
                              setGeneratedTasks(updatedTasks);
                            }}
                            rows={3}
                            className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                            <select
                              value={task.categoryId}
                              onChange={(e) => {
                                const updatedTasks = [...generatedTasks];
                                updatedTasks[index] = { ...task, categoryId: e.target.value };
                                setGeneratedTasks(updatedTasks);
                              }}
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
                            <input
                              type="date"
                              value={task.deadline.split('T')[0]}
                              onChange={(e) => {
                                const updatedTasks = [...generatedTasks];
                                updatedTasks[index] = { ...task, deadline: new Date(e.target.value).toISOString() };
                                setGeneratedTasks(updatedTasks);
                              }}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ):
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Décrivez votre objectif</label>
                  <textarea
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    rows={4}
                    placeholder="Ex: Je veux améliorer ma vie spirituelle en pratiquant la méditation quotidienne"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  />
                </div>
                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setTaskInput('');
                      setGeneratedTasks([]);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-500"
                  >
                    Annuler
                  </button>
                  {generatedTasks.length > 0 ? (
                    <button
                      onClick={handleConfirmTasks}
                      className="bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors"
                    >
                      Confirmer les tâches
                    </button>
                  ) : (
                    <button
                      onClick={handleGenerateTask}
                      disabled={isGenerating || !taskInput.trim()}
                      className="bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
                    >
                      {isGenerating ? 'Génération...' : 'Générer des tâches'}
                    </button>
                  )}
                </div>
                {generatedTasks.length > 0 && (
                  <div className="max-h-[60vh] overflow-y-auto pr-2">
                    {generatedTasks.map((task, index) => (
                      <div key={index} className="border rounded-lg p-4 mb-4 bg-gray-50 relative">
                        <div className="absolute top-4 right-4">
                          <button
                            onClick={() => {
                              const updatedTasks = generatedTasks.filter((_, i) => i !== index);
                              setGeneratedTasks(updatedTasks);
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                            <input
                              type="text"
                              value={task.title}
                              onChange={(e) => {
                                const updatedTasks = [...generatedTasks];
                                updatedTasks[index] = { ...task, title: e.target.value };
                                setGeneratedTasks(updatedTasks);
                              }}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                              value={task.description}
                              onChange={(e) => {
                                const updatedTasks = [...generatedTasks];
                                updatedTasks[index] = { ...task, description: e.target.value };
                                setGeneratedTasks(updatedTasks);
                              }}
                              rows={3}
                              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                              <select
                                value={task.categoryId}
                                onChange={(e) => {
                                  const updatedTasks = [...generatedTasks];
                                  updatedTasks[index] = { ...task, categoryId: e.target.value };
                                  setGeneratedTasks(updatedTasks);
                                }}
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
                              <label className="block text-sm font-medium text-gray-700 mb-1">Date limite</label>
                              <input
                                type="date"
                                value={task.deadline.split('T')[0]}
                                onChange={(e) => {
                                  const updatedTasks = [...generatedTasks];
                                  updatedTasks[index] = { ...task, deadline: new Date(e.target.value).toISOString() };
                                  setGeneratedTasks(updatedTasks);
                                }}
                                className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskList;