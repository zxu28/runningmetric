import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { parseMultipleGPXFiles, formatDistance, formatDuration, formatPace, GPXData } from '../utils/gpxParser'
import { useDataContext } from '../contexts/DataContext'
import StravaConnectButton from '../components/StravaConnectButton'
import { stravaService } from '../services/stravaService'
import { convertStravaActivityToGPXData, validateStravaStreams } from '../utils/stravaConverter'

const Upload = () => {
  const navigate = useNavigate()
  const { addParsedData } = useDataContext()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [parsedData, setParsedData] = useState<GPXData[]>([])
  const [isParsing, setIsParsing] = useState(false)

  const handleStravaSync = async () => {
    try {
      console.log('Starting Strava sync...')
      const activities = await stravaService.fetchActivities({ per_page: 30 }) // Fetch up to 30 recent activities
      console.log(`Fetched ${activities.length} activities from Strava:`, activities)
      
      const stravaData: GPXData[] = []
      
      // Process each activity with detailed streams
      for (const activity of activities) {
        try {
          console.log(`\n=== Processing activity: ${activity.name} (ID: ${activity.id}) ===`)
          
          // Fetch detailed streams for this activity
          console.log('Fetching detailed streams...')
          const { activity: detailedActivity, streams } = await stravaService.fetchActivityWithStreams(activity.id)
          
          console.log('Streams received:', {
            latlng: streams.latlng?.data?.length || 0,
            time: streams.time?.data?.length || 0,
            distance: streams.distance?.data?.length || 0,
            altitude: streams.altitude?.data?.length || 0
          })
          
          // Validate streams
          const validation = validateStravaStreams(streams)
          console.log('Stream validation:', validation)
          
          if (!validation.isValid) {
            console.warn(`Activity ${activity.name} has invalid streams:`, validation.issues)
            // Fall back to basic data without streams
            const basicData = {
              fileName: `${activity.name} (Strava)`,
              totalDistance: activity.distance,
              totalDuration: activity.moving_time,
              avgPace: activity.moving_time / 60 / (activity.distance / 1609.34),
              elevationGain: activity.total_elevation_gain,
              tracks: [{
                points: [],
                name: activity.name
              }],
              splits: [],
              startTime: new Date(activity.start_date),
              endTime: new Date(activity.start_date),
              source: 'strava' as const,
              stravaId: activity.id
            }
            stravaData.push(basicData)
            console.log(`Added basic data for ${activity.name} (no GPS points)`)
            continue
          }
          
          // Convert to GPXData format with detailed streams
          console.log('Converting streams to GPX format...')
          const gpxData = convertStravaActivityToGPXData(detailedActivity, streams)
          stravaData.push(gpxData)
          
          console.log(`✅ Successfully processed ${activity.name}:`)
          console.log(`   - GPS points: ${gpxData.tracks[0].points.length}`)
          console.log(`   - Mile splits: ${gpxData.splits.length}`)
          console.log(`   - Total distance: ${gpxData.totalDistance}m`)
          console.log(`   - Avg pace: ${gpxData.avgPace.toFixed(2)} min/mi`)
          
        } catch (error) {
          console.error(`❌ Failed to process activity ${activity.name}:`, error)
          // Add basic data as fallback
          const basicData = {
            fileName: `${activity.name} (Strava)`,
            totalDistance: activity.distance,
            totalDuration: activity.moving_time,
            avgPace: activity.moving_time / 60 / (activity.distance / 1609.34),
            elevationGain: activity.total_elevation_gain,
            tracks: [{
              points: [],
              name: activity.name
            }],
            splits: [],
            startTime: new Date(activity.start_date),
            endTime: new Date(activity.start_date),
            source: 'strava' as const,
            stravaId: activity.id
          }
          stravaData.push(basicData)
          console.log(`Added fallback basic data for ${activity.name}`)
        }
      }
      
      console.log('\n=== Final converted data ===')
      console.log('Converted Strava activities:', stravaData)
      
      // Check for duplicates before adding
      const existingData = JSON.parse(localStorage.getItem('runningData') || '[]')
      const existingStravaIds = existingData
        .filter((item: any) => item.source === 'strava')
        .map((item: any) => item.stravaId)
      
      // Filter out activities that already exist
      const newActivities = stravaData.filter(activity => 
        !existingStravaIds.includes(activity.stravaId)
      )
      
      if (newActivities.length === 0) {
        alert('All Strava activities are already synced!')
        return
      }
      
      // Add only new activities to DataContext
      addParsedData(newActivities)
      
      const activitiesWithStreams = newActivities.filter(a => a.tracks[0].points.length > 0).length
      alert(`Successfully synced ${newActivities.length} activities from Strava! ${activitiesWithStreams} have detailed GPS data. Check the Analysis page to view them.`)
      
      // Redirect to analysis page to see the synced activities
      setTimeout(() => {
        window.location.href = '/runningmetric/analysis'
      }, 2000)
      
    } catch (error) {
      console.error('Strava sync error:', error)
      alert('Failed to sync from Strava. Please try again.')
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const files = Array.from(e.dataTransfer.files).filter(file => 
        file.name.toLowerCase().endsWith('.gpx')
      )
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files).filter(file => 
        file.name.toLowerCase().endsWith('.gpx')
      )
      setUploadedFiles(prev => [...prev, ...files])
    }
  }

  const handleParseFiles = async () => {
    if (uploadedFiles.length === 0) return

    setIsParsing(true)
    try {
      const results = await parseMultipleGPXFiles(uploadedFiles)
      setParsedData(results)
      
      // Save to global context
      addParsedData(results)
      
      // Log results to console as requested
      console.log('Parsed GPX Files:', results)
      results.forEach((data, index) => {
        console.log(`File ${index + 1}: ${data.fileName}`)
        console.log(`  Distance: ${formatDistance(data.totalDistance)}`)
        console.log(`  Duration: ${formatDuration(data.totalDuration)}`)
        console.log(`  Pace: ${formatPace(data.avgPace)}`)
        console.log(`  Elevation Gain: ${data.elevationGain.toFixed(0)}m`)
        console.log(`  Start Time: ${data.startTime.toLocaleString()}`)
        console.log(`  End Time: ${data.endTime.toLocaleString()}`)
        console.log(`  Tracks: ${data.tracks.length}`)
        console.log('---')
      })
      
      // Navigate to analysis page after parsing completes
      navigate('/analysis')
    } catch (error) {
      console.error('Error parsing files:', error)
    } finally {
      setIsParsing(false)
    }
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
    setParsedData(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Upload GPX Files</h1>
          
          {/* Strava Connect Section */}
          <div className="mb-8">
            <StravaConnectButton onSync={handleStravaSync} />
          </div>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500 font-medium">OR</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div
              className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
                dragActive 
                  ? 'border-blue-400 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-6xl mb-4">📁</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Drop your GPX files here
              </h3>
              <p className="text-gray-600 mb-4">
                or click to browse your computer
              </p>
              <input
                type="file"
                multiple
                accept=".gpx"
                onChange={handleFileInput}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Choose Files
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <div className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center">
                        <div className="text-2xl mr-3">🏃‍♂️</div>
                        <div>
                          <p className="font-medium text-gray-900">{file.name}</p>
                          <p className="text-sm text-gray-500">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <button 
                    onClick={handleParseFiles}
                    disabled={isParsing}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {isParsing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Parsing Files...
                      </>
                    ) : (
                      <>
                        Parse Files
                        <svg className="ml-2 -mr-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {parsedData.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Parsed Results ({parsedData.length})
                </h3>
                <div className="space-y-4">
                  {parsedData.map((data, index) => (
                    <div key={index} className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-green-800">{data.fileName}</h4>
                        <span className="text-sm text-green-600">{data.tracks.length} track(s)</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-green-600 font-medium">Distance:</span>
                          <p className="text-green-800">{formatDistance(data.totalDistance)}</p>
                        </div>
                        <div>
                          <span className="text-green-600 font-medium">Duration:</span>
                          <p className="text-green-800">{formatDuration(data.totalDuration)}</p>
                        </div>
                        <div>
                          <span className="text-green-600 font-medium">Pace:</span>
                          <p className="text-green-800">{formatPace(data.avgPace)}</p>
                        </div>
                        <div>
                          <span className="text-green-600 font-medium">Elevation:</span>
                          <p className="text-green-800">{data.elevationGain.toFixed(0)}m</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Check the browser console for detailed parsing results
                  </p>
                  <p className="text-sm text-green-600 mb-4">
                    ✅ Files parsed successfully! Redirecting to analysis...
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Upload
