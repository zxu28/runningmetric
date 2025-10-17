import React from 'react'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import { formatDistance, formatPace, formatDuration } from '../utils/gpxParser'

interface RunDetailsProps {
  run: GPXData
}

const RunDetails: React.FC<RunDetailsProps> = ({ run }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{run.fileName}</h3>
        <p className="text-sm text-gray-600">
          {run.startTime.toLocaleDateString()} • {run.startTime.toLocaleTimeString()}
        </p>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Distance */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="text-2xl mr-2">🏃‍♂️</div>
            <div className="text-sm text-blue-600 font-medium">Distance</div>
          </div>
          <div className="text-xl font-bold text-blue-800">
            {formatDistance(run.totalDistance)}
          </div>
        </div>
        
        {/* Average Pace */}
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="text-2xl mr-2">⏱️</div>
            <div className="text-sm text-green-600 font-medium">Avg Pace</div>
          </div>
          <div className="text-xl font-bold text-green-800">
            {formatPace(run.avgPace)}
          </div>
        </div>
        
        {/* Duration */}
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="text-2xl mr-2">⏰</div>
            <div className="text-sm text-purple-600 font-medium">Duration</div>
          </div>
          <div className="text-xl font-bold text-purple-800">
            {formatDuration(run.totalDuration)}
          </div>
        </div>
        
        {/* Elevation */}
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center mb-2">
            <div className="text-2xl mr-2">⛰️</div>
            <div className="text-sm text-orange-600 font-medium">Elevation</div>
          </div>
          <div className="text-xl font-bold text-orange-800">
            {run.elevationGain.toFixed(0)}m
          </div>
        </div>
      </div>
      
      {/* Additional Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="text-center">
            <div className="text-gray-600 font-medium">Splits</div>
            <div className="text-gray-900 font-semibold">{run.splits.length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 font-medium">Tracks</div>
            <div className="text-gray-900 font-semibold">{run.tracks.length}</div>
          </div>
          <div className="text-center">
            <div className="text-gray-600 font-medium">Start Time</div>
            <div className="text-gray-900 font-semibold">
              {run.startTime.toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default RunDetails
