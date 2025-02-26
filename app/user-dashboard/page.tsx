'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, getDocs, query, where, writeBatch, doc } from 'firebase/firestore';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase';
import { getCurrentUser } from '../utils/auth';
import CategoryGrid from './components/CategoryGrid';
import DailyQuote from './components/DailyQuote';
import TaskList from './components/TaskList';

interface User {
  name: string;
  role: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  status: string;
  deadline: string;
  userId: string;
}

export default function UserDashboardPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string; icon: string; description: string; availability: 'all' | 'free' | 'premium'; createdAt: string; }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        router.push('/login');
        return;
      }

      try {
        const userData = await getCurrentUser();
        if (!userData || !('role' in userData) || userData.role !== 'user') {
          router.push('/login');
          return;
        }
        setCurrentUser({ name: (userData as any).name || '', role: userData.role as string });

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
        const userTasksRef = collection(db, 'users', firebaseUser.uid, 'tasks');
        const tasksSnapshot = await getDocs(userTasksRef);
        const tasksData = tasksSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Task[];
        setTasks(tasksData);

        // Calculate task counts per category
        const categoriesWithCounts = categoriesData.map(category => {
          const categoryTasks = tasksData.filter(task => task.categoryId === category.id);
          const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
          const totalTasks = categoryTasks.length;
          return {
            ...category,
            completedTasks,
            totalTasks
          };
        });
        setCategories(categoriesWithCounts);

      } catch (error) {
        console.error('Error fetching user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Chargement...</h1>
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FAD92]"></div>
        </div>
      </div>
    );
  }

  const handleEditTask = async (taskId: string) => {
    if (taskId === 'refresh') {
      // Fetch latest tasks
      const userTasksRef = collection(db, 'users', auth.currentUser?.uid || '', 'tasks');
      const tasksSnapshot = await getDocs(userTasksRef);
      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Task[];
      setTasks(tasksData);

      // Update category counts
      setCategories(prevCategories => 
        prevCategories.map(category => {
          const categoryTasks = tasksData.filter(task => task.categoryId === category.id);
          const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
          const totalTasks = categoryTasks.length;
          return {
            ...category,
            completedTasks,
            totalTasks
          };
        })
      );
    } else {
      router.push(`/user-dashboard/tasks/${taskId}`);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        // Delete task from Firestore
        await writeBatch(db)
          .delete(doc(db, 'users', auth.currentUser?.uid || '', 'tasks', taskId))
          .commit();
  
        // Update local state
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);

        // Update category counts
        setCategories(prevCategories => 
          prevCategories.map(category => {
            const categoryTasks = updatedTasks.filter(task => task.categoryId === category.id);
            const completedTasks = categoryTasks.filter(task => task.status === 'completed').length;
            const totalTasks = categoryTasks.length;
            return {
              ...category,
              completedTasks,
              totalTasks
            };
          })
        );
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Une erreur est survenue lors de la suppression de la tâche.');
      }
    }
  };

  return (
    <div className="p-8">
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
        setTasks={setTasks}
        setCategories={setCategories}
      />
    </div>
  );
}