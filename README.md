#  Mini Strava Analyzer

A modern, privacy-first web application for analyzing running data from GPX files. Upload your GPS tracking data and get beautiful insights about your running performance - all processed locally in your browser.

![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-blue?style=flat-square&logo=typescript)

>  

##  Features

- ** GPX File Upload**: Drag & drop multiple GPX files with validation
- ** Strava Integration**: Connect to Strava and sync your running activities with real-time progress tracking
- ** Data Analysis**: Distance, pace, elevation, and duration calculations
- ** Privacy-First**: All data stays in your browser - no cloud storage
- ** Modern UI**: Responsive design with smooth animations
- ** Visualizations**: Summary stats, recent runs, and performance charts
- ** Running Calendar**: Visual calendar showing your running history
- ** Enhanced Interactive Maps**: 
  - Color-coded route visualization by pace zones
  - Elevation profile with toggle
  - Interactive tooltips showing elevation, pace, and time at any point
  - Route heatmap visualization
- ** Run Tagging & Notes**: 
  - Add custom tags to organize runs (Race, Trail, Tempo, etc.)
  - Add personal notes to each run
  - Filter runs by tags
- ** Advanced Filtering**: 
  - Filter by year, month, tags, or search query
  - Multiple filters work simultaneously
  - Smart filter clearing
  - Delete buttons for selected filters (tags, years, months)
  - Custom filter tag management with delete functionality
- ** Best Efforts Tracking**: Personal records for 1 mile, 5K, 10K, and longest run
- ** Run Comparison**: Side-by-side comparison of different runs
- ** Progress Tracking**: Real-time sync progress with activity names and stages
- ** Smart Storage**: Automatic data optimization to prevent localStorage quota issues
- ** Running Stories**: 
  - Combine multiple runs into narrative stories with emotional context
  - Visual timeline and calendar views
  - Story insights and achievements
  - Photo attachments for stories
  - Story templates for quick creation
  - Export stories as PDF, image, or HTML

##  Live Website

**[https://zxu28.github.io/runningmetric/](https://zxu28.github.io/runningmetric/)**

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0 + TypeScript
- **Build**: Vite 5.0.0
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Maps**: React Leaflet
- **Calendar**: React Calendar
- **Deployment**: GitHub Pages
- **API Integration**: Strava OAuth 2.0

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navbar.tsx      # Navigation component
│   ├── PacePerMileChart.tsx    # Per-mile pace visualization
│   ├── ElevationChart.tsx      # Elevation profile chart
│   ├── RunCalendar.tsx         # Running calendar
│   ├── RunMap.tsx             # Enhanced interactive route maps with pace visualization
│   ├── RunDetails.tsx         # Run details panel with tags and notes
│   ├── TagManager.tsx         # Tag and notes management component
│   ├── SyncProgress.tsx        # Real-time sync progress indicator
│   ├── BestEffortsGrid.tsx    # Personal records display
│   ├── RunComparison.tsx      # Run comparison modal
│   ├── StravaConnectButton.tsx # Strava OAuth integration with progress tracking
│   ├── StoryModal.tsx         # Story creation/edit modal
│   ├── StoryCard.tsx          # Story summary card
│   ├── StoryTimeline.tsx      # Story timeline view
│   ├── StoryCalendar.tsx      # Story calendar view
│   ├── StoryDetails.tsx       # Story detail view with map and insights
│   ├── StoryMap.tsx           # Combined map for story runs
│   ├── RunSelector.tsx        # Run selection component
│   ├── PhotoUpload.tsx        # Photo upload component
│   ├── PhotoGallery.tsx       # Photo gallery component
│   └── TemplateSelector.tsx   # Story template selector
├── contexts/           # React context providers
│   ├── DataContext.tsx # Global state management with updateRun and storage optimization
│   └── StoriesContext.tsx # Story management context
├── pages/              # Main application pages
│   ├── Home.tsx        # Landing page
│   ├── Upload.tsx      # File upload interface with enhanced sync
│   ├── Analysis.tsx     # Data analysis dashboard with advanced filtering
│   ├── Stories.tsx     # Running Stories page
│   └── StravaCallback.tsx # Strava OAuth callback handler
├── services/           # External API services
│   └── stravaService.ts # Strava OAuth and API integration
├── utils/              # Utility functions
│   ├── gpxParser.ts    # GPX parsing and calculations (with tags/notes support)
│   ├── runHelpers.ts   # Run data manipulation
│   ├── metrics.ts      # Best efforts calculations
│   ├── trendAnalysis.ts # Weekly/monthly trend analysis
│   ├── localStorage.ts  # Data persistence utilities
│   ├── stravaConverter.ts # Strava data conversion
│   ├── storyTypes.ts   # Story type definitions
│   ├── storyStorage.ts # Story localStorage utilities
│   ├── storyInsights.ts # Story insights generation
│   ├── storyTemplates.ts # Story templates
│   ├── storyExport.ts  # Story export utilities (PDF, image, HTML)
│   └── photoStorage.ts # Photo handling utilities
├── hooks/              # Custom React hooks
│   └── useBestEfforts.ts # Best efforts state management
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

## 🏃‍♂️ Quick Start

```bash
git clone https://github.com/zxu28/runningmetric.git
cd runningmetric
npm install
npm run dev
```

Visit `http://localhost:5173`

##  GPX Support

Supports standard GPX files from:
- Garmin devices
- Strava exports  
- Apple Health exports
- Any GPS tracking app

## 🔧 Troubleshooting

### Strava OAuth "Bad Request" Error

If you encounter a `400 Bad Request: invalid client_id` error when trying to connect to Strava:

**Problem**: The redirect URI in GitHub secrets contains a trailing newline character (`\n`).

**Solution**:
1. Go to your GitHub repository settings: `Settings` > `Secrets and variables` > `Actions`
2. Find the `VITE_STRAVA_REDIRECT_URI` secret
3. Click "Update secret"
4. Enter exactly: `https://zxu28.github.io/runningmetric/strava-callback`
   - **No spaces or newlines at the end!**
5. Save the secret
6. Wait for the next deployment (~2-3 minutes)

**Verification**: Check the browser console on the live site for:
```
[Strava] Environment check: {
  hasClientId: true,
  hasClientSecret: true,
  redirectUri: "https://zxu28.github.io/runningmetric/strava-callback",
  clientIdLength: 6
}
```

### Rate Limiting

Strava API has rate limits:
- **Write Operations**: 100 requests per hour
- **Read Operations**: 1,000 requests per hour

If you hit the limit, wait 1 hour for the quota to reset.

## ✨ Recent Updates & Improvements

### 🆕 New Features

1. **Enhanced Interactive Maps**
   - Color-coded routes by pace zones (red=faster, blue=slower)
   - Elevation profile toggle
   - Interactive tooltips showing elevation, pace, and timestamp on hover
   - Performance optimized for large routes

2. **Run Tagging System**
   - Add custom tags to organize runs (Race, Trail, Tempo, Long Run, etc.)
   - Add personal notes to each run
   - Filter runs by tags
   - Predefined tags with custom tag support

3. **Advanced Filtering**
   - Filter by year, month, tags, or search query
   - Multiple filters work simultaneously
   - Month filtering for precise date-based searches
   - Smart filter clearing

4. **Real-Time Progress Tracking**
   - Visual progress indicator during Strava sync
   - Shows fetching/processing/saving stages
   - Displays current activity being processed
   - Progress bar with percentage and counts

5. **Running Stories Feature**
   - Combine multiple runs into narrative stories
   - Add emotional context with mood tags and notes
   - Visual timeline and calendar views
   - Story insights and achievements (longest distance, highest elevation, etc.)
   - Photo attachments for stories
   - Story templates for quick creation (Marathon Training, Race Prep, etc.)
   - Export stories as PDF, image, or HTML
   - Combined map visualization showing all runs in a story
   - Stories persist across browser sessions

6. **Enhanced Filter Management**
   - Delete buttons for custom filter tags
   - Remove selected filters directly from filter buttons
   - Clear distinction between custom tags and run tags
   - Smart tag deletion (only delete custom tags that don't exist on runs)

### 🐛 Issues Solved

1. **Slow Sync Performance**
   - ✅ Added rate limiting (250ms delay between requests)
   - ✅ Early duplicate detection to skip already-synced activities
   - ✅ Optimized API call sequence

2. **Duplicate Prevention**
   - ✅ Three-layer duplicate prevention system
   - ✅ Early filtering before processing
   - ✅ Final check before adding to storage
   - ✅ Data layer filtering in `addParsedData`

3. **localStorage Quota Issues**
   - ✅ Automatic data optimization (reduces GPS points for old runs)
   - ✅ Smart quota management with warnings
   - ✅ Automatic retry with further optimization if quota exceeded
   - ✅ Better error messages with actionable steps

4. **Loading Experience**
   - ✅ Real-time progress updates instead of "zero activities" message
   - ✅ Visual progress indicator with stages
   - ✅ Activity names shown during processing
   - ✅ Clear status messages

5. **Filter Tag Management**
   - ✅ Fixed custom tag deletion issue
   - ✅ Smart detection: tags that exist in both custom filters and runs cannot be deleted (they're managed by runs)
   - ✅ Visual indicators: "(custom)" for custom-only tags, "(custom+run)" for tags in both
   - ✅ Delete buttons only appear for tags that can actually be deleted
   - ✅ Improved tag normalization and whitespace handling
   - ✅ Case-insensitive tag matching
   - ✅ Immediate localStorage updates for tag changes

6. **Story Persistence**
   - ✅ Stories automatically save to localStorage
   - ✅ Stories persist across page refreshes and browser sessions
   - ✅ Fixed duplicate "Create Story" button issue
   - ✅ Proper story loading on page mount

### 📁 New Files

- `src/components/SyncProgress.tsx` - Real-time sync progress component
- `src/components/TagManager.tsx` - Tag and notes management component
- `src/components/StoryModal.tsx` - Story creation/edit modal
- `src/components/StoryCard.tsx` - Story summary card component
- `src/components/StoryTimeline.tsx` - Story timeline view component
- `src/components/StoryCalendar.tsx` - Story calendar view component
- `src/components/StoryDetails.tsx` - Story detail view with map and insights
- `src/components/StoryMap.tsx` - Combined map visualization for story runs
- `src/components/RunSelector.tsx` - Run selection component for stories
- `src/components/PhotoUpload.tsx` - Photo upload component
- `src/components/PhotoGallery.tsx` - Photo gallery component
- `src/components/TemplateSelector.tsx` - Story template selector
- `src/contexts/StoriesContext.tsx` - Story management context
- `src/pages/Stories.tsx` - Running Stories page
- `src/utils/storyTypes.ts` - Story type definitions
- `src/utils/storyStorage.ts` - Story localStorage utilities
- `src/utils/storyInsights.ts` - Story insights generation
- `src/utils/storyTemplates.ts` - Story templates
- `src/utils/storyExport.ts` - Story export utilities (PDF, image, HTML)
- `src/utils/photoStorage.ts` - Photo handling utilities

### 🔄 Enhanced Files

- `src/components/RunMap.tsx` - Added color-coded pace visualization and interactive tooltips
- `src/components/RunDetails.tsx` - Added tag and notes display/editing
- `src/components/StravaConnectButton.tsx` - Added progress tracking integration
- `src/pages/Analysis.tsx` - Added year/month filtering, search, custom tag management, and delete buttons for filters
- `src/pages/Upload.tsx` - Added progress callbacks and improved sync flow
- `src/pages/Home.tsx` - Updated with organic theme styling
- `src/contexts/DataContext.tsx` - Added `updateRun` function and storage optimization
- `src/utils/gpxParser.ts` - Added `tags` and `notes` fields to `GPXData` interface
- `src/components/Navbar.tsx` - Added Stories navigation link
- `src/App.tsx` - Added Stories route and StoriesProvider

##  Deployment

Automatically deployed to GitHub Pages on push to `main` branch.

## License

MIT License - see [LICENSE](LICENSE) file.

---

