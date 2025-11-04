import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useDataContext } from '../contexts/DataContext'
import { formatDistance, formatPace, GPXData } from '../utils/gpxParser'
import { getMostRecentRun } from '../utils/runHelpers'
import { useBestEfforts } from '../hooks/useBestEfforts'
import PacePerMileChart from '../components/PacePerMileChart'
import RightChartsPanel from '../components/RightChartsPanel'
import RunCalendar from '../components/RunCalendar'
import RunMap from '../components/RunMap'
import RunDetails from '../components/RunDetails'
import BestEffortsGrid from '../components/BestEffortsGrid'
import PRBadge from '../components/PRBadge'
import StatsOverview from '../components/StatsOverview'
import RunComparison from '../components/RunComparison'

const Analysis = () => {
  const { parsedData, removeDuplicates, clearAllData, updateRun } = useDataContext()
  const [expandedRuns, setExpandedRuns] = useState<Set<number>>(new Set())
  const [selectedRun, setSelectedRun] = useState<GPXData | null>(
    parsedData.length > 0 ? getMostRecentRun(parsedData) : null
  )
  const [showComparison, setShowComparison] = useState(false)
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set())
  const [selectedYears, setSelectedYears] = useState<Set<number>>(new Set())
  const [selectedMonths, setSelectedMonths] = useState<Set<string>>(new Set()) // Format: "YYYY-MM"
  const [searchQuery, setSearchQuery] = useState('')
  const [customTags, setCustomTags] = useState<string[]>([]) // Manually added filter tags
  const [newTagInput, setNewTagInput] = useState('')
  
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

  // Calculate summary statistics (use filtered runs if filters are active)
  const displayRuns = filteredRuns.length < parsedData.length ? filteredRuns : parsedData
  const totalRuns = displayRuns.length
  const totalDistance = displayRuns.reduce((sum, run) => sum + run.totalDistance, 0)
  const totalElevation = displayRuns.reduce((sum, run) => sum + run.elevationGain, 0)
  const avgPace = totalRuns > 0 ? displayRuns.reduce((sum, run) => sum + run.avgPace, 0) / totalRuns : 0

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
    <div className="min-h-screen bg-organic-gradient py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-earth-800 mb-10">Running Analysis</h1>
          
          {/* Search and Filter Bar */}
          <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6 mb-8">
            <div className="space-y-5">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search runs by name, tags, or notes..."
                  className="w-full px-5 py-3 border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 text-earth-800 placeholder-earth-400 transition-all duration-300"
                />
              </div>
              
              {/* Year Filters */}
              {allYears.length > 0 && (
                <div className="flex flex-wrap gap-3 items-center">
                  <span className="text-sm font-medium text-earth-700">Year:</span>
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
                  <span className="text-sm font-medium text-earth-700">Month:</span>
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
                  <span className="text-sm font-medium text-earth-700">Add Filter Tag:</span>
                  <input
                    type="text"
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Type tag name..."
                    className="flex-1 max-w-xs px-3 py-2 text-sm border-2 border-earth-200 rounded-organic focus:outline-none focus:ring-2 focus:ring-sage-400 focus:border-sage-400 bg-white/80 text-earth-800 placeholder-earth-400 transition-all duration-300"
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
                    <span className="text-sm font-medium text-earth-700">Tags:</span>
                    {allTags.map(tag => {
                      // Check if tag is custom (case-insensitive comparison, handling whitespace)
                      const isCustomTag = customTags.some(ct => 
                        ct.trim().toLowerCase() === tag.trim().toLowerCase()
                      )
                      const isRunTag = runTags.includes(tag)
                      const isSelected = selectedTags.has(tag)
                      
                      // A tag is deletable ONLY if it's custom AND NOT in runTags
                      // If it's in runTags, it came from actual runs and shouldn't be deleted
                      const isDeletable = isCustomTag && !isRunTag
                      
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
                          </button>
                          {/* Delete button ONLY for tags that are custom but NOT in runs */}
                          {isDeletable && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                e.preventDefault()
                                console.log('=== DELETE TAG DEBUG ===')
                                console.log('Tag to delete:', tag)
                                console.log('All customTags:', customTags)
                                console.log('All runTags:', runTags)
                                console.log('Is custom tag?', isCustomTag)
                                console.log('Is run tag?', isRunTag)
                                console.log('Is deletable?', isDeletable)
                                
                                // Find the exact tag name from customTags (case-sensitive match)
                                const exactTag = customTags.find(ct => 
                                  ct.trim().toLowerCase() === tag.trim().toLowerCase()
                                )
                                console.log('Found exact tag in customTags:', exactTag)
                                
                                if (!exactTag) {
                                  alert(`Cannot delete: "${tag}" is not found in custom tags. It may only exist in your runs.`)
                                  return
                                }
                                
                                if (confirm(`Delete custom tag "${tag}"?`)) {
                                  handleDeleteCustomTag(exactTag)
                                }
                              }}
                              className="opacity-100 w-7 h-7 flex items-center justify-center rounded-full bg-terracotta-100 text-terracotta-800 hover:bg-terracotta-200 hover:text-terracotta-900 transition-all duration-300 text-sm font-bold shadow-sm hover:shadow-md z-10"
                              title={`Delete custom tag "${tag}"`}
                            >
                              ×
                            </button>
                          )}
                          {/* Show info if tag exists in both custom and runs */}
                          {isCustomTag && isRunTag && (
                            <span className="text-xs text-earth-600 opacity-75" title="This tag exists in both custom filters and your runs. Cannot delete because it's used in runs.">
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
          
          {/* Stats Overview / Trend Charts */}
          <StatsOverview runs={displayRuns} />
          
          {/* Summary Cards */}
          <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-8 mb-10">
            <h2 className="text-2xl font-semibold text-earth-800 mb-6">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              <motion.div 
                className="bg-sage-50/80 rounded-organic-lg p-6 border-2 border-sage-200 hover:border-sage-300 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-sage-700">{totalRuns}</div>
                <div className="text-sm text-sage-600 mt-1">Total Runs</div>
              </motion.div>
              <motion.div 
                className="bg-moss-50/80 rounded-organic-lg p-6 border-2 border-moss-200 hover:border-moss-300 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-moss-700">{formatDistance(totalDistance)}</div>
                <div className="text-sm text-moss-600 mt-1">Total Distance</div>
              </motion.div>
              <motion.div 
                className="bg-terracotta-50/80 rounded-organic-lg p-6 border-2 border-terracotta-200 hover:border-terracotta-300 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-terracotta-700">{formatPace(avgPace)}</div>
                <div className="text-sm text-terracotta-600 mt-1">Avg Pace (per mi)</div>
              </motion.div>
              <motion.div 
                className="bg-earth-100/80 rounded-organic-lg p-6 border-2 border-earth-300 hover:border-earth-400 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl font-bold text-earth-700">{totalElevation.toFixed(0)}m</div>
                <div className="text-sm text-earth-600 mt-1">Elevation</div>
              </motion.div>
            </div>
          </div>

          {/* Calendar & Map Section */}
          {parsedData.length > 0 && !showComparison && (
            <div className="mb-10">
              <h2 className="text-3xl font-semibold text-earth-800 mb-8">Calendar & Map View</h2>
              
              <div className="grid lg:grid-cols-2 gap-8">
                {/* Left: Calendar */}
                <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-6">
                  <RunCalendar 
                    runs={parsedData} 
                    selectedRun={selectedRun}
                    onSelectRun={handleSelectRun} 
                  />
                </div>
                
                {/* Right: Map and Details */}
                <div className="space-y-6">
                  {selectedRun && (
                    <>
                      <RunDetails run={selectedRun} onUpdate={updateRun} />
                      <RunMap run={selectedRun} />
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Individual Run Sections */}
          <div className="space-y-6">
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
                    <div className="flex items-center space-x-4">
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
            className="mt-8 text-center"
          >
            <div className="bg-blue-50 rounded-lg p-8">
              <h3 className="text-xl font-semibold text-blue-900 mb-2">
                Upload More Runs
              </h3>
              <p className="text-blue-700 mb-4">
                Add more GPX files to get deeper insights and better analysis.
              </p>
              <div className="flex space-x-4">
                <Link
                  to="/upload"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Upload More Files
                  <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </Link>
                
                {parsedData.some(run => run.source === 'strava') && (
                  <button
                    onClick={removeDuplicates}
                    className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
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
                  className="inline-flex items-center px-6 py-3 border border-red-300 text-base font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
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
          className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full p-4 shadow-2xl hover:shadow-3xl transition-shadow z-40"
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
