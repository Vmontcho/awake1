'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '../../../firebase';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

// Initialize Firebase Storage
const storage = getStorage();

interface User {
  id: string;
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  role: string;
  status: string;
  createdAt: string;
  profilePicture?: string;
}

interface PageProps {
  params: {
    id: string;
  };
}

export default function UserDetailsPage({ params }: PageProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});

  useEffect(() => {
    const fetchUser = async () => {
      const userId = params?.id;
      if (!userId) {
        setError('User ID is required');
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setUser(userData);
          setEditedUser(userData);
        } else {
          setError('User not found');
        }
      } catch (err) {
        setError('Error fetching user data');
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchUser();
    }
  }, [params.id]);

  const handleSave = async () => {
    if (!user) return;
    
    setSaving(true);
    setError('');

    try {
      const updates: Partial<User> = { ...editedUser };
      
      // Handle profile picture upload if changed
      if (newProfilePicture) {
        const storageRef = ref(storage, `profile-pictures/${user.id}`);
        await uploadBytes(storageRef, newProfilePicture);
        const profilePictureUrl = await getDownloadURL(storageRef);
        updates.profilePicture = profilePictureUrl;
      }

      // Update user document in Firestore
      await updateDoc(doc(db, 'users', user.id), updates);
      
      // Refresh user data
      const updatedDoc = await getDoc(doc(db, 'users', user.id));
      const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() } as User;
      setUser(updatedUser);
      setEditedUser(updatedUser);

      // Show success message
      alert('User updated successfully');
    } catch (err) {
      setError('Failed to update user');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-red-600 text-center">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="text-center">User not found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <FiArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center bg-[#1FAD92] text-white px-4 py-2 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
          >
            <FiSave className="w-5 h-5 mr-2" />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>

        {/* User Details Form */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Détails de l'utilisateur
          </h1>

          <div className="space-y-6">
            {/* Profile Picture */}
            <div className="flex items-center space-x-6">
              <div className="relative w-24 h-24">
                <Image
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={`${user.name} ${user.surname}`}
                  fill
                  className="rounded-full object-cover"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Changer la photo de profil
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setNewProfilePicture(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#1FAD92] file:text-white hover:file:bg-opacity-90"
                />
              </div>
            </div>

            {/* Personal Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  value={editedUser.name || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  value={editedUser.surname || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, surname: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={editedUser.email || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, email: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={editedUser.phoneNumber || ''}
                  onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  value={editedUser.role || 'user'}
                  onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État
                </label>
                <select
                  value={editedUser.status || 'activated'}
                  onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-[#1FAD92] focus:outline-none focus:ring-1 focus:ring-[#1FAD92]"
                >
                  <option value="activated">Activé</option>
                  <option value="deactivated">Désactivé</option>
                </select>
              </div>
            </div>

            {/* Created At */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de création
              </label>
              <div className="text-gray-600">
                {new Date(user.createdAt).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}