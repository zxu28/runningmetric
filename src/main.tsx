import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'
import 'leaflet/dist/leaflet.css'

// Apply theme immediately before React renders to prevent flash
const applyInitialTheme = () => {
  const stored = localStorage.getItem('running-metrics-theme')
  if (stored === 'dark' || stored === 'light') {
    if (stored === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.classList.add('dark')
  }
}

applyInitialTheme()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter basename="/runningmetric">
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)
