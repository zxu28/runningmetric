import { useEffect, useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import ChartsDashboard from './pages/ChartsDashboard'
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import { demoRuns } from './data/demoData'
import './App.css'

const AuthContext = createContext(null)

function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    // Check if we're in demo mode (no Firebase config or demo mode enabled)
    const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                      import.meta.env.VITE_DEMO_MODE === 'true'
    
    if (isDemoMode) {
      setDemoMode(true)
      setUser({ uid: 'demo-user', email: 'demo@runningmetrics.com' })
      setIsChecking(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setIsChecking(false)
    })
    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user, demoMode }}>
      {isChecking ? <div className="p-6 text-center">Loading...</div> : children}
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function Navbar() {
  const { user, demoMode } = useAuth()
  return (
    <nav className="p-4 border-b flex items-center justify-between bg-white shadow-sm">
      <div className="flex gap-4 items-center">
        <Link to="/dashboard" className="font-bold text-xl text-blue-600">🏃‍♂️ RunningMetrics</Link>
        {demoMode && (
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium">
            DEMO MODE
          </span>
        )}
      </div>
      <div className="flex gap-3 items-center">
        {user?.email && <span className="text-sm opacity-80">{user.email}</span>}
        {!demoMode && (
          <button onClick={() => signOut(auth)} className="px-3 py-1 border rounded hover:bg-gray-50">
            Logout
          </button>
        )}
      </div>
    </nav>
  )
}

function LoginPage() {
  const { demoMode } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleEmailLogin(e) {
    e.preventDefault()
    setError('')
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      if (err?.code === 'auth/user-not-found') {
        try {
          await createUserWithEmailAndPassword(auth, email, password)
        } catch (e) {
          setError(e.message)
        }
      } else {
        setError(err.message)
      }
    }
  }

  async function handleGoogle() {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setError(err.message)
    }
  }

  if (demoMode) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">🏃‍♂️ RunningMetrics Demo</h1>
            <p className="text-gray-600">Welcome to the live demo! This showcases the running metrics app with sample data.</p>
          </div>
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">Demo Features:</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Upload and analyze GPX files</li>
                <li>• View running statistics and charts</li>
                <li>• Track pace, distance, and elevation</li>
                <li>• Weekly mileage visualization</li>
              </ul>
            </div>
            <Link 
              to="/dashboard" 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors block text-center"
            >
              Enter Demo Dashboard
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-indigo-100">
      <form onSubmit={handleEmailLogin} className="w-full max-w-sm bg-white rounded-lg shadow-lg p-8 space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-900">Login</h1>
        {error && <div className="text-red-600 text-sm bg-red-50 p-3 rounded">{error}</div>}
        <input 
          value={email} 
          onChange={(e)=>setEmail(e.target.value)} 
          placeholder="Email" 
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
        <input 
          type="password" 
          value={password} 
          onChange={(e)=>setPassword(e.target.value)} 
          placeholder="Password" 
          className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Sign in / Sign up
        </button>
        <button 
          type="button" 
          onClick={handleGoogle} 
          className="w-full border border-gray-300 py-3 px-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
        >
          Continue with Google
        </button>
      </form>
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
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><ChartsDashboard /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
