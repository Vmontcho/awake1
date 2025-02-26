'use client';

import { useState, useEffect } from 'react';
import { collection, getDocs, doc, writeBatch } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import { FiTrash2, FiEdit2, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

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

export default function GiftsPage() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGift, setEditingGift] = useState<Gift | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) {
          router.push('/login');
          return;
        }

        // Fetch categories from database
        const categoriesSnapshot = await getDocs(collection(db, 'categories'));
        const categoriesData = categoriesSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || '',
          icon: doc.data().icon || '',
          description: doc.data().description || ''
        }));
        setCategories(categoriesData);

        // Fetch user's gifts
        const userGiftsRef = collection(db, 'users', auth.currentUser.uid, 'gifts');
        const giftsSnapshot = await getDocs(userGiftsRef);
        const giftsData = giftsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Gift[];
        setGifts(giftsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSaveEdit = async () => {
    if (!editingGift || !auth.currentUser) return;
    setSaving(true);

    try {
      const giftRef = doc(db, 'users', auth.currentUser.uid, 'gifts', editingGift.id);
      await writeBatch(db)
        .update(giftRef, {
          ...editingGift,
          updatedAt: new Date().toISOString()
        })
        .commit();

      setGifts(prevGifts =>
        prevGifts.map(gift =>
          gift.id === editingGift.id ? editingGift : gift
        )
      );

      setIsModalOpen(false);
      setEditingGift(null);
    } catch (error) {
      console.error('Error updating gift:', error);
      alert('Une erreur est survenue lors de la mise à jour du cadeau.');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGift = async (giftId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cadeau ?')) {
      try {
        await writeBatch(db)
          .delete(doc(db, 'users', auth.currentUser?.uid || '', 'gifts', giftId))
          .commit();

        setGifts(prevGifts => prevGifts.filter(gift => gift.id !== giftId));
      } catch (error) {
        console.error('Error deleting gift:', error);
        alert('Une erreur est survenue lors de la suppression du cadeau.');
      }
    }
  };

  const filteredGifts = gifts.filter(gift => {
    if (filterStatus !== 'all' && gift.status !== filterStatus) return false;
    return true;
  });

  return (
    <div className="flex-1 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ma liste de cadeaux</h1>
        <p className="text-gray-600">Gérez et suivez vos cadeaux souhaités</p>
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
              <option value="to_obtain">À obtenir</option>
              <option value="acquired">Acquis</option>
              <option value="cancelled">Annulé</option>
            </select>
          </div>
          <button
            onClick={() => router.push('/user-dashboard/gifts/new')}
            className="bg-[#1FAD92] text-white px-4 py-2 rounded-md flex items-center space-x-2 hover:bg-opacity-90 transition-colors"
          >
            <FiPlus className="w-5 h-5" />
            <span>Ajouter un cadeau</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1FAD92]"></div>
              <span className="ml-2 text-gray-500">Chargement...</span>
            </div>
          ) : filteredGifts.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              Aucun cadeau trouvé
            </div>
          ) : (
            filteredGifts.map((gift) => (
              <div key={gift.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {categories.find(cat => cat.id === gift.category)?.icon || '📦'}
                    </span>
                    <h3 className="text-lg font-semibold text-gray-900">{gift.title}</h3>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingGift(gift);
                        setIsModalOpen(true);
                      }}
                      className="text-[#1FAD92] hover:text-[#178a74]"
                      title="Modifier"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteGift(gift.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Supprimer"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-gray-600">{gift.description}</p>

                  <div className="flex justify-end items-center">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        gift.status === 'acquired'
                          ? 'bg-green-100 text-green-800'
                          : gift.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {gift.status === 'acquired' ? 'Acquis' : 
                       gift.status === 'cancelled' ? 'Annulé' : 'À obtenir'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Edit Gift Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Modifier le cadeau</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre</label>
                <input
                  type="text"
                  value={editingGift?.title || ''}
                  onChange={(e) => setEditingGift(prev => prev ? { ...prev, title: e.target.value } : null)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={editingGift?.description || ''}
                  onChange={(e) => setEditingGift(prev => prev ? { ...prev, description: e.target.value } : null)}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                  <select
                    value={editingGift?.category || ''}
                    onChange={(e) => setEditingGift(prev => prev ? { ...prev, category: e.target.value } : null)}
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
                    value={editingGift?.status || ''}
                    onChange={(e) => setEditingGift(prev => prev ? { ...prev, status: e.target.value as Gift['status'] } : null)}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                  >
                    <option value="to_obtain">À obtenir</option>
                    <option value="acquired">Acquis</option>
                    <option value="cancelled">Annulé</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingGift(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1FAD92]"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveEdit}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium text-white bg-[#1FAD92] border border-transparent rounded-md shadow-sm hover:bg-[#178a74] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1FAD92] disabled:opacity-50"
                >
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}