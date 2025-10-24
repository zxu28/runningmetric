import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { MileSplit, formatPace } from '../utils/gpxParser'

interface PacePerMileChartProps {
  data: MileSplit[]
  source?: 'gpx' | 'strava'
}

const PacePerMileChart: React.FC<PacePerMileChartProps> = ({ data, source }) => {
  // Debug logging
  console.log('PacePerMileChart received:', { 
    dataLength: data?.length || 0, 
    source, 
    data: data?.slice(0, 2) // Show first 2 splits for debugging
  })

  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-64 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-4xl mb-2">📊</div>
          <p>No pace data available</p>
          {source === 'strava' && (
            <p className="text-sm text-gray-400 mt-2">
              Strava activities don't have detailed mile splits yet
            </p>
          )}
        </div>
      </div>
    )
  }

  // Prepare chart data with color coding
  const chartData = data.map(split => {
    const paceMinutes = split.pace
    const minutes = Math.floor(paceMinutes)
    const seconds = Math.round((paceMinutes - minutes) * 60)
    const paceFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    // Color coding based on pace (green = fast, red = slow)
    let color = '#10b981' // green-500 (fast)
    if (paceMinutes > 8) color = '#f59e0b' // amber-500 (medium)
    if (paceMinutes > 10) color = '#ef4444' // red-500 (slow)
    
    return {
      mile: `Mile ${split.mile}`,
      pace: paceMinutes,
      paceFormatted,
      duration: split.duration,
      elevationGain: split.elevationGain,
      elevationLoss: split.elevationLoss,
      fill: color
    }
  })

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-blue-600">
            <span className="font-medium">Pace:</span> {data.paceFormatted}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Duration:</span> {Math.floor(data.duration / 60)}:{(data.duration % 60).toFixed(0).padStart(2, '0')}
          </p>
          <p className="text-green-600">
            <span className="font-medium">Elevation Gain:</span> {data.elevationGain.toFixed(0)}m
          </p>
          <p className="text-red-600">
            <span className="font-medium">Elevation Loss:</span> {data.elevationLoss.toFixed(0)}m
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-white rounded-lg shadow-md p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Pace Per Mile</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="mile" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => formatPace(value)}
              domain={['dataMin - 1', 'dataMax + 1']}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="pace" 
              radius={[4, 4, 0, 0]}
              stroke="#374151"
              strokeWidth={1}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
          <span className="text-gray-600">Fast (&lt; 8:00)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-amber-500 rounded mr-2"></div>
          <span className="text-gray-600">Medium (8:00-10:00)</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
          <span className="text-gray-600">Slow (&gt; 10:00)</span>
        </div>
      </div>
    </motion.div>
  )
}

export default PacePerMileChart
