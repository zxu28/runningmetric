# 🏃‍♂️ Mini Strava Analyzer

A modern React + TypeScript application for analyzing running data from GPX files. Upload your running data and visualize your performance with beautiful charts and insights.

## 🚀 Live App

**👉 [View Live App](https://zxu28.github.io/runningmetric/)**

Upload your GPX files and analyze your running data with privacy-first local storage.

## ✨ Features

- **📁 GPX File Upload**: Upload GPX files from any running app (Strava, Garmin, etc.)
- **📊 Interactive Charts**: Visualize pace, distance, elevation, and performance trends
- **📈 Running Statistics**: Track total runs, distance, average pace, and elevation gain
- **🔒 Privacy-First**: Your data stays in your browser - no cloud storage required
- **💾 Local Storage**: Data persists across sessions on your device
- **📱 Responsive Design**: Works perfectly on desktop and mobile devices
- **🎨 Modern UI**: Beautiful, intuitive interface with smooth animations
- **⚡ TypeScript**: Full type safety and better development experience

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Animations**: Framer Motion
- **File Processing**: Papa Parse
- **Routing**: React Router DOM
- **Storage**: Browser localStorage (privacy-first)
- **Deployment**: GitHub Pages

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zxu28/runningmetric.git
   cd runningmetric
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
- **Duration**: Run time in hours, minutes, and seconds
- **Pace**: Average pace per kilometer
- **Elevation**: Elevation gain in meters
- **Date**: Run date and time

## 🚀 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.tsx      # Navigation component
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── Upload.tsx      # File upload page
│   └── Analysis.tsx    # Data analysis page
├── utils/              # Utility functions
│   └── gpxParser.ts    # GPX file parsing logic
├── assets/             # Static assets
├── App.tsx             # Main app component
├── main.tsx            # Entry point
├── index.css           # Global styles
└── vite-env.d.ts       # TypeScript definitions
```

## 🚀 Deployment

### GitHub Pages

The app is configured for automatic deployment to GitHub Pages:

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy
3. Your app will be available at `https://zxu28.github.io/runningmetric/`

### Manual Build

```bash
npm run build
```

The built files will be in the `dist` directory.

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
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Framer Motion](https://www.framer.com/motion/) for animations
- [Vite](https://vitejs.dev/) for fast development and building
- [React](https://react.dev/) for the amazing framework

---

Made with ❤️ for runners and data enthusiasts
