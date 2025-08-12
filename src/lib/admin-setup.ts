import { auth, db } from './firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "cjoliver539@gmail.com";

export async function testFirebaseConnection() {
  try {
    console.log('🔥 Testing Firebase connection...');
    console.log('🔥 Auth instance:', auth);
    console.log('🔥 DB instance:', db);
    console.log('🔥 Current user:', auth.currentUser);
    
    return { success: true, message: 'Firebase connection successful' };
  } catch (error: any) {
    console.error('🔥 Firebase connection failed:', error);
    return { success: false, error: error.message };
  }
}

export async function resetAdminPassword() {
  try {
    console.log('🔐 Sending password reset email to admin...');
    
    await sendPasswordResetEmail(auth, ADMIN_EMAIL);
    
    console.log('🔐 Password reset email sent successfully');
    
    return { success: true, message: `Password reset email sent to ${ADMIN_EMAIL}. Check your email and set a new password.` };
    
  } catch (error: any) {
    console.error('🔐 Password reset failed:', error);
    return { success: false, error: error.message };
  }
}

export async function testAdminLoginWithPassword(password: string) {
  try {
    console.log('🔐 Testing admin login with provided password...');
    
    const userCredential = await signInWithEmailAndPassword(auth, ADMIN_EMAIL, password);
    console.log('🔐 Admin login successful:', userCredential.user);
    
    // Check user document
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
    if (userDoc.exists()) {
      console.log('🔐 User document:', userDoc.data());
    } else {
      console.log('🔐 No user document found, creating one...');
      await createAdminDocument(userCredential.user.uid);
    }
    
    return { success: true, message: 'Admin login successful with provided password' };
    
  } catch (error: any) {
    console.error('🔐 Admin login test failed:', error);
    return { success: false, error: error.message };
  }
}

export async function testAdminLogin() {
  // Try with the default test password
  const ADMIN_PASSWORD = "admin123456";
  return await testAdminLoginWithPassword(ADMIN_PASSWORD);
}

async function createAdminDocument(uid: string) {
  await setDoc(doc(db, 'users', uid), {
    id: uid,
    email: ADMIN_EMAIL,
    name: 'Admin User',
    username: 'admin',
    subscription: 'premium',
    tier: 'premium',
    isAdmin: true,
    createdAt: serverTimestamp(),
    preferences: {
      timezone: 'UTC',
      notificationTime: '09:00',
      coachingTone: 'balanced',
      reminderFrequency: 'daily',
      focusAreas: ['habits']
    }
  });
}

export async function ensureAdminExists() {
  try {
    console.log('🔐 Checking if admin user exists...');
    
    // Try to create admin user
    const ADMIN_PASSWORD = "admin123456";
    const userCredential = await createUserWithEmailAndPassword(auth, ADMIN_EMAIL, ADMIN_PASSWORD);
    
    console.log('🔐 Created admin user:', userCredential.user.uid);
    
    // Create admin user document
    await createAdminDocument(userCredential.user.uid);
    
    console.log('🔐 Admin user document created');
    
    return { success: true, message: `Admin user created successfully with password: ${ADMIN_PASSWORD}` };
    
  } catch (error: any) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('🔐 Admin user already exists');
      return { success: true, message: 'Admin user already exists. Try password: admin123456 or reset password.' };
    } else {
      console.error('🔐 Error creating admin user:', error);
      return { success: false, error: error.message };
    }
  }
}

export async function debugAdminAccount() {
  try {
    console.log('🔐 Debug Admin Account Info:');
    console.log('Expected admin email:', ADMIN_EMAIL);
    console.log('Current auth user:', auth.currentUser);
    
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        console.log('User document:', userDoc.data());
      } else {
        console.log('No user document found');
      }
    }
    
  } catch (error) {
    console.error('🔐 Debug error:', error);
  }
}
