# Running Metrics Analyzer

A modern, privacy-first web application for analyzing running data from GPX files and Strava. Upload your GPS tracking data and get beautiful insights about your running performance - all processed locally in your browser.

![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-blue?style=flat-square&logo=typescript)

**[Live Website](https://zxu28.github.io/runningmetric/)**

## 🎯 Project Summary

Running Metrics Analyzer solves the problem of fragmented running data analysis by providing a unified, privacy-first platform where runners can:
- **Consolidate** running data from multiple sources (GPX files, Strava)
- **Analyze** performance with interactive visualizations and detailed metrics
- **Organize** runs with tags, notes, and narrative stories
- **Track** progress through achievements, goals, and personal records

All data processing happens locally in the browser - your data never leaves your device.

## ✨ Core Features

### Data Import & Sync
- **GPX File Upload**: Drag & drop multiple GPX files with validation
- **Strava Integration**: OAuth 2.0 integration with real-time sync progress
- **Smart Storage**: Automatic data optimization to prevent localStorage quota issues

### Analysis & Visualization
- **Interactive Maps**: Color-coded routes by pace zones with elevation profiles
- **Performance Charts**: Pace trends, elevation analysis, weekly distance tracking
- **Activity Heatmap**: Visual calendar showing running history
- **Run Comparison**: Side-by-side comparison of different runs

### Organization & Stories
- **Run Tagging**: Add custom tags and notes to organize runs
- **Running Stories**: Combine multiple runs into narrative stories with emotional context, photos, and insights
- **Story Templates**: Quick creation with pre-filled templates (Marathon Training, Race Prep, etc.)
- **Export**: Export stories as PDF, image, or HTML

### Progress Tracking
- **Achievements**: Badge system with milestones and streaks
- **Goals**: Set and track distance, pace, and frequency goals
- **Best Efforts**: Personal records for 1 mile, 5K, 10K, and longest run
- **Statistics**: Year-over-year comparisons, trend analysis, best periods

### User Experience
- **Dark Mode**: Toggle between light and dark themes
- **Responsive Design**: Mobile-friendly navigation and layouts
- **Advanced Filtering**: Filter by year, month, tags, or search query
- **Smooth Animations**: Polished UI with Framer Motion animations

## 🔧 Problems Solved

### 1. **Data Fragmentation**
- **Problem**: Running data scattered across multiple platforms and devices
- **Solution**: Unified import from GPX files and Strava API, all stored locally in one place

### 2. **Privacy Concerns**
- **Problem**: Cloud-based services require data upload and may monetize user data
- **Solution**: 100% client-side processing - all data stays in browser localStorage

### 3. **Limited Analysis Tools**
- **Problem**: Basic platforms only show simple stats without deep insights
- **Solution**: Advanced visualizations, run comparisons, trend analysis, and achievement tracking

### 4. **Poor Organization**
- **Problem**: Hard to organize and find specific runs from large datasets
- **Solution**: Custom tagging system, advanced filtering, and narrative stories for context

### 5. **Storage Limitations**
- **Problem**: Browser localStorage has size limits (~5-10MB)
- **Solution**: Automatic GPS point density reduction for older runs, smart quota management with warnings

### 6. **Sync Performance**
- **Problem**: Slow Strava sync with large activity lists
- **Solution**: Rate limiting, early duplicate detection, optimized API call sequence, real-time progress tracking

### 7. **User Experience Issues**
- **Problem**: Scroll flashing, poor loading states, unclear error messages
- **Solution**: Optimized CSS transitions, skeleton loaders, toast notifications, smooth animations

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── RunMap.tsx      # Interactive route maps with pace visualization
│   ├── RunDetails.tsx  # Run details with tags and notes
│   ├── StoryCard.tsx   # Story summary cards
│   ├── StoryModal.tsx  # Story creation/edit modal
│   ├── AchievementsPanel.tsx  # Achievement badges and tracking
│   ├── GoalTracker.tsx # Goal setting and progress
│   └── ...            # Charts, filters, and other UI components
├── contexts/           # React Context providers
│   ├── DataContext.tsx      # Global running data state
│   ├── StoriesContext.tsx   # Story management
│   ├── GoalsContext.tsx     # Goal tracking
│   ├── ThemeContext.tsx     # Dark/light mode
│   └── ErrorContext.tsx     # Toast notifications
├── pages/              # Main application pages
│   ├── Home.tsx        # Landing page
│   ├── Upload.tsx      # File upload and Strava sync
│   ├── Analysis.tsx    # Unified analysis page (Runs, Stats, Achievements, Goals)
│   └── Stories.tsx     # Running Stories page
├── services/           # External API services
│   └── stravaService.ts # Strava OAuth and API integration
├── utils/              # Utility functions
│   ├── gpxParser.ts    # GPX parsing and calculations
│   ├── achievements.ts # Achievement definitions and logic
│   ├── storyTypes.ts   # Story type definitions
│   ├── storyExport.ts  # Story export utilities
│   └── ...            # Metrics, storage, and analysis utilities
└── hooks/              # Custom React hooks
    ├── useAchievements.ts # Achievement management
    └── useBestEfforts.ts  # Personal records tracking
```

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0 + TypeScript
- **Build**: Vite 5.0.0
- **Styling**: Tailwind CSS with custom organic theme
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Maps**: React Leaflet
- **Deployment**: GitHub Pages
- **API Integration**: Strava OAuth 2.0

## 🚀 Quick Start

```bash
git clone https://github.com/zxu28/runningmetric.git
cd runningmetric
npm install
npm run dev
```

Visit `http://localhost:5173`

## 📊 Key Technical Highlights

- **GPX Parsing**: Custom parser with Haversine distance calculation, pause detection, GPS error filtering, and per-mile splits
- **Strava Integration**: OAuth 2.0 flow with token refresh, pagination, and rate limit management
- **State Management**: React Context API for global state with localStorage persistence
- **Performance Optimization**: GPS point density reduction, selective CSS transitions, GPU-accelerated animations
- **Data Export**: Client-side PDF/image/HTML generation with embedded photos and achievements

## 📝 GPX Support

Supports standard GPX files from:
- Garmin devices
- Strava exports
- Apple Health exports
- Any GPS tracking app

## 🔐 Privacy & Security

- All data processed locally in the browser
- No cloud storage or data transmission
- Strava OAuth uses secure token-based authentication
- Data stored in browser localStorage (can be cleared anytime)

## 📄 License

MIT License - see [LICENSE](LICENSE) file.

---

**Built with ❤️ for runners who want to understand their data better**
