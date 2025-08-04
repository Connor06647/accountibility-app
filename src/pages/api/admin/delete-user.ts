import { NextApiRequest, NextApiResponse } from 'next';
import admin from 'firebase-admin';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  };

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'DELETE') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { userId, adminUserId } = req.body;

    if (!userId || !adminUserId) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    // Verify the requesting user is an admin
    const adminDoc = await admin.firestore().collection('users').doc(adminUserId).get();
    const adminData = adminDoc.data();
    
    if (!adminData || adminData.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }

    // Delete user from Firebase Authentication
    await admin.auth().deleteUser(userId);

    // Delete user document from Firestore
    await admin.firestore().collection('users').doc(userId).delete();

    // Delete user's goals
    const goalsQuery = await admin.firestore().collection('goals').where('userId', '==', userId).get();
    const goalsBatch = admin.firestore().batch();
    goalsQuery.docs.forEach((doc: any) => {
      goalsBatch.delete(doc.ref);
    });
    await goalsBatch.commit();

    // Delete user's check-ins
    const checkInsQuery = await admin.firestore().collection('checkIns').where('userId', '==', userId).get();
    const checkInsBatch = admin.firestore().batch();
    checkInsQuery.docs.forEach((doc: any) => {
      checkInsBatch.delete(doc.ref);
    });
    await checkInsBatch.commit();

    res.status(200).json({ success: true, message: 'User completely deleted' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
