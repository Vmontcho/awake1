'use client';
import { useState, useEffect } from 'react';
import { use } from 'react'; // Importez `use` depuis React
import { useRouter } from 'next/navigation';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db } from '@/app/firebase';
import { FiArrowLeft, FiSave } from 'react-icons/fi';

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

interface PageParams {
  id: string;
}

interface Props {
  params: Promise<PageParams>; // `params` est maintenant une promesse
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function Page({ params: paramsPromise }: Props) {
  const router = useRouter();
  const storage = getStorage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newProfilePicture, setNewProfilePicture] = useState<File | null>(null);
  const [editedUser, setEditedUser] = useState<Partial<User>>({});
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Déballez `params` avec `React.use()`
  const params = use(paramsPromise);

  useEffect(() => {
    const fetchUser = async () => {
      if (!params?.id) {
        setError('User ID is required');
        setLoading(false);
        setShouldRedirect(true);
        return;
      }

      try {
        const userRef = doc(db, 'users', params.id);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const userData = { id: userDoc.id, ...userDoc.data() } as User;
          setUser(userData);
          setEditedUser(userData);
        } else {
          setError('User not found');
          setShouldRedirect(true);
        }
      } catch (err) {
        setError('Error fetching user data');
        console.error('Error:', err);
        setShouldRedirect(true);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [params?.id]);

  useEffect(() => {
    if (shouldRedirect && !loading) {
      router.replace('/dashboard/users');
    }
  }, [shouldRedirect, loading, router]);

  const handleSave = async () => {
    if (!user) return;

    // Form validation
    if (!editedUser.name?.trim() || !editedUser.email?.trim()) {
      setError('Name and email are required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editedUser.email || '')) {
      setError('Please enter a valid email address');
      return;
    }

    // Phone number validation (optional)
    if (editedUser.phoneNumber && !/^\+?[\d\s-]{8,}$/.test(editedUser.phoneNumber)) {
      setError('Please enter a valid phone number');
      return;
    }

    setSaving(true);
    setError('');

    try {
      const updates: Partial<User> = { ...editedUser };

      // Handle profile picture upload if changed
      if (newProfilePicture) {
        if (newProfilePicture.size > 5 * 1024 * 1024) { // 5MB limit
          throw new Error('Profile picture must be less than 5MB');
        }
        const storageRef = ref(storage, `profile-pictures/${user.id}`);
        await uploadBytes(storageRef, newProfilePicture);
        const profilePictureUrl = await getDownloadURL(storageRef);
        updates.profilePicture = profilePictureUrl;
      }

      // Update user in Firestore
      await updateDoc(doc(db, 'users', user.id), updates);

      // Refresh user data
      const updatedDoc = await getDoc(doc(db, 'users', user.id));
      const updatedUser = { id: updatedDoc.id, ...updatedDoc.data() } as User;
      setUser(updatedUser);
      setEditedUser(updatedUser);
      setNewProfilePicture(null);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg';
      successMessage.textContent = 'User updated successfully';
      document.body.appendChild(successMessage);
      setTimeout(() => successMessage.remove(), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating user');
      console.error('Error:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Loading...</h1>
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FAD92]"></div>
        </div>
      </div>
    );
  }

  if (shouldRedirect) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Redirecting...</h1>
        </div>
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1FAD92]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      <div className="flex items-center mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" /> Back
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">Edit User</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            {user?.profilePicture ? (
              <div className="mb-4">
                <div className="w-[100px] h-[100px] overflow-hidden rounded-full">
                  <img
                    src={user.profilePicture}
                    alt="Profile"
                    className="object-cover w-full h-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/awakening-logo.png';
                      target.onerror = null; // Prevent infinite loop if fallback also fails
                    }}
                  />
                </div>
              </div>
            ) : (
              <div className="mb-4">
                <div className="w-[100px] h-[100px] overflow-hidden rounded-full">
                  <img
                    src="/awakening-logo.png"
                    alt="Default Profile"
                    className="object-cover w-full h-full bg-gray-100"
                  />
                </div>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setNewProfilePicture(file);
              }}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-violet-50 file:text-violet-700
                hover:file:bg-violet-100"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editedUser.name || ''}
                onChange={(e) => setEditedUser({ ...editedUser, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Surname
              </label>
              <input
                type="text"
                value={editedUser.surname || ''}
                onChange={(e) => setEditedUser({ ...editedUser, surname: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={editedUser.phoneNumber || ''}
                onChange={(e) => setEditedUser({ ...editedUser, phoneNumber: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role
              </label>
              <select
                value={editedUser.role || ''}
                onChange={(e) => setEditedUser({ ...editedUser, role: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={editedUser.status || ''}
                onChange={(e) => setEditedUser({ ...editedUser, status: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="activated">Activated</option>
                <option value="deactivated">Deactivated</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <FiSave className="mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}