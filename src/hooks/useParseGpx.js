import { useCallback, useMemo, useState } from 'react'
import GpxParser from 'gpxparser'

function haversineMeters(a, b) {
  const R = 6371000
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function useParseGpx() {
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')
  const [isParsing, setIsParsing] = useState(false)

  const parseFile = useCallback(async (file) => {
    setError('')
    setSummary(null)
    if (!file) return
    try {
      setIsParsing(true)
      const text = await file.text()
      const gpx = new GpxParser()
      gpx.parse(text)
      const points = (gpx.tracks?.[0]?.segments?.[0] || [])
      if (!points.length) throw new Error('No track points found')

      let distance = 0
      let elevationGain = 0
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1]
        const curr = points[i]
        distance += haversineMeters(prev, curr)
        const deltaEle = (curr?.ele ?? 0) - (prev?.ele ?? 0)
        if (deltaEle > 0) elevationGain += deltaEle
      }

      const start = new Date(points[0].time)
      const end = new Date(points[points.length - 1].time)
      const durationSec = Math.max(0, (end - start) / 1000)

      const km = distance / 1000
      const paceMinPerKm = km > 0 ? (durationSec / 60) / km : 0

      const s = {
        distanceMeters: Math.round(distance),
        durationSec: Math.round(durationSec),
        paceMinPerKm,
        elevationGain: Math.round(elevationGain),
        date: start.toISOString(),
      }
      setSummary(s)
    } catch (e) {
      setError(e.message || 'Failed to parse GPX')
    } finally {
      setIsParsing(false)
    }
  }, [])

  const paceLabel = useMemo(() => {
    if (!summary) return ''
    const mins = Math.floor(summary.paceMinPerKm)
    const secs = Math.round((summary.paceMinPerKm - mins) * 60)
    return `${mins}:${String(secs).padStart(2, '0')} /km`
  }, [summary])

  return { summary, error, isParsing, parseFile, paceLabel }
}


