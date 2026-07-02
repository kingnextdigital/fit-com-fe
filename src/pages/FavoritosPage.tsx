import { Heart, Music } from 'lucide-react';
import { playlists } from '@/data/playlists';
import { usePlayerStore, formatTime } from '@/store/playerStore';

export default function FavoritosPage() {
  const { favorites, currentTrack, togglePlay, isPlaying, playTrack, toggleFavorite } = usePlayerStore();

  const allTracks = playlists.flatMap(p => p.tracks);
  const favTracks = allTracks.filter(t => favorites.includes(t.id));

  if (favTracks.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-[#1c1c1c] flex items-center justify-center mb-4">
          <Heart className="w-7 h-7 text-gray-600" />
        </div>
        <h2 className="text-lg font-semibold text-white mb-2">Nenhum favorito ainda</h2>
        <p className="text-sm text-gray-500 max-w-xs leading-relaxed">
          Clique no ícone de coração em qualquer faixa para salvá-la aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-800 to-amber-500 flex items-center justify-center">
          <Heart className="w-6 h-6 fill-white text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Favoritos</h1>
          <p className="text-sm text-gray-400">{favTracks.length} {favTracks.length === 1 ? 'faixa' : 'faixas'}</p>
        </div>
      </div>

      <div className="space-y-1">
        {favTracks.map((track, i) => {
          const pl = playlists.find(p => p.id === track.playlistId);
          const isActive = currentTrack?.id === track.id;

          return (
            <div
              key={track.id}
              onClick={() => {
                if (isActive) togglePlay();
                else playTrack(track);
              }}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer group transition-colors ${
                isActive ? 'bg-amber-600/15' : 'hover:bg-white/5'
              }`}
            >
              <span className="w-5 text-xs text-gray-500 text-right shrink-0">{i + 1}</span>

              <div
                className="w-9 h-9 rounded shrink-0 flex items-center justify-center"
                style={{ background: pl?.gradient ?? '#1a1a1a' }}
              >
                <Music className="w-4 h-4 text-white/70" />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium truncate ${isActive ? 'text-amber-400' : 'text-white'}`}>
                  {track.title}
                </p>
                <p className="text-xs text-gray-500 truncate">{track.playlistName}</p>
              </div>

              <button
                onClick={e => { e.stopPropagation(); toggleFavorite(track.id); }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remover dos favoritos"
              >
                <Heart className="w-4 h-4 fill-amber-400 text-amber-400" />
              </button>

              <span className="text-xs text-gray-500 w-9 text-right shrink-0">{formatTime(track.duration)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
