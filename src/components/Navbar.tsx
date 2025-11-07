import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState } from 'react'
import { useTheme } from '../contexts/ThemeContext'

const Navbar = () => {
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <nav className="bg-earth-50/80 dark:bg-earth-800/80 backdrop-blur-sm border-b border-earth-200/50 dark:border-earth-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center group">
              <motion.span 
                className="text-lg sm:text-xl md:text-2xl font-bold text-sage-600 dark:text-sage-400 group-hover:text-sage-700 dark:group-hover:text-sage-300"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                🏃‍♂️ <span className="text-earth-700 dark:text-earth-100 hidden sm:inline">Running Metrics</span>
                <span className="text-earth-700 dark:text-earth-100 sm:hidden">Metrics</span>
              </motion.span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <Link
              to="/"
              className={`px-2 lg:px-4 py-2 rounded-organic text-xs lg:text-sm font-medium transition-all duration-300 ${
                isActive('/') 
                  ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                  : 'text-earth-700 dark:text-earth-200 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/upload"
              className={`px-2 lg:px-4 py-2 rounded-organic text-xs lg:text-sm font-medium transition-all duration-300 ${
                isActive('/upload') 
                  ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                  : 'text-earth-700 dark:text-earth-200 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
              }`}
            >
              Upload
            </Link>
            <Link
              to="/analysis"
              className={`px-2 lg:px-4 py-2 rounded-organic text-xs lg:text-sm font-medium transition-all duration-300 ${
                isActive('/analysis') 
                  ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                  : 'text-earth-700 dark:text-earth-200 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
              }`}
            >
              Analysis
            </Link>
            <Link
              to="/stories"
              className={`px-2 lg:px-4 py-2 rounded-organic text-xs lg:text-sm font-medium transition-all duration-300 ${
                isActive('/stories') 
                  ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                  : 'text-earth-700 dark:text-earth-200 hover:text-sage-700 dark:hover:text-sage-300 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
              }`}
            >
              Stories
            </Link>
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="px-2 lg:px-3 py-2 rounded-organic text-earth-700 dark:text-earth-200 hover:bg-earth-100/50 dark:hover:bg-earth-700/50 transition-all duration-300"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <motion.svg
                className="w-4 h-4 lg:w-5 lg:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'light' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                )}
              </motion.svg>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="px-2 py-2 rounded-organic text-earth-700 dark:text-earth-200 hover:bg-earth-100/50 dark:hover:bg-earth-700/50 transition-all duration-300"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              <motion.svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'light' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                )}
              </motion.svg>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="px-2 py-2 rounded-organic text-earth-700 dark:text-earth-200 hover:bg-earth-100/50 dark:hover:bg-earth-700/50"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-earth-200/50 dark:border-earth-700/50">
            <div className="flex flex-col gap-2">
              <Link
                to="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                  isActive('/') 
                    ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                    : 'text-earth-700 dark:text-earth-200 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
                }`}
              >
                Home
              </Link>
              <Link
                to="/upload"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                  isActive('/upload') 
                    ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                    : 'text-earth-700 dark:text-earth-200 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
                }`}
              >
                Upload
              </Link>
              <Link
                to="/analysis"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                  isActive('/analysis') 
                    ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                    : 'text-earth-700 dark:text-earth-200 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
                }`}
              >
                Analysis
              </Link>
              <Link
                to="/stories"
                onClick={() => setIsMobileMenuOpen(false)}
                className={`px-4 py-2 rounded-organic text-sm font-medium transition-all duration-300 ${
                  isActive('/stories') 
                    ? 'bg-sage-200 dark:bg-sage-700 text-sage-800 dark:text-sage-100 shadow-organic' 
                    : 'text-earth-700 dark:text-earth-200 hover:bg-earth-100/50 dark:hover:bg-earth-700/50'
                }`}
              >
                Stories
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
