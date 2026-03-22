import { useEffect, useMemo, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet'
import L from 'leaflet'

const HOME_LAT = -12.943
const HOME_LNG = 28.639

const baseIcon = L.icon({
  iconUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

// Simple color-tinted marker icon for "immediate" status
function createImmediateIcon() {
  const svg = encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 52"><path fill="#f97373" stroke="#7f1d1d" stroke-width="2" d="M16 1C9.4 1 4 6.4 4 13c0 7.3 7 17.2 10.7 23 0.5 0.7 1.2 1 1.3 1 0.1 0 0.8-0.3 1.3-1C21 30.2 28 20.3 28 13 28 6.4 22.6 1 16 1z"/><circle cx="16" cy="14" r="5" fill="#fee2e2"/></svg>',
  )
  return L.icon({
    iconUrl: `data:image/svg+xml,${svg}`,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  })
}

const immediateIcon = createImmediateIcon()

function FlyToSelected({ selected }) {
  const map = useMap()

  useEffect(() => {
    if (!selected) return
    if (typeof selected.last_lat !== 'number' || typeof selected.last_lng !== 'number') return
    map.flyTo([selected.last_lat, selected.last_lng], 16, { duration: 0.8 })
  }, [selected, map])

  return null
}

export function FleetMap({ vehicles, selected }) {
  const markers = useMemo(() => vehicles ?? [], [vehicles])
  const labelMap = useMemo(() => {
    const sorted = [...(vehicles ?? [])].sort((a, b) => (a.device_id || '').localeCompare(b.device_id || ''))
    return new Map(sorted.map((v, index) => [v.id, v.nickname || `GPS ${index + 1}`]))
  }, [vehicles])
  const [satellite, setSatellite] = useState(false)

  return (
    <div className="flex-1 min-h-[320px] bg-slate-900 relative">
      <div className="absolute right-4 top-4 z-[1000]">
        <button
          type="button"
          onClick={() => setSatellite((current) => !current)}
          className="rounded-full border border-slate-700 bg-slate-950/90 px-3 py-1.5 text-xs md:text-sm text-slate-100 shadow-lg"
        >
          {satellite ? 'Map view' : 'Satellite view'}
        </button>
      </div>
      <MapContainer
        center={[HOME_LAT, HOME_LNG]}
        zoom={13}
        className="w-full h-full rounded-lg overflow-hidden"
      >
        {satellite ? (
          <TileLayer
            attribution="Tiles &copy; Esri"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />
        ) : (
          <TileLayer
            attribution="&copy; OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        <FlyToSelected selected={selected} />

        {markers.map((v) => {
          if (typeof v.last_lat !== 'number' || typeof v.last_lng !== 'number') return null
          const name = labelMap.get(v.id) || v.nickname || 'GPS'
          const isImmediate = v.current_status === 'immediate'
          const icon = isImmediate ? immediateIcon : baseIcon

          return (
            <Marker key={v.id} position={[v.last_lat, v.last_lng]} icon={icon} riseOnHover>
              <Tooltip direction="top" offset={[0, -28]} permanent>
                {name}
              </Tooltip>
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold mb-1">{name}</p>
                  <p className="text-xs text-slate-500 mb-1">
                    Status: <span className="uppercase">{v.current_status}</span>
                  </p>
                  <p className="text-xs text-slate-500">
                    Lat: {v.last_lat.toFixed(5)}, Lng: {v.last_lng.toFixed(5)}
                  </p>
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
