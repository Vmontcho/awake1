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
  price: number;
  status: string;
  deadline: string;
  userId: string;
}

export default function GiftsPage() {
  const router = useRouter();
  const [gifts, setGifts] = useState<Gift[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!auth.currentUser) {
          router.push('/login');
          return;
        }

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
              <option value="pending">En attente</option>
              <option value="purchased">Acheté</option>
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

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Titre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix</th>
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
              ) : filteredGifts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun cadeau trouvé
                  </td>
                </tr>
              ) : (
                filteredGifts.map((gift) => (
                  <tr key={gift.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {gift.title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {gift.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {gift.price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          gift.status === 'purchased'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {gift.status === 'purchased' ? 'Acheté' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(gift.deadline).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => router.push(`/user-dashboard/gifts/${gift.id}`)}
                        className="text-[#1FAD92] hover:text-[#178a74] mr-3"
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
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}