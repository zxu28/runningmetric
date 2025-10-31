import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const Home = () => {
  return (
    <div className="min-h-screen bg-organic-gradient relative overflow-hidden">
      {/* Organic background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 bg-sage-200/30 rounded-full blur-3xl"
          animate={{ flow: true }}
        />
        <motion.div
          className="absolute bottom-20 right-10 w-80 h-80 bg-earth-200/30 rounded-full blur-3xl"
          animate={{ flow: true }}
          style={{ animationDelay: '2s' }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-48 h-48 bg-moss-200/20 rounded-full blur-2xl"
          animate={{ float: true }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-bold text-earth-800 mb-6"
              animate={{ float: true }}
            >
              🏃‍♂️ Running Metrics
            </motion.h1>
            <p className="text-xl md:text-2xl text-earth-700 mb-12 max-w-3xl mx-auto leading-relaxed">
              Your personal running companion. Upload your GPX files and discover beautiful insights about your performance—all processed locally in your browser.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16"
          >
            <Link
              to="/upload"
              className="inline-flex items-center px-10 py-5 text-lg font-medium rounded-organic-lg text-white bg-sage-600 hover:bg-sage-700 shadow-organic-lg hover:shadow-organic transform hover:scale-105 transition-all duration-300"
            >
              Get Started
              <svg className="ml-3 -mr-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto"
          >
            <motion.div 
              className="bg-white/70 backdrop-blur-sm rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transform hover:-translate-y-2 transition-all duration-500"
              whileHover={{ scale: 1.02 }}
            >
              <div className="text-4xl mb-4 animate-float">📁</div>
              <h3 className="text-xl font-semibold text-earth-800 mb-3">Upload GPX Files</h3>
              <p className="text-earth-600 leading-relaxed">Upload your running data from any GPS device or running app. Drag & drop, or browse—it's that simple.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white/70 backdrop-blur-sm rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transform hover:-translate-y-2 transition-all duration-500"
              whileHover={{ scale: 1.02 }}
              style={{ animationDelay: '0.1s' }}
            >
              <div className="text-4xl mb-4 animate-float" style={{ animationDelay: '0.2s' }}>📊</div>
              <h3 className="text-xl font-semibold text-earth-800 mb-3">Analyze Data</h3>
              <p className="text-earth-600 leading-relaxed">View detailed charts, maps, and statistics about your running performance. Track your progress over time.</p>
            </motion.div>
            
            <motion.div 
              className="bg-white/70 backdrop-blur-sm rounded-organic-lg p-8 shadow-organic hover:shadow-organic-lg transform hover:-translate-y-2 transition-all duration-500"
              whileHover={{ scale: 1.02 }}
              style={{ animationDelay: '0.2s' }}
            >
              <div className="text-4xl mb-4 animate-float" style={{ animationDelay: '0.4s' }}>🔒</div>
              <h3 className="text-xl font-semibold text-earth-800 mb-3">Privacy First</h3>
              <p className="text-earth-600 leading-relaxed">Your data stays in your browser—no cloud storage required. Your runs, your privacy, your control.</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Home
