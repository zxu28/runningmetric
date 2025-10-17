import { motion } from 'framer-motion'
import { useDataContext } from '../contexts/DataContext'
import { formatDistance, formatDuration, formatPace } from '../utils/gpxParser'

const Analysis = () => {
  const { parsedData } = useDataContext()

  // Calculate summary statistics
  const totalRuns = parsedData.length
  const totalDistance = parsedData.reduce((sum, run) => sum + run.totalDistance, 0)
  const totalDuration = parsedData.reduce((sum, run) => sum + run.totalDuration, 0)
  const totalElevation = parsedData.reduce((sum, run) => sum + run.elevationGain, 0)
  const avgPace = totalRuns > 0 ? parsedData.reduce((sum, run) => sum + run.avgPace, 0) / totalRuns : 0

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
              <a
                href="/upload"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
              >
                Upload GPX Files
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    )
  }
}

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
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Summary Cards */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Summary</h2>
              <div className="grid grid-cols-2 gap-4">
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
                  <div className="text-sm text-purple-600">Avg Pace</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-orange-600">{totalElevation.toFixed(0)}m</div>
                  <div className="text-sm text-orange-600">Elevation</div>
                </div>
              </div>
            </div>

            {/* Recent Runs */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Runs</h2>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {parsedData.slice(0, 5).map((run, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{run.fileName}</h4>
                        <p className="text-sm text-gray-600">{run.startTime.toLocaleDateString()}</p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="font-medium text-gray-900">{formatDistance(run.totalDistance)}</div>
                        <div className="text-gray-600">{formatPace(run.avgPace)}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Charts Placeholder */}
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Performance Charts</h2>
              <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <div className="text-4xl mb-2">📈</div>
                  <p>Charts will appear here once you upload more GPX files</p>
                  <p className="text-sm">Currently showing {totalRuns} run{totalRuns !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </div>
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
              <a
                href="/upload"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Upload More Files
                <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

export default Analysis
