import { useEffect, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:4000')

function getCookie(name) {
  if (typeof document === 'undefined') return null
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

function setCookie(name, value, days = 365) {
  if (typeof document === 'undefined') return
  const maxAge = days * 24 * 60 * 60
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${maxAge}; Path=/; SameSite=Lax`
}

function getOrCreateDeviceId() {
  if (typeof window === 'undefined') return 'unknown-device'
  const existing = window.localStorage.getItem('supa_fleet_device_id') || getCookie('supa_fleet_device_id')
  if (existing) {
    window.localStorage.setItem('supa_fleet_device_id', existing)
    setCookie('supa_fleet_device_id', existing)
    return existing
  }
  const id = crypto.randomUUID ? crypto.randomUUID() : `device-${Date.now()}`
  window.localStorage.setItem('supa_fleet_device_id', id)
  setCookie('supa_fleet_device_id', id)
  return id
}

function Driver() {
  const [status, setStatus] = useState('Requesting location permission…')
  const [lastCoords, setLastCoords] = useState(null)
  const [error, setError] = useState(null)
  const [wakeLockActive, setWakeLockActive] = useState(false)
  const [nickname, setNickname] = useState(() => {
    if (typeof window === 'undefined') return ''
    return window.localStorage.getItem('supa_fleet_nickname') || ''
  })

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported on this device.')
      setStatus('Unavailable')
      return
    }

    const deviceId = getOrCreateDeviceId()
    let lastSentAt = 0

    const watcherId = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude, speed } = position.coords
        setLastCoords({ latitude, longitude })
        setStatus('Tracking…')

        const now = Date.now()
        if (now - lastSentAt < 5000) return
        lastSentAt = now

        try {
          const res = await fetch(`${API_BASE_URL}/location`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              device_id: deviceId,
              latitude,
              longitude,
              // speed is in m/s from the Geolocation API when available
              speed: typeof speed === 'number' ? speed : null,
              nickname: nickname && nickname.trim() !== '' ? nickname.trim() : null,
            }),
          })

          if (!res.ok) {
            const text = await res.text()
            console.error('Failed to send location', text)
            setError(`Failed to send location to server: ${text || res.status}`)
          } else {
            const data = await res.json()
            setStatus(`Tracking: ${data.status} (${Math.round(data.distance_meters)} m from base)`)
          }
        } catch (err) {
          console.error('Error sending location', err)
          setError('Network error while sending location.')
        }
      },
      (geoError) => {
        console.error('Geolocation error', geoError)
        setError(geoError.message)
        setStatus('Location access denied or unavailable.')
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 10000,
      },
    )

    return () => {
      if (watcherId != null) {
        navigator.geolocation.clearWatch(watcherId)
      }
    }
  }, [])

  // Keep the screen awake while in Driver Mode so tracking is reliable.
  useEffect(() => {
    let wakeLock = null

    const requestWakeLock = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') {
          wakeLock = await navigator.wakeLock.request('screen')
          setWakeLockActive(true)

          wakeLock.addEventListener('release', () => {
            setWakeLockActive(false)
          })
        }
      } catch (err) {
        console.error('Wake lock request failed:', err)
        setWakeLockActive(false)
      }
    }

    requestWakeLock()

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        requestWakeLock()
      } else if (wakeLock) {
        wakeLock.release().catch(() => {})
        wakeLock = null
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      if (wakeLock) {
        wakeLock.release().catch(() => {})
      }
    }
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-slate-950 text-slate-50 px-4">
      <div className="text-center max-w-xl">
        <h1 className="text-3xl font-semibold mb-2">Driver Mode</h1>
        <p className="text-slate-300">
          This device is acting as a GPS beacon. Keep this page open while
          driving.
        </p>
      </div>

      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-3">
        <div>
          <p className="text-xs font-medium text-slate-300 mb-1">Driver nickname (optional)</p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              if (typeof window !== 'undefined') {
                window.localStorage.setItem('supa_fleet_nickname', e.target.value)
              }
            }}
            placeholder="e.g. Truck 01 - Musa"
            className="w-full rounded bg-slate-950 border border-slate-700 px-3 py-1.5 text-sm text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
        </div>

        <p className="font-medium mb-1">Status</p>
        <p className="text-emerald-400 text-sm mb-2">{status}</p>
        {lastCoords && (
          <p className="text-xs text-slate-400">
            Last position: {lastCoords.latitude.toFixed(5)}, {lastCoords.longitude.toFixed(5)}
          </p>
        )}
        <p className="text-xs text-slate-500 mt-2">
          Screen wake lock: {wakeLockActive ? 'On' : 'Off or unsupported'}
        </p>
        {error && <p className="text-xs text-red-400 mt-2">{error}</p>}
      </div>
    </div>
  )
}

export default Driver
