import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { GPXData, formatDistance, formatPace, formatDuration } from '../utils/gpxParser'
import ComparisonMap from './ComparisonMap'
import SplitComparisonTable from './SplitComparisonTable'
import PaceDeltaChart from './PaceDeltaChart'

interface RunComparisonProps {
  runs: GPXData[]
  onClose: () => void
}

const RunComparison: React.FC<RunComparisonProps> = ({ runs, onClose }) => {
  const [runA, setRunA] = useState<GPXData | null>(runs[0] || null)
  const [runB, setRunB] = useState<GPXData | null>(runs[1] || null)

  if (runs.length < 2) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-earth-800 rounded-organic-lg shadow-organic-lg p-8 max-w-md"
        >
          <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100 mb-4">Not Enough Runs</h2>
          <p className="text-earth-600 dark:text-earth-300 mb-6">
            You need at least 2 runs to compare. Upload more GPX files to use this feature.
          </p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-sage-600 text-white rounded-organic hover:bg-sage-700 transition-all duration-300"
          >
            Close
          </button>
        </motion.div>
      </div>
    )
  }

  const calculateDifference = (runA: GPXData | null, runB: GPXData | null) => {
    if (!runA || !runB) return null

    return {
      distance: runA.totalDistance - runB.totalDistance,
      time: runA.totalDuration - runB.totalDuration,
      pace: runA.avgPace - runB.avgPace,
      elevation: runA.elevationGain - runB.elevationGain
    }
  }

  const diff = calculateDifference(runA, runB)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="bg-white dark:bg-earth-800 rounded-organic-lg shadow-organic-lg w-full max-w-7xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-600 to-moss-600 dark:from-sage-700 dark:to-moss-700 p-6 text-white flex items-center justify-between">
          <h2 className="text-2xl font-bold">Run Comparison</h2>
          <button
            onClick={onClose}
            className="text-white hover:text-earth-100 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Selector Row */}
        <div className="p-6 bg-earth-50 dark:bg-earth-700/50 border-b border-earth-200 dark:border-earth-600 grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-200 mb-2">Run A (Sage)</label>
            <select
              value={runA?.fileName || ''}
              onChange={(e) => {
                const selected = runs.find(r => r.fileName === e.target.value)
                setRunA(selected || null)
              }}
              className="w-full px-3 py-2 border-2 border-earth-200 dark:border-earth-600 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-100"
            >
              {runs.map(run => (
                <option key={run.fileName} value={run.fileName}>
                  {run.fileName} - {formatDistance(run.totalDistance)} - {run.startTime.toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-200 mb-2">Run B (Terracotta)</label>
            <select
              value={runB?.fileName || ''}
              onChange={(e) => {
                const selected = runs.find(r => r.fileName === e.target.value)
                setRunB(selected || null)
              }}
              className="w-full px-3 py-2 border-2 border-earth-200 dark:border-earth-600 rounded-organic focus:outline-none focus:ring-2 focus:ring-terracotta-400 focus:border-terracotta-400 bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-100"
            >
              {runs.map(run => (
                <option key={run.fileName} value={run.fileName}>
                  {run.fileName} - {formatDistance(run.totalDistance)} - {run.startTime.toLocaleDateString()}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-organic-gradient dark:bg-gradient-to-br dark:from-earth-900 dark:via-earth-800 dark:to-earth-900">
          {runA && runB && diff && (
            <>
              {/* Summary Comparison */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4 border-2 border-sage-200 dark:border-sage-700">
                  <div className="text-sm text-earth-600 dark:text-earth-400 mb-1">Distance Difference</div>
                  <div className={`text-2xl font-bold ${diff.distance > 0 ? 'text-sage-600 dark:text-sage-400' : 'text-terracotta-600 dark:text-terracotta-400'}`}>
                    {diff.distance > 0 ? '+' : ''}{formatDistance(Math.abs(diff.distance))}
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4 border-2 border-moss-200 dark:border-moss-700">
                  <div className="text-sm text-earth-600 dark:text-earth-400 mb-1">Time Difference</div>
                  <div className={`text-2xl font-bold ${diff.time > 0 ? 'text-sage-600 dark:text-sage-400' : 'text-terracotta-600 dark:text-terracotta-400'}`}>
                    {diff.time > 0 ? '+' : ''}{formatDuration(Math.abs(diff.time))}
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4 border-2 border-earth-200 dark:border-earth-600">
                  <div className="text-sm text-earth-600 dark:text-earth-400 mb-1">Pace Difference</div>
                  <div className={`text-2xl font-bold ${diff.pace < 0 ? 'text-moss-600 dark:text-moss-400' : 'text-terracotta-600 dark:text-terracotta-400'}`}>
                    {diff.pace < 0 ? '' : '+'}{formatPace(Math.abs(diff.pace))}
                  </div>
                  <div className="text-xs text-earth-500 dark:text-earth-400">
                    {diff.pace < 0 ? 'Run A faster' : 'Run B faster'}
                  </div>
                </div>

                <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-4 border-2 border-sage-200 dark:border-sage-700">
                  <div className="text-sm text-earth-600 dark:text-earth-400 mb-1">Elevation Difference</div>
                  <div className={`text-2xl font-bold ${diff.elevation > 0 ? 'text-sage-600 dark:text-sage-400' : 'text-terracotta-600 dark:text-terracotta-400'}`}>
                    {diff.elevation > 0 ? '+' : ''}{Math.abs(diff.elevation).toFixed(0)}m
                  </div>
                </div>
              </div>

              {/* Map Comparison */}
              <ComparisonMap runA={runA} runB={runB} />

              {/* Pace Delta Chart */}
              <PaceDeltaChart runA={runA} runB={runB} />

              {/* Split Comparison Table */}
              <SplitComparisonTable runA={runA} runB={runB} />
            </>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default RunComparison

