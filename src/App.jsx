import { createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import ChartsDashboard from './pages/ChartsDashboard'
import './App.css'

const AuthContext = createContext(null)

function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  // Simplified context for future Firebase integration
  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
}

function Navbar() {
  return (
    <nav className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
      <div className="flex gap-4 items-center">
        <Link to="/dashboard" className="font-bold text-xl text-blue-600">🏃‍♂️ RunningMetrics</Link>
      </div>
    </nav>
  )
}

function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">🏃‍♂️ RunningMetrics</h1>
          <p className="text-gray-600">Analyze your running data from GPX files. Upload your runs and visualize your performance with beautiful charts and statistics.</p>
        </div>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Features:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Upload and analyze GPX files from any running app</li>
              <li>• View running statistics and interactive charts</li>
              <li>• Track pace, distance, elevation, and weekly mileage</li>
              <li>• Your data stays private in your browser</li>
            </ul>
          </div>
          <Link 
            to="/dashboard" 
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center"
          >
            Start Analyzing Your Runs
          </Link>
        </div>
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <div className="p-6">
      <h2 className="text-lg font-semibold mb-2">Dashboard</h2>
      <p>Welcome! Upload runs and view charts.</p>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/dashboard" element={<ChartsDashboard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
