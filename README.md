# CodeTracker 🚀

CodeTracker is a comprehensive platform designed to help developers organize their coding practice, track their problem-solving journey, and visualize their progress over time. Whether you're preparing for technical interviews or improving your coding skills, CodeTracker provides all the tools you need to stay organized and motivated. A modern, full-stack web application for tracking and managing coding problems, solutions, and progress. Built with React, TypeScript, and Lovable Cloud (Supabase backend).

## ✨ Features

### 🔐 Authentication
- Secure user registration and login
- Email-based authentication
- Password visibility toggle
- Auto-confirm email signups
- Protected routes and data

### 📊 Dashboard
- **Real-time Statistics**: Track total questions, completed, in-progress, and to-do items
- **Visual Analytics**: Interactive pie charts for difficulty and status breakdowns
- **Streak Tracking**: Monitor current and longest solving streaks
- **Weekly & Monthly Insights**: View completion trends over time
- **Quick Navigation**: Easy access to all questions from the dashboard

### 📝 Question Management
- **CRUD Operations**: Create, read, update, and delete coding questions
- **Rich Details**: Store title, description, language, topic, difficulty, and status
- **Code Solutions**: Save solution code with syntax highlighting
- **Notes & Approaches**: Document your problem-solving strategies
- **Advanced Filtering**: Filter by difficulty, status, language, and topic
- **Smart Sorting**: Sort by date, title, difficulty, or status
- **Search Functionality**: Quickly find questions by title or description

### 🎯 Question Details
- **Comprehensive View**: See all question information in one place
- **Multiple Solutions**: Track different solution approaches for the same problem
- **Solution Management**: Add, view, and delete alternative solutions
- **Code Display**: Syntax-highlighted code viewer
- **Timestamps**: Track creation and last solved dates
- **Easy Navigation**: Quick access to edit mode

### 👤 Profile Management
- **User Information**: Update username, avatar, and bio
- **Activity Calendar**: GitHub-style contribution graph showing your coding activity
- **Year-at-a-Glance**: Visual representation of your entire year's progress
- **Detailed Statistics**:
  - Total questions solved
  - Completion rate
  - Current streak
  - Longest streak
- **Account Management**: Delete account option with confirmation

### 🎨 User Experience
- **Dark/Light Theme**: Toggle between themes with persistent preference
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Modern UI**: Built with shadcn/ui components and Radix UI primitives
- **Smooth Animations**: Engaging transitions and loading states
- **Toast Notifications**: Real-time feedback for user actions
- **Loading States**: Clear indicators during data operations

### 🔧 Additional Features
- **Code Editor**: Integrated code editor for writing and viewing solutions
- **Data Persistence**: All data stored securely in the backend
- **Real-time Updates**: Instant synchronization across all views
- **Error Handling**: Comprehensive error messages and fallbacks
- **404 Page**: Custom not found page for invalid routes

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **React Router v6** - Client-side routing
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React components
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Recharts** - Composable charting library
- **React Hook Form** - Form state management
- **TanStack Query** - Data fetching and caching
- **Sonner** - Toast notifications
- **date-fns** - Date utility library

### Backend (Lovable Cloud)
- **Authentication** - Secure user management
- **PostgreSQL Database** - Relational data storage
- **Row Level Security (RLS)** - Data access policies
- **Real-time Subscriptions** - Live data updates
- **Storage** - File and asset management
