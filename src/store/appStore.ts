import { create } from 'zustand';
import { WorkoutLog } from '@/types';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface AppState {
  sidebarOpen: boolean;
  activeWorkoutLog: WorkoutLog | null;
  timerRunning: boolean;
  timerSeconds: number;
  theme: 'light' | 'dark';
  notifications: Notification[];

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  startWorkout: (log: WorkoutLog) => void;
  endWorkout: () => void;
  updateTimer: (seconds: number) => void;
  toggleTimer: () => void;
  resetTimer: () => void;
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
}

const isDesktop = (): boolean =>
  typeof window !== 'undefined' && window.innerWidth >= 1024;

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: isDesktop(),
  activeWorkoutLog: null,
  timerRunning: false,
  timerSeconds: 0,
  theme: 'light',
  notifications: [],

  toggleSidebar: () =>
    set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSidebarOpen: (open) =>
    set({ sidebarOpen: open }),

  startWorkout: (log) =>
    set({ activeWorkoutLog: log, timerRunning: true, timerSeconds: 0 }),

  endWorkout: () =>
    set({ activeWorkoutLog: null, timerRunning: false, timerSeconds: 0 }),

  updateTimer: (seconds) =>
    set({ timerSeconds: seconds }),

  toggleTimer: () =>
    set((state) => ({ timerRunning: !state.timerRunning })),

  resetTimer: () =>
    set({ timerRunning: false, timerSeconds: 0 }),

  setTheme: (theme) =>
    set({ theme }),

  toggleTheme: () =>
    set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),
}));
