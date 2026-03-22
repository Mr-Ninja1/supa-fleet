import { useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { VehicleSidebar } from '../components/VehicleSidebar'
import { FleetMap } from '../components/FleetMap'
import { useVehicles } from '../hooks/useVehicles'

function Dashboard() {
  const { vehicles, loading, error, updateNickname } = useVehicles()
  const [selectedId, setSelectedId] = useState(null)
  const driverUrl = useMemo(
    () => (typeof window !== 'undefined' ? `${window.location.origin}/driver` : ''),
    [],
  )

  const selected = useMemo(
    () => vehicles.find((v) => v.id === selectedId) || null,
    [vehicles, selectedId],
  )

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <header className="border-b border-slate-800 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Supa-Fleet Command Center</h1>
          <p className="text-xs text-slate-400">
            Live vehicle positions with Realtime updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[11px] text-slate-300 mb-0.5">Driver Onboarding</p>
            <p className="text-[10px] text-slate-500">
              Drivers scan to open the app directly in Driver Mode.
            </p>
          </div>
          <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
            {driverUrl && (
              <QRCodeCanvas value={driverUrl} size={90} bgColor="#020617" fgColor="#e5e7eb" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <VehicleSidebar
          vehicles={vehicles}
          loading={loading}
          error={error}
          onSelect={(v) => setSelectedId(v.id)}
          onUpdateNickname={updateNickname}
        />
        <section className="flex-1 flex flex-col p-3 md:p-4 gap-3 bg-slate-950">
          <FleetMap vehicles={vehicles} selected={selected} />
        </section>
      </main>
    </div>
  )
}

export default Dashboard
