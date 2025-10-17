#  Mini Strava Analyzer

A modern, privacy-first web application for analyzing running data from GPX files. Upload your GPS tracking data and get beautiful insights about your running performance - all processed locally in your browser.

![GitHub Pages](https://img.shields.io/badge/Deployed%20on-GitHub%20Pages-blue?style=flat-square)
![React](https://img.shields.io/badge/React-18.2.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2.0-blue?style=flat-square&logo=typescript)

>  **Note**: Currently working on fixing GitHub Pages routing to prevent 404 errors on direct links. The site may show 404s when accessing routes directly until this is resolved.

##  Features

- ** GPX File Upload**: Drag & drop multiple GPX files with validation
- ** Data Analysis**: Distance, pace, elevation, and duration calculations
- ** Privacy-First**: All data stays in your browser - no cloud storage
- ** Modern UI**: Responsive design with smooth animations
- ** Visualizations**: Summary stats, recent runs, and performance charts

##  Live Website

**[https://zxu28.github.io/runningmetric/](https://zxu28.github.io/runningmetric/)**

## 🛠️ Tech Stack

- **Frontend**: React 18.2.0 + TypeScript
- **Build**: Vite 5.0.0
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Deployment**: GitHub Pages

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Navbar.tsx      # Navigation component
├── contexts/           # React context providers
│   └── DataContext.tsx # Global state management
├── pages/              # Main application pages
│   ├── Home.tsx        # Landing page
│   ├── Upload.tsx      # File upload interface
│   └── Analysis.tsx    # Data analysis dashboard
├── utils/              # Utility functions
│   └── gpxParser.ts    # GPX parsing and calculations
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

##  Deployment

Automatically deployed to GitHub Pages on push to `main` branch.

## License

MIT License - see [LICENSE](LICENSE) file.

---

