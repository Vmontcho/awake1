'use client';

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

interface Gift {
  title: string;
  description: string;
  category: string;
  status: 'to_obtain' | 'acquired' | 'cancelled';
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

export default function NewGiftPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [gift, setGift] = useState<Gift>({
    title: '',
    description: '',
    category: '',
    status: 'to_obtain'
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          icon: doc.data().icon || '',
          description: doc.data().description || ''
        }));
        setCategories(categoriesData);
        if (categoriesData.length > 0) {
          setGift(prev => ({ ...prev, category: categoriesData[0].id }));
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };

    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!auth.currentUser) {
        router.push('/login');
        return;
      }

      if (!gift.title.trim()) {
        throw new Error('Le titre est requis');
      }

      const giftData = {
        ...gift,
        userId: auth.currentUser.uid,
        createdAt: new Date().toISOString()
      };

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'gifts'), giftData);
      router.push('/user-dashboard/gifts');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      console.error('Error creating gift:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" /> Retour
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Ajouter un cadeau</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={gift.title}
              onChange={(e) => setGift({ ...gift, title: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={gift.description}
              onChange={(e) => setGift({ ...gift, description: e.target.value })}
              rows={3}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie
            </label>
            <select
              value={gift.category}
              onChange={(e) => setGift({ ...gift, category: e.target.value })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
              required
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              État
            </label>
            <select
              value={gift.status}
              onChange={(e) => setGift({ ...gift, status: e.target.value as Gift['status'] })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
            >
              <option value="to_obtain">À obtenir</option>
              <option value="acquired">Acquis</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Création...' : 'Créer le cadeau'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}