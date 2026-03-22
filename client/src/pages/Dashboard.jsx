import { useMemo, useState } from 'react'
import { QRCodeCanvas } from 'qrcode.react'
import { VehicleSidebar } from '../components/VehicleSidebar'
import { FleetMap } from '../components/FleetMap'
import { useVehicles } from '../hooks/useVehicles'

function Dashboard() {
  const { vehicles, loading, error, updateNickname, removeVehicle } = useVehicles()
  const [selectedId, setSelectedId] = useState(null)
  const [mobileView, setMobileView] = useState('map')
  const [dismissedEmptyModal, setDismissedEmptyModal] = useState(false)
  const driverUrl = useMemo(
    () => (typeof window !== 'undefined' ? `${window.location.origin}/driver` : ''),
    [],
  )

  const selected = useMemo(
    () => vehicles.find((v) => v.id === selectedId) || null,
    [vehicles, selectedId],
  )

  const hasOnlineDevices = useMemo(() => {
    const now = Date.now()
    return vehicles.some((v) => now - new Date(v.last_ping).getTime() < 30_000)
  }, [vehicles])

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      {!loading && !hasOnlineDevices && !dismissedEmptyModal && (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center bg-slate-950/80 px-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/90 p-5 text-center shadow-2xl">
            <p className="text-sm font-semibold text-slate-100 mb-2">No devices online</p>
            <p className="text-sm text-slate-300 mb-4">
              Scan this QR code on the phone you want to track. The driver device
              should choose <span className="text-slate-100">Track this device</span> and
              allow location access.
            </p>
            <div className="mx-auto w-fit rounded-xl border border-slate-800 bg-slate-950 p-3 mb-4">
              {driverUrl && (
                <QRCodeCanvas value={driverUrl} size={160} bgColor="#020617" fgColor="#e5e7eb" />
              )}
            </div>
            <button
              type="button"
              onClick={() => setDismissedEmptyModal(true)}
              className="w-full rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
            >
              Got it
            </button>
          </div>
        </div>
      )}
      <header className="border-b border-slate-800 px-5 py-4 md:py-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-4xl font-semibold">Supa-Fleet Command Center</h1>
          <p className="text-base md:text-lg text-slate-400">
            Live vehicle positions with Realtime updates.
          </p>
          <div className="mt-3 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-sm text-slate-300 md:hidden">
            <p className="font-semibold text-slate-100">Mobile admin view</p>
            <p className="text-slate-400">
              This dashboard looks best on a PC. Scan the QR with the phone you
              want to track, or go back and choose <span className="text-slate-100">Track this device</span>.
            </p>
          </div>
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
        <div className="md:hidden px-4 pt-3">
          <div className="flex items-center gap-2 rounded-full bg-slate-900/80 border border-slate-800 p-1">
            <button
              type="button"
              onClick={() => setMobileView('map')}
              className={`flex-1 rounded-full px-3 py-1 text-sm ${
                mobileView === 'map'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Map
            </button>
            <button
              type="button"
              onClick={() => setMobileView('fleet')}
              className={`flex-1 rounded-full px-3 py-1 text-sm ${
                mobileView === 'fleet'
                  ? 'bg-emerald-500 text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Fleet
            </button>
          </div>
        </div>

        <div className={`${mobileView === 'fleet' ? 'block' : 'hidden'} md:block`}>
          <VehicleSidebar
            vehicles={vehicles}
            loading={loading}
            error={error}
            selectedId={selectedId}
            onSelect={(v) => {
              setSelectedId(v.id)
              setMobileView('map')
            }}
            onUpdateNickname={updateNickname}
            onRemove={removeVehicle}
          />
        </div>

        <section className={`${mobileView === 'map' ? 'block' : 'hidden'} md:flex md:flex-1 flex-col p-3 md:p-4 gap-3 bg-slate-950`}>
          <FleetMap vehicles={vehicles} selected={selected} />
        </section>
      </main>
    </div>
  )
}

export default Dashboard
