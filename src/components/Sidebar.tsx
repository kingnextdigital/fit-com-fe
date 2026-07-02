import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Library } from 'lucide-react';
import { playlists } from '@/data/playlists';
import { usePlayerStore } from '@/store/playerStore';

export default function Sidebar() {
  const navigate = useNavigate();
  const { currentTrack, isPlaying } = usePlayerStore();

  return (
    <aside className="w-60 shrink-0 flex flex-col gap-2 p-2 bg-black">
      {/* Logo */}
      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-black font-black text-base leading-none">✝</span>
          </div>
          <div className="leading-none">
            <p className="text-[9px] font-bold tracking-[0.2em] text-amber-500/50 uppercase">Fit com</p>
            <p className="text-2xl font-black text-white">FÉ</p>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-[#121212] rounded-lg px-3 py-3 space-y-0.5">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex items-center gap-4 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
              isActive ? 'text-white' : 'text-gray-400 hover:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Home className={`w-6 h-6 ${isActive ? 'fill-white' : ''}`} />
              Início
            </>
          )}
        </NavLink>
      </div>

      {/* Library */}
      <div className="flex-1 bg-[#121212] rounded-lg flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <button className="flex items-center gap-3 text-gray-400 hover:text-white font-semibold text-sm transition-colors">
            <Library className="w-6 h-6" />
            Sua Biblioteca
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-0.5">
          {playlists.map(pl => {
            const isActive = currentTrack?.playlistId === pl.id;
            return (
              <button
                key={pl.id}
                onClick={() => navigate(`/playlists/${pl.id}`)}
                className="w-full flex items-center gap-3 px-2 py-2 rounded-md hover:bg-white/10 transition-colors group"
              >
                <div
                  className="w-11 h-11 rounded shrink-0 flex items-center justify-center text-xl"
                  style={{ background: pl.gradient }}
                >
                  {pl.emoji}
                </div>
                <div className="text-left min-w-0">
                  <p className={`text-sm font-medium truncate ${isActive ? 'text-amber-400' : 'text-white'}`}>
                    {pl.name}
                  </p>
                  <p className="text-xs text-gray-400 truncate">Playlist</p>
                </div>
                {isActive && isPlaying && (
                  <div className="ml-auto shrink-0 flex gap-0.5 items-end h-3">
                    <span className="w-0.5 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-0.5 h-3 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-0.5 h-1.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Bible verse */}
        <div className="px-4 py-4 border-t border-white/5">
          <p className="text-[11px] text-gray-500 italic leading-relaxed">
            "Tudo posso naquele que me fortalece."
          </p>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Filipenses 4:13</p>
        </div>
      </div>
    </aside>
  );
}
