import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy } from 'firebase/firestore';
import { CheckIn } from '@/types';

interface CreateCheckInRequest {
  userId: string;
  goalId: string;
  completed: boolean;
  value?: number;
  notes?: string;
  mood?: 1 | 2 | 3 | 4 | 5;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { userId, goalId, days } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      let checkInsQuery = query(
        collection(db, 'checkins'),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

      // If goalId is provided, filter by goal
      if (goalId) {
        checkInsQuery = query(
          collection(db, 'checkins'),
          where('userId', '==', userId),
          where('goalId', '==', goalId),
          orderBy('date', 'desc')
        );
      }

      const snapshot = await getDocs(checkInsQuery);
      let checkIns = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date.toDate() // Convert Firestore timestamp
      })) as CheckIn[];

      // Filter by days if provided
      if (days) {
        const daysCount = parseInt(days as string);
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysCount);
        checkIns = checkIns.filter(checkIn => checkIn.date >= cutoffDate);
      }

      res.status(200).json({ checkIns });
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, goalId, completed, value, notes, mood }: CreateCheckInRequest = req.body;

      if (!userId || !goalId || completed === undefined) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const checkInData: Omit<CheckIn, 'id'> = {
        userId,
        goalId,
        date: new Date(),
        completed,
        value,
        notes,
        mood,
        createdAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'checkins'), checkInData);
      
      res.status(201).json({ 
        success: true, 
        checkInId: docRef.id,
        checkIn: { id: docRef.id, ...checkInData }
      });
    } catch (error) {
      console.error('Error creating check-in:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
