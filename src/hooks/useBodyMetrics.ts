import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { BodyMeasurement } from '@/types'

export function useBodyMeasurements(limit = 30) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['body-measurements', user?.id, limit],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as BodyMeasurement[]
    },
    enabled: !!user,
  })
}

export function useLatestMeasurement() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['latest-measurement', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('body_measurements')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data as BodyMeasurement | null
    },
    enabled: !!user,
  })
}

export function useAddMeasurement() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (measurement: Omit<BodyMeasurement, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('body_measurements').insert(measurement).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['body-measurements', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['latest-measurement', user?.id] })
    },
  })
}
