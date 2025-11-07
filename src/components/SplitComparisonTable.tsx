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
      className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4 border-2 border-earth-200 dark:border-earth-600"
    >
      <h3 className="text-lg font-semibold text-earth-800 dark:text-earth-100 mb-4">Split-by-Split Comparison</h3>
      
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-earth-200 dark:divide-earth-600">
          <thead className="bg-earth-50 dark:bg-earth-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-earth-600 dark:text-earth-300 uppercase tracking-wider">
                Mile
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                Run A Pace
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-sage-600 dark:text-sage-400 uppercase tracking-wider">
                Run A Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-terracotta-600 dark:text-terracotta-400 uppercase tracking-wider">
                Run B Pace
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-terracotta-600 dark:text-terracotta-400 uppercase tracking-wider">
                Run B Time
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-earth-600 dark:text-earth-300 uppercase tracking-wider">
                Difference
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-earth-800 divide-y divide-earth-200 dark:divide-earth-600">
            {Array.from({ length: maxSplits }).map((_, index) => {
              const splitA = runA.splits[index]
              const splitB = runB.splits[index]
              const paceDiff = splitA && splitB ? splitA.pace - splitB.pace : null
              const fasterRun = paceDiff !== null ? (paceDiff < 0 ? 'A' : 'B') : null

              return (
                <tr 
                  key={index}
                  className={index % 2 === 0 ? 'bg-white/50 dark:bg-earth-800/50' : 'bg-earth-50/50 dark:bg-earth-700/50'}
                >
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-earth-800 dark:text-earth-100">
                    {index + 1}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${splitA && fasterRun === 'A' ? 'font-bold text-moss-600 dark:text-moss-400' : 'text-sage-600 dark:text-sage-400'}`}>
                    {splitA ? formatPace(splitA.pace) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-sage-600 dark:text-sage-400">
                    {splitA ? formatDuration(splitA.duration) : '-'}
                  </td>
                  <td className={`px-4 py-3 whitespace-nowrap text-sm ${splitB && fasterRun === 'B' ? 'font-bold text-moss-600 dark:text-moss-400' : 'text-terracotta-600 dark:text-terracotta-400'}`}>
                    {splitB ? formatPace(splitB.pace) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-terracotta-600 dark:text-terracotta-400">
                    {splitB ? formatDuration(splitB.duration) : '-'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-earth-800 dark:text-earth-100">
                    {paceDiff !== null ? (
                      <span className={paceDiff < 0 ? 'text-moss-600 dark:text-moss-400' : 'text-terracotta-600 dark:text-terracotta-400'}>
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

