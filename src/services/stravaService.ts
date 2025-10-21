// Strava OAuth Service (MVP - Client-side implementation)

const STRAVA_CLIENT_ID = import.meta.env.VITE_STRAVA_CLIENT_ID || ''
const STRAVA_CLIENT_SECRET = import.meta.env.VITE_STRAVA_CLIENT_SECRET || ''
const STRAVA_REDIRECT_URI = import.meta.env.VITE_STRAVA_REDIRECT_URI || 
  `${window.location.origin}/runningmetric/strava-callback`

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'
const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth'

export interface StravaTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number // Unix timestamp
  athleteId: number
  athleteName: string
}

export interface StravaActivity {
  id: number
  name: string
  type: string
  distance: number // meters
  moving_time: number // seconds
  elapsed_time: number // seconds
  total_elevation_gain: number // meters
  start_date: string // ISO 8601
  start_date_local: string
  average_speed: number // m/s
  max_speed: number // m/s
  map?: {
    summary_polyline: string
  }
}

class StravaService {
  private readonly STORAGE_KEY = 'strava_tokens'

  // Initiate OAuth authorization flow
  authorize(): void {
    const scope = 'read,activity:read_all'
    const authUrl = `${STRAVA_OAUTH_BASE}/authorize?` +
      `client_id=${STRAVA_CLIENT_ID}&` +
      `redirect_uri=${encodeURIComponent(STRAVA_REDIRECT_URI)}&` +
      `response_type=code&` +
      `approval_prompt=auto&` +
      `scope=${scope}`
    
    window.location.href = authUrl
  }

  // Exchange authorization code for access token
  async exchangeToken(code: string): Promise<StravaTokens> {
    try {
      const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          code: code,
          grant_type: 'authorization_code'
        })
      })

      if (!response.ok) {
        throw new Error(`Token exchange failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      const tokens: StravaTokens = {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at,
        athleteId: data.athlete.id,
        athleteName: `${data.athlete.firstname} ${data.athlete.lastname}`
      }

      // Store tokens in localStorage
      this.saveTokens(tokens)
      
      return tokens
    } catch (error) {
      console.error('Token exchange error:', error)
      throw error
    }
  }

  // Refresh access token
  async refreshAccessToken(): Promise<StravaTokens> {
    const tokens = this.getTokens()
    if (!tokens) {
      throw new Error('No tokens found')
    }

    try {
      const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client_id: STRAVA_CLIENT_ID,
          client_secret: STRAVA_CLIENT_SECRET,
          refresh_token: tokens.refreshToken,
          grant_type: 'refresh_token'
        })
      })

      if (!response.ok) {
        throw new Error(`Token refresh failed: ${response.statusText}`)
      }

      const data = await response.json()
      
      const newTokens: StravaTokens = {
        ...tokens,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresAt: data.expires_at
      }

      this.saveTokens(newTokens)
      return newTokens
    } catch (error) {
      console.error('Token refresh error:', error)
      throw error
    }
  }

  // Get valid access token (refresh if needed)
  async getValidAccessToken(): Promise<string> {
    const tokens = this.getTokens()
    if (!tokens) {
      throw new Error('Not connected to Strava')
    }

    // Check if token is expired (with 5 min buffer)
    const now = Math.floor(Date.now() / 1000)
    if (tokens.expiresAt < now + 300) {
      const refreshed = await this.refreshAccessToken()
      return refreshed.accessToken
    }

    return tokens.accessToken
  }

  // Fetch athlete's activities
  async fetchActivities(options: {
    after?: number // Unix timestamp
    before?: number // Unix timestamp
    page?: number
    per_page?: number
  } = {}): Promise<StravaActivity[]> {
    try {
      const accessToken = await this.getValidAccessToken()
      
      const params = new URLSearchParams({
        page: String(options.page || 1),
        per_page: String(options.per_page || 30)
      })
      
      if (options.after) params.append('after', String(options.after))
      if (options.before) params.append('before', String(options.before))

      const response = await fetch(
        `${STRAVA_API_BASE}/athlete/activities?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch activities: ${response.statusText}`)
      }

      const activities: StravaActivity[] = await response.json()
      
      // Filter only running activities
      return activities.filter(a => a.type === 'Run')
    } catch (error) {
      console.error('Fetch activities error:', error)
      throw error
    }
  }

  // Fetch detailed activity streams (GPS data)
  async fetchActivityStreams(activityId: number): Promise<any> {
    try {
      const accessToken = await this.getValidAccessToken()
      
      const keys = 'latlng,time,distance,altitude,heartrate'
      const response = await fetch(
        `${STRAVA_API_BASE}/activities/${activityId}/streams?keys=${keys}&key_by_type=true`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch streams: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Fetch streams error:', error)
      throw error
    }
  }

  // Check if user is connected
  isConnected(): boolean {
    const tokens = this.getTokens()
    return tokens !== null
  }

  // Get stored tokens
  getTokens(): StravaTokens | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null
      return JSON.parse(stored)
    } catch {
      return null
    }
  }

  // Save tokens to localStorage
  private saveTokens(tokens: StravaTokens): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tokens))
  }

  // Disconnect (clear tokens)
  disconnect(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }
}

export const stravaService = new StravaService()

