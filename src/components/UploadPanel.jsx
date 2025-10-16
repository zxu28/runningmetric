import { useRef } from 'react'
import { useParseGpx } from '../hooks/useParseGpx'

export default function UploadPanel({ onSave }) {
  const { summary, error, isParsing, parseFile, paceLabel } = useParseGpx()
  const inputRef = useRef(null)

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      parseFile(file)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 slide-up">
      <div className="flex items-center gap-3 mb-4">
        <div className="text-2xl">📁</div>
        <h2 className="text-xl font-bold text-gray-800">Upload GPX File</h2>
      </div>
      
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
          <input 
            ref={inputRef} 
            type="file" 
            accept=".gpx" 
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="space-y-2">
            <div className="text-4xl">🏃‍♂️</div>
            <div>
              <button
                onClick={() => inputRef.current?.click()}
                className="text-blue-600 hover:text-blue-700 font-semibold underline"
              >
                Click to upload a GPX file
              </button>
              <span className="text-gray-500"> or drag and drop</span>
            </div>
            <div className="text-sm text-gray-400">Supports .gpx files from running apps</div>
          </div>
        </div>

        {isParsing && (
          <div className="flex items-center justify-center gap-2 text-blue-600">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm">Parsing GPX file...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-600">
              <div className="text-lg">⚠️</div>
              <span className="text-sm font-medium">{error}</span>
            </div>
          </div>
        )}

        {summary && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 fade-in">
            <div className="flex items-center gap-2 mb-3">
              <div className="text-lg">✅</div>
              <span className="font-semibold text-green-800">GPX File Parsed Successfully!</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs uppercase text-green-600 font-semibold mb-1">Distance</div>
                <div className="text-lg font-bold text-green-800">{(summary.distanceMeters/1000).toFixed(2)} km</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs uppercase text-green-600 font-semibold mb-1">Duration</div>
                <div className="text-lg font-bold text-green-800">
                  {Math.floor(summary.durationSec/60)}m {summary.durationSec%60}s
                </div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs uppercase text-green-600 font-semibold mb-1">Avg Pace</div>
                <div className="text-lg font-bold text-green-800">{paceLabel}</div>
              </div>
              <div className="bg-white rounded-lg p-3">
                <div className="text-xs uppercase text-green-600 font-semibold mb-1">Elev Gain</div>
                <div className="text-lg font-bold text-green-800">{summary.elevationGain} m</div>
              </div>
            </div>
            <button 
              className="w-full mt-4 bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 transition-colors"
              onClick={() => onSave?.(summary)}
            >
              Save Run to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


