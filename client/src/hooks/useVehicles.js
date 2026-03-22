import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useVehicles() {
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!supabase) {
      setError('Supabase client is not configured')
      setLoading(false)
      return
    }

    const load = async () => {
      setLoading(true)
      const { data, error: err } = await supabase
        .from('vehicles')
        .select('*')
        .order('last_ping', { ascending: false })

      if (err) {
        console.error('Error loading vehicles:', err)
        setError('Failed to load devices')
      } else {
        setVehicles(data ?? [])
        setError(null)
      }
      setLoading(false)
    }

    load()

    const channel = supabase
      .channel('vehicles-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'vehicles',
        },
        (payload) => {
          setVehicles((current) => {
            const next = [...current]
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const row = payload.new
              const idx = next.findIndex((v) => v.id === row.id)
              if (idx === -1) {
                next.unshift(row)
              } else {
                next[idx] = row
              }
            } else if (payload.eventType === 'DELETE') {
              const row = payload.old
              return next.filter((v) => v.id !== row.id)
            }
            return next
          })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const updateNickname = async (vehicleId, nickname) => {
    if (!supabase) return
    const { error: err } = await supabase
      .from('vehicles')
      .update({ nickname })
      .eq('id', vehicleId)

    if (err) {
      console.error('Error updating nickname:', err)
      setError('Failed to update name')
    } else {
      setError(null)
    }
  }

  const removeVehicle = async (vehicleId) => {
    if (!supabase) return
    const { error: err } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)

    if (err) {
      console.error('Error deleting vehicle:', err)
      setError('Failed to remove device')
    } else {
      setError(null)
    }
  }

  return { vehicles, loading, error, updateNickname, removeVehicle }
}
