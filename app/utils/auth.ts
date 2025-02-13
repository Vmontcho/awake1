import { User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

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

// Function to verify if user has admin access
export const verifyAdminAccess = async (user: FirebaseUser): Promise<boolean> => {
  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return false;

    const userData = userDoc.data() as User;
    return ['admin', 'superadmin'].includes(userData.role);
  } catch (error) {
    console.error('Error verifying admin access:', error);
    return false;
  }
};

// Function to get current user data
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) return null;

    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    if (!userDoc.exists()) return null;

    return { id: userDoc.id, ...userDoc.data() } as User;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};