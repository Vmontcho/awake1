'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { getCurrentUser } from '../utils/auth';
import Sidebar from './components/Sidebar';
import TaskList from './components/TaskList';
import CategoryGrid from './components/CategoryGrid';
import DailyQuote from './components/DailyQuote';

interface User {
  name: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  status: 'pending' | 'completed';
  createdAt: string;
  userId: string;
}



export default function UserDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; description: string; availability: 'all' | 'free' | 'premium'; createdAt: string; }[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    categoryId: '',
    status: 'pending',
    deadline: new Date().toISOString()
  });



  



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
        const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', firebaseUser.uid));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">Chargement...</div>
      </div>
    );
  }

  const handleEditTask = (taskId: string) => {
    router.push(`/user-dashboard/tasks/${taskId}`);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        // Delete task from Firestore
        await writeBatch(db)
          .delete(doc(db, 'tasks', taskId))
          .commit();
  
        // Update local state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Une erreur est survenue lors de la suppression de la tâche.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      <Sidebar onLogout={handleLogout} />



      <div className="flex-1 p-8 pb-24 lg:pb-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Bienvenue, {currentUser?.name || 'Utilisateur'}</h1>
          <p className="text-gray-600">Voici un aperçu de votre progression</p>
        </div>

        <CategoryGrid categories={categories} />
        <DailyQuote />
  
        <TaskList
          tasks={tasks}
          categories={categories}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
          onCreateTask={() => setIsModalOpen(true)}
        />
      </div>
    </div>
  );
}