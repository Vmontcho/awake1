'use client';

import { useState } from 'react';
import { FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';

interface Task {
  id: string;
  name: string;
  category: string;
  deadline: string;
  objective: string;
  status: 'to_do' | 'in_progress' | 'done' | 'cancelled';
}

interface TaskListProps {
  tasks: Task[];
  onEdit: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onCreateTask?: () => void;
  categories: { id: string; name: string; icon: string; description: string; availability: 'all' | 'free' | 'premium'; createdAt: string; }[];
}

export default function TaskList({ tasks, onEdit, onDelete, onCreateTask, categories }: TaskListProps) {
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'to_do':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'done':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'to_do':
        return 'À faire';
      case 'in_progress':
        return 'En cours';
      case 'done':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return status;
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (dateFilter !== 'all') {
      const taskDate = new Date(task.deadline);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dateFilter) {
        case 'today':
          return taskDate.getTime() === today.getTime();
        case 'recent':
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          return taskDate >= weekAgo;
        case 'oldest':
          const monthAgo = new Date(today);
          monthAgo.setMonth(today.getMonth() - 1);
          return taskDate <= monthAgo;
        default:
          return true;
      }
    }
    return true;
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Mes Tâches</h2>
        <button
          onClick={onCreateTask}
          className="bg-[#1FAD92] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          <span>Créer une tâche</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="all">Toutes les catégories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.name}>{category.name}</option>
          ))}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="all">Tous les statuts</option>
          <option value="to_do">À faire</option>
          <option value="in_progress">En cours</option>
          <option value="done">Effectué.e</option>
          <option value="cancelled">Annulé.e</option>
        </select>

        <select
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900"
        >
          <option value="all">Toutes les dates</option>
          <option value="today">Aujourd'hui</option>
          <option value="recent">Récent (7 derniers jours)</option>
          <option value="oldest">Plus ancien ({'>='} 1 mois)</option>
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catégorie</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date limite</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Objectif</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredTasks.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Aucune tâche trouvée
                </td>
              </tr>
            ) : (
              filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {task.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {task.category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(task.deadline).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.objective}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                      {getStatusText(task.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => onEdit(task.id)}
                        className="text-[#1FAD92] hover:text-[#178a74]"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => onDelete(task.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}