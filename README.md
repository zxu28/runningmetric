# 🏃‍♂️ RunningMetrics - Live Demo

A modern React web application for analyzing running data from GPX files. Upload your running data and visualize your performance with beautiful charts and statistics.

## 🚀 Live Demo

**👉 [View Live Demo](https://your-username.github.io/runningmetrics/)**

The live demo showcases the app with sample data, allowing you to explore all features without authentication.

## ✨ Features

- **📁 GPX File Upload**: Upload GPX files from any running app (Strava, Garmin, etc.)
- **📊 Interactive Charts**: Visualize pace, distance, elevation, and weekly mileage
- **📈 Running Statistics**: Track total runs, distance, average pace, and elevation gain
- **🎯 Demo Mode**: Explore the app with sample data
- **🔐 User Authentication**: Firebase authentication with Google sign-in
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, intuitive interface with smooth animations

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Tailwind CSS
- **Charts**: Recharts
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **GPX Parsing**: gpxparser
- **Deployment**: GitHub Pages

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

3. **Set up Firebase (Optional)**
   
   For full functionality, set up a Firebase project:
   
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication (Email/Password and Google)
   - Create a Firestore database
   - Copy your Firebase config to `.env.local`:
   ```env
   VITE_FIREBASE_API_KEY=your_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎯 Demo Mode

The app automatically runs in demo mode when no Firebase configuration is provided. Demo mode includes:

- Sample running data (5 runs with realistic metrics)
- All chart visualizations
- GPX file upload functionality (saves locally)
- No authentication required

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

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── UploadPanel.jsx  # GPX file upload component
├── data/               # Demo data and sample files
│   └── demoData.js     # Sample running data
├── hooks/              # Custom React hooks
│   └── useParseGpx.js  # GPX parsing logic
├── pages/              # Page components
│   └── ChartsDashboard.jsx # Main dashboard
├── services/           # API and external services
│   └── runsApi.js      # Firebase operations
├── App.jsx             # Main app component
└── firebase.js         # Firebase configuration
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
