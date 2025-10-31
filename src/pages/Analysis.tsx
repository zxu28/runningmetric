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
  const [searchQuery, setSearchQuery] = useState('')
  
  // Use best efforts hook
  const { bestEfforts, newPRs, clearNewPRs } = useBestEfforts(parsedData)
  
  // Get all unique tags from runs
  const allTags = Array.from(new Set(
    parsedData.flatMap(run => run.tags || [])
  )).sort()
  
  // Get all unique years from runs (sorted descending)
  const allYears = Array.from(new Set(
    parsedData.map(run => run.startTime.getFullYear())
  )).sort((a, b) => b - a) // Most recent first
  
  // Filter runs based on selected tags, years, and search query
  const filteredRuns = parsedData.filter(run => {
    // Filter by tags
    if (selectedTags.size > 0) {
      const runTags = run.tags || []
      const hasSelectedTag = Array.from(selectedTags).some(tag => runTags.includes(tag))
      if (!hasSelectedTag) return false
    }
    
    // Filter by year
    if (selectedYears.size > 0) {
      const runYear = run.startTime.getFullYear()
      if (!selectedYears.has(runYear)) return false
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

  const handleSelectRun = (run: GPXData) => {
    setSelectedRun(run)
  }

  // Debug: Log localStorage data and context state
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
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center py-16"
          >
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-800 mb-4">No Data Available</h1>
              <p className="text-red-600 mb-6">
                You haven't uploaded any GPX files yet. Please upload some running data to view your analysis.
              </p>
              <Link
                to="/upload"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Running Analysis</h1>
          
          {/* Search and Filter Bar */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="space-y-4">
              {/* Search */}
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search runs by name, tags, or notes..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Year Filters */}
              {allYears.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">Year:</span>
                  {allYears.map(year => (
                    <button
                      key={year}
                      onClick={() => {
                        const newSelected = new Set(selectedYears)
                        if (newSelected.has(year)) {
                          newSelected.delete(year)
                        } else {
                          newSelected.add(year)
                        }
                        setSelectedYears(newSelected)
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedYears.has(year)
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-purple-500'
                      }`}
                    >
                      {year} {selectedYears.has(year) && '✓'}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Tag Filters */}
              {allTags.length > 0 && (
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-sm font-medium text-gray-700">Tags:</span>
                  {allTags.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        const newSelected = new Set(selectedTags)
                        if (newSelected.has(tag)) {
                          newSelected.delete(tag)
                        } else {
                          newSelected.add(tag)
                        }
                        setSelectedTags(newSelected)
                      }}
                      className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                        selectedTags.has(tag)
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-blue-500'
                      }`}
                    >
                      {tag} {selectedTags.has(tag) && '✓'}
                    </button>
                  ))}
                </div>
              )}
              
              {/* Clear All Filters */}
              {(selectedTags.size > 0 || selectedYears.size > 0 || searchQuery.trim()) && (
                <div className="pt-2 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedTags(new Set())
                      setSelectedYears(new Set())
                      setSearchQuery('')
                    }}
                    className="px-4 py-2 text-sm rounded-md bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              )}
            </div>
            
            {/* Results count */}
            {filteredRuns.length !== parsedData.length && (
              <div className="mt-3 pt-3 border-t border-gray-200 text-sm text-gray-600">
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
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-blue-600">{totalRuns}</div>
                <div className="text-sm text-blue-600">Total Runs</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-green-600">{formatDistance(totalDistance)}</div>
                <div className="text-sm text-green-600">Total Distance</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-purple-600">{formatPace(avgPace)}</div>
                <div className="text-sm text-purple-600">Avg Pace (per mi)</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-orange-600">{totalElevation.toFixed(0)}m</div>
                <div className="text-sm text-orange-600">Elevation</div>
              </div>
            </div>
          </div>

          {/* Calendar & Map Section */}
          {parsedData.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-6">Calendar & Map View</h2>
              
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Left: Calendar */}
                <div>
                  <RunCalendar 
                    runs={parsedData} 
                    selectedRun={selectedRun}
                    onSelectRun={handleSelectRun} 
                  />
                </div>
                
                {/* Right: Map and Details */}
                <div className="space-y-4">
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
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="border rounded-lg bg-white shadow-md overflow-hidden"
              >
                {/* Header - always visible */}
                <div 
                  onClick={() => toggleRun(originalIndex)} 
                  className="cursor-pointer p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2 flex-wrap">
                        <span>Run {originalIndex + 1}: {run.fileName}</span>
                        {run.source === 'strava' && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                            </svg>
                            Strava
                          </span>
                        )}
                        {/* Tags */}
                        {run.tags && run.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {run.tags.map(tag => (
                              <span
                                key={tag}
                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {run.startTime.toLocaleDateString()} • {run.source === 'strava' ? `${(run.totalDistance / 1609.34).toFixed(1)} miles` : `${run.splits.length} mile${run.splits.length !== 1 ? 's' : ''}`}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="font-medium text-gray-900">{formatDistance(run.totalDistance)}</div>
                        <div className="text-gray-600">{formatPace(run.avgPace)}</div>
                        {/* Debug: Show raw pace value */}
                        {run.source === 'strava' && (
                          <div className="text-xs text-gray-400">
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
