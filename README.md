# 🏃‍♂️ RunningMetrics

A modern React web application for analyzing running data from GPX files. Upload your running data and visualize your performance with beautiful charts and statistics.

## 🚀 Live App

**👉 [View Live App](https://zxu28.github.io/runningmetric/)**

Upload your GPX files and analyze your running data with privacy-first local storage.

## ✨ Features

- **📁 GPX File Upload**: Upload GPX files from any running app (Strava, Garmin, etc.)
- **📊 Interactive Charts**: Visualize pace, distance, elevation, and weekly mileage
- **📈 Running Statistics**: Track total runs, distance, average pace, and elevation gain
- **🔒 Privacy-First**: Your data stays in your browser - no cloud storage required
- **💾 Local Storage**: Data persists across sessions on your device
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Charts**: Recharts
- **Storage**: Browser localStorage (privacy-first)
- **GPX Parsing**: gpxparser
- **Deployment**: GitHub Pages
- **Future**: Firebase integration available for cloud sync

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/runningmetrics.git
   cd runningmetrics
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔒 Privacy & Data Storage

The app uses browser localStorage to store your running data:

- **No cloud storage**: Your data never leaves your device
- **Persistent**: Data survives browser restarts and page refreshes
- **Private**: No tracking, no analytics, no data collection
- **Portable**: Data is stored locally and can be exported if needed

## 📊 Supported GPX Data

The app extracts and visualizes:

- **Distance**: Total run distance in kilometers
- **Duration**: Run time in minutes and seconds
- **Pace**: Average pace per kilometer
- **Elevation**: Elevation gain in meters
- **Date**: Run date and time

## 🚀 Deployment

### GitHub Pages

The app is configured for automatic deployment to GitHub Pages:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your app will be available at `https://your-username.github.io/runningmetrics/`

### Manual Build

```bash
npm run build
```

The built files will be in the `dist` directory.

### Firebase Integration (Optional)

For future cloud sync capabilities, you can set up Firebase:

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication and Firestore
3. Add your Firebase config to `.env.local`
4. The app will automatically use Firebase for data persistence when configured

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── UploadPanel.jsx  # GPX file upload component
├── hooks/              # Custom React hooks
│   └── useParseGpx.js  # GPX parsing logic
├── pages/              # Page components
│   └── ChartsDashboard.jsx # Main dashboard
├── services/           # API and external services
│   ├── localStorageApi.js # Local storage operations
│   └── runsApi.js      # Firebase operations (future)
├── App.jsx             # Main app component
└── firebase.js         # Firebase configuration (future)
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Recharts](https://recharts.org/) for beautiful chart components
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Vite](https://vitejs.dev/) for fast development and building

---

Made with ❤️ for runners and data enthusiasts
