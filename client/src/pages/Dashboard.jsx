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
      <header className="border-b border-slate-800 px-5 py-4 md:py-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold">Supa-Fleet Command Center</h1>
          <p className="text-base md:text-lg text-slate-400">
            Live vehicle positions with Realtime updates.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-base md:text-lg text-slate-300 mb-0.5">Driver Onboarding</p>
            <p className="text-sm md:text-base text-slate-500 max-w-[280px]">
              Scan this QR code on the phone you want to track.
            </p>
          </div>
          <div className="p-2 md:p-4 rounded-xl bg-slate-900 border border-slate-800">
            {driverUrl && (
              <QRCodeCanvas value={driverUrl} size={140} bgColor="#020617" fgColor="#e5e7eb" />
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col md:flex-row overflow-hidden text-base md:text-lg">
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
