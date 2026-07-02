import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { NutritionEntry, WaterIntake } from '@/types'
import { format } from 'date-fns'

export function useNutritionEntries(date?: Date) {
  const { user } = useAuthStore()
  const dateStr = format(date ?? new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['nutrition', user?.id, dateStr],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('nutrition_entries')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data as NutritionEntry[]
    },
    enabled: !!user,
  })
}

export function useWaterIntake(date?: Date) {
  const { user } = useAuthStore()
  const dateStr = format(date ?? new Date(), 'yyyy-MM-dd')

  return useQuery({
    queryKey: ['water', user?.id, dateStr],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .eq('date', dateStr)
      if (error) throw error
      return data as WaterIntake[]
    },
    enabled: !!user,
  })
}

export function useAddNutritionEntry() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (entry: Omit<NutritionEntry, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('nutrition_entries').insert(entry).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['nutrition', user?.id, variables.date] })
    },
  })
}

export function useAddWater() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (intake: Omit<WaterIntake, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('water_intake').insert(intake).select().single()
      if (error) throw error
      return data
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['water', user?.id, variables.date] })
    },
  })
}
