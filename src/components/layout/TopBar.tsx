import React, { useState, useRef, useEffect } from 'react';
import { Menu, Bell, Search, Sun, Moon, Dumbbell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { Avatar } from '@/components/ui/Avatar';
import { cn } from '@/lib/utils';

interface TopBarProps {
  title: string;
}

const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, signOut } = useAuthStore();
  const { toggleSidebar, theme, toggleTheme, activeWorkoutLog } = useAppStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
  };

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-white border-b border-gray-200 flex items-center px-4 gap-3">
      {/* Hamburger — mobile only */}
      <button
        onClick={toggleSidebar}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
        aria-label="Abrir menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-gray-900 truncate">{title}</h1>
      </div>

      {/* Active workout indicator */}
      {activeWorkoutLog && (
        <Link
          to="/treino-ativo"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 hover:bg-green-100 transition-colors text-green-700 text-sm font-medium"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
          </span>
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Treino em andamento</span>
        </Link>
      )}

      {/* Right side actions */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Buscar"
        >
          <Search className="w-5 h-5 text-gray-600" />
        </button>

        {/* Notification bell */}
        <button
          className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white" />
        </button>

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Alternar tema"
        >
          {theme === 'dark' ? (
            <Sun className="w-5 h-5 text-gray-600" />
          ) : (
            <Moon className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Avatar with dropdown */}
        <div className="relative ml-1" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Menu do usuário"
            aria-expanded={dropdownOpen}
          >
            <Avatar
              name={user?.user_metadata?.full_name ?? user?.email ?? 'U'}
              size="sm"
            />
          </button>

          {dropdownOpen && (
            <div
              className={cn(
                'absolute right-0 mt-2 min-w-48 bg-white rounded-2xl shadow-elevated border border-gray-100 py-1 z-50',
              )}
              role="menu"
            >
              {user && (
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {user.user_metadata?.full_name ?? user.email}
                  </p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
              )}

              <Link
                to="/perfil"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                Perfil
              </Link>

              <Link
                to="/configuracoes"
                onClick={() => setDropdownOpen(false)}
                className="flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                role="menuitem"
              >
                Configurações
              </Link>

              <div className="border-t border-gray-100 mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full text-left flex items-center px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  role="menuitem"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default TopBar;
