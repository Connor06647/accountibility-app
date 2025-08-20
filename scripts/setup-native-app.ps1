# Native App Setup Script for Windows PowerShell
# This script sets up a React Native project for the Accountability App

Write-Host "🚀 Setting up React Native Accountability App..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm found: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Create a new directory for the native app
$NATIVE_APP_DIR = "..\AccountabilityAppNative"

Write-Host "📁 Creating React Native project..." -ForegroundColor Blue
npx create-expo-app@latest AccountabilityAppNative --template blank-typescript

Set-Location AccountabilityAppNative

Write-Host "📦 Installing essential dependencies..." -ForegroundColor Blue

# Navigation
npm install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack @react-navigation/native-stack

# Expo navigation dependencies
npx expo install react-native-screens react-native-safe-area-context

# Firebase
npm install @react-native-firebase/app @react-native-firebase/auth @react-native-firebase/firestore @react-native-firebase/messaging

# State Management
npm install @reduxjs/toolkit react-redux

# UI and styling
npm install react-native-elements react-native-vector-icons
npx expo install react-native-svg

# Storage
npx expo install @react-native-async-storage/async-storage

# Payments
npm install @stripe/stripe-react-native

# Charts and analytics
npm install react-native-chart-kit

# Animations
npx expo install react-native-reanimated react-native-gesture-handler

# Development dependencies
npm install --save-dev @types/react @types/react-native

Write-Host "📂 Creating project structure..." -ForegroundColor Blue

# Create directory structure
New-Item -ItemType Directory -Path "src" -Force
New-Item -ItemType Directory -Path "src\components" -Force
New-Item -ItemType Directory -Path "src\screens" -Force
New-Item -ItemType Directory -Path "src\navigation" -Force
New-Item -ItemType Directory -Path "src\services" -Force
New-Item -ItemType Directory -Path "src\store" -Force
New-Item -ItemType Directory -Path "src\utils" -Force
New-Item -ItemType Directory -Path "src\types" -Force

New-Item -ItemType Directory -Path "src\components\Button" -Force
New-Item -ItemType Directory -Path "src\components\Card" -Force
New-Item -ItemType Directory -Path "src\components\Input" -Force
New-Item -ItemType Directory -Path "src\components\Charts" -Force

New-Item -ItemType Directory -Path "src\screens\Auth" -Force
New-Item -ItemType Directory -Path "src\screens\Dashboard" -Force
New-Item -ItemType Directory -Path "src\screens\Goals" -Force
New-Item -ItemType Directory -Path "src\screens\Analytics" -Force
New-Item -ItemType Directory -Path "src\screens\Profile" -Force
New-Item -ItemType Directory -Path "src\screens\Settings" -Force

New-Item -ItemType Directory -Path "src\store\slices" -Force

Write-Host "📝 Creating initial files..." -ForegroundColor Blue

# App.tsx replacement
@"
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider } from 'react-redux';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    </Provider>
  );
}
"@ | Out-File -FilePath "App.tsx" -Encoding UTF8

# Create basic navigation structure
@"
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import DashboardScreen from '../screens/Dashboard/DashboardScreen';
import GoalsScreen from '../screens/Goals/GoalsScreen';
import AnalyticsScreen from '../screens/Analytics/AnalyticsScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Goals" component={GoalsScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
    </Stack.Navigator>
  );
}
"@ | Out-File -FilePath "src\navigation\AppNavigator.tsx" -Encoding UTF8

# Create basic store setup
@"
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
"@ | Out-File -FilePath "src\store\store.ts" -Encoding UTF8

# Create basic screen templates
@"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard</Text>
      <Text>Welcome to your accountability dashboard!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
"@ | Out-File -FilePath "src\screens\Dashboard\DashboardScreen.tsx" -Encoding UTF8

@"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GoalsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Goals</Text>
      <Text>Manage your goals and track progress!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
"@ | Out-File -FilePath "src\screens\Goals\GoalsScreen.tsx" -Encoding UTF8

@"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AnalyticsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Analytics</Text>
      <Text>View your progress analytics and insights!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
"@ | Out-File -FilePath "src\screens\Analytics\AnalyticsScreen.tsx" -Encoding UTF8

@"
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text>Manage your account and settings!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});
"@ | Out-File -FilePath "src\screens\Profile\ProfileScreen.tsx" -Encoding UTF8

# Create Firebase config template
@"
// Firebase configuration for React Native
// Copy your web app's Firebase config here and adapt for React Native

export const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain", 
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

// Initialize Firebase when this module is imported
// import { initializeApp } from '@react-native-firebase/app';
// initializeApp(firebaseConfig);
"@ | Out-File -FilePath "src\services\firebase.ts" -Encoding UTF8

# Create types file
@"
// Type definitions for the Accountability App

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetValue: number;
  currentValue: number;
  deadline: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckIn {
  id: string;
  goalId: string;
  value: number;
  note?: string;
  timestamp: Date;
}

export interface AnalyticsData {
  completionRate: number;
  streak: number;
  totalGoals: number;
  completedGoals: number;
}
"@ | Out-File -FilePath "src\types\index.ts" -Encoding UTF8

Write-Host "✅ React Native project setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "🔧 Next steps:" -ForegroundColor Yellow
Write-Host "1. cd AccountabilityAppNative"
Write-Host "2. Update src\services\firebase.ts with your Firebase config"
Write-Host "3. Run 'npx expo start' to start development"
Write-Host ""
Write-Host "📱 To test on device:" -ForegroundColor Yellow
Write-Host "1. Install Expo Go app on your phone"
Write-Host "2. Scan the QR code from the terminal"
Write-Host ""
Write-Host "🏗️ To build for app stores later:" -ForegroundColor Yellow
Write-Host "1. Run 'npm install -g eas-cli'"
Write-Host "2. Run 'eas build:configure'"
Write-Host "3. Run 'eas build --platform all'"
