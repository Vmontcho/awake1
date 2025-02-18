'use client';

import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'completed';
  categoryId: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
}

interface TaskListProps {
  tasks: Task[];
  categories: Category[];
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCreateTask: () => void;
}

const getStatusLabel = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return 'En cours';
    case 'completed':
      return 'Terminé';
    default:
      return status;
  }
};

const getStatusColor = (status: Task['status']) => {
  switch (status) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'completed':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function TaskList({ tasks, categories, onEdit, onDelete, onCreateTask }: TaskListProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mes tâches</h2>
        <button
          onClick={onCreateTask}
          className="bg-[#1FAD92] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Créer une tâche</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {tasks.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  Aucune tâche trouvée
                </td>
              </tr>
            ) : (
              tasks.map((task) => {
                const category = categories.find(c => c.id === task.categoryId);
                return (
                  <tr key={task.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <span className="text-xl mr-2">{category?.icon}</span>
                        <span>{category?.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{task.description}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => onEdit(task.id)}
                          className="text-[#1FAD92] hover:text-opacity-80 transition-colors"
                        >
                          <FiEdit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => onDelete(task.id)}
                          className="text-red-500 hover:text-opacity-80 transition-colors"
                        >
                          <FiTrash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}