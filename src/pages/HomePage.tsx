import { useNavigate } from 'react-router-dom';
import { Play, Heart } from 'lucide-react';
import { playlists } from '@/data/playlists';
import { usePlayerStore, formatTime } from '@/store/playerStore';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function PlaylistCard({ pl }: { pl: typeof playlists[0] }) {
  const navigate = useNavigate();
  const { playTrack } = usePlayerStore();

  return (
    <div
      onClick={() => navigate(`/playlists/${pl.id}`)}
      className="text-left group bg-[#181818] hover:bg-[#282828] rounded-lg p-4 transition-colors duration-200 cursor-pointer"
    >
      <div className="relative mb-4">
        <div
          className="w-full aspect-square rounded-md flex items-center justify-center text-5xl shadow-xl"
          style={{ background: pl.gradient }}
        >
          {pl.emoji}
        </div>
        <button
          onClick={e => {
            e.stopPropagation();
            if (pl.tracks.length > 0) playTrack(pl.tracks[0]);
          }}
          className="absolute bottom-2 right-2 w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 hover:bg-amber-300"
        >
          <Play className="w-5 h-5 text-black fill-black ml-0.5" />
        </button>
      </div>
      <p className="text-sm font-bold text-white truncate">{pl.name}</p>
      <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{pl.description}</p>
    </div>
  );
}

function ShortcutCard({ pl }: { pl: typeof playlists[0] }) {
  const navigate = useNavigate();
  const { currentTrack } = usePlayerStore();
  const isActive = currentTrack?.playlistId === pl.id;

  return (
    <button
      onClick={() => navigate(`/playlists/${pl.id}`)}
      className={`flex items-center gap-3 rounded-md overflow-hidden transition-colors duration-150 group ${
        isActive ? 'bg-[#333]' : 'bg-[#ffffff12] hover:bg-[#ffffff1f]'
      }`}
    >
      <div
        className="w-14 h-14 shrink-0 flex items-center justify-center text-2xl"
        style={{ background: pl.gradient }}
      >
        {pl.emoji}
      </div>
      <span className="text-sm font-bold text-white pr-3 truncate">{pl.name}</span>
    </button>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { playTrack, currentTrack, recentlyPlayed, favorites, toggleFavorite } = usePlayerStore();

  return (
    <div className="min-h-full">
      {/* Gradient header */}
      <div
        className="px-8 pt-16 pb-8"
        style={{ background: 'linear-gradient(to bottom, #4a2800 0%, #121212 100%)' }}
      >
        <h1 className="text-3xl font-extrabold text-white mb-1">{getGreeting()}</h1>
        <p className="text-gray-400 text-sm">Escolha uma playlist e treina com fé.</p>
      </div>

      <div className="px-8 pb-8 space-y-8" style={{ background: '#121212' }}>
        {/* Donation banner */}
        <div className="border border-amber-700/30 bg-amber-950/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-white">Ajude a manter o projeto no ar 🙏</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Se esse app te ajudou, contribua com qualquer valor. Sua colaboração mantém a música acessível a todos.
            </p>
          </div>
          <button className="shrink-0 flex items-center gap-2 border border-amber-600 text-amber-400 text-xs font-semibold px-4 py-2 rounded-full hover:bg-amber-600/10 transition-colors whitespace-nowrap">
            Pix: 35997230557
          </button>
        </div>

        {/* Shortcuts grid */}
        <div>
          <div className="grid grid-cols-2 gap-2">
            {playlists.map(pl => <ShortcutCard key={pl.id} pl={pl} />)}
          </div>
        </div>

        {/* Recently played */}
        {recentlyPlayed.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white">Tocadas recentemente</h2>
              <button
                onClick={() => navigate('/playlists')}
                className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
              >
                Ver tudo
              </button>
            </div>
            <div className="space-y-1">
              {recentlyPlayed.map((track) => {
                const pl = playlists.find(p => p.id === track.playlistId);
                const isFav = favorites.includes(track.id);
                const isActive = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer group transition-colors ${
                      isActive ? 'bg-white/10' : 'hover:bg-white/10'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded shrink-0 flex items-center justify-center text-lg"
                      style={{ background: pl?.gradient ?? '#333' }}
                    >
                      {pl?.emoji ?? '🎵'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${isActive ? 'text-amber-400' : 'text-white'}`}>
                        {track.title}
                      </p>
                      <p className="text-xs text-gray-400 truncate">{track.playlistName}</p>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); toggleFavorite(track.id); }}
                      className={`transition-opacity ${isFav ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    >
                      <Heart className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : 'text-gray-400 hover:text-white'}`} />
                    </button>
                    <span className="text-xs text-gray-400 w-9 text-right tabular-nums">{formatTime(track.duration)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Playlists grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-white">Playlists para você</h2>
            <button
              onClick={() => navigate('/playlists')}
              className="text-xs font-bold text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
            >
              Ver tudo
            </button>
          </div>
          <div className="grid grid-cols-5 gap-5">
            {playlists.map(pl => <PlaylistCard key={pl.id} pl={pl} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
