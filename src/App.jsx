import { useEffect, useState, createContext, useContext } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import ChartsDashboard from './pages/ChartsDashboard'
import { onAuthStateChanged, signOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth'
import { auth, googleProvider } from './firebase'
import './App.css'

const AuthContext = createContext(null)

function useAuth() {
  return useContext(AuthContext)
}

function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setIsChecking(false)
    })
    return () => unsub()
  }, [])

  return (
    <AuthContext.Provider value={{ user }}>
      {isChecking ? <div className="p-6 text-center">Loading...</div> : children}
    </AuthContext.Provider>
  )
}

function ProtectedRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function Navbar() {
  const { user } = useAuth()
  return (
    <nav className="p-4 border-b flex items-center justify-between">
      <div className="flex gap-4 items-center">
        <Link to="/dashboard" className="font-semibold">RunningMetrics</Link>
      </div>
      <div className="flex gap-3 items-center">
        {user?.email && <span className="text-sm opacity-80">{user.email}</span>}
        <button onClick={() => signOut(auth)} className="px-3 py-1 border rounded">Logout</button>
      </div>
    </nav>
  )
}

function LoginPage() {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={handleEmailLogin} className="w-full max-w-sm space-y-3">
        <h1 className="text-xl font-semibold">Login</h1>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
        <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" className="w-full border p-2 rounded" />
        <button type="submit" className="w-full border rounded p-2">Sign in / Sign up</button>
        <button type="button" onClick={handleGoogle} className="w-full border rounded p-2">Continue with Google</button>
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
