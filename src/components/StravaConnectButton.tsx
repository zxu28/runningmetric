import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { stravaService, StravaTokens } from '../services/stravaService'

interface StravaConnectButtonProps {
  onSync?: () => void
}

const StravaConnectButton: React.FC<StravaConnectButtonProps> = ({ onSync }) => {
  const [isConnected, setIsConnected] = useState(false)
  const [tokens, setTokens] = useState<StravaTokens | null>(null)
  const [isSyncing, setIsSyncing] = useState(false)

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
    if (confirm('Are you sure you want to disconnect from Strava?')) {
      stravaService.disconnect()
      setIsConnected(false)
      setTokens(null)
    }
  }

  const handleSync = async () => {
    setIsSyncing(true)
    try {
      if (onSync) {
        await onSync()
      }
    } catch (error) {
      console.error('Sync error:', error)
      alert('Failed to sync activities. Please try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  if (isConnected && tokens) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-md p-6"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {/* Strava Logo */}
            <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-bold">
              S
            </div>
            <div>
              <div className="font-semibold text-gray-900">
                Connected to Strava
              </div>
              <div className="text-sm text-gray-600">
                {tokens.athleteName}
              </div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="text-sm text-red-600 hover:text-red-700 hover:underline"
          >
            Disconnect
          </button>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {isSyncing ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Syncing...
              </span>
            ) : (
              'Sync Activities'
            )}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg shadow-md p-6 text-white"
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold mb-1">Connect with Strava</h3>
          <p className="text-orange-100 text-sm">
            Sync your activities automatically
          </p>
        </div>
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center text-3xl font-bold">
          S
        </div>
      </div>
      
      <button
        onClick={handleConnect}
        className="w-full px-6 py-3 bg-white text-orange-600 rounded-md hover:bg-orange-50 transition-colors font-semibold flex items-center justify-center space-x-2"
      >
        <span>Connect Now</span>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
      </button>
    </motion.div>
  )
}

export default StravaConnectButton

