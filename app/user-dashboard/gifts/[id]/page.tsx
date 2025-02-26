'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { auth, db } from '../../../firebase';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';

interface Gift {
  id: string;
  title: string;
  description: string;
  category: string;
  status: 'to_obtain' | 'acquired' | 'cancelled';
  deadline?: string;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function GiftDetailPage({ params }: PageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [gift, setGift] = useState<Gift | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) {
          router.push('/login');
          return;
        }

        // Fetch the gift data
        const giftRef = doc(db, 'users', auth.currentUser.uid, 'gifts', params.id);
        const giftDoc = await getDoc(giftRef);

        if (!giftDoc.exists()) {
          setError('Gift not found');
          return;
        }

        setGift({
          id: giftDoc.id,
          ...giftDoc.data()
        } as Gift);

        // Fetch categories
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          icon: doc.data().icon || '',
          description: doc.data().description || ''
        }));
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while loading the gift');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const handleSave = async () => {
    if (!gift || !auth.currentUser) return;
    setSaving(true);

    try {
      const giftRef = doc(db, 'users', auth.currentUser.uid, 'gifts', gift.id);
      await updateDoc(giftRef, {
        ...gift,
        updatedAt: new Date().toISOString()
      });

      router.push('/user-dashboard/gifts');
    } catch (error) {
      console.error('Error updating gift:', error);
      setError('An error occurred while saving the gift');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FAD92]"></div>
          <span className="ml-2 text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!gift) {
    return (
      <div className="p-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <p className="text-yellow-600">Gift not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Gift</h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
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
              Category
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
              Status
            </label>
            <select
              value={gift.status}
              onChange={(e) => setGift({ ...gift, status: e.target.value as Gift['status'] })}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
            >
              <option value="to_obtain">To Obtain</option>
              <option value="acquired">Acquired</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}