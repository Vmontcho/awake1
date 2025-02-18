import { getDoc, doc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export const getCurrentUser = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('No authenticated user');
  }

  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (!userDoc.exists()) {
    throw new Error('User document not found');
  }

  return {
    id: userDoc.id,
    ...userDoc.data(),
  };
};