#!/bin/bash

# Native App Setup Script
# This script sets up a React Native project for the Accountability App

echo "🚀 Setting up React Native Accountability App..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Create a new directory for the native app
NATIVE_APP_DIR="../AccountabilityAppNative"

echo "📁 Creating React Native project..."
npx create-expo-app@latest AccountabilityAppNative --template blank-typescript

cd AccountabilityAppNative || exit

echo "📦 Installing essential dependencies..."

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

echo "📂 Creating project structure..."

# Create directory structure
mkdir -p src/{components,screens,navigation,services,store,utils,types}
mkdir -p src/components/{Button,Card,Input,Charts}
mkdir -p src/screens/{Auth,Dashboard,Goals,Analytics,Profile,Settings}
mkdir -p src/store/slices

echo "📝 Creating initial files..."

# App.tsx replacement
cat > App.tsx << 'EOF'
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
EOF

# Create basic navigation structure
cat > src/navigation/AppNavigator.tsx << 'EOF'
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
EOF

# Create basic store setup
cat > src/store/store.ts << 'EOF'
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add reducers here
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
EOF

# Create basic screen templates
cat > src/screens/Dashboard/DashboardScreen.tsx << 'EOF'
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
EOF

cat > src/screens/Goals/GoalsScreen.tsx << 'EOF'
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
EOF

cat > src/screens/Analytics/AnalyticsScreen.tsx << 'EOF'
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
EOF

cat > src/screens/Profile/ProfileScreen.tsx << 'EOF'
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
EOF

# Create Firebase config template
cat > src/services/firebase.ts << 'EOF'
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
EOF

# Create types file
cat > src/types/index.ts << 'EOF'
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
EOF

echo "✅ React Native project setup complete!"
echo ""
echo "🔧 Next steps:"
echo "1. cd AccountabilityAppNative"
echo "2. Update src/services/firebase.ts with your Firebase config"
echo "3. Run 'npx expo start' to start development"
echo ""
echo "📱 To test on device:"
echo "1. Install Expo Go app on your phone"
echo "2. Scan the QR code from the terminal"
echo ""
echo "🏗️  To build for app stores later:"
echo "1. Run 'npm install -g eas-cli'"
echo "2. Run 'eas build:configure'"
echo "3. Run 'eas build --platform all'"
