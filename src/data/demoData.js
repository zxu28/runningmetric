// Demo data for showcasing the app without authentication
export const demoRuns = [
  {
    id: 'demo-1',
    distance: 5000, // 5km
    time: 1800, // 30 minutes
    pace: 6.0, // 6 min/km
    elevation: 120,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
  },
  {
    id: 'demo-2',
    distance: 10000, // 10km
    time: 3600, // 60 minutes
    pace: 6.0, // 6 min/km
    elevation: 200,
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: 'demo-3',
    distance: 7500, // 7.5km
    time: 2700, // 45 minutes
    pace: 6.0, // 6 min/km
    elevation: 80,
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: 'demo-4',
    distance: 15000, // 15km
    time: 5400, // 90 minutes
    pace: 6.0, // 6 min/km
    elevation: 300,
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: 'demo-5',
    distance: 8000, // 8km
    time: 2880, // 48 minutes
    pace: 6.0, // 6 min/km
    elevation: 150,
    date: new Date().toISOString(), // today
  },
]

export const sampleGpxContent = `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="RunningMetrics Demo" xmlns="http://www.topografix.com/GPX/1/1">
  <trk>
    <name>Demo Run - 5km</name>
    <trkseg>
      <trkpt lat="40.7128" lon="-74.0060">
        <ele>10</ele>
        <time>2024-01-15T08:00:00Z</time>
      </trkpt>
      <trkpt lat="40.7130" lon="-74.0058">
        <ele>12</ele>
        <time>2024-01-15T08:01:00Z</time>
      </trkpt>
      <trkpt lat="40.7132" lon="-74.0056">
        <ele>15</ele>
        <time>2024-01-15T08:02:00Z</time>
      </trkpt>
      <trkpt lat="40.7134" lon="-74.0054">
        <ele>18</ele>
        <time>2024-01-15T08:03:00Z</time>
      </trkpt>
      <trkpt lat="40.7136" lon="-74.0052">
        <ele>20</ele>
        <time>2024-01-15T08:04:00Z</time>
      </trkpt>
    </trkseg>
  </trk>
</gpx>`
