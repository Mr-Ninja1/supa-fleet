import { useMemo, useState } from 'react'

const ONLINE_WINDOW_MS = 30_000

function formatTimeAgo(iso) {
  if (!iso) return 'Unknown'
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 5_000) return 'Just now'
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function VehicleSidebar({ vehicles, loading, error, onSelect, onUpdateNickname }) {
  const [editingId, setEditingId] = useState(null)
  const [draftNickname, setDraftNickname] = useState('')

  const labelMap = useMemo(() => {
    const sorted = [...vehicles].sort((a, b) => (a.device_id || '').localeCompare(b.device_id || ''))
    return new Map(sorted.map((v, index) => [v.id, v.nickname || `GPS ${index + 1}`]))
  }, [vehicles])

  const decorated = useMemo(
    () =>
      vehicles.map((v) => {
        const isOnline = Date.now() - new Date(v.last_ping).getTime() < ONLINE_WINDOW_MS
        return { ...v, isOnline }
      }),
    [vehicles],
  )

  const startEdit = (vehicle) => {
    setEditingId(vehicle.id)
    setDraftNickname(vehicle.nickname ?? '')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraftNickname('')
  }

  const saveEdit = async (vehicleId) => {
    if (!onUpdateNickname) return
    const nickname = draftNickname.trim() || null
    await onUpdateNickname(vehicleId, nickname)
    setEditingId(null)
    setDraftNickname('')
  }

  return (
    <aside className="w-full md:w-80 xl:w-96 bg-slate-900/80 border-r border-slate-800 flex flex-col">
      <div className="px-4 py-4 md:py-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-lg font-semibold text-slate-100 tracking-wide uppercase">Fleet</h2>
          <p className="text-base md:text-lg text-slate-400">Devices currently reporting</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <p className="px-4 py-3 text-sm md:text-base text-slate-400">Loading devices…</p>
        )}
        {error && !loading && (
          <p className="px-4 py-3 text-sm md:text-base text-red-400">{error}</p>
        )}
        {!loading && !error && decorated.length === 0 && (
          <p className="px-4 py-3 text-sm md:text-base text-slate-500">No devices yet. Ask a driver to scan the QR.</p>
        )}

        <ul className="divide-y divide-slate-800">
          {decorated.map((v) => {
            const label = labelMap.get(v.id) || 'GPS'
            const nicknameLabel = v.nickname || 'Not set'
            const renameLabel = v.nickname ? 'Rename' : 'Set name'
            return (
              <li key={v.id} className="px-3 py-2.5 text-base md:text-lg text-slate-100 flex flex-col gap-1">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelect?.(v)}
                    className="flex-1 text-left flex items-center gap-2 hover:bg-slate-800/80 rounded-md px-2 py-1 transition"
                  >
                    <span
                      className={`inline-flex h-3 w-3 rounded-full ${v.isOnline ? 'bg-emerald-400' : 'bg-slate-500'}`}
                    />
                    <span className="truncate font-medium">{label}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => startEdit(v)}
                    className="text-sm md:text-base px-2 py-1 rounded border border-slate-600 text-slate-200 hover:bg-slate-800"
                  >
                    {renameLabel}
                  </button>
                </div>
                <p className="text-xs md:text-sm text-slate-400 pl-5">
                  Nickname: <span className="text-slate-200">{nicknameLabel}</span>
                </p>
                <div className="flex items-center justify-between pl-5 pr-1 text-xs md:text-sm text-slate-500">
                  <span className="uppercase tracking-wide">{v.current_status}</span>
                  <span>{formatTimeAgo(v.last_ping)}</span>
                </div>

                {editingId === v.id && (
                  <div className="mt-2 flex items-center gap-2 pl-5 pr-1">
                    <input
                      type="text"
                      value={draftNickname}
                      onChange={(e) => setDraftNickname(e.target.value)}
                      placeholder="Enter nickname (optional)"
                      className="flex-1 rounded bg-slate-950 border border-slate-700 px-2 py-1 text-sm md:text-base text-slate-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => saveEdit(v.id)}
                      className="text-sm md:text-base px-2 py-1 rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sm md:text-base px-2 py-1 rounded text-slate-300 hover:bg-slate-800"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </aside>
  )
}
