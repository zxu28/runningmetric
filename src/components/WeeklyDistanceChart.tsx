import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { PeriodStats } from '../utils/trendAnalysis'
import { formatDistance } from '../utils/gpxParser'

interface WeeklyDistanceChartProps {
  data: PeriodStats[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 text-sm"
      >
        <p className="font-semibold mb-1">{data.period}</p>
        <p className="text-blue-600">
          Distance: <span className="font-medium">{formatDistance(data.distance)}</span>
        </p>
        <p className="text-gray-600">
          Runs: <span className="font-medium">{data.runCount}</span>
        </p>
      </motion.div>
    )
  }
  return null
}

const WeeklyDistanceChart: React.FC<WeeklyDistanceChartProps> = ({ data }) => {
  // Transform data for chart
  const chartData = data.map(period => ({
    period: period.period,
    distance: period.totalDistance,
    distanceMiles: period.totalDistance / 1609.34,
    runCount: period.runCount
  }))

  // Get color intensity based on distance
  const getBarColor = (value: number, maxValue: number) => {
    const intensity = value / maxValue
    if (intensity > 0.75) return '#1e40af' // dark blue
    if (intensity > 0.5) return '#3b82f6' // blue
    if (intensity > 0.25) return '#60a5fa' // light blue
    return '#93c5fd' // very light blue
  }

  const maxDistance = Math.max(...chartData.map(d => d.distanceMiles))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-50 rounded-lg p-4 h-80 flex flex-col"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Distance</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
          <XAxis
            dataKey="period"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#e0e0e0' }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis
            label={{ value: 'Miles', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="distanceMiles" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`} 
                fill={getBarColor(entry.distanceMiles, maxDistance)}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default WeeklyDistanceChart

