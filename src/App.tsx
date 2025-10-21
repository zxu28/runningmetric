import { Routes, Route } from 'react-router-dom'
import { DataProvider } from './contexts/DataContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Upload from './pages/Upload'
import Analysis from './pages/Analysis'
import StravaCallback from './pages/StravaCallback'

function App() {
  return (
    <DataProvider>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/analysis" element={<Analysis />} />
            <Route path="/strava-callback" element={<StravaCallback />} />
          </Routes>
        </main>
      </div>
    </DataProvider>
  )
}

export default App
