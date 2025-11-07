import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './contexts/DataContext'
import { StoriesProvider } from './contexts/StoriesContext'
import { GoalsProvider } from './contexts/GoalsContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Analysis from './pages/Analysis'
import Stories from './pages/Stories'
import StravaCallback from './pages/StravaCallback'

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <StoriesProvider>
          <GoalsProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-earth-900 transition-colors duration-300">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/upload" element={<Upload />} />
                  <Route path="/analysis" element={<Analysis />} />
                  <Route path="/stories" element={<Stories />} />
                  <Route path="/strava-callback" element={<StravaCallback />} />
                </Routes>
              </main>
            </div>
          </GoalsProvider>
        </StoriesProvider>
      </DataProvider>
    </ThemeProvider>
  )
}

export default App
