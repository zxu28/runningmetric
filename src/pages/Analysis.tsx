import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useDataContext } from '../contexts/DataContext'
import { useStoriesContext } from '../contexts/StoriesContext'
import { useGoalsContext } from '../contexts/GoalsContext'
import { formatDistance, formatPace, GPXData } from '../utils/gpxParser'
import { getMostRecentRun } from '../utils/runHelpers'
import { useBestEfforts } from '../hooks/useBestEfforts'
import { useAchievements } from '../hooks/useAchievements'
import { getAchievementById } from '../utils/achievements'
import { exportDataAsJSON, exportRunsAsCSV } from '../utils/dataExport'
import { getWeeklyTrends, getMonthlyTrends, TimePeriod } from '../utils/trendAnalysis'
import PacePerMileChart from '../components/PacePerMileChart'
import RightChartsPanel from '../components/RightChartsPanel'
import RunCalendar from '../components/RunCalendar'
import RunMap from '../components/RunMap'
import RunDetails from '../components/RunDetails'
import BestEffortsGrid from '../components/BestEffortsGrid'
import PRBadge from '../components/PRBadge'
import RunComparison from '../components/RunComparison'
import AchievementPopup from '../components/AchievementPopup'
import AchievementsPanel from '../components/AchievementsPanel'
import GoalTracker from '../components/GoalTracker'
import ActivityHeatmap from '../components/ActivityHeatmap'
import WeeklyDistanceChart from '../components/WeeklyDistanceChart'
import PaceTrendChart from '../components/PaceTrendChart'
import ElevationTrendChart from '../components/ElevationTrendChart'

const Analysis = () => {
  const { parsedData, removeDuplicates, clearAllData, updateRun, deleteRun } = useDataContext()
  const [expandedRuns, setExpandedRuns] = useState<Set<number>>(new Set())
  const [selectedRun, setSelectedRun] = useState<GPXData | null>(
    parsedData.length > 0 ? getMostRecentRun(parsedData) : null
  )
  const [showSelectedRunDetails, setShowSelectedRunDetails] = useState(true)
  const [showComparison, setShowComparison] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set())
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set()) // Format: "YYYY-MM"
  const [searchQuery, setSearchQuery] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([]) // Manually added filter tags
  const [newTagInput, setNewTagInput] = useState('')
  const [selectedRuns, setSelectedRuns] = useState<Set<string>>(new Set()) // Selected runs for bulk operations
  const [bulkTagInput, setBulkTagInput] = useState('')
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [activeTab, setActiveTab] = useState<'runs' | 'stats' | 'achievements' | 'goals'>('runs')
  const [statsPeriod, setStatsPeriod] = useState<TimePeriod>('thisYear')
  
  // Load custom tags from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('customFilterTags')
    if (stored) {
      try {
        const tags = JSON.parse(stored)
        if (Array.isArray(tags)) {
          // Normalize tags: trim whitespace and remove empty strings
          const normalizedTags = tags
            .map(tag => typeof tag === 'string' ? tag.trim() : String(tag).trim())
            .filter(tag => tag.length > 0)
          // Remove duplicates (case-insensitive)
          const uniqueTags = Array.from(new Set(
            normalizedTags.map(tag => tag.toLowerCase())
          )).map(lowerTag => {
            // Find the original case version
            const originalTag = normalizedTags.find(t => t.toLowerCase() === lowerTag)
            return originalTag || lowerTag
          })
          setCustomTags(uniqueTags)
        } else {
          setCustomTags([])
        }
      } catch (error) {
        console.error('Failed to load custom tags:', error)
        setCustomTags([])
      }
    }
  }, [])
  
  // Save custom tags to localStorage whenever they change
  useEffect(() => {
    try {
      if (customTags.length > 0) {
        localStorage.setItem('customFilterTags', JSON.stringify(customTags))
      } else {
        // Only remove if we previously had tags
        if (localStorage.getItem('customFilterTags')) {
          localStorage.removeItem('customFilterTags')
        }
      }
    } catch (error) {
      console.error('Failed to save custom tags:', error)
    }
  }, [customTags])
  
  // Use best efforts hook
  const { bestEfforts, newPRs, clearNewPRs } = useBestEfforts(parsedData)
  
  // Use achievements hook
  const { newlyUnlocked, clearNewlyUnlocked, unlockedIds, achievements } = useAchievements(bestEfforts)
  
  // Get stories and goals for export
  const { stories } = useStoriesContext()
  const { goals } = useGoalsContext()
  
  // Statistics calculations
  const trendData = useMemo(() => {
    if (['last7days', 'last30days', 'last90days', 'last4weeks'].includes(statsPeriod)) {
      return getWeeklyTrends(parsedData, statsPeriod)
    } else {
      return getMonthlyTrends(parsedData, statsPeriod)
    }
  }, [parsedData, statsPeriod])

  // Year-over-year comparison
  const yearOverYearData = useMemo(() => {
    if (parsedData.length === 0) return null

    const years = Array.from(new Set(parsedData.map(run => run.startTime.getFullYear()))).sort()
    if (years.length < 2) return null

    const comparison = years.map(year => {
      const yearRuns = parsedData.filter(run => run.startTime.getFullYear() === year)
      const totalDistance = yearRuns.reduce((sum, run) => sum + run.totalDistance, 0)
      const totalTime = yearRuns.reduce((sum, run) => sum + run.totalDuration, 0)
      const totalElevation = yearRuns.reduce((sum, run) => sum + run.elevationGain, 0)
      const distanceMiles = totalDistance / 1609.34
      const averagePace = distanceMiles > 0 ? (totalTime / 60) / distanceMiles : 0

      return {
        year,
        runCount: yearRuns.length,
        totalDistance,
        totalDistanceMiles: distanceMiles,
        totalTime,
        totalElevation,
        averagePace,
        runs: yearRuns
      }
    })

    return comparison
  }, [parsedData])

  // Best periods
  const bestPeriods = useMemo(() => {
    if (parsedData.length === 0) return null

    const monthlyStats = getMonthlyTrends(parsedData, 'allTime')
    
    const bestDistance = [...monthlyStats].sort((a, b) => b.totalDistance - a.totalDistance)[0]
    const bestPace = [...monthlyStats].filter(m => m.averagePace > 0).sort((a, b) => a.averagePace - b.averagePace)[0]
    const bestElevation = [...monthlyStats].sort((a, b) => b.totalElevation - a.totalElevation)[0]
    const mostRuns = [...monthlyStats].sort((a, b) => b.runCount - a.runCount)[0]

    return {
      bestDistance,
      bestPace,
      bestElevation,
      mostRuns
    }
  }, [parsedData])

  // Overall statistics
  const overallStats = useMemo(() => {
    if (parsedData.length === 0) return null

    const totalDistance = parsedData.reduce((sum, run) => sum + run.totalDistance, 0)
    const totalTime = parsedData.reduce((sum, run) => sum + run.totalDuration, 0)
    const totalElevation = parsedData.reduce((sum, run) => sum + run.elevationGain, 0)
    const distanceMiles = totalDistance / 1609.34
    const averagePace = distanceMiles > 0 ? (totalTime / 60) / distanceMiles : 0

    const dates = parsedData.map(run => run.startTime.getTime()).sort((a, b) => a - b)
    const firstRun = dates[0] ? new Date(dates[0]) : null
    const lastRun = dates[dates.length - 1] ? new Date(dates[dates.length - 1]) : null
    const daysActive = firstRun && lastRun 
      ? Math.ceil((lastRun.getTime() - firstRun.getTime()) / (1000 * 60 * 60 * 24))
      : 0

    return {
      totalRuns: parsedData.length,
      totalDistance,
      totalDistanceMiles: distanceMiles,
      totalTime,
      totalElevation,
      averagePace,
      firstRun,
      lastRun,
      daysActive,
      averageDistancePerRun: distanceMiles / parsedData.length,
      averageRunsPerWeek: daysActive > 0 ? (parsedData.length / (daysActive / 7)) : 0
    }
  }, [parsedData])

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'last4weeks', label: 'Last 4 Weeks' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'allTime', label: 'All Time' }
  ]
  
  // Get all unique tags from runs and combine with custom tags
  const runTags = Array.from(new Set(
    parsedData.flatMap(run => run.tags || [])
  ))
  const allTags = Array.from(new Set([...runTags, ...customTags])).sort()
  
  // Get all unique years from runs (sorted descending)
  const allYears = Array.from(new Set(
    parsedData.map(run => run.startTime.getFullYear())
  )).sort((a, b) => b - a) // Most recent first
  
  // Get all unique year-month combinations
  const yearMonthMap = new Map<string, { year: number; month: number; label: string }>()
  parsedData.forEach(run => {
    const year = run.startTime.getFullYear()
    const month = run.startTime.getMonth()
    const key = `${year}-${String(month + 1).padStart(2, '0')}`
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    if (!yearMonthMap.has(key)) {
      yearMonthMap.set(key, {
        year,
        month,
        label: `${monthNames[month]} ${year}`
      })
    }
  })
  const allMonths = Array.from(yearMonthMap.entries())
    .sort((a, b) => {
      // Sort by year descending, then month descending
      if (a[1].year !== b[1].year) return b[1].year - a[1].year
      return b[1].month - a[1].month
    })
    .map(([key, value]) => ({ key, ...value }))
  
  // Filter runs based on selected tags, years, months, and search query
  const filteredRuns = parsedData.filter(run => {
    // Filter by tags
    if (selectedTags.size > 0) {
      const currentRunTags = run.tags || []
      const hasSelectedTag = Array.from(selectedTags).some(tag => currentRunTags.includes(tag))
      if (!hasSelectedTag) return false
    }
    
    // Filter by year
    if (selectedYears.size > 0) {
      const runYear = run.startTime.getFullYear()
      if (!selectedYears.has(runYear)) return false
    }
    
    // Filter by month (YYYY-MM format)
    if (selectedMonths.size > 0) {
      const runYear = run.startTime.getFullYear()
      const runMonth = String(run.startTime.getMonth() + 1).padStart(2, '0')
      const monthKey = `${runYear}-${runMonth}`
      if (!selectedMonths.has(monthKey)) return false
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      const matchesName = run.fileName.toLowerCase().includes(query)
      const matchesNotes = run.notes?.toLowerCase().includes(query) || false
      const matchesTags = run.tags?.some(tag => tag.toLowerCase().includes(query)) || false
      if (!matchesName && !matchesNotes && !matchesTags) return false
    }
    
    return true
  })

  // Helper function to get unique run ID
  const getRunId = (run: GPXData): string => {
    if (run.source === 'strava' && run.stravaId) {
      return `strava-${run.stravaId}`
    }
    return `${run.fileName}-${run.startTime.getTime()}`
  }

  // Toggle run selection for bulk operations
  const toggleRunSelection = (run: GPXData) => {
    const runId = getRunId(run)
    const newSelected = new Set(selectedRuns)
    if (newSelected.has(runId)) {
      newSelected.delete(runId)
    } else {
      newSelected.add(runId)
    }
    setSelectedRuns(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  // Select all filtered runs
  const selectAllRuns = () => {
    const allIds = new Set(filteredRuns.map(run => getRunId(run)))
    setSelectedRuns(allIds)
    setShowBulkActions(allIds.size > 0)
  }

  // Deselect all runs
  const deselectAllRuns = () => {
    setSelectedRuns(new Set())
    setShowBulkActions(false)
  }

  // Bulk add tag to selected runs
  const handleBulkAddTag = () => {
    const tag = bulkTagInput.trim()
    if (!tag || selectedRuns.size === 0) return

    filteredRuns.forEach(run => {
      const runId = getRunId(run)
      if (selectedRuns.has(runId)) {
        const currentTags = run.tags || []
        if (!currentTags.includes(tag)) {
          const updatedRun = { ...run, tags: [...currentTags, tag] }
          updateRun(updatedRun)
        }
      }
    })
    setBulkTagInput('')
    setSelectedRuns(new Set())
    setShowBulkActions(false)
  }

  // Bulk delete selected runs
  const handleBulkDelete = () => {
    if (selectedRuns.size === 0) return
    if (!confirm(`Delete ${selectedRuns.size} run${selectedRuns.size !== 1 ? 's' : ''}? This action cannot be undone.`)) {
      return
    }

    filteredRuns.forEach(run => {
      const runId = getRunId(run)
      if (selectedRuns.has(runId)) {
        deleteRun(run)
      }
    })
    setSelectedRuns(new Set())
    setShowBulkActions(false)
  }

  const toggleRun = (index: number) => {
    const newExpanded = new Set(expandedRuns)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedRuns(newExpanded)
  }

  const handleAddCustomTag = () => {
    const trimmed = newTagInput.trim()
    // Prevent adding if it already exists (case-insensitive)
    const alreadyExists = customTags.some(ct => ct.trim().toLowerCase() === trimmed.toLowerCase()) ||
                         runTags.some(rt => rt.trim().toLowerCase() === trimmed.toLowerCase())
    if (trimmed && !alreadyExists) {
      setCustomTags([...customTags, trimmed])
      setNewTagInput('')
    } else if (alreadyExists) {
      alert(`Tag "${trimmed}" already exists as a filter tag or is used in your runs.`)
    }
  }

  const handleDeleteCustomTag = (tagToDelete: string) => {
    console.log('Deleting tag:', tagToDelete)
    console.log('Current customTags:', customTags)
    
    // Use case-insensitive comparison to handle any case mismatches
    // Also trim whitespace to handle any whitespace issues
    const trimmedTagToDelete = tagToDelete.trim()
    const updatedTags = customTags.filter(tag => {
      const trimmedTag = tag.trim()
      const matches = trimmedTag.toLowerCase() !== trimmedTagToDelete.toLowerCase()
      if (!matches) {
        console.log(`Removing tag: "${tag}" (matched "${tagToDelete}")`)
      }
      return matches
    })
    
    console.log('Updated tags after deletion:', updatedTags)
    console.log('Tags removed:', customTags.length - updatedTags.length)
    
    // Force update by creating a new array reference
    setCustomTags([...updatedTags])
    
    // Also remove from selected tags if it was selected (case-insensitive)
    const newSelected = new Set(selectedTags)
    let removedFromSelected = false
    Array.from(newSelected).forEach(tag => {
      if (tag.trim().toLowerCase() === trimmedTagToDelete.toLowerCase()) {
        newSelected.delete(tag)
        removedFromSelected = true
      }
    })
    if (removedFromSelected) {
      setSelectedTags(newSelected)
    }
    
    // Force localStorage update immediately
    try {
      if (updatedTags.length > 0) {
        localStorage.setItem('customFilterTags', JSON.stringify(updatedTags))
      } else {
        localStorage.removeItem('customFilterTags')
      }
      console.log('localStorage updated successfully')
    } catch (error) {
      console.error('Failed to update localStorage:', error)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddCustomTag()
    }
  }

  const handleSelectRun = (run: GPXData) => {
    setSelectedRun(run)
  }
  useEffect(() => {
    console.log('📊 Analysis Page - Data State Check:')
    console.log('- parsedData from context:', parsedData.length, 'items')
    console.log('- parsedData:', parsedData)
    
    const stored = localStorage.getItem('runningData')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        console.log('🔍 localStorage Debug Info:')
        console.log('- Total items in storage:', parsed.length)
        parsed.forEach((run: any, index: number) => {
          console.log(`Run ${index + 1}:`, {
            fileName: run.fileName,
            source: run.source,
            stravaId: run.stravaId,
            date: run.startTime,
            distance: run.totalDistance,
            hasTracks: !!run.tracks,
            tracksLength: run.tracks?.length || 0,
            hasSplits: !!run.splits,
            splitsLength: run.splits?.length || 0
          })
        })
        
        // Compare with context
        if (parsedData.length !== parsed.length) {
          console.warn(`⚠️ MISMATCH: localStorage has ${parsed.length} items, but context has ${parsedData.length}`)
        }
      } catch (error) {
        console.error('Error parsing localStorage:', error)
      }
    } else {
      console.log('🔍 No data in localStorage')
    }
  }, [parsedData])

  // If no data, show error message
  if (parsedData.length === 0) {
    return (
      <div className="min-h-screen bg-organic-gradient py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center py-20"
          >
            <div className="bg-white/70 backdrop-blur-sm border-2 border-earth-200 rounded-organic-lg p-10 max-w-md mx-auto shadow-organic">
              <div className="text-6xl mb-6 animate-float">🌱</div>
              <h1 className="text-3xl font-bold text-earth-800 mb-4">No Runs Yet</h1>
              <p className="text-earth-700 mb-8 leading-relaxed">
                You haven't uploaded any GPX files yet. Let's get started—upload some running data to view your analysis.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center px-8 py-4 text-base font-medium rounded-organic-lg text-white bg-sage-600 hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300"
              >
                Upload GPX Files
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-organic-gradient dark:bg-gradient-to-br dark:from-earth-900 dark:via-earth-800 dark:to-earth-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-earth-800 dark:text-earth-100 mb-6 sm:mb-10">Running Analysis</h1>
          
          {/* Tabs */}
          <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-2 mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('runs')}
              className={`px-6 py-3 rounded-organic font-medium transition-all duration-300 ${
                activeTab === 'runs'
                  ? 'bg-sage-600 text-white shadow-organic'
                  : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
              }`}
            >
              Runs
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-3 rounded-organic font-medium transition-all duration-300 ${
                activeTab === 'stats'
                  ? 'bg-sage-600 text-white shadow-organic'
                  : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
              }`}
            >
              Statistics
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-6 py-3 rounded-organic font-medium transition-all duration-300 ${
                activeTab === 'achievements'
                  ? 'bg-sage-600 text-white shadow-organic'
                  : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
              }`}
            >
              Achievements
            </button>
            <button
              onClick={() => setActiveTab('goals')}
              className={`px-6 py-3 rounded-organic font-medium transition-all duration-300 ${
                activeTab === 'goals'
                  ? 'bg-sage-600 text-white shadow-organic'
                  : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
              }`}
            >
              Goals
            </button>
          </div>
          
          {/* Achievement Popups */}
          <AnimatePresence>
            {newlyUnlocked.map(achievementId => {
              const achievement = getAchievementById(achievementId)
              return achievement ? (
                <AchievementPopup
                  key={achievementId}
                  achievement={achievement}
                  onDismiss={clearNewlyUnlocked}
                />
              ) : null
            })}
          </AnimatePresence>
          
          {/* Tab Content */}
          {activeTab === 'runs' && (
            <>
              {/* Search and Filter Bar */}
              <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 mb-8">
            <div className="space-y-5">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search runs by name, tags, or notes..."
                  className="w-full px-5 py-3 border-2 border-earth-200 dark:border-earth-700 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 dark:bg-earth-700/80 text-earth-800 dark:text-earth-100 placeholder-earth-400 dark:placeholder-earth-500 transition-all duration-300"
                />
              </div>
              
              {/* Year Filters */}
              {allYears.length > 0 && (
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-medium text-earth-700 dark:text-earth-300">Year:</span>
                  {allYears.map(year => {
                    const isSelected = selectedYears.has(year)
                    return (
                      <div key={year} className="flex items-center gap-1 group">
                        <button
                          onClick={() => {
                            const newSelected = new Set(selectedYears)
                            if (newSelected.has(year)) {
                              newSelected.delete(year)
                              // Also clear month selections for this year
                              const newMonths = new Set(selectedMonths)
                              allMonths.forEach(m => {
                                if (m.year === year) newMonths.delete(m.key)
                              })
                              setSelectedMonths(newMonths)
                            } else {
                              newSelected.add(year)
                            }
                            setSelectedYears(newSelected)
                          }}
                          className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${
                            isSelected
                              ? 'bg-moss-500 text-white border-moss-600 shadow-organic'
                              : 'bg-earth-100 text-earth-700 border-earth-200 hover:border-moss-400 hover:bg-earth-50'
                          }`}
                        >
                          {year} {isSelected && '✓'}
                        </button>
                        {/* Remove from filter button for selected years */}
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              const newSelected = new Set(selectedYears)
                              newSelected.delete(year)
                              setSelectedYears(newSelected)
                              // Also clear month selections for this year
                              const newMonths = new Set(selectedMonths)
                              allMonths.forEach(m => {
                                if (m.year === year) newMonths.delete(m.key)
                              })
                              setSelectedMonths(newMonths)
                            }}
                            className="opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-earth-300 text-earth-800 hover:bg-earth-400 transition-all duration-300 text-xs font-bold"
                            title="Remove from filters"
                          >
                            ⊗
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              
              {/* Month Filters */}
              {allMonths.length > 0 && (
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-medium text-earth-700 dark:text-earth-300">Month:</span>
                  {allMonths.map(({ key, label }) => {
                    const isSelected = selectedMonths.has(key)
                    return (
                      <div key={key} className="flex items-center gap-1 group">
                        <button
                          onClick={() => {
                            const newSelected = new Set(selectedMonths)
                            if (newSelected.has(key)) {
                              newSelected.delete(key)
                            } else {
                              newSelected.add(key)
                              // Auto-select the year if not already selected
                              if (!selectedYears.has(allMonths.find(m => m.key === key)?.year || 0)) {
                                const monthYear = allMonths.find(m => m.key === key)?.year || 0
                                setSelectedYears(new Set([...selectedYears, monthYear]))
                              }
                            }
                            setSelectedMonths(newSelected)
                          }}
                          className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${
                            isSelected
                              ? 'bg-terracotta-500 text-white border-terracotta-600 shadow-organic'
                              : 'bg-earth-100 text-earth-700 border-earth-200 hover:border-terracotta-400 hover:bg-earth-50'
                          }`}
                        >
                          {label} {isSelected && '✓'}
                        </button>
                        {/* Remove from filter button for selected months */}
                        {isSelected && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              e.preventDefault()
                              const newSelected = new Set(selectedMonths)
                              newSelected.delete(key)
                              setSelectedMonths(newSelected)
                            }}
                            className="opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-earth-300 text-earth-800 hover:bg-earth-400 transition-all duration-300 text-xs font-bold"
                            title="Remove from filters"
                          >
                            ⊗
                          </button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
              
              {/* Tag Filters */}
              <div className="space-y-3">
                {/* Add Custom Tag */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-earth-700 dark:text-earth-300">Add Filter Tag:</span>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type tag name..."
                    className="flex-1 max-w-xs px-3 py-2 text-sm border-2 border-earth-200 dark:border-earth-700 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 dark:bg-earth-700/80 text-earth-800 dark:text-earth-100 placeholder-earth-400 dark:placeholder-earth-500 transition-all duration-300"
                  />
                  <button
                    onClick={handleAddCustomTag}
                    disabled={!newTagInput.trim() || customTags.includes(newTagInput.trim()) || runTags.includes(newTagInput.trim())}
                    className="px-4 py-2 text-sm rounded-organic bg-sage-600 text-white hover:bg-sage-700 disabled:bg-earth-300 disabled:cursor-not-allowed transition-all duration-300 font-medium"
                  >
                    Add
                  </button>
                </div>

                {/* Tag Filters */}
                {allTags.length > 0 && (
                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-sm font-medium text-earth-700 dark:text-earth-300">Tags:</span>
                    {allTags.map(tag => {
                      // Check if tag is custom (case-insensitive comparison, handling whitespace)
                      const isCustomTag = customTags.some(ct => 
                        ct.trim().toLowerCase() === tag.trim().toLowerCase()
                      )
                      const isRunTag = runTags.includes(tag)
                      const isSelected = selectedTags.has(tag)
                      
                      // Find which runs have this tag
                      const runsWithTag = parsedData.filter(run => 
                        (run.tags || []).includes(tag)
                      )
                      
                      return (
                        <div key={tag} className="flex items-center gap-1 group">
                          <button
                            onClick={() => {
                              const newSelected = new Set(selectedTags)
                              if (newSelected.has(tag)) {
                                newSelected.delete(tag)
                              } else {
                                newSelected.add(tag)
                              }
                              setSelectedTags(newSelected)
                            }}
                            className={`px-4 py-2 text-sm rounded-full border-2 transition-all duration-300 flex items-center gap-2 ${
                              isSelected
                                ? 'bg-sage-500 text-white border-sage-600 shadow-organic'
                                : 'bg-earth-100 text-earth-700 border-earth-200 hover:border-sage-400 hover:bg-earth-50'
                            }`}
                          >
                            {tag} {isSelected && '✓'}
                            {isCustomTag && (
                              <span className="text-xs opacity-75" title={isRunTag ? "Custom filter tag (also exists on runs)" : "Custom filter tag"}>{
                                isRunTag ? "(custom+run)" : "(custom)"
                              }</span>
                            )}
                            {isRunTag && runsWithTag.length > 0 && (
                              <span className="text-xs opacity-75" title={`Used in ${runsWithTag.length} run${runsWithTag.length !== 1 ? 's' : ''}`}>
                                ({runsWithTag.length})
                              </span>
                            )}
                          </button>
                          {/* Delete button for custom tags - show if it's a custom tag */}
                          {isCustomTag && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                
                                // Find the exact tag name from customTags (case-insensitive match)
                                const exactTag = customTags.find(ct => 
                                  ct.trim().toLowerCase() === tag.trim().toLowerCase()
                                )
                                
                                if (!exactTag) {
                                  alert(`Cannot delete: "${tag}" is not found in custom tags.`)
                                  return
                                }
                                
                                const message = isRunTag 
                                  ? `Delete "${tag}" from custom filter tags? (It will still appear because it's used in ${runsWithTag.length} run${runsWithTag.length !== 1 ? 's' : ''}.)`
                                  : `Delete custom tag "${tag}"?`
                                
                                if (confirm(message)) {
                                  handleDeleteCustomTag(exactTag)
                                }
                              }}
                              className="opacity-100 w-7 h-7 flex items-center justify-center rounded-full bg-terracotta-100 text-terracotta-800 hover:bg-terracotta-200 hover:text-terracotta-900 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md z-10"
                              title={`Delete "${tag}" from custom filter tags${isRunTag ? ` (will still show from ${runsWithTag.length} run${runsWithTag.length !== 1 ? 's' : ''})` : ''}`}
                            >
                              ×
                            </button>
                          )}
                          {/* Remove tag from runs button - show if tag exists in runs */}
                          {isRunTag && runsWithTag.length > 0 && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                
                                const message = `Remove "${tag}" from ${runsWithTag.length} run${runsWithTag.length !== 1 ? 's' : ''}? This will remove the tag from all runs that have it.`
                                
                                if (confirm(message)) {
                                  // Remove tag from all runs that have it
                                  runsWithTag.forEach(run => {
                                    const updatedTags = (run.tags || []).filter(t => t !== tag)
                                    const updatedRun: GPXData = {
                                      ...run,
                                      tags: updatedTags.length > 0 ? updatedTags : undefined
                                    }
                                    updateRun(updatedRun)
                                  })
                                  
                                  // Also remove from custom tags if it exists there
                                  if (isCustomTag) {
                                    const exactTag = customTags.find(ct => 
                                      ct.trim().toLowerCase() === tag.trim().toLowerCase()
                                    )
                                    if (exactTag) {
                                      handleDeleteCustomTag(exactTag)
                                    }
                                  }
                                  
                                  // Remove from selected tags
                                  const newSelected = new Set(selectedTags)
                                  newSelected.delete(tag)
                                  setSelectedTags(newSelected)
                                }
                              }}
                              className="opacity-100 w-7 h-7 flex items-center justify-center rounded-full bg-red-100 text-red-800 hover:bg-red-200 hover:text-red-900 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md z-10"
                              title={`Remove "${tag}" from all ${runsWithTag.length} run${runsWithTag.length !== 1 ? 's' : ''}`}
                            >
                              🗑️
                            </button>
                          )}
                          {/* Show info if tag exists in both custom and runs */}
                          {isCustomTag && isRunTag && (
                            <span className="text-xs text-earth-600 opacity-75" title="This tag exists in both custom filters and your runs. Deleting from custom filters will remove it from filters, but it will still appear because it's used in your runs.">
                              (in runs)
                            </span>
                          )}
                          {/* Remove from filter button for selected tags */}
                          {isSelected && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                const newSelected = new Set(selectedTags)
                                newSelected.delete(tag)
                                setSelectedTags(newSelected)
                              }}
                              className="opacity-100 w-6 h-6 flex items-center justify-center rounded-full bg-earth-300 text-earth-800 hover:bg-earth-400 transition-all duration-300 text-xs font-bold"
                              title="Remove from filters"
                            >
                              ⊗
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
              
              {/* Clear All Filters */}
              {(selectedTags.size > 0 || selectedYears.size > 0 || selectedMonths.size > 0 || searchQuery.trim()) && (
                <div className="pt-4 border-t border-earth-200">
                  <button
                    onClick={() => {
                      setSelectedTags(new Set())
                      setSelectedYears(new Set())
                      setSelectedMonths(new Set())
                      setSearchQuery('')
                    }}
                    className="px-5 py-2.5 text-sm rounded-organic bg-earth-200 text-earth-800 border-2 border-earth-300 hover:bg-earth-300 hover:border-earth-400 transition-all duration-300"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Results count */}
            {filteredRuns.length !== parsedData.length && (
              <div className="mt-5 pt-5 border-t border-earth-200 text-sm text-earth-600">
                Showing {filteredRuns.length} of {parsedData.length} runs
              </div>
            )}
          </div>
          
          {/* PR Badge Notification */}
          <PRBadge prTypes={newPRs} onDismiss={clearNewPRs} />
          
          {/* Best Efforts Grid */}
          <BestEffortsGrid bestEfforts={bestEfforts} />

          {/* Calendar & Map Section */}
          {parsedData.length > 0 && !showComparison && (
            <div className="mb-10">
              <h2 className="text-3xl font-semibold text-earth-800 dark:text-earth-100 mb-8">Calendar View</h2>
              
              <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
                <RunCalendar 
                  runs={parsedData} 
                  selectedRun={selectedRun}
                  onSelectRun={handleSelectRun} 
                />
              </div>
            </div>
          )}

          {/* Bulk Actions Toolbar */}
          {showBulkActions && selectedRuns.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-sage-100 dark:bg-sage-900/50 border-2 border-sage-300 dark:border-sage-700 rounded-organic-lg p-4 mb-6 sticky top-20 z-40"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="font-semibold text-earth-800 dark:text-earth-100">
                    {selectedRuns.size} run{selectedRuns.size !== 1 ? 's' : ''} selected
                  </span>
                  <button
                    onClick={deselectAllRuns}
                    className="text-sm text-earth-600 dark:text-earth-300 hover:text-earth-800 dark:hover:text-earth-100 underline"
                  >
                    Clear selection
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Add tag..."
                      value={bulkTagInput}
                      onChange={(e) => setBulkTagInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleBulkAddTag()
                        }
                      }}
                      className="px-3 py-2 rounded-organic border-2 border-earth-200 dark:border-earth-700 focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white dark:bg-earth-800 text-earth-800 dark:text-earth-100 placeholder-earth-400 dark:placeholder-earth-500 text-sm"
                    />
                    <button
                      onClick={handleBulkAddTag}
                      className="px-4 py-2 rounded-organic bg-sage-600 text-white hover:bg-sage-700 transition-all duration-300 font-medium text-sm"
                    >
                      Add Tag
                    </button>
                  </div>
                  <button
                    onClick={handleBulkDelete}
                    className="px-4 py-2 rounded-organic bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/70 border-2 border-red-300 dark:border-red-700 transition-all duration-300 font-medium text-sm"
                  >
                    Delete Selected
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Individual Run Sections */}
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-earth-800 dark:text-earth-100">Runs</h2>
            {filteredRuns.length > 0 && (
              <button
                onClick={selectedRuns.size === filteredRuns.length ? deselectAllRuns : selectAllRuns}
                className="text-sm text-sage-600 dark:text-sage-400 hover:text-sage-700 dark:hover:text-sage-300 font-medium underline"
              >
                {selectedRuns.size === filteredRuns.length ? 'Deselect All' : 'Select All'}
              </button>
            )}
          </div>
          <div className="space-y-6">
            {/* Selected Run Card (if selected and not in filtered list) */}
            {selectedRun && !filteredRuns.some(r => 
              selectedRun.source === 'strava' && selectedRun.stravaId
                ? r.source === 'strava' && r.stravaId === selectedRun.stravaId
                : r.fileName === selectedRun.fileName && r.startTime.getTime() === selectedRun.startTime.getTime()
            ) && (() => {
              const selectedRunIndex = parsedData.findIndex(r => 
                selectedRun.source === 'strava' && selectedRun.stravaId 
                  ? r.source === 'strava' && r.stravaId === selectedRun.stravaId
                  : r.fileName === selectedRun.fileName && r.startTime.getTime() === selectedRun.startTime.getTime()
              )
              return (
                <motion.div
                  key={`selected-${selectedRun.fileName}-${selectedRun.startTime.getTime()}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="border-2 border-sage-400 dark:border-sage-600 rounded-organic-lg bg-sage-50/50 dark:bg-sage-900/30 backdrop-blur-sm shadow-organic hover:shadow-organic-lg overflow-hidden transition-all duration-300"
                >
                  {/* Header - always visible */}
                  <div 
                    onClick={() => setShowSelectedRunDetails(!showSelectedRunDetails)} 
                    className="cursor-pointer p-6 hover:bg-sage-100/50 dark:hover:bg-sage-800/50 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100 flex items-center space-x-3 flex-wrap">
                            <span>Run {selectedRunIndex >= 0 ? selectedRunIndex + 1 : ''}: {selectedRun.fileName}</span>
                            {selectedRun.source === 'strava' && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-terracotta-100 dark:bg-terracotta-900/50 text-terracotta-800 dark:text-terracotta-200 border border-terracotta-200 dark:border-terracotta-700">
                                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                                </svg>
                                Strava
                              </span>
                            )}
                            {/* Tags */}
                            {selectedRun.tags && selectedRun.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {selectedRun.tags.map(tag => (
                                  <span
                                    key={tag}
                                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sage-100 dark:bg-sage-900/50 text-sage-800 dark:text-sage-200 border border-sage-200 dark:border-sage-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </h3>
                          <p className="text-sm text-earth-600 dark:text-earth-400 mt-2">
                            {selectedRun.startTime.toLocaleDateString()} • {selectedRun.source === 'strava' ? `${(selectedRun.totalDistance / 1609.34).toFixed(1)} miles` : `${selectedRun.splits.length} mile${selectedRun.splits.length !== 1 ? 's' : ''}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSelectedRun(null)
                          }}
                          className="px-3 py-1.5 text-sm rounded-organic bg-earth-200 dark:bg-earth-700 text-earth-800 dark:text-earth-200 hover:bg-earth-300 dark:hover:bg-earth-600 border-2 border-earth-300 dark:border-earth-600 transition-all duration-300 font-medium"
                          title="Clear selection"
                        >
                          Close
                        </button>
                        <motion.svg
                          className="w-6 h-6 text-earth-600 dark:text-earth-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          animate={{ rotate: showSelectedRunDetails ? 180 : 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </motion.svg>
                      </div>
                    </div>
                  </div>
                  
                  {/* Expanded content */}
                  <AnimatePresence>
                    {showSelectedRunDetails && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-sage-300 dark:border-sage-700"
                      >
                        <div className="p-6 space-y-6">
                          <RunDetails run={selectedRun} onUpdate={updateRun} />
                          <RunMap run={selectedRun} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })()}
            
            {filteredRuns.map((run, index) => {
              // Find original index for expanded state
              const originalIndex = parsedData.findIndex(r => 
                run.source === 'strava' && run.stravaId 
                  ? r.source === 'strava' && r.stravaId === run.stravaId
                  : r.fileName === run.fileName && r.startTime.getTime() === run.startTime.getTime()
              )
              return (
              <motion.div
                key={`${run.fileName}-${run.startTime.getTime()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                className="border-2 border-earth-200 rounded-organic-lg bg-white/70 backdrop-blur-sm shadow-organic hover:shadow-organic-lg overflow-hidden transition-all duration-300"
              >
                {/* Header - always visible */}
                <div 
                  onClick={() => toggleRun(originalIndex)} 
                  className="cursor-pointer p-6 hover:bg-earth-50/50 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Checkbox for bulk selection */}
                      <input
                        type="checkbox"
                        checked={selectedRuns.has(getRunId(run))}
                        onChange={(e) => {
                          e.stopPropagation()
                          toggleRunSelection(run)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-5 h-5 rounded border-2 border-earth-300 text-sage-600 focus:ring-sage-500 focus:ring-2 cursor-pointer"
                      />
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-earth-800 flex items-center space-x-3 flex-wrap">
                          <span>Run {originalIndex + 1}: {run.fileName}</span>
                          {run.source === 'strava' && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-terracotta-100 text-terracotta-800 border border-terracotta-200">
                              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                              </svg>
                              Strava
                            </span>
                          )}
                          {/* Tags */}
                          {run.tags && run.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {run.tags.map(tag => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-sage-100 text-sage-800 border border-sage-200"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </h3>
                        <p className="text-sm text-earth-600 mt-2">
                          {run.startTime.toLocaleDateString()} • {run.source === 'strava' ? `${(run.totalDistance / 1609.34).toFixed(1)} miles` : `${run.splits.length} mile${run.splits.length !== 1 ? 's' : ''}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (confirm(`Delete "${run.fileName}"? This action cannot be undone.`)) {
                            deleteRun(run)
                            // Also remove from expanded runs if it was expanded
                            const newExpanded = new Set(expandedRuns)
                            newExpanded.delete(originalIndex)
                            setExpandedRuns(newExpanded)
                            // Clear selected run if it was the deleted one
                            if (selectedRun && (
                              (run.source === 'strava' && run.stravaId && selectedRun.source === 'strava' && selectedRun.stravaId === run.stravaId) ||
                              (run.fileName === selectedRun.fileName && run.startTime.getTime() === selectedRun.startTime.getTime())
                            )) {
                              setSelectedRun(null)
                            }
                            // Remove from selected runs if it was selected
                            const runId = getRunId(run)
                            if (selectedRuns.has(runId)) {
                              const newSelected = new Set(selectedRuns)
                              newSelected.delete(runId)
                              setSelectedRuns(newSelected)
                              setShowBulkActions(newSelected.size > 0)
                            }
                          }
                        }}
                        className="px-3 py-1.5 text-sm rounded-organic bg-red-100 text-red-800 hover:bg-red-200 border-2 border-red-300 hover:border-red-400 transition-all duration-300 font-medium"
                        title="Delete this run"
                      >
                        Delete
                      </button>
                      <div className="text-right text-sm">
                        <div className="font-medium text-earth-800">{formatDistance(run.totalDistance)}</div>
                        <div className="text-earth-600">{formatPace(run.avgPace)}</div>
                        {/* Debug: Show raw pace value */}
                        {run.source === 'strava' && (
                          <div className="text-xs text-earth-400">
                            Raw pace: {run.avgPace.toFixed(2)} min/mi
                          </div>
                        )}
                      </div>
                      <motion.div
                        animate={{ rotate: expandedRuns.has(originalIndex) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="text-gray-400"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </motion.div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded content */}
                <AnimatePresence>
                  {expandedRuns.has(originalIndex) && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="border-t"
                    >
                      <div className="p-6 grid md:grid-cols-2 gap-6">
                        <PacePerMileChart data={run.splits} source={run.source} />
                        <RightChartsPanel run={run} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
            })}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8"
          >
            <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-8">
              <h3 className="text-xl font-semibold text-earth-800 dark:text-earth-100 mb-4">
                Data Management
              </h3>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => exportDataAsJSON(parsedData, stories, goals, unlockedIds, customTags)}
                  className="inline-flex items-center px-6 py-3 rounded-organic bg-sage-600 text-white hover:bg-sage-700 shadow-organic-lg transition-all duration-300 font-medium"
                  title="Export all data as JSON backup"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export All Data (JSON)
                </button>
                
                <button
                  onClick={() => exportRunsAsCSV(parsedData)}
                  className="inline-flex items-center px-6 py-3 rounded-organic bg-moss-600 text-white hover:bg-moss-700 shadow-organic-lg transition-all duration-300 font-medium"
                  title="Export runs as CSV"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Runs (CSV)
                </button>
                
                <Link
                  to="/upload"
                  className="inline-flex items-center px-6 py-3 rounded-organic bg-terracotta-600 text-white hover:bg-terracotta-700 shadow-organic-lg transition-all duration-300 font-medium"
                >
                  Upload More Files
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                {parsedData.some(run => run.source === 'strava') && (
                  <button
                    onClick={removeDuplicates}
                    className="inline-flex items-center px-6 py-3 rounded-organic bg-earth-200 dark:bg-earth-700 text-earth-800 dark:text-earth-200 hover:bg-earth-300 dark:hover:bg-earth-600 border-2 border-earth-300 dark:border-earth-600 transition-all duration-300 font-medium"
                  >
                    Remove Duplicates
                    <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
                
                <button
                  onClick={clearAllData}
                  className="inline-flex items-center px-6 py-3 rounded-organic bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-900/50 border-2 border-red-300 dark:border-red-700 transition-all duration-300 font-medium"
                >
                  Clear All Data
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clipRule="evenodd" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
            </>
          )}

          {/* Statistics Tab */}
          {activeTab === 'stats' && (
            <>
              {parsedData.length === 0 ? (
                <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-12 text-center">
                  <div className="text-6xl mb-4">📊</div>
                  <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100 mb-2">No Data Available</h2>
                  <p className="text-earth-600 dark:text-earth-300">Upload some runs to see your statistics!</p>
                </div>
              ) : (
                <>
                  {/* Activity Heatmap - At the top */}
                  <ActivityHeatmap runs={parsedData} range="all" />

                  {/* Overall Stats Cards */}
                  {overallStats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 border-2 border-sage-200 dark:border-sage-700"
                      >
                        <div className="text-3xl font-bold text-sage-700 dark:text-sage-400">{overallStats.totalRuns}</div>
                        <div className="text-sm text-earth-600 dark:text-earth-300 mt-1">Total Runs</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 border-2 border-moss-200 dark:border-moss-700"
                      >
                        <div className="text-3xl font-bold text-moss-700 dark:text-moss-400">{overallStats.totalDistanceMiles.toFixed(1)}</div>
                        <div className="text-sm text-earth-600 dark:text-earth-300 mt-1">Total Miles</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 border-2 border-terracotta-200 dark:border-terracotta-700"
                      >
                        <div className="text-3xl font-bold text-terracotta-700 dark:text-terracotta-400">{formatPace(overallStats.averagePace)}</div>
                        <div className="text-sm text-earth-600 dark:text-earth-300 mt-1">Avg Pace</div>
                      </motion.div>
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 border-2 border-earth-200 dark:border-earth-700"
                      >
                        <div className="text-3xl font-bold text-earth-700 dark:text-earth-400">{overallStats.totalElevation.toFixed(0)}m</div>
                        <div className="text-sm text-earth-600 dark:text-earth-300 mt-1">Elevation</div>
                      </motion.div>
                    </div>
                  )}

                  {/* Year-over-Year Comparison */}
                  {yearOverYearData && yearOverYearData.length >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 mb-8"
                    >
                      <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100 mb-4">Year-over-Year Comparison</h2>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-b-2 border-earth-200 dark:border-earth-700">
                              <th className="pb-3 text-earth-800 dark:text-earth-100 font-semibold">Year</th>
                              <th className="pb-3 text-earth-800 dark:text-earth-100 font-semibold">Runs</th>
                              <th className="pb-3 text-earth-800 dark:text-earth-100 font-semibold">Distance</th>
                              <th className="pb-3 text-earth-800 dark:text-earth-100 font-semibold">Avg Pace</th>
                              <th className="pb-3 text-earth-800 dark:text-earth-100 font-semibold">Elevation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {yearOverYearData.map((yearData, index) => {
                              const prevYear = index > 0 ? yearOverYearData[index - 1] : null
                              const distanceChange = prevYear 
                                ? ((yearData.totalDistanceMiles - prevYear.totalDistanceMiles) / prevYear.totalDistanceMiles * 100)
                                : 0
                              const paceChange = prevYear && prevYear.averagePace > 0
                                ? ((yearData.averagePace - prevYear.averagePace) / prevYear.averagePace * 100)
                                : 0

                              return (
                                <tr key={yearData.year} className="border-b border-earth-100 dark:border-earth-700">
                                  <td className="py-3 font-medium text-earth-800 dark:text-earth-100">{yearData.year}</td>
                                  <td className="py-3 text-earth-700 dark:text-earth-300">{yearData.runCount}</td>
                                  <td className="py-3 text-earth-700 dark:text-earth-300">
                                    {yearData.totalDistanceMiles.toFixed(1)} mi
                                    {prevYear && (
                                      <span className={`ml-2 text-xs ${distanceChange >= 0 ? 'text-sage-600' : 'text-red-600'}`}>
                                        ({distanceChange >= 0 ? '+' : ''}{distanceChange.toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 text-earth-700 dark:text-earth-300">
                                    {formatPace(yearData.averagePace)}
                                    {prevYear && paceChange !== 0 && (
                                      <span className={`ml-2 text-xs ${paceChange <= 0 ? 'text-sage-600' : 'text-red-600'}`}>
                                        ({paceChange >= 0 ? '+' : ''}{paceChange.toFixed(1)}%)
                                      </span>
                                    )}
                                  </td>
                                  <td className="py-3 text-earth-700 dark:text-earth-300">{yearData.totalElevation.toFixed(0)}m</td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </motion.div>
                  )}

                  {/* Best Periods */}
                  {bestPeriods && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 mb-8"
                    >
                      <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100 mb-4">Best Periods</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {bestPeriods.bestDistance && (
                          <div className="bg-sage-50/50 dark:bg-sage-900/30 rounded-organic-lg p-4 border-2 border-sage-200 dark:border-sage-700">
                            <div className="text-sm text-earth-600 dark:text-earth-300 mb-1">🏆 Best Distance</div>
                            <div className="text-lg font-bold text-sage-700 dark:text-sage-400">
                              {(bestPeriods.bestDistance.totalDistance / 1609.34).toFixed(1)} mi
                            </div>
                            <div className="text-xs text-earth-500 dark:text-earth-400 mt-1">{bestPeriods.bestDistance.period}</div>
                          </div>
                        )}
                        {bestPeriods.bestPace && (
                          <div className="bg-moss-50/50 dark:bg-moss-900/30 rounded-organic-lg p-4 border-2 border-moss-200 dark:border-moss-700">
                            <div className="text-sm text-earth-600 dark:text-earth-300 mb-1">⚡ Best Pace</div>
                            <div className="text-lg font-bold text-moss-700 dark:text-moss-400">
                              {formatPace(bestPeriods.bestPace.averagePace)}
                            </div>
                            <div className="text-xs text-earth-500 dark:text-earth-400 mt-1">{bestPeriods.bestPace.period}</div>
                          </div>
                        )}
                        {bestPeriods.bestElevation && (
                          <div className="bg-terracotta-50/50 dark:bg-terracotta-900/30 rounded-organic-lg p-4 border-2 border-terracotta-200 dark:border-terracotta-700">
                            <div className="text-sm text-earth-600 dark:text-earth-300 mb-1">⛰️ Most Elevation</div>
                            <div className="text-lg font-bold text-terracotta-700 dark:text-terracotta-400">
                              {bestPeriods.bestElevation.totalElevation.toFixed(0)}m
                            </div>
                            <div className="text-xs text-earth-500 dark:text-earth-400 mt-1">{bestPeriods.bestElevation.period}</div>
                          </div>
                        )}
                        {bestPeriods.mostRuns && (
                          <div className="bg-earth-50/50 dark:bg-earth-900/30 rounded-organic-lg p-4 border-2 border-earth-200 dark:border-earth-700">
                            <div className="text-sm text-earth-600 dark:text-earth-300 mb-1">🔥 Most Runs</div>
                            <div className="text-lg font-bold text-earth-700 dark:text-earth-400">
                              {bestPeriods.mostRuns.runCount} runs
                            </div>
                            <div className="text-xs text-earth-500 dark:text-earth-400 mt-1">{bestPeriods.mostRuns.period}</div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* Trends Charts */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 mb-8"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100">Trends & Progress</h2>
                      <div className="flex flex-wrap gap-2">
                        {periods.map(period => (
                          <button
                            key={period.value}
                            onClick={() => setStatsPeriod(period.value)}
                            className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                              statsPeriod === period.value
                                ? 'bg-sage-600 text-white shadow-organic'
                                : 'bg-earth-100 dark:bg-earth-700 text-earth-700 dark:text-earth-300 hover:bg-earth-200 dark:hover:bg-earth-600'
                            }`}
                          >
                            {period.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {trendData.length > 0 ? (
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <WeeklyDistanceChart data={trendData} />
                        <PaceTrendChart data={trendData} />
                        <ElevationTrendChart data={trendData} />
                      </div>
                    ) : (
                      <div className="text-center py-8 text-earth-500 dark:text-earth-400">
                        <div className="text-4xl mb-2">📊</div>
                        <p>No runs found for the selected period</p>
                        <p className="text-sm mt-1">Try selecting a different time range</p>
                      </div>
                    )}
                  </motion.div>
                </>
              )}
            </>
          )}

          {/* Achievements Tab */}
          {activeTab === 'achievements' && (
            <AchievementsPanel achievements={achievements} unlockedIds={unlockedIds} runs={parsedData} />
          )}

          {/* Goals Tab */}
          {activeTab === 'goals' && (
            <GoalTracker />
          )}
        </motion.div>
      </div>

      {/* Floating Compare Button */}
      {parsedData.length >= 2 && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowComparison(true)}
          className="fixed bottom-8 right-8 bg-gradient-to-r from-sage-600 to-moss-600 dark:from-sage-700 dark:to-moss-700 text-white rounded-full p-4 shadow-organic-lg hover:shadow-organic-xl transition-shadow z-40"
          title="Compare Runs"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </motion.button>
      )}

      {/* Run Comparison Modal */}
      <AnimatePresence>
        {showComparison && (
          <RunComparison 
            runs={parsedData} 
            onClose={() => setShowComparison(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default Analysis
