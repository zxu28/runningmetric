import React from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, ReferenceLine } from 'recharts'
import { motion } from 'framer-motion'
import { GPXData, formatPace } from '../utils/gpxParser'

interface PaceDeltaChartProps {
  runA: GPXData
  runB: GPXData
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
        <p className="font-semibold mb-1">Mile {data.mile}</p>
        <p className={data.delta < 0 ? 'text-green-600' : 'text-red-600'}>
          {data.delta < 0 ? 'Run A faster by ' : 'Run B faster by '}
          <span className="font-medium">{formatPace(Math.abs(data.delta))}</span>
        </p>
      </motion.div>
    )
  }
  return null
}

const PaceDeltaChart: React.FC<PaceDeltaChartProps> = ({ runA, runB }) => {
  const maxSplits = Math.max(runA.splits.length, runB.splits.length)
  
  // Calculate pace differences for each mile
  const chartData = Array.from({ length: maxSplits }).map((_, index) => {
    const splitA = runA.splits[index]
    const splitB = runB.splits[index]
    const delta = splitA && splitB ? splitA.pace - splitB.pace : 0
    
    return {
      mile: index + 1,
      delta: delta,
      hasData: Boolean(splitA && splitB)
    }
  }).filter(d => d.hasData)

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Pace Difference by Mile</h3>
        <div className="text-center py-8 text-gray-500">
          No comparable splits available
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white rounded-lg shadow-md p-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Pace Difference by Mile</h3>
      <p className="text-sm text-gray-600 mb-4">
        Negative values mean Run A was faster, positive values mean Run B was faster
      </p>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" vertical={false} />
            <XAxis
              dataKey="mile"
              label={{ value: 'Mile', position: 'insideBottom', offset: -5, fill: '#6b7280' }}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <YAxis
              label={{ value: 'Pace Difference (min/mi)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
              tickFormatter={(value) => formatPace(Math.abs(value))}
              tick={{ fill: '#6b7280', fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: '#e0e0e0' }}
            />
            <ReferenceLine y={0} stroke="#000" strokeWidth={2} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
            <Bar dataKey="delta" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.delta < 0 ? '#10b981' : '#ef4444'} // green if A faster, red if B faster
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  )
}

export default PaceDeltaChart

