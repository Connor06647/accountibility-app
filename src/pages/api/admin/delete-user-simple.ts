import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { doc, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, adminUserId } = req.body;

    if (!userId || !adminUserId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Note: This is a simplified version that only deletes from Firestore
    // The Firebase Auth account will remain active until Firebase Admin SDK is set up
    
    // Delete user document from Firestore
    await deleteDoc(doc(db, 'users', userId));

    // Delete user's goals
    const goalsQuery = query(collection(db, 'goals'), where('userId', '==', userId));
    const goalsSnapshot = await getDocs(goalsQuery);
    const deleteGoalsPromises = goalsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteGoalsPromises);

    // Delete user's check-ins
    const checkInsQuery = query(collection(db, 'checkIns'), where('userId', '==', userId));
    const checkInsSnapshot = await getDocs(checkInsQuery);
    const deleteCheckInsPromises = checkInsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteCheckInsPromises);

    res.status(200).json({ 
      success: true, 
      message: 'User data deleted from Firestore (Firebase Auth account still exists)',
      warning: 'Complete deletion requires Firebase Admin SDK setup'
    });
  } catch (error) {
    console.error('Error deleting user data:', error);
    res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' });
  }
}
