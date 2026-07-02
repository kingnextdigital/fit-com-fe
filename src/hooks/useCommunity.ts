import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import type { CommunityPost } from '@/types'

export function useCommunityFeed() {
  const { user } = useAuthStore()

  return useInfiniteQuery({
    queryKey: ['community-feed'],
    queryFn: async ({ pageParam = 0 }) => {
      const from = pageParam * 10
      const to = from + 9
      const { data, error } = await supabase
        .from('community_posts')
        .select('*, profiles(id, name, avatar_url, level, streak)')
        .order('created_at', { ascending: false })
        .range(from, to)
      if (error) throw error
      return data as CommunityPost[]
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => (lastPage.length === 10 ? allPages.length : undefined),
    enabled: !!user,
  })
}

export function useCreatePost() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async (post: { content: string; image_url?: string; workout_log_id?: string }) => {
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('community_posts')
        .insert({ ...post, user_id: user.id })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] })
    },
  })
}

export function useLikePost() {
  const queryClient = useQueryClient()
  const { user } = useAuthStore()

  return useMutation({
    mutationFn: async ({ postId, liked }: { postId: string; liked: boolean }) => {
      if (!user) throw new Error('Not authenticated')
      if (liked) {
        const { error } = await supabase
          .from('community_likes')
          .insert({ post_id: postId, user_id: user.id })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('community_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community-feed'] })
    },
  })
}
