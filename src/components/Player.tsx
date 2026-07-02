import { Heart, Shuffle, SkipBack, SkipForward, Play, Pause, Repeat, Volume2, VolumeX } from 'lucide-react';
import { usePlayerStore, formatTime } from '@/store/playerStore';
import { playlists } from '@/data/playlists';

export default function Player() {
  const {
    currentTrack, isPlaying, volume, currentTime, duration,
    favorites, togglePlay, nextTrack, prevTrack, setVolume, seek, toggleFavorite,
  } = usePlayerStore();

  const isFav = currentTrack ? favorites.includes(currentTrack.id) : false;
  const progress = duration > 0 ? currentTime / duration : 0;
  const pl = playlists.find(p => p.id === currentTrack?.playlistId);

  return (
    <div className="fixed bottom-0 left-0 right-0 h-[90px] bg-[#181818] border-t border-white/10 flex items-center px-4 gap-4 z-50 select-none">
      {/* Left — track info */}
      <div className="w-[30%] flex items-center gap-3 min-w-0">
        {currentTrack ? (
          <>
            <div
              className="w-14 h-14 rounded shrink-0 flex items-center justify-center text-2xl"
              style={{ background: pl?.gradient ?? 'linear-gradient(135deg,#1a0800,#c47a0a)' }}
            >
              {pl?.emoji ?? '🎵'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate hover:underline cursor-pointer">
                {currentTrack.title}
              </p>
              <p className="text-xs text-gray-400 truncate">{currentTrack.playlistName}</p>
            </div>
            <button
              onClick={() => currentTrack && toggleFavorite(currentTrack.id)}
              className="shrink-0 ml-1 transition-colors"
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-gray-400 hover:text-white'}`} />
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-500">Nenhuma faixa selecionada</p>
        )}
      </div>

      {/* Center — controls + progress */}
      <div className="flex-1 flex flex-col items-center gap-2">
        <div className="flex items-center gap-5">
          <button className="text-gray-400 hover:text-white transition-colors" title="Aleatório">
            <Shuffle className="w-4 h-4" />
          </button>
          <button
            onClick={prevTrack}
            disabled={!currentTrack}
            className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <SkipBack className="w-4 h-4 fill-current" />
          </button>
          <button
            onClick={togglePlay}
            disabled={!currentTrack}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 disabled:opacity-30 flex items-center justify-center transition-transform active:scale-95"
          >
            {isPlaying
              ? <Pause className="w-4 h-4 text-black fill-black" />
              : <Play className="w-4 h-4 text-black fill-black ml-0.5" />
            }
          </button>
          <button
            onClick={nextTrack}
            disabled={!currentTrack}
            className="text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
          >
            <SkipForward className="w-4 h-4 fill-current" />
          </button>
          <button className="text-gray-400 hover:text-white transition-colors" title="Repetir">
            <Repeat className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 w-full max-w-lg">
          <span className="text-[10px] text-gray-400 w-8 text-right tabular-nums">{formatTime(currentTime)}</span>
          <div className="flex-1 group relative h-4 flex items-center cursor-pointer">
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 group-hover:h-1.5 bg-[#4d4d4d] rounded-full transition-all duration-100">
              <div
                className="h-full bg-[#b3b3b3] group-hover:bg-amber-400 rounded-full transition-colors duration-100"
                style={{ width: `${progress * 100}%` }}
              />
              <div
                className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
                style={{ left: `${progress * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={e => seek(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <span className="text-[10px] text-gray-400 w-8 tabular-nums">{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right — volume */}
      <div className="w-[30%] flex items-center justify-end gap-2">
        <button
          onClick={() => setVolume(volume > 0 ? 0 : 0.8)}
          className="text-gray-400 hover:text-white transition-colors"
        >
          {volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        <div className="group relative h-4 flex items-center w-24 cursor-pointer">
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1 group-hover:h-1.5 bg-[#4d4d4d] rounded-full transition-all duration-100">
            <div
              className="h-full bg-[#b3b3b3] group-hover:bg-amber-400 rounded-full transition-colors duration-100"
              style={{ width: `${volume * 100}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity -translate-x-1/2"
              style={{ left: `${volume * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={volume}
            onChange={e => setVolume(Number(e.target.value))}
            className="absolute inset-0 w-full opacity-0 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
}
