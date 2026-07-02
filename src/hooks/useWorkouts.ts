import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { WorkoutPlan, WorkoutLog } from '@/types'

export function useWorkoutPlans() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['workout-plans', user?.id],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*, workout_days(*, workout_exercises(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data as WorkoutPlan[]
    },
    enabled: !!user,
  })
}

export function useActiveWorkoutPlan() {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['active-workout-plan', user?.id],
    queryFn: async () => {
      if (!user) return null
      const { data, error } = await supabase
        .from('workout_plans')
        .select('*, workout_days(*, workout_exercises(*, exercises(*)))')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data as WorkoutPlan | null
    },
    enabled: !!user,
  })
}

export function useWorkoutLogs(limit = 20) {
  const { user } = useAuthStore()

  return useQuery({
    queryKey: ['workout-logs', user?.id, limit],
    queryFn: async () => {
      if (!user) return []
      const { data, error } = await supabase
        .from('workout_logs')
        .select('*, exercise_logs(*, exercises(*))')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data as WorkoutLog[]
    },
    enabled: !!user,
  })
}

export function useCreateWorkoutPlan() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (plan: Omit<WorkoutPlan, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase.from('workout_plans').insert(plan).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-plans', user?.id] })
    },
  })
}

export function useLogWorkout() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (log: Omit<WorkoutLog, 'id' | 'created_at'>) => {
      const { data, error } = await supabase.from('workout_logs').insert(log).select().single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workout-logs', user?.id] })
    },
  })
}
