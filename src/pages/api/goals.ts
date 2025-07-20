import type { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { Goal } from '@/types';

interface CreateGoalRequest {
  userId: string;
  title: string;
  description?: string;
  category: string;
  targetValue?: number;
  unit?: string;
  frequency: 'daily' | 'weekly' | 'monthly';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { userId } = req.query;
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const goalsQuery = query(
        collection(db, 'goals'),
        where('userId', '==', userId),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      );

      const snapshot = await getDocs(goalsQuery);
      const goals = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Goal[];

      res.status(200).json({ goals });
    } catch (error) {
      console.error('Error fetching goals:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else if (req.method === 'POST') {
    try {
      const { userId, title, description, category, targetValue, unit, frequency }: CreateGoalRequest = req.body;

      if (!userId || !title || !category || !frequency) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const goalData: Omit<Goal, 'id'> = {
        userId,
        title,
        description,
        category: category as any,
        targetValue,
        unit,
        frequency,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const docRef = await addDoc(collection(db, 'goals'), goalData);
      
      res.status(201).json({ 
        success: true, 
        goalId: docRef.id,
        goal: { id: docRef.id, ...goalData }
      });
    } catch (error) {
      console.error('Error creating goal:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  }
}
