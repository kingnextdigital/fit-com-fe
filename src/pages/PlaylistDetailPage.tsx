import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Play, Pause, Heart, Clock } from 'lucide-react';
import { getPlaylist } from '@/data/playlists';
import { usePlayerStore, formatTime } from '@/store/playerStore';

export default function PlaylistDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { playTrack, togglePlay, currentTrack, isPlaying, favorites, toggleFavorite } = usePlayerStore();

  const playlist = getPlaylist(id ?? '');

  if (!playlist) {
    return (
      <div className="p-8 text-center text-gray-400">
        <p>Playlist não encontrada.</p>
        <button onClick={() => navigate('/playlists')} className="mt-4 text-amber-500 hover:underline text-sm">
          Voltar
        </button>
      </div>
    );
  }

  const isPlaylistPlaying = currentTrack?.playlistId === playlist.id && isPlaying;
  const totalDuration = playlist.tracks.reduce((acc, t) => acc + t.duration, 0);

  const handleMainPlay = () => {
    if (currentTrack?.playlistId === playlist.id) {
      togglePlay();
    } else {
      playTrack(playlist.tracks[0]);
    }
  };

  const handleTrackClick = (track: typeof playlist.tracks[0]) => {
    if (currentTrack?.id === track.id) {
      togglePlay();
    } else {
      playTrack(track);
    }
  };

  return (
    <div className="min-h-full" style={{ background: '#121212' }}>
      {/* Gradient header */}
      <div
        className="px-8 pt-8 pb-6"
        style={{ background: `linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, #121212 100%), ${playlist.gradient}` }}
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-gray-300 hover:text-white text-sm mb-6 transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Voltar
        </button>

        <div className="flex items-end gap-6">
          <div
            className="w-52 h-52 rounded-md shadow-2xl shrink-0 flex items-center justify-center"
            style={{ background: playlist.gradient }}
          >
            <span className="text-7xl">{playlist.emoji}</span>
          </div>
          <div className="pb-2">
            <p className="text-xs font-bold uppercase tracking-widest text-white/70 mb-2">Playlist</p>
            <h1 className="text-5xl font-black text-white mb-3 leading-tight">{playlist.name}</h1>
            <p className="text-sm text-gray-300 mb-3">{playlist.description}</p>
            <p className="text-sm text-gray-400">
              {playlist.tracks.length} faixas · {Math.floor(totalDuration / 60)} min
            </p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="px-8 py-5 flex items-center gap-5">
        <button
          onClick={handleMainPlay}
          className="w-14 h-14 bg-amber-400 hover:bg-amber-300 rounded-full flex items-center justify-center shadow-lg transition-colors hover:scale-105 active:scale-95"
        >
          {isPlaylistPlaying
            ? <Pause className="w-6 h-6 text-black fill-black" />
            : <Play className="w-6 h-6 text-black fill-black ml-0.5" />
          }
        </button>
      </div>

      {/* Track list */}
      <div className="px-8 pb-8">
        {/* Header */}
        <div className="grid grid-cols-[24px_1fr_auto] gap-4 px-4 pb-2 border-b border-white/10 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <span className="text-center">#</span>
          <span>Título</span>
          <Clock className="w-4 h-4" />
        </div>

        <div className="mt-2 space-y-0.5">
          {playlist.tracks.map((track, i) => {
            const isActive = currentTrack?.id === track.id;
            const isFav = favorites.includes(track.id);

            return (
              <div
                key={track.id}
                onDoubleClick={() => handleTrackClick(track)}
                className={`grid grid-cols-[24px_1fr_auto] gap-4 items-center px-4 py-2 rounded-md cursor-pointer group transition-colors ${
                  isActive ? 'bg-white/10' : 'hover:bg-white/10'
                }`}
              >
                {/* Index / play indicator */}
                <div className="flex items-center justify-center">
                  {isActive ? (
                    <button onClick={() => togglePlay()} className="flex items-center justify-center">
                      {isPlaying
                        ? <Pause className="w-4 h-4 text-amber-400 fill-amber-400" />
                        : <Play className="w-4 h-4 text-amber-400 fill-amber-400 ml-0.5" />
                      }
                    </button>
                  ) : (
                    <>
                      <span className="text-sm text-gray-400 group-hover:hidden">{i + 1}</span>
                      <button onClick={() => handleTrackClick(track)} className="hidden group-hover:flex items-center justify-center">
                        <Play className="w-4 h-4 text-white fill-white ml-0.5" />
                      </button>
                    </>
                  )}
                </div>

                {/* Title */}
                <div className="min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-amber-400' : 'text-white'}`}>
                    {track.title}
                  </p>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{track.playlistName}</p>
                </div>

                {/* Duration + favorite */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleFavorite(track.id)}
                    className={`transition-opacity ${isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-gray-400 hover:text-white'}`} />
                  </button>
                  <span className="text-sm text-gray-400 tabular-nums w-9 text-right">{formatTime(track.duration)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
