const STORAGE_KEY = 'runningmetrics_runs'

export function saveRunLocal(run) {
  try {
    const runs = getRunsLocal()
    const newRun = {
      id: `run-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
      distance: run.distanceMeters,
      time: run.durationSec,
      pace: run.paceMinPerKm,
      elevation: run.elevationGain,
      date: run.date,
      createdAt: new Date().toISOString(),
    }
    runs.push(newRun)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(runs))
    return newRun
  } catch (error) {
    console.error('Error saving run to localStorage:', error)
    return null
  }
}

export function getRunsLocal() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error('Error reading runs from localStorage:', error)
    return []
  }
}

export function deleteRunLocal(runId) {
  try {
    const runs = getRunsLocal()
    const filtered = runs.filter(r => r.id !== runId)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
  } catch (error) {
    console.error('Error deleting run from localStorage:', error)
  }
}
