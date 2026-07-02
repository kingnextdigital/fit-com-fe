import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track } from '@/types/music';
import { playlists } from '@/data/playlists';

const audio = typeof window !== 'undefined' ? new Audio() : null;
if (audio) audio.volume = 0.8;

export function formatTime(secs: number): string {
  if (!secs || isNaN(secs)) return '0:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

interface PlayerState {
  currentTrack: Track | null;
  currentPlaylistId: string | null;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  favorites: string[];
  recentlyPlayed: Track[];

  playTrack: (track: Track) => void;
  togglePlay: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (v: number) => void;
  seek: (time: number) => void;
  toggleFavorite: (trackId: string) => void;
  _updateTime: (currentTime: number, duration: number) => void;
  _setPlaying: (v: boolean) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      currentPlaylistId: null,
      isPlaying: false,
      volume: 0.8,
      currentTime: 0,
      duration: 0,
      favorites: [],
      recentlyPlayed: [],

      playTrack: (track) => {
        const { recentlyPlayed } = get();
        if (audio) {
          audio.src = track.audioUrl || '';
          audio.load();
          if (track.audioUrl) {
            audio.play().catch((e) => console.error('[player] play failed:', e));
          }
        }
        const recent = [track, ...recentlyPlayed.filter(t => t.id !== track.id)].slice(0, 6);
        set({
          currentTrack: track,
          currentPlaylistId: track.playlistId,
          isPlaying: !!track.audioUrl,
          recentlyPlayed: recent,
          currentTime: 0,
        });
      },

      togglePlay: () => {
        const { isPlaying, currentTrack } = get();
        if (!currentTrack) return;
        if (isPlaying) {
          audio?.pause();
        } else {
          audio?.play().catch(() => {});
        }
        set({ isPlaying: !isPlaying });
      },

      nextTrack: () => {
        const { currentTrack, currentPlaylistId } = get();
        if (!currentTrack || !currentPlaylistId) return;
        const playlist = playlists.find(p => p.id === currentPlaylistId);
        if (!playlist) return;
        const idx = playlist.tracks.findIndex(t => t.id === currentTrack.id);
        const next = playlist.tracks[(idx + 1) % playlist.tracks.length];
        get().playTrack(next);
      },

      prevTrack: () => {
        const { currentTrack, currentPlaylistId, currentTime } = get();
        if (!currentTrack || !currentPlaylistId) return;
        if (currentTime > 3 && audio) {
          audio.currentTime = 0;
          return;
        }
        const playlist = playlists.find(p => p.id === currentPlaylistId);
        if (!playlist) return;
        const idx = playlist.tracks.findIndex(t => t.id === currentTrack.id);
        const prev = playlist.tracks[(idx - 1 + playlist.tracks.length) % playlist.tracks.length];
        get().playTrack(prev);
      },

      setVolume: (v) => {
        if (audio) audio.volume = v;
        set({ volume: v });
      },

      seek: (time) => {
        if (audio) audio.currentTime = time;
        set({ currentTime: time });
      },

      toggleFavorite: (trackId) => {
        const { favorites } = get();
        set({
          favorites: favorites.includes(trackId)
            ? favorites.filter(id => id !== trackId)
            : [...favorites, trackId],
        });
      },

      _updateTime: (currentTime, duration) => set({ currentTime, duration }),
      _setPlaying: (v) => set({ isPlaying: v }),
    }),
    {
      name: 'fit-com-fe',
      partialize: (s) => ({ favorites: s.favorites, recentlyPlayed: s.recentlyPlayed, volume: s.volume }),
    }
  )
);

if (audio) {
  audio.addEventListener('timeupdate', () => {
    usePlayerStore.getState()._updateTime(audio.currentTime, audio.duration || 0);
  });
  audio.addEventListener('ended', () => {
    usePlayerStore.getState().nextTrack();
  });
  audio.addEventListener('play', () => usePlayerStore.getState()._setPlaying(true));
  audio.addEventListener('pause', () => usePlayerStore.getState()._setPlaying(false));
}
