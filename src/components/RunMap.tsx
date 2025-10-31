import React, { useState, useEffect, useMemo, useRef } from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMap } from 'react-leaflet'
import { motion } from 'framer-motion'
import L from 'leaflet'
import { GPXData, GPXPoint } from '../utils/gpxParser'
import { extractCoordinates, calculateBounds } from '../utils/runHelpers'

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

interface RunMapProps {
  run: GPXData
}

// Component to update map when run changes - with debouncing to prevent shaking
function MapUpdater({ bounds }: { bounds: L.LatLngBounds }) {
  const map = useMap()
  const boundsRef = useRef<L.LatLngBounds | null>(null)
  const isUpdatingRef = useRef(false)
  
  useEffect(() => {
    // Only update if bounds have actually changed
    if (boundsRef.current && boundsRef.current.equals(bounds)) {
      return
    }
    
    // Prevent multiple simultaneous updates
    if (isUpdatingRef.current) {
      return
    }
    
    isUpdatingRef.current = true
    boundsRef.current = bounds
    
    // Use requestAnimationFrame to ensure map is ready
    requestAnimationFrame(() => {
      try {
        map.fitBounds(bounds, { 
          padding: [20, 20],
          animate: false // Disable animation to prevent shaking
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

// Custom hook to get pace/altitude at a point
function getPointData(points: GPXPoint[], index: number) {
  if (index < 0 || index >= points.length) return null
  
  const point = points[index]
  const elevation = point.elevation || 0
  
  // Calculate pace from previous point if available
  let pace = 0
  if (index > 0) {
    const prevPoint = points[index - 1]
    const distance = haversineDistance(prevPoint, point)
    const timeDiff = (point.time.getTime() - prevPoint.time.getTime()) / 1000 / 60 // minutes
    if (timeDiff > 0 && distance > 0) {
      pace = timeDiff / (distance / 1609.34) // min per mile
    }
  }
  
  return { elevation, pace, time: point.time, distance: index }
}

function haversineDistance(point1: GPXPoint, point2: GPXPoint): number {
  const R = 6371000 // Earth's radius in meters
  const dLat = (point2.lat - point1.lat) * Math.PI / 180
  const dLon = (point2.lon - point1.lon) * Math.PI / 180
  const lat1 = point1.lat * Math.PI / 180
  const lat2 = point2.lat * Math.PI / 180

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// Create color-coded polyline based on pace
function getColorForPace(pace: number): string {
  if (pace === 0) return '#9ca3af' // gray for no pace data
  if (pace < 6) return '#ef4444' // red - very fast
  if (pace < 7) return '#f97316' // orange - fast
  if (pace < 8) return '#eab308' // yellow - moderate-fast
  if (pace < 9) return '#84cc16' // lime - moderate
  if (pace < 10) return '#22c55e' // green - moderate-slow
  if (pace < 11) return '#3b82f6' // blue - slow
  return '#6366f1' // indigo - very slow
}

const RunMap: React.FC<RunMapProps> = ({ run }) => {
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  const [showElevationProfile, setShowElevationProfile] = useState(false)
  
  // Memoize calculations to prevent unnecessary re-renders
  const { allPoints, coordinates, bounds, startPoint, endPoint, paceSegments, elevationData } = useMemo(() => {
    // Get all points from tracks
    const points: GPXPoint[] = []
    run.tracks.forEach(track => {
      points.push(...track.points)
    })
    points.sort((a, b) => a.time.getTime() - b.time.getTime())
    
    const coords = extractCoordinates(run)
    const calculatedBounds = calculateBounds(coords)
    
    // Calculate pace segments for color-coding
    const getPaceSegments = () => {
      if (points.length < 2) return coords.map(() => '#3b82f6')
      
      const segments: string[] = []
      for (let i = 0; i < points.length - 1; i++) {
        const pointData = getPointData(points, i)
        segments.push(pointData ? getColorForPace(pointData.pace) : '#3b82f6')
      }
      return segments
    }
    
    const segments = getPaceSegments()
    const start = coords[0]
    const end = coords[coords.length - 1]
    
    // Calculate elevation profile data
    const elevation = points.map((point, index) => ({
      distance: index * (run.totalDistance / points.length),
      elevation: point.elevation || 0
    }))
    
    return {
      allPoints: points,
      coordinates: coords,
      bounds: calculatedBounds,
      startPoint: start,
      endPoint: end,
      paceSegments: segments,
      elevationData: elevation
    }
  }, [run])
  
  const hoveredData = hoveredPoint !== null ? getPointData(allPoints, hoveredPoint) : null
  
  // Stable key for map container
  const mapKey = useMemo(() => `${run.fileName}-${run.startTime.getTime()}`, [run.fileName, run.startTime])
  
  // Convert bounds to LatLngBounds only once
  const leafletBounds = useMemo(() => {
    if (!bounds || !Array.isArray(bounds) || bounds.length !== 2) return null
    return L.latLngBounds(bounds)
  }, [bounds])

  if (coordinates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6"
      >
        <h3 className="text-lg font-semibold text-earth-800 mb-4">Route Map</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-earth-600">
            <div className="text-4xl mb-2">🗺️</div>
            <p>No GPS data available</p>
            <p className="text-sm">This run doesn't contain GPS coordinates</p>
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-earth-800">Route Map</h3>
        <div className="flex gap-2">
          <button
            onClick={() => setShowElevationProfile(!showElevationProfile)}
            className={`px-3 py-1 text-xs rounded-organic transition-all duration-300 ${
              showElevationProfile
                ? 'bg-sage-600 text-white'
                : 'bg-earth-100 text-earth-700 hover:bg-earth-200'
            }`}
          >
            {showElevationProfile ? 'Hide' : 'Show'} Elevation
          </button>
        </div>
      </div>
      
      <div className="h-96 rounded-lg overflow-hidden relative z-0">
        {leafletBounds && (
          <MapContainer
            bounds={leafletBounds}
            style={{ height: '100%', width: '100%', zIndex: 0 }}
            scrollWheelZoom={true}
            attributionControl={true}
            key={mapKey}
          >
            <MapUpdater bounds={leafletBounds} />
            
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              updateWhenZooming={false}
              updateWhenIdle={true}
            />
            
            {/* Route polyline with color coding - optimized for performance */}
            {coordinates.length <= 500 ? (
              // Color-coded segments for smaller routes
              coordinates.map((coord, index) => {
                if (index === 0) return null
                const prevCoord = coordinates[index - 1]
                const color = paceSegments[index - 1] || '#3b82f6'
                
                return (
                  <Polyline
                    key={`polyline-${index}`}
                    positions={[prevCoord, coord]}
                    color={color}
                    weight={4}
                    opacity={0.8}
                    eventHandlers={{
                      mouseover: () => setHoveredPoint(index),
                      mouseout: () => setHoveredPoint(null)
                    }}
                  />
                )
              })
            ) : (
              // Single polyline for large routes (performance optimization)
              <Polyline
                key="polyline-single"
                positions={coordinates}
                color="#3b82f6"
                weight={4}
                opacity={0.8}
              />
            )}
            
            {/* Start marker */}
            <Marker 
              key="start-marker"
              position={startPoint}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-green-600 mb-1">🏁 Start</div>
                  <div className="text-xs text-gray-600 mb-1">
                    {run.startTime.toLocaleTimeString()}
                  </div>
                  {allPoints[0] && (
                    <div className="text-xs text-gray-500">
                      Elevation: {(allPoints[0].elevation || 0).toFixed(0)}m
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
            
            {/* End marker */}
            <Marker 
              key="end-marker"
              position={endPoint}
            >
              <Popup>
                <div className="text-center">
                  <div className="font-semibold text-red-600 mb-1">🏁 Finish</div>
                  <div className="text-xs text-gray-600 mb-1">
                    {run.endTime.toLocaleTimeString()}
                  </div>
                  {allPoints[allPoints.length - 1] && (
                    <div className="text-xs text-gray-500">
                      Elevation: {(allPoints[allPoints.length - 1].elevation || 0).toFixed(0)}m
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        )}
        
        {/* Hover tooltip */}
        {hoveredData && hoveredPoint !== null && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000] border border-earth-200">
            <div className="text-xs font-semibold text-earth-800 mb-1">Point {hoveredPoint + 1}</div>
            <div className="text-xs text-earth-600 space-y-1">
              <div>Elevation: {hoveredData.elevation.toFixed(0)}m</div>
              {hoveredData.pace > 0 && (
                <div>Pace: {hoveredData.pace.toFixed(1)} min/mi</div>
              )}
              <div>Time: {hoveredData.time.toLocaleTimeString()}</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Elevation Profile */}
      {showElevationProfile && elevationData.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Elevation Profile</h4>
          <div className="h-32 bg-gray-50 rounded-lg p-2 relative">
            <svg className="w-full h-full" viewBox={`0 0 ${elevationData.length} 100`} preserveAspectRatio="none">
              <polyline
                points={elevationData.map((d, i) => `${i},${100 - (d.elevation / (Math.max(...elevationData.map(e => e.elevation)) || 1)) * 100}`).join(' ')}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2"
              />
            </svg>
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Start: {elevationData[0]?.elevation.toFixed(0)}m</span>
            <span>Max: {Math.max(...elevationData.map(e => e.elevation)).toFixed(0)}m</span>
            <span>End: {elevationData[elevationData.length - 1]?.elevation.toFixed(0)}m</span>
          </div>
        </div>
      )}
      
      {/* Map info and legend */}
      <div className="mt-4 flex flex-col gap-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>📍 {coordinates.length} GPS points</span>
          <span>🗺️ OpenStreetMap</span>
        </div>
        
        {/* Pace legend */}
        <div className="flex items-center gap-2 text-xs">
          <span className="text-gray-600">Pace:</span>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-red-500"></div>
            <span className="text-gray-500">&lt;6</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-orange-500"></div>
            <span className="text-gray-500">6-7</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-yellow-500"></div>
            <span className="text-gray-500">7-8</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-green-500"></div>
            <span className="text-gray-500">8-9</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-blue-500"></div>
            <span className="text-gray-500">9-10</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-1 bg-indigo-500"></div>
            <span className="text-gray-500">&gt;10</span>
          </div>
          <span className="text-gray-500">min/mi</span>
        </div>
      </div>
    </motion.div>
  )
}

export default RunMap
