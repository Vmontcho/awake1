'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getCurrentUser } from '../utils/auth';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';

interface User {
  name: string;
  role: string;
}

interface Task {
  id: string;
  name: string;
  category: string;
  deadline: string;
  objective: string;
  status: 'to_do' | 'in_progress' | 'done' | 'cancelled';
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; description: string; availability: 'all' | 'free' | 'premium'; createdAt: string; }[]>([]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }
  
      try {
        const userData = await getCurrentUser();
        if (!userData || userData.role !== 'user') {
          router.push('/login');
          return;
        }
        setCurrentUser(userData);
  
        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          icon: doc.data().icon || '',
          description: doc.data().description || '',
          availability: doc.data().availability || 'all',
          createdAt: doc.data().createdAt || new Date().toISOString()
        }));
        setCategories(categoriesData);
  
        // Fetch user's tasks
        const tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userData.id)
        );
        const tasksSnapshot = await getDocs(tasksQuery);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    });
  
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleEditTask = (taskId: string) => {
    router.push(`/user-dashboard/tasks/${taskId}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    // Implement task deletion logic
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      // Add deletion logic here
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar onLogout={handleLogout} />

      <div className="flex-1 p-8 pb-24 lg:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {currentUser?.name || 'Utilisateur'}</h1>
          <p className="text-gray-600">Voici un aperçu de votre progression</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">Tâches totales</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">{tasks.length}</span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">Tâches terminées</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {tasks.filter(task => task.status === 'done').length}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">En cours</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {tasks.filter(task => task.status === 'in_progress').length}
              </span>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-gray-500 text-sm mb-1">À faire</h3>
            <div className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                {tasks.filter(task => task.status === 'to_do').length}
              </span>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Catégories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const categoryTaskCount = tasks.filter(task => task.category === category.name).length;
              return (
                <div key={category.id} className="bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{category.icon}</span>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{category.name}</h3>
                      <p className="text-sm text-gray-500">{categoryTaskCount} tâches</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Citation du jour</h2>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 italic">"Le seul moyen de faire du bon travail est d'aimer ce que vous faites."</p>
              <p className="text-xs text-gray-500 mt-2">- Steve Jobs</p>
            </div>
          </div>
        </div>

        <TaskList
          categories={categories}
          tasks={tasks}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onCreateTask={() => router.push('/user-dashboard/tasks/new')}
        />
      </div>
    </div>
  );
}