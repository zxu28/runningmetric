import React, { useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import L from 'leaflet'
import { GPXData } from '../utils/gpxParser'
import { extractCoordinates, calculateBounds } from '../utils/runHelpers'
import { getRunId } from '../utils/storyTypes'

// Fix Leaflet default marker icons
import icon from 'leaflet/dist/images/marker-icon.png'
import iconShadow from 'leaflet/dist/images/marker-shadow.png'

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
})

L.Marker.prototype.options.icon = DefaultIcon

interface StoryMapProps {
  runs: GPXData[]
  colorMode?: 'date' | 'mood' | 'pace'
  showMarkers?: boolean
  height?: string
  compact?: boolean
}

// Component to update map when bounds change
function MapUpdater({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap()
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const isUpdatingRef = useRef(false)
  
  useEffect(() => {
    if (boundsRef.current && boundsRef.current.equals(bounds)) {
      return
    }
    
    if (isUpdatingRef.current) {
      return
    }
    
    isUpdatingRef.current = true
    boundsRef.current = bounds
    
    requestAnimationFrame(() => {
      try {
        map.fitBounds(bounds, { 
          padding: [20, 20],
          animate: false
        })
      } catch (error) {
        console.warn('Map bounds update failed:', error)
      } finally {
        setTimeout(() => {
          isUpdatingRef.current = false
        }, 100)
      }
    })
  }, [bounds, map])
  
  return null
}

// Color palette for date-based coloring (chronological gradient)
const DATE_COLORS = [
  '#ef4444', // red (oldest)
  '#f97316', // orange
  '#eab308', // yellow
  '#84cc16', // lime
  '#22c55e', // green
  '#3b82f6', // blue
  '#6366f1', // indigo (newest)
]

// Get color for pace
function getColorForPace(pace: number): string {
  if (pace === 0) return '#9ca3af'
  if (pace < 6) return '#ef4444'
  if (pace < 7) return '#f97316'
  if (pace < 8) return '#eab308'
  if (pace < 9) return '#84cc16'
  if (pace < 10) return '#22c55e'
  if (pace < 11) return '#3b82f6'
  return '#6366f1'
}

const StoryMap: React.FC<StoryMapProps> = ({ 
  runs, 
  colorMode = 'date', 
  showMarkers = true,
  height = '500px',
  compact = false
}) => {
  // Sort runs chronologically
  const sortedRuns = useMemo(() => {
    return [...runs].sort((a, b) => a.startTime.getTime() - b.startTime.getTime())
  }, [runs])

  // Combine all coordinates and calculate bounds
  const { allCoordinates, bounds, routeSegments, startPoint, endPoint } = useMemo(() => {
    const allCoords: [number, number][] = []
    const segments: Array<{ coords: [number, number][], color: string, run: GPXData }> = []

    // Sort runs by date for color coding
    sortedRuns.forEach((run, runIndex) => {
      const coords = extractCoordinates(run)
      if (coords.length === 0) return

      allCoords.push(...coords)

      // Determine color based on mode
      let color: string
      if (colorMode === 'date') {
        // Color by chronological order
        const colorIndex = Math.floor((runIndex / sortedRuns.length) * DATE_COLORS.length)
        color = DATE_COLORS[Math.min(colorIndex, DATE_COLORS.length - 1)]
      } else if (colorMode === 'mood') {
        // For mood mode, we'd need mood data from story context
        // For now, use a default color
        color = '#3b82f6'
      } else {
        // Pace mode - use average pace of run
        color = getColorForPace(run.avgPace)
      }

      segments.push({
        coords,
        color,
        run
      })
    })

    const calculatedBounds = calculateBounds(allCoords)
    const start = allCoords[0]
    const end = allCoords[allCoords.length - 1]

    return {
      allCoordinates: allCoords,
      bounds: calculatedBounds,
      routeSegments: segments,
      startPoint: start,
      endPoint: end
    }
  }, [sortedRuns, colorMode])

  const leafletBounds = useMemo(() => {
    if (!bounds || !Array.isArray(bounds) || bounds.length !== 2) return null
    return L.latLngBounds(bounds)
  }, [bounds])

  if (runs.length === 0 || allCoordinates.length === 0) {
    return (
      <div className={`bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 ${compact ? 'p-4' : ''}`}>
        <div className={`flex items-center justify-center ${compact ? 'h-48' : 'h-64'}`}>
          <div className="text-center text-earth-600">
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-sm">No GPS data available</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={`bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic ${compact ? 'p-4' : 'p-6'}`}
    >
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-earth-800">
            Story Route Map
          </h3>
          <div className="text-sm text-earth-600">
            {runs.length} {runs.length === 1 ? 'run' : 'runs'}
          </div>
        </div>
      )}

      {leafletBounds && (
        <MapContainer
          bounds={leafletBounds}
          style={{ height, width: '100%', zIndex: 1 }}
          scrollWheelZoom={true}
          attributionControl={true}
          key={`story-map-${runs.map(r => getRunId(r)).join('-')}`}
        >
          <MapUpdater bounds={leafletBounds} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            updateWhenZooming={false}
            updateWhenIdle={true}
          />

          {/* Render each run as a separate polyline */}
          {routeSegments.map((segment, index) => (
            <Polyline
              key={`segment-${index}-${getRunId(segment.run)}`}
              positions={segment.coords}
              color={segment.color}
              weight={compact ? 3 : 4}
              opacity={0.8}
            />
          ))}

          {/* Start marker */}
          {showMarkers && startPoint && (
            <Marker position={startPoint}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-sage-700">Start</div>
                  <div className="text-earth-600">{sortedRuns[0]?.fileName}</div>
                  <div className="text-xs text-earth-500">
                    {sortedRuns[0]?.startTime.toLocaleDateString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}

          {/* End marker */}
          {showMarkers && endPoint && sortedRuns.length > 0 && (
            <Marker position={endPoint}>
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold text-terracotta-700">End</div>
                  <div className="text-earth-600">{sortedRuns[sortedRuns.length - 1]?.fileName}</div>
                  <div className="text-xs text-earth-500">
                    {sortedRuns[sortedRuns.length - 1]?.startTime.toLocaleDateString()}
                  </div>
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      )}

      {/* Legend */}
      {!compact && colorMode === 'date' && runs.length > 1 && (
        <div className="mt-4 flex items-center gap-2 text-xs text-earth-600">
          <span>Color gradient:</span>
          <div className="flex items-center gap-1">
            {DATE_COLORS.map((color, index) => (
              <div
                key={index}
                className="w-4 h-4 rounded"
                style={{ backgroundColor: color }}
                title={index === 0 ? 'Oldest' : index === DATE_COLORS.length - 1 ? 'Newest' : ''}
              />
            ))}
          </div>
          <span className="ml-2">Oldest → Newest</span>
        </div>
      )}
    </motion.div>
  )
}

export default StoryMap

