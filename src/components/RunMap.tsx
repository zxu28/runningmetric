import React from 'react'
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet'
import { motion } from 'framer-motion'
import L from 'leaflet'
import { GPXData } from '../utils/gpxParser'
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

const RunMap: React.FC<RunMapProps> = ({ run }) => {
  const coordinates = extractCoordinates(run)
  const bounds = calculateBounds(coordinates)

  if (coordinates.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Map</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="text-center text-gray-500">
            <div className="text-4xl mb-2">🗺️</div>
            <p>No GPS data available</p>
            <p className="text-sm">This run doesn't contain GPS coordinates</p>
          </div>
        </div>
      </motion.div>
    )
  }

  const startPoint = coordinates[0]
  const endPoint = coordinates[coordinates.length - 1]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Route Map</h3>
      
      <div className="h-64 rounded-lg overflow-hidden">
        <MapContainer
          bounds={bounds}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
          attributionControl={true}
          key={`${run.fileName}-${run.startTime.getTime()}`} // Force re-render when run changes
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          
          {/* Route polyline */}
          <Polyline
            positions={coordinates}
            color="#3b82f6"
            weight={4}
            opacity={0.8}
          />
          
          {/* Start marker */}
          <Marker position={startPoint}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-green-600">🏁 Start</div>
                <div className="text-sm text-gray-600">
                  {run.startTime.toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
          
          {/* End marker */}
          <Marker position={endPoint}>
            <Popup>
              <div className="text-center">
                <div className="font-semibold text-red-600">🏁 Finish</div>
                <div className="text-sm text-gray-600">
                  {run.endTime.toLocaleTimeString()}
                </div>
              </div>
            </Popup>
          </Marker>
        </MapContainer>
      </div>
      
      {/* Map info */}
      <div className="mt-4 flex justify-between text-sm text-gray-600">
        <span>📍 {coordinates.length} GPS points</span>
        <span>🗺️ OpenStreetMap</span>
      </div>
    </motion.div>
  )
}

export default RunMap
