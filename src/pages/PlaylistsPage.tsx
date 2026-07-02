import { useNavigate } from 'react-router-dom';
import { playlists } from '@/data/playlists';

export default function PlaylistsPage() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Playlists</h1>
      <div className="grid grid-cols-4 gap-5">
        {playlists.map(pl => (
          <button
            key={pl.id}
            onClick={() => navigate(`/playlists/${pl.id}`)}
            className="text-left group"
          >
            <div
              className="w-full aspect-square rounded-xl flex items-center justify-center mb-3 group-hover:opacity-90 transition-opacity"
              style={{ background: pl.gradient }}
            >
              <span className="text-5xl">{pl.emoji}</span>
            </div>
            <p className="text-sm font-semibold text-white">{pl.name}</p>
            <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{pl.description}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
