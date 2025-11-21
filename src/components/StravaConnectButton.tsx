import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { stravaService, StravaTokens } from '../services/stravaService'
import { useError } from '../contexts/ErrorContext'
import { useDataContext } from '../contexts/DataContext'
import SyncProgress from './SyncProgress'

export interface SyncProgressInfo {
  stage: 'fetching' | 'processing' | 'saving'
  current: number
  total: number
  currentActivity?: string
  message?: string
}

interface StravaConnectButtonProps {
  onSync?: (progressCallback?: (progress: SyncProgressInfo) => void) => Promise<void>
}

const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({ onSync }) => {
  const { showError, showWarning, showInfo } = useError()
  const { removeStravaData, parsedData } = useDataContext()
  const [isConnected, setIsConnected] = useState(false)
  const [tokens, setTokens] = useState<StravaTokens | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState<SyncProgressInfo | null>(null)

  useEffect(() => {
    // Check connection status
    const connected = stravaService.isConnected()
    setIsConnected(connected)
    if (connected) {
      setTokens(stravaService.getTokens())
    }
  }, [])

  const handleConnect = () => {
    stravaService.authorize()
  }

  const handleDisconnect = () => {
    const stravaRunCount = parsedData.filter(run => run.source === 'strava').length
    
    if (!confirm('Are you sure you want to disconnect from Strava?')) {
      return
    }
    
    // Ask if they want to remove Strava data too
    if (stravaRunCount > 0) {
      const removeData = confirm(
        `You have ${stravaRunCount} Strava activity/activities synced.\n\n` +
        `Do you also want to remove these activities from your data?\n\n` +
        `Click OK to remove Strava data, or Cancel to keep it.`
      )
      
      if (removeData) {
        removeStravaData()
        showInfo('Disconnected from Strava and removed synced activities.', 4000)
      } else {
        showInfo('Disconnected from Strava. Your synced activities are still available.', 4000)
      }
    }
    
    stravaService.disconnect()
    setIsConnected(false)
    setTokens(null)
  }

  const handleSync = async () => {
    setIsSyncing(true)
    setSyncProgress({
      stage: 'fetching',
      current: 0,
      total: 0,
      message: 'Connecting to Strava...'
    })
    console.log('🔄 Sync started')
    
    // Safety timeout - clear loading after 10 minutes max
    const timeout = setTimeout(() => {
      console.warn('⚠️ Sync timeout - clearing loading state after 10 minutes')
      setIsSyncing(false)
      setSyncProgress(null)
      showWarning('Sync is taking longer than expected. Please check the console for errors or try again.', 8000)
    }, 10 * 60 * 1000) // 10 minutes
    
    try {
      if (onSync) {
        await onSync((progress) => {
          setSyncProgress(progress)
        })
        console.log('✅ Sync completed successfully')
      }
    } catch (error) {
      console.error('❌ Sync error:', error)
      setSyncProgress(null)
      showError('Failed to sync activities. Please try again.')
    } finally {
      clearTimeout(timeout)
      setIsSyncing(false)
      setSyncProgress(null)
      console.log('🔚 Sync finished - loading state cleared')
    }
  }

  if (isConnected && tokens) {
    return (
      <>
        <SyncProgress
          isVisible={!!syncProgress}
          stage={syncProgress?.stage || 'fetching'}
          current={syncProgress?.current || 0}
          total={syncProgress?.total || 0}
          currentActivity={syncProgress?.currentActivity}
          message={syncProgress?.message}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white/70 backdrop-blur-sm rounded-organic-lg shadow-organic p-8"
        >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {/* Strava Logo */}
            <div className="w-14 h-14 bg-terracotta-500 rounded-organic-lg flex items-center justify-center text-white font-bold text-xl shadow-organic">
              S
            </div>
            <div>
              <div className="font-semibold text-earth-800 text-lg">
                Connected to Strava
              </div>
              <div className="text-sm text-earth-600">
                {tokens.athleteName}
              </div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-sm text-terracotta-600 hover:text-terracotta-800 px-4 py-2 rounded-full hover:bg-terracotta-50 transition-all duration-300"
          >
            Disconnect
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex-1 px-6 py-4 bg-terracotta-500 text-white rounded-organic-lg hover:bg-terracotta-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-medium shadow-organic-lg hover:shadow-organic transform hover:scale-105 disabled:transform-none"
          >
            {isSyncing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Syncing...
              </span>
            ) : (
              'Sync Activities'
            )}
          </button>
        </div>
      </motion.div>
      </>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="bg-gradient-to-r from-terracotta-500 to-terracotta-600 rounded-organic-lg shadow-organic-lg p-8 text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-bold mb-2">Connect with Strava</h3>
          <p className="text-terracotta-50 text-base">
            Sync your activities automatically
          </p>
        </div>
        <div className="w-20 h-20 bg-white bg-opacity-20 rounded-organic-lg flex items-center justify-center text-4xl font-bold backdrop-blur-sm">
          S
        </div>
      </div>
      
      <button
        onClick={handleConnect}
        className="w-full px-8 py-4 bg-white text-terracotta-600 rounded-organic-lg hover:bg-terracotta-50 transition-all duration-300 font-semibold flex items-center justify-center space-x-3 shadow-organic-lg hover:shadow-organic transform hover:scale-105"
      >
        <span>Connect Now</span>
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </motion.div>
  )
}

export default StravaConnectButton

