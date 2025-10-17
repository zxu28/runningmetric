import React from 'react'
import { motion } from 'framer-motion'
import { GPXData, formatPace, formatDuration } from '../utils/gpxParser'

interface SplitComparisonTableProps {
  runA: GPXData
  runB: GPXData
}

const SplitComparisonTable: React.FC<SplitComparisonTableProps> = ({ runA, runB }) => {
  const maxSplits = Math.max(runA.splits.length, runB.splits.length)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-lg shadow-md p-4"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Split-by-Split Comparison</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mile
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                Run A Pace
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-blue-600 uppercase tracking-wider">
                Run A Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                Run B Pace
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-orange-600 uppercase tracking-wider">
                Run B Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Difference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: maxSplits }).map((_, index) => {
              const splitA = runA.splits[index]
              const splitB = runB.splits[index]
              const paceDiff = splitA && splitB ? splitA.pace - splitB.pace : null
              const fasterRun = paceDiff !== null ? (paceDiff < 0 ? 'A' : 'B') : null

              return (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {index + 1}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${splitA && fasterRun === 'A' ? 'font-bold text-green-600' : 'text-blue-600'}`}>
                    {splitA ? formatPace(splitA.pace) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-600">
                    {splitA ? formatDuration(splitA.duration) : '-'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${splitB && fasterRun === 'B' ? 'font-bold text-green-600' : 'text-orange-600'}`}>
                    {splitB ? formatPace(splitB.pace) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-orange-600">
                    {splitB ? formatDuration(splitB.duration) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {paceDiff !== null ? (
                      <span className={paceDiff < 0 ? 'text-green-600' : 'text-red-600'}>
                        {paceDiff < 0 ? '' : '+'}{formatPace(Math.abs(paceDiff))}
                      </span>
                    ) : '-'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  )
}

export default SplitComparisonTable

