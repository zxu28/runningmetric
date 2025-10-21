import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { stravaService } from '../services/stravaService'

const StravaCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const code = searchParams.get('code')
    const error = searchParams.get('error')

    if (error) {
      setStatus('error')
      setMessage('Authorization denied by user')
      setTimeout(() => navigate('/analysis'), 3000)
      return
    }

    if (!code) {
      setStatus('error')
      setMessage('No authorization code received')
      setTimeout(() => navigate('/analysis'), 3000)
      return
    }

    // Exchange code for tokens
    stravaService.exchangeToken(code)
      .then((tokens) => {
        setStatus('success')
        setMessage(`Successfully connected as ${tokens.athleteName}!`)
        setTimeout(() => navigate('/analysis'), 2000)
      })
      .catch((err) => {
        console.error('Exchange error:', err)
        setStatus('error')
        setMessage('Failed to connect to Strava. Please try again.')
        setTimeout(() => navigate('/analysis'), 3000)
      })
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center"
      >
        {status === 'loading' && (
          <>
            <div className="flex justify-center mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500"></div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Connecting to Strava...
            </h2>
            <p className="text-gray-600">
              Please wait while we set up your connection
            </p>
          </>
        )}

        {status === 'success' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-6xl mb-4"
            >
              ✅
            </motion.div>
            <h2 className="text-2xl font-bold text-green-600 mb-2">
              Connected Successfully!
            </h2>
            <p className="text-gray-600 mb-1">{message}</p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="text-6xl mb-4"
            >
              ❌
            </motion.div>
            <h2 className="text-2xl font-bold text-red-600 mb-2">
              Connection Failed
            </h2>
            <p className="text-gray-600 mb-1">{message}</p>
            <p className="text-sm text-gray-500 mt-4">
              Redirecting back...
            </p>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default StravaCallback

