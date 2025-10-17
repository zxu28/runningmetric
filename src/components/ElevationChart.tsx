import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from 'framer-motion'
import { MileSplit } from '../utils/gpxParser'

interface ElevationChartProps {
  data: MileSplit[]
}

const ElevationChart: React.FC<ElevationChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 h-48 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <div className="text-3xl mb-2">⛰️</div>
          <p>No elevation data available</p>
        </div>
      </div>
    )
  }

  // Calculate cumulative elevation for chart
  let cumulativeElevation = 0
  const chartData = data.map(split => {
    cumulativeElevation += split.elevationGain - split.elevationLoss
    return {
      mile: split.mile,
      elevation: cumulativeElevation,
      elevationGain: split.elevationGain,
      elevationLoss: split.elevationLoss,
      distance: split.endDistance / 1609.34 // Convert to miles
    }
  })

  // Calculate elevation stats
  const elevations = chartData.map(d => d.elevation)
  const maxElevation = Math.max(...elevations)
  const minElevation = Math.min(...elevations)
  const totalGain = data.reduce((sum, split) => sum + split.elevationGain, 0)
  const totalLoss = data.reduce((sum, split) => sum + split.elevationLoss, 0)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900">Mile {label}</p>
          <p className="text-blue-600">
            <span className="font-medium">Elevation:</span> {data.elevation.toFixed(0)}m
          </p>
          <p className="text-green-600">
            <span className="font-medium">Gain:</span> +{data.elevationGain.toFixed(0)}m
          </p>
          <p className="text-red-600">
            <span className="font-medium">Loss:</span> -{data.elevationLoss.toFixed(0)}m
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
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Elevation Profile</h3>
      
      {/* Elevation Stats */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-blue-600 font-medium">Max Elevation</div>
          <div className="text-blue-800 font-bold">{maxElevation.toFixed(0)}m</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-green-600 font-medium">Total Gain</div>
          <div className="text-green-800 font-bold">{totalGain.toFixed(0)}m</div>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <defs>
              <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis 
              dataKey="mile" 
              stroke="#6b7280"
              fontSize={12}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `${value}m`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="elevation"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#elevationGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
      
      {/* Additional Stats */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <span>Min: {minElevation.toFixed(0)}m</span>
        <span>Total Loss: {totalLoss.toFixed(0)}m</span>
      </div>
    </motion.div>
  )
}

export default ElevationChart
