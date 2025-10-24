#  Mini Strava Analyzer

A modern, privacy-first web application for analyzing running data from GPX files. Upload your GPS tracking data and get beautiful insights about your running performance - all processed locally in your browser.

![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-blue?style=flat-square&logo=typescript)

>  **Note**: encountering configuration problems and bad request error currently. The Strava OAuth does not work currently.

##  Features

- ** GPX File Upload**: Drag & drop multiple GPX files with validation
- ** Strava Integration**: Connect to Strava and sync your running activities
- ** Data Analysis**: Distance, pace, elevation, and duration calculations
- ** Privacy-First**: All data stays in your browser - no cloud storage
- ** Modern UI**: Responsive design with smooth animations
- ** Visualizations**: Summary stats, recent runs, and performance charts
- ** Running Calendar**: Visual calendar showing your running history
- ** Interactive Maps**: Route visualization with Leaflet maps
- ** Best Efforts Tracking**: Personal records for 1 mile, 5K, 10K, and longest run
- ** Run Comparison**: Side-by-side comparison of different runs

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
│   ├── RunMap.tsx             # Interactive route maps
│   ├── BestEffortsGrid.tsx    # Personal records display
│   ├── RunComparison.tsx      # Run comparison modal
│   └── StravaConnectButton.tsx # Strava OAuth integration
├── contexts/           # React context providers
│   └── DataContext.tsx # Global state management
├── pages/              # Main application pages
│   ├── Home.tsx        # Landing page
│   ├── Upload.tsx      # File upload interface
│   ├── Analysis.tsx    # Data analysis dashboard
│   └── StravaCallback.tsx # Strava OAuth callback handler
├── services/           # External API services
│   └── stravaService.ts # Strava OAuth and API integration
├── utils/              # Utility functions
│   ├── gpxParser.ts    # GPX parsing and calculations
│   ├── runHelpers.ts   # Run data manipulation
│   ├── metrics.ts      # Best efforts calculations
│   ├── trendAnalysis.ts # Weekly/monthly trend analysis
│   ├── localStorage.ts  # Data persistence utilities
│   └── stravaConverter.ts # Strava data conversion
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

##  Deployment

Automatically deployed to GitHub Pages on push to `main` branch.

## License

MIT License - see [LICENSE](LICENSE) file.

---

