# Accountability On Autopilot

Your AI-powered discipline coach for building lasting habits and achieving your goals.

## 🎯 Project Overview

Accountability On Autopilot is a comprehensive web application designed to help users maintain discipline across various life areas including fitness, education, productivity, and mental health. The platform leverages AI technology to provide personalized coaching, daily check-ins, and automated accountability through popular messaging platforms.

## ✨ Key Features

### 🏆 Tiered Subscription Levels
- **Free Tier**: Basic habit tracking, streaks, and reminders
- **Standard Tier (£4.99/month)**: AI WhatsApp check-ins, weekly reports, smart insights
- **Premium Tier (£14.99/month)**: Custom AI coaching, voice notes, human support

### 🎯 Goal & Focus Areas
- Fitness tracking (workouts, steps, nutrition)
- Education goals (study sessions, reading, skill development)
- Habit formation (journaling, water intake, meditation)
- Mental health (mood tracking, affirmations, wellness)
- Custom user-defined goals

### 🤖 AI Messaging Integration
- Smart WhatsApp/SMS check-ins
- Empathetic or firm coaching based on preferences
- Pattern recognition for missed goals
- Personalized daily conversations

### 🎮 Gamification System
- XP points and level progression
- Achievement badges and rewards
- Streak tracking and celebrations
- Optional leaderboards

### 👥 Accountability Features
- Partner matching system
- Shared goal tracking
- AI buddy for encouragement
- Progress sharing and updates

## 🛠 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Firebase Auth
- **Database**: Firestore (Firebase)
- **AI Integration**: OpenAI GPT API
- **Messaging**: WhatsApp Business API, Twilio
- **Payments**: Stripe
- **Deployment**: Vercel (recommended)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase account
- OpenAI API key (for AI features)
- WhatsApp Business API access (optional)
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone [your-repo-url]
   cd accountability-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your environment variables in `.env.local`

4. **Firebase Setup**
   - Create a new Firebase project
   - Enable Authentication and Firestore
   - Download your Firebase config
   - Update the Firebase configuration in `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── components/          # Reusable React components
│   ├── ui/             # Basic UI components
│   └── AccountabilityApp.tsx  # Main app component
├── pages/              # Next.js pages and API routes
│   ├── api/            # Backend API endpoints
│   ├── _app.tsx        # App wrapper
│   └── index.tsx       # Home page
├── lib/                # Utilities and configurations
│   ├── firebase.ts     # Firebase configuration
│   ├── auth-context.tsx # Authentication context
│   └── utils.ts        # Utility functions
├── types/              # TypeScript type definitions
├── styles/             # Global styles
└── hooks/              # Custom React hooks (to be added)
```

## 🎨 Key Components

### Authentication Flow
- Splash screen with brand introduction
- Welcome screen with user statistics
- Multi-step onboarding process
- Sign up/Sign in forms with social auth
- Subscription plan selection

### Core Features (To Be Implemented)
- **Dashboard**: Overview of goals, streaks, and progress
- **Goal Management**: Create, edit, and track goals
- **Check-in System**: Daily/weekly progress logging
- **Analytics**: Visual progress tracking and insights
- **AI Coach**: Personalized messaging and coaching
- **Profile Settings**: User preferences and notifications

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Quality

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** for type safety
- **Tailwind CSS** for consistent styling

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Build the project: `npm run build`
3. Deploy: `firebase deploy`

## 📊 Roadmap

### Phase 1: MVP (Current)
- [x] Project scaffolding and setup
- [x] Basic UI components and authentication flow
- [ ] Firebase integration
- [ ] Basic goal tracking
- [ ] User dashboard

### Phase 2: Core Features
- [ ] AI coaching integration
- [ ] WhatsApp/SMS messaging
- [ ] Gamification system
- [ ] Analytics dashboard

### Phase 3: Advanced Features
- [ ] Accountability partner matching
- [ ] Payment integration
- [ ] Mobile app (React Native/Flutter)
- [ ] Advanced AI features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit changes: `git commit -am 'Add new feature'`
4. Push to branch: `git push origin feature/new-feature`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in this repository
- Contact: [your-email@example.com]

## 🙏 Acknowledgments

- Lucide React for beautiful icons
- Tailwind CSS for rapid styling
- Firebase for backend services
- Next.js team for the amazing framework

---

**Ready to automate your accountability journey? Let's build something amazing! 🚀**
