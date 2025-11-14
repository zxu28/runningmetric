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
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set())
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set()) // Format: "YYYY-MM"

  // Get all unique tags from runs
  const allTags = useMemo(() => {
    return Array.from(new Set(runs.flatMap(run => run.tags || []))).sort()
  }, [runs])

  // Get all unique years from runs
  const allYears = useMemo(() => {
    return Array.from(new Set(runs.map(run => run.startTime.getFullYear()))).sort((a, b) => b - a)
  }, [runs])

  // Get all unique year-month combinations
  const allMonths = useMemo(() => {
    const monthMap = new Map<string, { year: number; month: number; label: string }>()
    runs.forEach(run => {
      const year = run.startTime.getFullYear()
      const month = run.startTime.getMonth()
      const key = `${year}-${String(month + 1).padStart(2, '0')}`
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      if (!monthMap.has(key)) {
        monthMap.set(key, {
          year,
          month,
          label: `${monthNames[month]} ${year}`
        })
      }
    })
    return Array.from(monthMap.values()).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year
      return b.month - a.month
    })
  }, [runs])

  // Filter and sort runs
  const filteredAndSortedRuns = useMemo(() => {
    let filtered = runs.filter(run => {
      // Search query filter
      const query = searchQuery.toLowerCase()
      const matchesSearch = !searchQuery || (
        run.fileName.toLowerCase().includes(query) ||
        run.startTime.toLocaleDateString().toLowerCase().includes(query) ||
        (run.tags && run.tags.some(tag => tag.toLowerCase().includes(query))) ||
        (run.notes && run.notes.toLowerCase().includes(query))
      )

      // Tag filter
      const matchesTags = selectedTags.size === 0 || 
        (run.tags && run.tags.some(tag => selectedTags.has(tag)))

      // Year filter
      const runYear = run.startTime.getFullYear()
      const matchesYear = selectedYears.size === 0 || selectedYears.has(runYear)

      // Month filter
      const runMonth = `${runYear}-${String(run.startTime.getMonth() + 1).padStart(2, '0')}`
      const matchesMonth = selectedMonths.size === 0 || selectedMonths.has(runMonth)

      return matchesSearch && matchesTags && matchesYear && matchesMonth
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
  }, [runs, searchQuery, sortBy, selectedTags, selectedYears, selectedMonths])

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

  const toggleTag = (tag: string) => {
    const newSelected = new Set(selectedTags)
    if (newSelected.has(tag)) {
      newSelected.delete(tag)
    } else {
      newSelected.add(tag)
    }
    setSelectedTags(newSelected)
  }

  const toggleYear = (year: number) => {
    const newSelected = new Set(selectedYears)
    if (newSelected.has(year)) {
      newSelected.delete(year)
      // Also clear month selections for this year
      const newMonths = new Set(selectedMonths)
      allMonths.forEach(m => {
        if (m.year === year) newMonths.delete(`${m.year}-${String(m.month + 1).padStart(2, '0')}`)
      })
      setSelectedMonths(newMonths)
    } else {
      newSelected.add(year)
    }
    setSelectedYears(newSelected)
  }

  const toggleMonth = (monthKey: string) => {
    const newSelected = new Set(selectedMonths)
    if (newSelected.has(monthKey)) {
      newSelected.delete(monthKey)
    } else {
      newSelected.add(monthKey)
      // Auto-select the year if not already selected
      const year = parseInt(monthKey.split('-')[0])
      if (!selectedYears.has(year)) {
        setSelectedYears(new Set([...selectedYears, year]))
      }
    }
    setSelectedMonths(newSelected)
  }

  if (runs.length === 0) {
    return (
      <div className="bg-earth-50/50 dark:bg-earth-800/50 rounded-organic-lg p-8 text-center">
        <div className="text-4xl mb-4">📚</div>
        <p className="text-earth-700 dark:text-earth-300">No runs available to select.</p>
        <p className="text-sm text-earth-600 dark:text-earth-400 mt-2">Upload or sync some runs first!</p>
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
            className="w-full px-4 py-2 border-2 border-earth-200 dark:border-earth-700 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 dark:bg-earth-700/80 text-earth-800 dark:text-earth-100 placeholder-earth-400 dark:placeholder-earth-500 transition-all duration-300"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'distance' | 'pace')}
          className="px-4 py-2 border-2 border-earth-200 dark:border-earth-700 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 dark:bg-earth-700/80 text-earth-800 dark:text-earth-100 transition-all duration-300"
        >
          <option value="date">Sort by Date</option>
          <option value="distance">Sort by Distance</option>
          <option value="pace">Sort by Pace</option>
        </select>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              Filter by Tags:
            </label>
            <div className="flex flex-wrap gap-2">
              {allTags.map(tag => {
                const isSelected = selectedTags.has(tag)
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all duration-300 ${
                      isSelected
                        ? 'bg-sage-500 text-white border-sage-600 shadow-organic'
                        : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 border-earth-200 dark:border-earth-600 hover:border-sage-400'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Year Filters */}
        {allYears.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              Filter by Year:
            </label>
            <div className="flex flex-wrap gap-2">
              {allYears.map(year => {
                const isSelected = selectedYears.has(year)
                return (
                  <button
                    key={year}
                    type="button"
                    onClick={() => toggleYear(year)}
                    className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all duration-300 ${
                      isSelected
                        ? 'bg-moss-500 text-white border-moss-600 shadow-organic'
                        : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 border-earth-200 dark:border-earth-600 hover:border-moss-400'
                    }`}
                  >
                    {year}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Month Filters */}
        {allMonths.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-earth-700 dark:text-earth-300 mb-2">
              Filter by Month:
            </label>
            <div className="flex flex-wrap gap-2">
              {allMonths.map(({ year, month, label }) => {
                const monthKey = `${year}-${String(month + 1).padStart(2, '0')}`
                const isSelected = selectedMonths.has(monthKey)
                return (
                  <button
                    key={monthKey}
                    type="button"
                    onClick={() => toggleMonth(monthKey)}
                    className={`px-3 py-1.5 text-xs rounded-full border-2 transition-all duration-300 ${
                      isSelected
                        ? 'bg-terracotta-500 text-white border-terracotta-600 shadow-organic'
                        : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 border-earth-200 dark:border-earth-600 hover:border-terracotta-400'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {/* Clear Filters */}
        {(selectedTags.size > 0 || selectedYears.size > 0 || selectedMonths.size > 0) && (
          <button
            type="button"
            onClick={() => {
              setSelectedTags(new Set())
              setSelectedYears(new Set())
              setSelectedMonths(new Set())
            }}
            className="text-sm text-terracotta-600 dark:text-terracotta-400 hover:text-terracotta-700 dark:hover:text-terracotta-300 px-3 py-1 rounded-full hover:bg-terracotta-50 dark:hover:bg-terracotta-900/30 transition-all duration-300"
          >
            Clear All Filters
          </button>
        )}
      </div>

      {/* Select All / Deselect All */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={handleSelectAll}
          className="text-sm text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 px-3 py-1 rounded-full hover:bg-sage-50 dark:hover:bg-sage-900/30 transition-all duration-300"
        >
          {selectedRunIds.length === filteredAndSortedRuns.length
            ? 'Deselect All'
            : 'Select All'}
        </button>
        <span className="text-sm text-earth-600 dark:text-earth-400">
          {selectedRunIds.length} of {filteredAndSortedRuns.length} selected
          {filteredAndSortedRuns.length !== runs.length && ` (${runs.length} total)`}
        </span>
      </div>

      {/* Run List */}
      <div className="max-h-96 overflow-y-auto space-y-2 border-2 border-earth-200 dark:border-earth-700 rounded-organic-lg p-4 bg-white/50 dark:bg-earth-800/50">
        {filteredAndSortedRuns.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4 animate-float">🔍</div>
            <h3 className="text-xl font-bold text-earth-800 dark:text-earth-100 mb-2">
              {selectedTags.size > 0 || selectedYears.size > 0 || selectedMonths.size > 0 || searchQuery
                ? 'No Runs Match Your Filters'
                : 'No Runs Available'}
            </h3>
            <p className="text-earth-600 dark:text-earth-400 mb-6 max-w-md mx-auto leading-relaxed">
              {selectedTags.size > 0 || selectedYears.size > 0 || selectedMonths.size > 0 || searchQuery
                ? 'Try adjusting your filters or search query to find more runs.'
                : 'Upload GPX files or sync from Strava to get started.'}
            </p>
            {(selectedTags.size > 0 || selectedYears.size > 0 || selectedMonths.size > 0 || searchQuery) && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setSelectedTags(new Set())
                  setSelectedYears(new Set())
                  setSelectedMonths(new Set())
                }}
                className="inline-flex items-center px-6 py-3 rounded-organic-lg bg-sage-600 text-white hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300 font-medium"
              >
                Clear All Filters
              </button>
            )}
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
                  className={`flex items-start gap-3 p-3 rounded-organic cursor-pointer transition-colors duration-200 ${
                    isSelected
                      ? 'bg-sage-100 dark:bg-sage-800 border-2 border-sage-400 dark:border-sage-600 shadow-organic'
                      : 'bg-earth-50/50 dark:bg-earth-700/50 border-2 border-earth-200 dark:border-earth-600 hover:border-sage-300 dark:hover:border-sage-500 hover:bg-earth-50 dark:hover:bg-earth-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleRun(runId)}
                    className="mt-1 w-5 h-5 text-sage-600 border-earth-300 dark:border-earth-600 rounded focus:ring-sage-500 focus:ring-2"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-earth-800 dark:text-earth-100 truncate">
                          {run.fileName}
                        </p>
                        <p className="text-sm text-earth-600 dark:text-earth-400">
                          {run.startTime.toLocaleDateString()} • {formatDistance(run.totalDistance)} • {formatPace(run.avgPace)}
                        </p>
                        {run.tags && run.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {run.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-moss-100 dark:bg-moss-800 text-moss-800 dark:text-moss-200 border border-moss-200 dark:border-moss-700"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <div className="flex-shrink-0">
                          <div className="w-6 h-6 rounded-full bg-sage-500 dark:bg-sage-600 flex items-center justify-center">
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

