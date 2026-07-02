import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { Home, Dumbbell, Bot, History, User } from 'lucide-react';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { ToastContainer } from '@/components/ui/Toast';
import { useAppStore } from '@/store/appStore';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/treinos': 'Meus Treinos',
  '/treino-ativo': 'Treino em Andamento',
  '/exercicios': 'Exercícios',
  '/ia': 'Treinador IA',
  '/historico': 'Histórico',
  '/calendario': 'Calendário',
  '/corpo': 'Evolução Corporal',
  '/nutricao': 'Nutrição',
  '/desafios': 'Desafios',
  '/crista': 'Área Cristã',
  '/comunidade': 'Comunidade',
  '/configuracoes': 'Configurações',
  '/admin': 'Painel Admin',
};

const bottomNavItems = [
  { label: 'Home', icon: Home, path: '/' },
  { label: 'Treinos', icon: Dumbbell, path: '/treinos' },
  { label: 'IA', icon: Bot, path: '/ia' },
  { label: 'Histórico', icon: History, path: '/historico' },
  { label: 'Perfil', icon: User, path: '/perfil' },
];

const Layout: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useAppStore();
  const location = useLocation();
  const pageTitle = PAGE_TITLES[location.pathname] ?? 'Treino Cristão AI';

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar title={pageTitle} />

        <main className="flex-1 overflow-y-auto p-4 lg:p-6 pb-20 lg:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Bottom nav — mobile only */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around border-t border-border bg-background px-2 py-2 lg:hidden">
        {bottomNavItems.map(({ label, icon: Icon, path }) => (
          <Link
            key={path}
            to={path}
            className="flex flex-col items-center gap-0.5 px-3 py-1 text-gray-500 hover:text-teal-700 transition-colors"
          >
            <Icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      <ToastContainer />
    </div>
  );
};

export default Layout;
