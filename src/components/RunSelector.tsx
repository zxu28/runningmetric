import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { GPXData } from '../utils/gpxParser'
import { getRunId } from '../utils/storyTypes'
import { formatDistance, formatPace } from '../utils/gpxParser'

interface RunSelectorProps {
  runs: GPXData[]
  selectedRunIds: string[]
  onSelectionChange: (runIds: string[]) => void
}

const RunSelector: React.FC<RunSelectorProps> = ({ runs, selectedRunIds, onSelectionChange }) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'distance' | 'pace'>('date')

  // Filter and sort runs
  const filteredAndSortedRuns = useMemo(() => {
    let filtered = runs.filter(run => {
      const query = searchQuery.toLowerCase()
      return (
        run.fileName.toLowerCase().includes(query) ||
        run.startTime.toLocaleDateString().toLowerCase().includes(query) ||
        (run.tags && run.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (run.notes && run.notes.toLowerCase().includes(query))
      )
    })

    // Sort runs
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return b.startTime.getTime() - a.startTime.getTime() // Newest first
        case 'distance':
          return b.totalDistance - a.totalDistance // Longest first
        case 'pace':
          return a.avgPace - b.avgPace // Fastest first
        default:
          return 0
      }
    })

    return filtered
  }, [runs, searchQuery, sortBy])

  const handleToggleRun = (runId: string) => {
    if (selectedRunIds.includes(runId)) {
      onSelectionChange(selectedRunIds.filter(id => id !== runId))
    } else {
      onSelectionChange([...selectedRunIds, runId])
    }
  }

  const handleSelectAll = () => {
    if (selectedRunIds.length === filteredAndSortedRuns.length) {
      onSelectionChange([])
    } else {
      onSelectionChange(filteredAndSortedRuns.map(run => getRunId(run)))
    }
  }

  if (runs.length === 0) {
    return (
      <div className="bg-earth-50/50 rounded-organic-lg p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <p className="text-earth-700">No runs available to select.</p>
        <p className="text-sm text-earth-600 mt-2">Upload or sync some runs first!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search and Sort Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search runs by name, date, tags, or notes..."
            className="w-full px-4 py-2 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 text-earth-800 placeholder-earth-400 transition-all duration-300"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'distance' | 'pace')}
          className="px-4 py-2 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 text-earth-800 transition-all duration-300"
        >
          <option value="date">Sort by Date</option>
          <option value="distance">Sort by Distance</option>
          <option value="pace">Sort by Pace</option>
        </select>
      </div>

      {/* Select All / Deselect All */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleSelectAll}
          className="text-sm text-sage-600 hover:text-sage-700 px-3 py-1 rounded-full hover:bg-sage-50 transition-all duration-300"
        >
          {selectedRunIds.length === filteredAndSortedRuns.length
            ? 'Deselect All'
            : 'Select All'}
        </button>
        <span className="text-sm text-earth-600">
          {selectedRunIds.length} of {filteredAndSortedRuns.length} selected
        </span>
      </div>

      {/* Run List */}
      <div className="max-h-96 overflow-y-auto space-y-2 border-2 border-earth-200 rounded-organic-lg p-4 bg-white/50">
        {filteredAndSortedRuns.length === 0 ? (
          <div className="text-center py-8 text-earth-600">
            <p>No runs match your search.</p>
          </div>
        ) : (
          filteredAndSortedRuns.map((run, index) => {
            const runId = getRunId(run)
            const isSelected = selectedRunIds.includes(runId)

            return (
              <motion.div
                key={runId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
              >
                <label
                  className={`flex items-start gap-3 p-3 rounded-organic cursor-pointer transition-all duration-300 ${
                    isSelected
                      ? 'bg-sage-100 border-2 border-sage-400 shadow-organic'
                      : 'bg-earth-50/50 border-2 border-earth-200 hover:border-sage-300 hover:bg-earth-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleRun(runId)}
                    className="mt-1 w-5 h-5 text-sage-600 border-earth-300 rounded focus:ring-sage-500 focus:ring-2"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-earth-800 truncate">
                          {run.fileName}
                        </p>
                        <p className="text-sm text-earth-600">
                          {run.startTime.toLocaleDateString()} • {formatDistance(run.totalDistance)} • {formatPace(run.avgPace)}
                        </p>
                        {run.tags && run.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {run.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-moss-100 text-moss-800 border border-moss-200"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-sage-500 flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </label>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}

export default RunSelector

