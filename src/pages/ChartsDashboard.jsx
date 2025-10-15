import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../firebase'
import { addRunForUser, deleteRun, listRunsForUser } from '../services/runsApi'
import UploadPanel from '../components/UploadPanel'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export default function ChartsDashboard() {
  const [user, setUser] = useState(null)
  const [runs, setRuns] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
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
      if (!user) return
      setLoading(true)
      const data = await listRunsForUser(user.uid)
      setRuns(data)
      setLoading(false)
    }
    load()
  }, [user])

  async function handleSave(summary) {
    const saved = await addRunForUser(user.uid, summary)
    setRuns((prev) => [...prev, saved])
  }

  async function handleDelete(id) {
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
    <div className="p-6 space-y-6">
      <UploadPanel onSave={handleSave} />

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4">
          <div className="font-semibold mb-2">Summary</div>
          {loading ? (
            <div>Loading runs...</div>
          ) : runs.length === 0 ? (
            <div>No runs yet. Upload a GPX to get started.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div><div className="text-xs uppercase opacity-70">Total Runs</div><div className="font-semibold">{totals.totalRuns}</div></div>
              <div><div className="text-xs uppercase opacity-70">Total Distance</div><div className="font-semibold">{totals.totalDistanceKm.toFixed(2)} km</div></div>
              <div><div className="text-xs uppercase opacity-70">Avg Pace</div><div className="font-semibold">{totals.avgPaceLabel}</div></div>
              <div><div className="text-xs uppercase opacity-70">Elevation Gain</div><div className="font-semibold">{totals.totalElev} m</div></div>
            </div>
          )}
        </div>

        <div className="border rounded p-4">
          <div className="font-semibold mb-2">Saved Runs</div>
          {loading ? (
            <div>Loading...</div>
          ) : runs.length === 0 ? (
            <div>No runs saved.</div>
          ) : (
            <ul className="space-y-2">
              {runs.map(r => (
                <li key={r.id} className="flex items-center justify-between border rounded p-2">
                  <span>{(r.distance/1000).toFixed(2)} km · {new Date(r.date || Date.now()).toLocaleDateString()}</span>
                  <button className="px-2 py-1 border rounded" onClick={()=>handleDelete(r.id)}>Delete</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="border rounded p-4 h-80">
          <div className="font-semibold mb-2">Pace vs Distance</div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={paceVsDistance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="distance" unit=" km" />
              <YAxis dataKey="pace" unit=" min/km" />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="pace" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="border rounded p-4 h-80">
          <div className="font-semibold mb-2">Elevation over Time</div>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={elevationSeries}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis unit=" m" />
              <Tooltip />
              <Area type="monotone" dataKey="elevation" stroke="#82ca9d" fill="#82ca9d" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="border rounded p-4 h-80">
        <div className="font-semibold mb-2">Weekly Mileage</div>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyMileage}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="week" />
            <YAxis unit=" km" />
            <Tooltip />
            <Bar dataKey="km" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}


