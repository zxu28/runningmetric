import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useDataContext } from '../contexts/DataContext'
import { GPXData, formatDistance, formatPace, formatDuration } from '../utils/gpxParser'
import { getWeeklyTrends, getMonthlyTrends, PeriodStats, TimePeriod } from '../utils/trendAnalysis'
import WeeklyDistanceChart from '../components/WeeklyDistanceChart'
import PaceTrendChart from '../components/PaceTrendChart'
import ElevationTrendChart from '../components/ElevationTrendChart'

const Statistics = () => {
  const { parsedData } = useDataContext()
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('thisYear')
  const [viewMode, setViewMode] = useState<'weekly' | 'monthly' | 'yearly'>('monthly')

  const periods: { value: TimePeriod; label: string }[] = [
    { value: 'last7days', label: 'Last 7 Days' },
    { value: 'last30days', label: 'Last 30 Days' },
    { value: 'last90days', label: 'Last 90 Days' },
    { value: 'last4weeks', label: 'Last 4 Weeks' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'thisYear', label: 'This Year' },
    { value: 'allTime', label: 'All Time' }
  ]

  // Calculate trends based on selected period
  const trendData = useMemo(() => {
    if (['last7days', 'last30days', 'last90days', 'last4weeks'].includes(selectedPeriod)) {
      return getWeeklyTrends(parsedData, selectedPeriod)
    } else {
      return getMonthlyTrends(parsedData, selectedPeriod)
    }
  }, [parsedData, selectedPeriod])

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

  // Best months/weeks
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

  if (parsedData.length === 0) {
    return (
      <div className="min-h-screen bg-organic-gradient dark:bg-gradient-to-br dark:from-earth-900 dark:via-earth-800 dark:to-earth-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/70 dark:bg-earth-800/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-12 text-center">
            <div className="text-6xl mb-4">📊</div>
            <h2 className="text-2xl font-bold text-earth-800 dark:text-earth-100 mb-2">No Data Available</h2>
            <p className="text-earth-600 dark:text-earth-300">Upload some runs to see your statistics!</p>
          </div>
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
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-earth-800 dark:text-earth-100 mb-6 sm:mb-10">
            Statistics & Analytics
          </h1>

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
                    onClick={() => setSelectedPeriod(period.value)}
                    className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                      selectedPeriod === period.value
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
        </motion.div>
      </div>
    </div>
  )
}

export default Statistics

