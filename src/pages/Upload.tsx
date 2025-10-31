import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { parseMultipleGPXFiles, formatDistance, formatDuration, formatPace, GPXData } from '../utils/gpxParser'
import { useDataContext } from '../contexts/DataContext'
import StravaConnectButton, { SyncProgressInfo } from '../components/StravaConnectButton'
import { stravaService } from '../services/stravaService'
import { convertStravaActivityToGPXData, validateStravaStreams } from '../utils/stravaConverter'

const Upload = () => {
  const navigate = useNavigate()
  const { addParsedData } = useDataContext()
  const [dragActive, setDragActive] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [parsedData, setParsedData] = useState<GPXData[]>([])
  const [isParsing, setIsParsing] = useState(false)

  const handleStravaSync = async (progressCallback?: (progress: SyncProgressInfo) => void) => {
    try {
      console.log('Starting Strava sync...')
      
      // Update progress: Fetching stage
      progressCallback?.({
        stage: 'fetching',
        current: 0,
        total: 0,
        message: 'Fetching activities list from Strava...'
      })
      
      // Check for duplicates early to avoid unnecessary API calls
      const existingData = JSON.parse(localStorage.getItem('runningData') || '[]')
      const existingStravaIds = new Set(
        existingData
          .filter((item: any) => item.source === 'strava')
          .map((item: any) => item.stravaId)
      )
      console.log(`Found ${existingStravaIds.size} already-synced activities in localStorage`)
      
      const activities = await stravaService.fetchAllActivities() // Fetch ALL activities using pagination
      console.log(`\n📊 SYNC SUMMARY:`)
      console.log(`Fetched ${activities.length} total activities from Strava`)
      console.log('Activity names:', activities.map(a => a.name))
      
      // Update progress: Show fetched count
      progressCallback?.({
        stage: 'fetching',
        current: activities.length,
        total: activities.length,
        message: `Found ${activities.length} activities from Strava`
      })
      
      // Filter out already-synced activities before processing
      const newActivities = activities.filter(activity => !existingStravaIds.has(activity.id))
      console.log(`Skipping ${activities.length - newActivities.length} already-synced activities`)
      console.log(`Processing ${newActivities.length} new activities`)
      
      if (newActivities.length === 0) {
        // Clear progress indicator
        progressCallback?.({
          stage: 'fetching',
          current: activities.length,
          total: activities.length,
          message: activities.length > 0 
            ? `All ${activities.length} activities are already synced!`
            : 'No new activities to sync.'
        })
        
        // Wait a moment for the message to show, then clear
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        if (activities.length === 0) {
          alert('No running activities found in your Strava account. Make sure you have running activities synced to Strava.')
        } else {
          const message = `All ${activities.length} Strava activities are already synced!\n\nWould you like to view your runs on the Analysis page?`
          if (confirm(message)) {
            navigate('/analysis')
          }
        }
        return
      }
      
      const stravaData: GPXData[] = []
      
      // Update progress: Processing stage
      progressCallback?.({
        stage: 'processing',
        current: 0,
        total: newActivities.length,
        message: `Processing ${newActivities.length} new activities...`
      })
      
      // Process each activity with detailed streams
      // Add delay between requests to respect rate limits (Strava: 600 requests per 15 minutes)
      // ~250ms delay = ~240 requests per minute = safe margin
      const DELAY_BETWEEN_REQUESTS = 250 // milliseconds
      
      for (let i = 0; i < newActivities.length; i++) {
        const activity = newActivities[i]
        try {
          const currentIndex = i + 1
          
          // Update progress
          progressCallback?.({
            stage: 'processing',
            current: currentIndex,
            total: newActivities.length,
            currentActivity: activity.name,
            message: `Processing ${currentIndex} of ${newActivities.length}...`
          })
          
          console.log(`\n=== Processing activity ${currentIndex}/${newActivities.length}: ${activity.name} (ID: ${activity.id}) ===`)
          
          // Add delay before each request (except the first one)
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, DELAY_BETWEEN_REQUESTS))
          }
          
          // Fetch detailed streams for this activity
          // Note: Each activity requires 2 API calls (activity + streams)
          // Rate limiting: 250ms delay = ~240 requests/min = safe margin under 600/15min limit
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
            console.warn(`⚠️ Activity ${activity.name} has invalid streams:`, validation.issues)
            console.warn('  Falling back to basic data without GPS points')
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
          console.error('  Error details:', error)
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
      
      console.log('\n=== Final PATH data ===')
      console.log(`Total activities processed: ${stravaData.length}`)
      if (stravaData.length === 0) {
        console.warn('⚠️ CRITICAL: No activities were converted! This could mean:')
        console.warn('  - No activities fetched from Strava')
        console.warn('  - All activities failed validation/conversion')
        console.warn('  - Error occurred during stream fetching')
        alert('No activities were successfully processed. Check console for details.')
        return
      }
      console.log('Converted Strava activities:', stravaData.map(a => ({ name: a.fileName, id: a.stravaId })))
      
      // Double-check for duplicates (safety check in case something changed)
      const finalNewActivities = stravaData.filter(activity => 
        !existingStravaIds.has(activity.stravaId)
      )
      
      console.log(`New activities to add: ${finalNewActivities.length}`)
      console.log('New activity names:', finalNewActivities.map(a => a.fileName))
      
      if (finalNewActivities.length === 0) {
        console.log('No new activities to sync')
        alert(`All processed activities are already synced! (Processed ${stravaData.length}, but all were duplicates)`)
        return
      }
      
      // Update progress: Saving stage
      progressCallback?.({
        stage: 'saving',
        current: finalNewActivities.length,
        total: finalNewActivities.length,
        message: `Saving ${finalNewActivities.length} activities to browser storage...`
      })
      
      // Add only new activities to DataContext
      console.log('Adding to DataContext:', finalNewActivities.length, 'activities')
      addParsedData(finalNewActivities)
      
      // Wait a moment for data to be saved to localStorage
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Verify data was saved
      const savedData = localStorage.getItem('runningData')
      if (savedData) {
        const parsed = JSON.parse(savedData)
        console.log('✅ Verified data in localStorage:', parsed.length, 'total activities')
      } else {
        console.error('❌ No data found in localStorage after adding!')
      }
      
      const activitiesWithStreams = finalNewActivities.filter(a => a.tracks[0].points.length > 0).length
      alert(`Successfully synced ${finalNewActivities.length} activities from Strava! ${activitiesWithStreams} have detailed GPS data. Check the Analysis page to view them.`)
      
      // Navigate using React Router instead of window.location for proper state preservation
      navigate('/analysis')
      
      console.log('✅ Sync process completed successfully')
      
    } catch (error: any) {
      console.error('Strava sync error:', error)
      
      // Check for rate limit errors
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        alert('Rate limit exceeded! Strava allows 600 requests per 15 minutes. Please wait a few minutes and try again.')
      } else {
        alert(`Failed to sync from Strava: ${error.message || 'Unknown error'}`)
      }
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
