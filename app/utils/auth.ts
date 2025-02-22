import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

interface UserData {
  id: string;
  name?: string;
  role: string;
  status?: string;
}

export async function getCurrentUser(): Promise<UserData | null> {
  try {
    // Get the current user without artificial delay
    const user = auth.currentUser;
    
    // If no user is found, wait for auth state to be ready
    if (!user) {
      await auth.authStateReady();
      const refreshedUser = auth.currentUser;
      if (!refreshedUser) return null;
      
      // Verify token silently without force refresh
      try {
        await refreshedUser.getIdToken(false);
      } catch (tokenError) {
        console.error('Token verification failed:', tokenError);
        return null;
      }
      
      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, 'users', refreshedUser.uid));
      if (!userDoc.exists()) return null;
      
      const userData = userDoc.data();
      return {
        id: userDoc.id,
        name: userData.name,
        role: userData.role,
        status: userData.status
      };
    }
    
    // For existing user session, verify token and get data
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (!userDoc.exists()) return null;
    
    const userData = userDoc.data();
    return {
      id: userDoc.id,
      name: userData.name,
      role: userData.role,
      status: userData.status
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}