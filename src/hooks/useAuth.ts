import { useAuthStore } from '@/store/authStore'

export function useAuth() {
  const { user, profile, loading, initialized, signIn, signUp, signOut, updateProfile, signInWithGoogle } =
    useAuthStore()

  return {
    user,
    profile,
    loading,
    initialized,
    isAuthenticated: !!user,
    isAdmin: profile?.role === 'admin',
    onboardingCompleted: profile?.onboarding_completed ?? false,
    signIn,
    signUp,
    signOut,
    updateProfile,
    signInWithGoogle,
  }
}
