import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { addRunForUser, deleteRun, listRunsForUser } from '../services/runsApi'
import UploadPanel from '../components/UploadPanel'
import { demoRuns } from '../data/demoData'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function ChartsDashboard() {
  const [user, setUser] = useState(null)
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Check if we're in demo mode
    const isDemoMode = !import.meta.env.VITE_FIREBASE_API_KEY || 
                      import.meta.env.VITE_DEMO_MODE === 'true'
    
    if (isDemoMode) {
      setDemoMode(true)
      setUser({ uid: 'demo-user', email: 'demo@runningmetrics.com' })
      setRuns(demoRuns)
      setLoading(false)
      return
    }

    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      if (!u) {
        navigate('/login')
      }
    })
    return () => unsub()
  }, [navigate])

  useEffect(() => {
    async function load() {
      if (!user || demoMode) return
      setLoading(true)
      const data = await listRunsForUser(user.uid)
      setRuns(data)
      setLoading(false)
    }
    load()
  }, [user, demoMode])

  async function handleSave(summary) {
    if (demoMode) {
      // In demo mode, just add to local state
      const newRun = {
        id: `demo-${Date.now()}`,
        distance: summary.distanceMeters,
        time: summary.durationSec,
        pace: summary.paceMinPerKm,
        elevation: summary.elevationGain,
        date: summary.date,
      }
      setRuns((prev) => [...prev, newRun])
      return
    }
    
    const saved = await addRunForUser(user.uid, summary)
    setRuns((prev) => [...prev, saved])
  }

  async function handleDelete(id) {
    if (demoMode) {
      // In demo mode, just remove from local state
      setRuns((prev) => prev.filter(r => r.id !== id))
      return
    }
    
    await deleteRun(user.uid, id)
    setRuns((prev) => prev.filter(r => r.id !== id))
  }

  const paceVsDistance = useMemo(() => runs.map(r => ({ distance: r.distance / 1000, pace: r.pace })), [runs])
  const elevationSeries = useMemo(() => runs.map(r => ({ date: r.date?.slice(0,10), elevation: r.elevation })), [runs])
  const weeklyMileage = useMemo(() => {
    const byWeek = new Map()
    for (const r of runs) {
      const d = new Date(r.date || Date.now())
      const key = `${d.getUTCFullYear()}-W${Math.ceil((d.getUTCDate() + 6 - (d.getUTCDay() || 7)) / 7)}`
      byWeek.set(key, (byWeek.get(key) || 0) + (r.distance / 1000))
    }
    return Array.from(byWeek.entries()).map(([week, km]) => ({ week, km }))
  }, [runs])

  const totals = useMemo(() => {
    const totalRuns = runs.length
    const totalDistanceKm = runs.reduce((s, r) => s + r.distance / 1000, 0)
    const avgPace = runs.length ? runs.reduce((s, r) => s + r.pace, 0) / runs.length : 0
    const totalElev = runs.reduce((s, r) => s + (r.elevation || 0), 0)
    const mins = Math.floor(avgPace)
    const secs = Math.round((avgPace - mins) * 60)
    return { totalRuns, totalDistanceKm, totalElev, avgPaceLabel: `${mins}:${String(secs).padStart(2,'0')}/km` }
  }, [runs])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        {demoMode && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-lg shadow-lg fade-in">
            <div className="flex items-center gap-3">
              <div className="text-2xl">🎯</div>
              <div>
                <h3 className="font-bold text-lg">Demo Mode Active</h3>
                <p className="text-blue-100">You're viewing the app with sample data. Upload your own GPX files to see your real running metrics!</p>
              </div>
            </div>
          </div>
        )}

        <div className="fade-in">
          <UploadPanel onSave={handleSave} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">📊</div>
              <h2 className="text-xl font-bold text-gray-800">Running Summary</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : runs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">🏃‍♂️</div>
                <p>No runs yet. Upload a GPX to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div className="text-xs uppercase text-blue-600 font-semibold mb-1">Total Runs</div>
                  <div className="text-2xl font-bold text-blue-800">{totals.totalRuns}</div>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div className="text-xs uppercase text-green-600 font-semibold mb-1">Total Distance</div>
                  <div className="text-2xl font-bold text-green-800">{totals.totalDistanceKm.toFixed(2)} km</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div className="text-xs uppercase text-purple-600 font-semibold mb-1">Avg Pace</div>
                  <div className="text-2xl font-bold text-purple-800">{totals.avgPaceLabel}</div>
                </div>
                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <div className="text-xs uppercase text-orange-600 font-semibold mb-1">Elevation Gain</div>
                  <div className="text-2xl font-bold text-orange-800">{totals.totalElev} m</div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">🏃‍♀️</div>
              <h2 className="text-xl font-bold text-gray-800">Recent Runs</h2>
            </div>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : runs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No runs saved yet.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {runs.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-3 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="font-semibold text-gray-800">{(r.distance/1000).toFixed(2)} km</div>
                        <div className="text-sm text-gray-500">{new Date(r.date || Date.now()).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <button 
                      className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium" 
                      onClick={()=>handleDelete(r.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))}
                {runs.length > 5 && (
                  <div className="text-center text-sm text-gray-500 py-2">
                    +{runs.length - 5} more runs
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6 slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">⚡</div>
              <h2 className="text-xl font-bold text-gray-800">Pace vs Distance</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={paceVsDistance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="distance" 
                    unit=" km" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    dataKey="pace" 
                    unit=" min/km" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pace" 
                    stroke="#3b82f6" 
                    strokeWidth={3}
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-2xl">⛰️</div>
              <h2 className="text-xl font-bold text-gray-800">Elevation over Time</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={elevationSeries}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    unit=" m" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="elevation" 
                    stroke="#10b981" 
                    fill="#10b981" 
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 slide-up">
          <div className="flex items-center gap-3 mb-4">
            <div className="text-2xl">📈</div>
            <h2 className="text-xl font-bold text-gray-800">Weekly Mileage</h2>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyMileage}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="week" 
                  stroke="#666"
                  fontSize={12}
                />
                <YAxis 
                  unit=" km" 
                  stroke="#666"
                  fontSize={12}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar 
                  dataKey="km" 
                  fill="#8b5cf6" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}


