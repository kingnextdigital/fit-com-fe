import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import Sidebar from '@/components/Sidebar';
import Player from '@/components/Player';
import HomePage from '@/pages/HomePage';
import PlaylistsPage from '@/pages/PlaylistsPage';
import PlaylistDetailPage from '@/pages/PlaylistDetailPage';
import FavoritosPage from '@/pages/FavoritosPage';

function AppLayout() {
  return (
    <div className="flex h-screen bg-[#0a0a0a] overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-[90px]">
        <Outlet />
      </main>
      <Player />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="playlists" element={<PlaylistsPage />} />
          <Route path="playlists/:id" element={<PlaylistDetailPage />} />
          <Route path="favoritos" element={<FavoritosPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
