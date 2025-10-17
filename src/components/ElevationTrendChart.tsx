import React from 'react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { motion } from 'framer-motion'
import { PeriodStats } from '../utils/trendAnalysis'

interface ElevationTrendChartProps {
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
        <p className="text-purple-600">
          Elevation: <span className="font-medium">{data.elevation.toFixed(0)}m</span>
        </p>
        <p className="text-gray-600">
          Runs: <span className="font-medium">{data.runCount}</span>
        </p>
      </motion.div>
    )
  }
  return null
}

const ElevationTrendChart: React.FC<ElevationTrendChartProps> = ({ data }) => {
  // Transform data for chart
  const chartData = data.map(period => ({
    period: period.period,
    elevation: period.totalElevation,
    runCount: period.runCount
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-50 rounded-lg p-4 h-80 flex flex-col"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Elevation Gain</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="elevationGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#a855f7" stopOpacity={0.1}/>
            </linearGradient>
          </defs>
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
            label={{ value: 'Elevation (m)', angle: -90, position: 'insideLeft', fill: '#6b7280' }}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={false}
            axisLine={{ stroke: '#e0e0e0' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#a855f7', strokeWidth: 2 }} />
          <Area
            type="monotone"
            dataKey="elevation"
            stroke="#a855f7"
            strokeWidth={3}
            fill="url(#elevationGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}

export default ElevationTrendChart

