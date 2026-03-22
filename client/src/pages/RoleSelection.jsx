import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function RoleSelection() {
  const navigate = useNavigate()

  // On larger non-touch screens (typical desktops), go straight to the
  // command center so admins land on the dashboard by default.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const isLargeScreen = window.matchMedia('(min-width: 1024px)').matches
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    if (isLargeScreen && !isTouch) {
      navigate('/dashboard', { replace: true })
    }
  }, [navigate])

  const handleDriver = () => {
    navigate('/driver')
  }

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4 py-10 lg:py-20">
      <div className="w-full max-w-5xl grid gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
        <div className="space-y-4">
          <p className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-[11px] font-medium uppercase tracking-wide text-slate-300">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Real‑time GPS fleet tracking
          </p>
          <h1 className="mt-4 text-3xl md:text-5xl font-semibold tracking-tight">
            Welcome to <span className="text-brand-blue">Supa‑Fleet</span>
          </h1>
          <p className="mt-3 text-sm md:text-base text-slate-300 max-w-2xl">
            Choose how you want to use this device. You can turn it into a live
            GPS beacon for drivers, or monitor all vehicles from the admin
            command center.
          </p>

          <div className="mt-6 grid gap-3 text-xs text-slate-400 max-w-xl">
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              <p>
                <span className="font-semibold text-slate-100">Drivers:</span>{' '}
                On the phone placed in the vehicle, open this site and tap
                <span className="font-medium text-emerald-300"> Track this device</span>, then
                allow location access.
              </p>
            </div>
            <div className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-sky-400" />
              <p>
                <span className="font-semibold text-slate-100">Admins:</span>{' '}
                On a laptop or desktop, go straight to the command center to see
                all vehicles on the map.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-4 md:p-5 shadow-xl shadow-slate-900/40">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-300 mb-3">
              Choose a role on this device
            </h2>
            <p className="mb-3 text-[11px] text-slate-400">
              On the device inside the vehicle, choose
              <span className="font-medium text-emerald-300"> Track this device</span>.
              On your monitoring laptop or tablet, choose
              <span className="font-medium text-slate-100"> Track using this device</span> to
              open the command center.
            </p>
            <div className="flex flex-col gap-3">
              <button
                type="button"
                onClick={handleDriver}
                className="w-full rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 py-3 px-4 text-sm font-semibold shadow-lg shadow-emerald-500/25 transition flex items-center justify-between gap-3"
              >
                <div className="text-left">
                  <p>Track this device</p>
                  <p className="text-[11px] font-normal text-emerald-100">
                    Driver Mode · Use this phone as the tracker
                  </p>
                </div>
                <span className="text-[11px] rounded-full bg-emerald-900/60 px-2 py-0.5 text-emerald-100 border border-emerald-400/40">
                  Recommended on phones
                </span>
              </button>

              <button
                type="button"
                onClick={handleDashboard}
                className="w-full rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-50 py-3 px-4 text-sm font-semibold border border-slate-700/80 transition flex items-center justify-between gap-3"
              >
                <div className="text-left">
                  <p>Track using this device</p>
                  <p className="text-[11px] font-normal text-slate-300">
                    Admin Command Center · Use this screen to monitor all vehicles
                  </p>
                </div>
                <span className="text-[11px] rounded-full bg-slate-900 px-2 py-0.5 text-slate-300 border border-slate-600/70">
                  Map & fleet overview
                </span>
              </button>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 text-center md:text-left">
            You can always switch roles later by navigating to{' '}
            <span className="text-slate-300">/driver</span> or{' '}
            <span className="text-slate-300">/dashboard</span>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default RoleSelection
