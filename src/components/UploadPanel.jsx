import { useRef } from 'react'
import { useParseGpx } from '../hooks/useParseGpx'

export default function UploadPanel({ onSave }) {
  const { summary, error, isParsing, parseFile, paceLabel } = useParseGpx()
  const inputRef = useRef(null)

  return (
    <div className="border rounded p-4 space-y-4">
      <div className="space-y-2">
        <input ref={inputRef} type="file" accept=".gpx" onChange={(e)=>parseFile(e.target.files?.[0])} />
        {isParsing && <div className="text-sm opacity-80">Parsing...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
      </div>
      {summary && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-xs uppercase opacity-70">Distance</div>
            <div className="font-semibold">{(summary.distanceMeters/1000).toFixed(2)} km</div>
          </div>
          <div>
            <div className="text-xs uppercase opacity-70">Duration</div>
            <div className="font-semibold">{Math.floor(summary.durationSec/60)}m {summary.durationSec%60}s</div>
          </div>
          <div>
            <div className="text-xs uppercase opacity-70">Avg Pace</div>
            <div className="font-semibold">{paceLabel}</div>
          </div>
          <div>
            <div className="text-xs uppercase opacity-70">Elev Gain</div>
            <div className="font-semibold">{summary.elevationGain} m</div>
          </div>
        </div>
      )}
      {summary && (
        <button className="border rounded px-3 py-2" onClick={()=>onSave?.(summary)}>Save Run</button>
      )}
    </div>
  )
}


