// Firebase utilities file to handle imports
import { db } from './firebase';

// Lazy imports to avoid TypeScript module resolution issues
export const getFirestoreModules = async () => {
  try {
    const firestore = await import('firebase/firestore');
    return {
      collection: firestore.collection,
      getDocs: firestore.getDocs,
      query: firestore.query,
      orderBy: firestore.orderBy,
      limit: firestore.limit,
      onSnapshot: firestore.onSnapshot,
      where: firestore.where,
      doc: firestore.doc,
      updateDoc: firestore.updateDoc,
      deleteDoc: firestore.deleteDoc,
      addDoc: firestore.addDoc,
      Timestamp: firestore.Timestamp,
      DocumentData: firestore.DocumentData,
      QuerySnapshot: firestore.QuerySnapshot,
      DocumentSnapshot: firestore.DocumentSnapshot,
    };
  } catch (error) {
    console.error('Error importing firestore modules:', error);
    return null;
  }
};

// Wrapper functions for Firestore operations
export const firestoreOperations = {
  // Users collection
  getUsersCollection: async () => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.collection(db, 'users');
  },

  // Goals collection
  getGoalsCollection: async (userId: string) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.collection(db, 'users', userId, 'goals');
  },

  // Check-ins collection
  getCheckinsCollection: async (userId: string) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.collection(db, 'users', userId, 'checkins');
  },

  // Generic collection getter
  getCollection: async (collectionPath: string) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.collection(db, collectionPath);
  },

  // Document operations
  getDoc: async (docPath: string) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.doc(db, docPath);
  },

  // Query operations
  createQuery: async (collectionRef: any, ...constraints: any[]) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.query(collectionRef, ...constraints);
  },

  // Common query constraints
  orderBy: async (field: string, direction?: 'asc' | 'desc') => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.orderBy(field, direction);
  },

  limit: async (limitValue: number) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.limit(limitValue);
  },

  where: async (field: string, operator: any, value: any) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.where(field, operator, value);
  },

  // Document operations
  addDoc: async (collectionRef: any, data: any) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.addDoc(collectionRef, data);
  },

  updateDoc: async (docRef: any, data: any) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.updateDoc(docRef, data);
  },

  deleteDoc: async (docRef: any) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.deleteDoc(docRef);
  },

  getDocs: async (queryRef: any) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.getDocs(queryRef);
  },

  onSnapshot: async (queryRef: any, callback: (snapshot: any) => void) => {
    const modules = await getFirestoreModules();
    if (!modules) return null;
    return modules.onSnapshot(queryRef, callback);
  },

  // Timestamp utilities
  Timestamp: {
    now: async () => {
      const modules = await getFirestoreModules();
      if (!modules) return null;
      return modules.Timestamp.now();
    },
    fromDate: async (date: Date) => {
      const modules = await getFirestoreModules();
      if (!modules) return null;
      return modules.Timestamp.fromDate(date);
    },
  },
};

export { db };
