const STORAGE_KEY = 'runningmetrics_runs'

export function saveRunLocal(run) {
  const runs = getRunsLocal()
  const newRun = {
    id: `run-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
}

export function getRunsLocal() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return stored ? JSON.parse(stored) : []
}

export function deleteRunLocal(runId) {
  const runs = getRunsLocal()
  const filtered = runs.filter(r => r.id !== runId)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered))
}
