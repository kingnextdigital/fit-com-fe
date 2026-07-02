import React, { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Dumbbell,
  BookOpen,
  Bot,
  History,
  Calendar,
  Activity,
  Apple,
  Trophy,
  Heart,
  Users,
  Shield,
  Settings,
  LogOut,
  X,
  Cross,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { useAppStore } from '@/store/appStore';
import { LevelBadge, StreakBadge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { ProgressRing } from '@/components/ui/Progress';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NavItemDef {
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: string;
  adminOnly?: boolean;
}

// ─── Navigation items ─────────────────────────────────────────────────────────

const NAV_ITEMS: NavItemDef[] = [
  { label: 'Dashboard',     icon: LayoutDashboard, path: '/' },
  { label: 'Meus Treinos',  icon: Dumbbell,        path: '/treinos' },
  { label: 'Exercícios',    icon: BookOpen,         path: '/exercicios' },
  { label: 'Treinador IA',  icon: Bot,              path: '/ia',         badge: 'IA' },
  { label: 'Histórico',     icon: History,          path: '/historico' },
  { label: 'Calendário',    icon: Calendar,         path: '/calendario' },
  { label: 'Corpo',         icon: Activity,         path: '/corpo' },
  { label: 'Nutrição',      icon: Apple,            path: '/nutricao' },
  { label: 'Desafios',      icon: Trophy,           path: '/desafios' },
  { label: 'Área Cristã',   icon: Heart,            path: '/crista' },
  { label: 'Comunidade',    icon: Users,            path: '/comunidade' },
];

const BOTTOM_NAV_ITEMS: NavItemDef[] = [
  { label: 'Admin',          icon: Shield,   path: '/admin', adminOnly: true },
  { label: 'Configurações',  icon: Settings, path: '/configuracoes' },
];

// ─── APP_VERSION ──────────────────────────────────────────────────────────────

const APP_VERSION = '1.0.0';

// ─── XP helpers ───────────────────────────────────────────────────────────────

function xpForLevel(level: number): number {
  return level * 100;
}

function xpProgress(xp: number, level: number): number {
  const floor = xpForLevel(level - 1);
  const ceil  = xpForLevel(level);
  const range = ceil - floor;
  if (range <= 0) return 100;
  return Math.min(100, Math.max(0, ((xp - floor) / range) * 100));
}

// ─── NavLink ──────────────────────────────────────────────────────────────────

interface NavLinkProps {
  item: NavItemDef;
  active: boolean;
  onClick?: () => void;
}

function NavLink({ item, active, onClick }: NavLinkProps) {
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      className={cn(
        'group relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 select-none outline-none focus-visible:ring-2 focus-visible:ring-teal-500/60',
        active
          ? 'bg-teal-50 text-teal-700'
          : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800'
      )}
    >
      {/* Active indicator bar */}
      {active && (
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-teal-600" />
      )}

      <Icon
        size={18}
        className={cn(
          'flex-shrink-0 transition-colors',
          active ? 'text-teal-600' : 'text-gray-400 group-hover:text-gray-600'
        )}
      />

      <span className="flex-1 truncate">{item.label}</span>

      {/* AI badge */}
      {item.badge && (
        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-bold tracking-wide bg-yellow-400 text-yellow-900 leading-none">
          {item.badge}
        </span>
      )}

      {/* Subtle cross icon for Área Cristã */}
      {item.path === '/crista' && !item.badge && (
        <Cross size={11} className="flex-shrink-0 text-teal-400 opacity-70" />
      )}
    </Link>
  );
}

// ─── Logo ─────────────────────────────────────────────────────────────────────

function SidebarLogo() {
  return (
    <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-100">
      {/* Cross-shaped teal icon */}
      <div className="relative flex-shrink-0 w-9 h-9 flex items-center justify-center">
        <div className="absolute w-4 h-full rounded-full bg-teal-600" />
        <div className="absolute h-4 w-full rounded-full bg-teal-600" />
        <div className="absolute w-2.5 h-full rounded-full bg-teal-400 opacity-70" />
        <div className="absolute h-2.5 w-full rounded-full bg-teal-400 opacity-70" />
      </div>

      {/* Text + AI pill */}
      <div className="flex items-baseline gap-2 min-w-0">
        <span className="text-base font-bold text-gray-900 leading-none tracking-tight">
          Treino Cristão
        </span>
        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold tracking-widest bg-yellow-400 text-yellow-900 leading-none flex-shrink-0">
          AI
        </span>
      </div>
    </div>
  );
}

// ─── User section ─────────────────────────────────────────────────────────────

interface UserSectionProps {
  name: string;
  avatarUrl?: string;
  level: number;
  xp: number;
  streak: number;
}

function UserSection({ name, avatarUrl, level, xp, streak }: UserSectionProps) {
  const progress = xpProgress(xp, level);

  return (
    <div className="px-4 py-4 border-t border-gray-100 bg-gray-50/60">
      <div className="flex items-center gap-3 mb-3">
        {/* Avatar with XP ring */}
        <div className="relative flex-shrink-0">
          <ProgressRing
            value={progress}
            size={48}
            strokeWidth={3}
            color="teal"
            animated
          />
          <div className="absolute inset-[4px] rounded-full overflow-hidden">
            <Avatar src={avatarUrl} name={name} size="sm" className="w-full h-full" />
          </div>
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-gray-900 truncate leading-tight">
            {name}
          </p>
          <p className="text-xs text-gray-400 leading-tight mt-0.5">Membro ativo</p>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap gap-1.5">
        <LevelBadge level={level} xp={xp} />
        {streak > 0 && <StreakBadge streak={streak} />}
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const location = useLocation();
  const { profile, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close on outside click (mobile only)
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node) &&
        window.innerWidth < 1024
      ) {
        setSidebarOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, setSidebarOpen]);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (sidebarOpen && window.innerWidth < 1024) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [sidebarOpen]);

  const isAdmin = (profile as (typeof profile & { role?: string }) | null)?.role === 'admin';

  const visibleBottomItems = BOTTOM_NAV_ITEMS.filter(
    (item) => !item.adminOnly || isAdmin
  );

  const handleNavClick = () => {
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden',
          sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        )}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed top-0 left-0 z-40 h-full flex flex-col bg-white border-r border-gray-200 shadow-xl',
          'transition-transform duration-300 ease-in-out',
          'w-[260px]',
          // Desktop: always visible (transform handled by layout padding)
          'lg:translate-x-0 lg:shadow-none',
          // Mobile: slide in/out
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
        aria-label="Navegação principal"
      >
        {/* Close button — mobile only */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors lg:hidden"
          aria-label="Fechar menu"
        >
          <X size={18} />
        </button>

        {/* Logo */}
        <SidebarLogo />

        {/* Nav scroll area */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5 scrollbar-thin scrollbar-thumb-gray-200">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              active={
                item.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(item.path)
              }
              onClick={handleNavClick}
            />
          ))}

          {/* Separator */}
          <div className="my-3 border-t border-gray-100" />

          {visibleBottomItems.map((item) => (
            <NavLink
              key={item.path}
              item={item}
              active={location.pathname.startsWith(item.path)}
              onClick={handleNavClick}
            />
          ))}
        </nav>

        {/* User section */}
        {profile && (
          <UserSection
            name={profile.name}
            avatarUrl={profile.avatar_url}
            level={profile.level ?? 1}
            xp={profile.xp ?? 0}
            streak={profile.streak ?? 0}
          />
        )}

        {/* Footer: logout + version */}
        <div className="px-3 py-3 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={16} />
            Sair
          </button>
          <span className="text-[11px] text-gray-300 font-mono select-none pr-1">
            v{APP_VERSION}
          </span>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
