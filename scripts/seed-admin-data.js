// Simple script to add sample data for testing the admin panel
// This would typically be run as a Node.js script with Firebase Admin SDK

const sampleUsers = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    tier: 'free',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    lastSeen: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: 'user2', 
    name: 'Jane Smith',
    email: 'jane@example.com',
    tier: 'standard',
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lastSeen: new Date(Date.now() - 2 * 60 * 60 * 1000)
  },
  {
    id: 'user3',
    name: 'Bob Johnson',
    email: 'bob@example.com', 
    tier: 'premium',
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
    lastSeen: new Date(Date.now() - 30 * 60 * 1000)
  }
];

const sampleGoals = [
  { id: 'goal1', userId: 'user1', title: 'Exercise Daily', status: 'active' },
  { id: 'goal2', userId: 'user1', title: 'Read for 30 mins', status: 'active' },
  { id: 'goal3', userId: 'user2', title: 'Meditate', status: 'completed' },
  { id: 'goal4', userId: 'user3', title: 'Learn Spanish', status: 'active' }
];

const sampleCheckIns = [
  { id: 'checkin1', userId: 'user1', date: new Date().toISOString().split('T')[0], rating: 8 },
  { id: 'checkin2', userId: 'user2', date: new Date().toISOString().split('T')[0], rating: 7 },
  { id: 'checkin3', userId: 'user3', date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0], rating: 9 }
];

console.log('Sample data for admin panel testing:');
console.log('Users:', sampleUsers.length);
console.log('Goals:', sampleGoals.length);
console.log('Check-ins:', sampleCheckIns.length);
console.log('\nTo use this data, you would typically write it to Firebase using the Admin SDK.');
console.log('For now, the admin panel will show simulated real-time data when you have real users.');
