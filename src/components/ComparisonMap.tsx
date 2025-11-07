import React, { useEffect } from 'react'
import { MapContainer, TileLayer, Polyline, useMap } from 'react-leaflet'
import { LatLngBoundsExpression } from 'leaflet'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import { extractCoordinates } from '../utils/runHelpers'

interface ComparisonMapProps {
  runA: GPXData
  runB: GPXData
}

const MapUpdater: React.FC<{ coordinatesA: [number, number][]; coordinatesB: [number, number][] }> = ({ 
  coordinatesA, 
  coordinatesB 
}) => {
  const map = useMap()

  useEffect(() => {
    const allCoords = [...coordinatesA, ...coordinatesB]
    if (allCoords.length > 0) {
      const bounds: LatLngBoundsExpression = allCoords.map(coord => [coord[0], coord[1]])
      map.fitBounds(bounds, { padding: [50, 50] })
    }
  }, [coordinatesA, coordinatesB, map])

  return null
}

const ComparisonMap: React.FC<ComparisonMapProps> = ({ runA, runB }) => {
  const coordinatesA = extractCoordinates(runA)
  const coordinatesB = extractCoordinates(runB)
  const center: [number, number] = coordinatesA.length > 0 ? coordinatesA[0] : [0, 0]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4 border-2 border-earth-200 dark:border-earth-600"
    >
      <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-2">Route Comparison</h3>
      
      {/* Legend */}
      <div className="flex items-center space-x-4 mb-2 text-sm text-earth-700 dark:text-earth-300">
        <div className="flex items-center">
          <div className="w-4 h-1 bg-sage-600 mr-2"></div>
          <span>Run A: {runA.fileName}</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-1 bg-terracotta-600 mr-2"></div>
          <span>Run B: {runB.fileName}</span>
        </div>
      </div>

      {coordinatesA.length === 0 || coordinatesB.length === 0 ? (
        <div className="flex items-center justify-center h-80 text-earth-500 dark:text-earth-400">
          No GPS data available for one or both runs.
        </div>
      ) : (
        <MapContainer
          center={center}
          zoom={13}
          scrollWheelZoom={true}
          className="h-96 w-full rounded-organic z-0"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Polyline positions={coordinatesA} color="#6b7f5f" weight={4} opacity={0.7} />
          <Polyline positions={coordinatesB} color="#c97d60" weight={4} opacity={0.7} />
          <MapUpdater coordinatesA={coordinatesA} coordinatesB={coordinatesB} />
        </MapContainer>
      )}
    </motion.div>
  )
}

export default ComparisonMap

