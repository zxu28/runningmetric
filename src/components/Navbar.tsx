import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

const Navbar = () => {
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-earth-50/80 backdrop-blur-sm border-b border-earth-200/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <motion.span 
                className="text-2xl font-bold text-sage-600 group-hover:text-sage-700"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                🏃‍♂️ <span className="text-earth-700">Running Metrics</span>
              </motion.span>
            </Link>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-sage-200 text-sage-800 shadow-organic' 
                  : 'text-earth-700 hover:text-sage-700 hover:bg-earth-100/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                isActive('/upload') 
                  ? 'bg-sage-200 text-sage-800 shadow-organic' 
                  : 'text-earth-700 hover:text-sage-700 hover:bg-earth-100/50'
              }`}
            >
              Upload
            </Link>
            <Link
              to="/analysis"
              className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                isActive('/analysis') 
                  ? 'bg-sage-200 text-sage-800 shadow-organic' 
                  : 'text-earth-700 hover:text-sage-700 hover:bg-earth-100/50'
              }`}
            >
              Analysis
            </Link>
            <Link
              to="/stories"
              className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                isActive('/stories') 
                  ? 'bg-sage-200 text-sage-800 shadow-organic' 
                  : 'text-earth-700 hover:text-sage-700 hover:bg-earth-100/50'
              }`}
            >
              Stories
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
