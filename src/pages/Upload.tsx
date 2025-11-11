import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { parseMultipleGPXFiles, formatDistance, formatDuration, formatPace, GPXData } from '../utils/gpxParser'
import { useDataContext } from '../contexts/DataContext'
import { useError } from '../contexts/ErrorContext'
import StravaConnectButton, { SyncProgressInfo } from '../components/StravaConnectButton'
import { stravaService } from '../services/stravaService'
import { convertStravaActivityToGPXData, validateStravaStreams } from '../utils/stravaConverter'

const Upload = () => {
  const navigate = useNavigate()
  const { addParsedData } = useDataContext()
  const { showError, showSuccess, showInfo, showWarning } = useError()
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
          showError('No running activities found in your Strava account. Make sure you have running activities synced to Strava.')
        } else {
          showInfo(`All ${activities.length} Strava activities are already synced! Navigate to the Analysis page to view them.`, 6000)
          setTimeout(() => {
            if (window.confirm('Would you like to view your runs on the Analysis page?')) {
              navigate('/analysis')
            }
          }, 1000)
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
        showError('No activities were successfully processed. Check the browser console for details.')
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
        showInfo(`All processed activities are already synced! (Processed ${stravaData.length}, but all were duplicates)`, 5000)
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
      showSuccess(`Successfully synced ${finalNewActivities.length} activities from Strava! ${activitiesWithStreams} have detailed GPS data.`, 6000)
      
      // Navigate using React Router instead of window.location for proper state preservation
      navigate('/analysis')
      
      console.log('✅ Sync process completed successfully')
      
    } catch (error: any) {
      console.error('Strava sync error:', error)
      
      // Check for rate limit errors
      if (error.message?.includes('429') || error.message?.includes('Too Many Requests')) {
        showError('Rate limit exceeded! Strava allows 600 requests per 15 minutes. Please wait a few minutes and try again.', 8000)
      } else {
        showError(`Failed to sync from Strava: ${error.message || 'Unknown error'}. Please try again.`)
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
    <div className="min-h-screen bg-organic-gradient py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-earth-800 mb-10">Upload GPX Files</h1>
          
          {/* Strava Connect Section */}
          <div className="mb-10">
            <StravaConnectButton onSync={handleStravaSync} />
          </div>

          {/* Divider */}
          <div className="relative mb-10">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t-2 border-earth-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-6 bg-organic-gradient text-earth-600 font-medium rounded-full border-2 border-earth-200 py-2">OR</span>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-10">
            <div
              className={`border-2 border-dashed rounded-organic-lg p-16 text-center transition-all duration-300 ${
                dragActive 
                  ? 'border-sage-400 bg-sage-50/50 shadow-organic-lg scale-105' 
                  : 'border-earth-300 hover:border-sage-400 hover:bg-earth-50/30'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="text-7xl mb-6 animate-float">📁</div>
              <h3 className="text-2xl font-semibold text-earth-800 mb-3">
                Drop your GPX files here
              </h3>
              <p className="text-earth-600 mb-6 text-lg">
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
                className="inline-flex items-center px-8 py-4 border-2 border-transparent text-base font-medium rounded-organic-lg text-white bg-sage-600 hover:bg-sage-700 cursor-pointer shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300"
              >
                Choose Files
              </label>
            </div>

            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mt-10"
              >
                <h3 className="text-xl font-semibold text-earth-800 mb-5">
                  Uploaded Files ({uploadedFiles.length})
                </h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between bg-earth-50/80 rounded-organic-lg p-4 border-2 border-earth-200 hover:border-sage-300 transition-all duration-300"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center">
                        <div className="text-3xl mr-4">🏃‍♂️</div>
                        <div>
                          <p className="font-medium text-earth-800">{file.name}</p>
                          <p className="text-sm text-earth-600">
                            {(file.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-terracotta-600 hover:text-terracotta-800 px-3 py-1 rounded-full hover:bg-terracotta-50 transition-all duration-300"
                      >
                        Remove
                      </button>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <button 
                    onClick={handleParseFiles}
                    disabled={isParsing}
                    className="inline-flex items-center px-10 py-4 border-2 border-transparent text-lg font-medium rounded-organic-lg text-white bg-moss-600 hover:bg-moss-700 disabled:bg-earth-300 disabled:cursor-not-allowed shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300 disabled:transform-none"
                  >
                    {isParsing ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Parsing...
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
                transition={{ duration: 0.6 }}
                className="mt-10"
              >
                <h3 className="text-xl font-semibold text-earth-800 mb-5">
                  Parsed Results ({parsedData.length})
                </h3>
                <div className="space-y-4">
                  {parsedData.map((data, index) => (
                    <motion.div 
                      key={index} 
                      className="bg-moss-50/80 border-2 border-moss-200 rounded-organic-lg p-6 hover:shadow-organic transition-all duration-300"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-moss-800 text-lg">{data.fileName}</h4>
                        <span className="text-sm text-moss-600 bg-moss-100 px-3 py-1 rounded-full">{data.tracks.length} track(s)</span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-moss-600 font-medium">Distance:</span>
                          <p className="text-moss-800 font-semibold">{formatDistance(data.totalDistance)}</p>
                        </div>
                        <div>
                          <span className="text-moss-600 font-medium">Duration:</span>
                          <p className="text-moss-800 font-semibold">{formatDuration(data.totalDuration)}</p>
                        </div>
                        <div>
                          <span className="text-moss-600 font-medium">Pace:</span>
                          <p className="text-moss-800 font-semibold">{formatPace(data.avgPace)}</p>
                        </div>
                        <div>
                          <span className="text-moss-600 font-medium">Elevation:</span>
                          <p className="text-moss-800 font-semibold">{data.elevationGain.toFixed(0)}m</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-sm text-earth-600 mb-4">
                    Check the browser console for detailed parsing results
                  </p>
                  <p className="text-sm text-moss-600 mb-4 font-medium">
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
