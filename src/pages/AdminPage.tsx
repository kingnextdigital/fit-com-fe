import React, { useState } from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Search,
  Download,
  Eye,
  ToggleLeft,
  ToggleRight,
  Edit2,
  Trash2,
  Plus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  CheckCircle,
  AlertCircle,
  XCircle,
  Server,
  Database,
  HardDrive,
  ChevronLeft,
  ChevronRight,
  Shield,
  Dumbbell,
  BookOpen,
  Heart,
  Activity,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardContent, StatCard } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

const newUsersData = [
  { day: '01/06', users: 18 },
  { day: '03/06', users: 24 },
  { day: '05/06', users: 31 },
  { day: '07/06', users: 22 },
  { day: '09/06', users: 41 },
  { day: '11/06', users: 37 },
  { day: '13/06', users: 29 },
  { day: '15/06', users: 53 },
  { day: '17/06', users: 48 },
  { day: '19/06', users: 62 },
  { day: '21/06', users: 44 },
  { day: '23/06', users: 57 },
  { day: '25/06', users: 71 },
  { day: '27/06', users: 66 },
  { day: '29/06', users: 80 },
];

const revenueByPlanData = [
  { plan: 'Jan', Mensal: 3200, Anual: 4100, Trial: 820 },
  { plan: 'Fev', Mensal: 3500, Anual: 4400, Trial: 760 },
  { plan: 'Mar', Mensal: 3800, Anual: 4900, Trial: 900 },
  { plan: 'Abr', Mensal: 4100, Anual: 5200, Trial: 840 },
  { plan: 'Mai', Mensal: 4400, Anual: 5600, Trial: 980 },
  { plan: 'Jun', Mensal: 4800, Anual: 6100, Trial: 1020 },
];

const planDistributionData = [
  { name: 'Mensal', value: 58, color: '#14b8a6' },
  { name: 'Anual', value: 32, color: '#f59e0b' },
  { name: 'Trial', value: 10, color: '#94a3b8' },
];

const mockUsers = [
  {
    id: '1',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@gmail.com',
    plan: 'Anual',
    status: 'ativo',
    createdAt: '12/01/2025',
    avatar: undefined,
  },
  {
    id: '2',
    name: 'Ana Paula Costa',
    email: 'anapaula@hotmail.com',
    plan: 'Mensal',
    status: 'ativo',
    createdAt: '03/02/2025',
    avatar: undefined,
  },
  {
    id: '3',
    name: 'Rodrigo Mendes',
    email: 'rodrigo.m@outlook.com',
    plan: 'Trial',
    status: 'trial',
    createdAt: '18/06/2025',
    avatar: undefined,
  },
  {
    id: '4',
    name: 'Carla Souza',
    email: 'carlinha.souza@gmail.com',
    plan: 'Mensal',
    status: 'inativo',
    createdAt: '22/03/2025',
    avatar: undefined,
  },
  {
    id: '5',
    name: 'Thiago Oliveira',
    email: 'thiagooliv@yahoo.com',
    plan: 'Anual',
    status: 'ativo',
    createdAt: '07/04/2025',
    avatar: undefined,
  },
];

const mockPlans = [
  { id: '1', name: 'Trial', price: 'R$ 0,00', duration: '7 dias', subscribers: 123, features: ['Acesso básico', '3 treinos', 'IA limitada'] },
  { id: '2', name: 'Mensal', price: 'R$ 19,90', duration: '30 dias', subscribers: 287, features: ['Acesso completo', 'Treinos ilimitados', 'IA completa', 'Devocionais'] },
  { id: '3', name: 'Anual', price: 'R$ 149,90', duration: '365 dias', subscribers: 169, features: ['Tudo do Mensal', 'Prioridade suporte', 'Exportar histórico', 'Badge exclusivo'] },
];

const mockExercicios = [
  { id: '1', name: 'Supino Reto', category: 'Peito', level: 'Intermediário', active: true },
  { id: '2', name: 'Agachamento Livre', category: 'Pernas', level: 'Avançado', active: true },
  { id: '3', name: 'Remada Curvada', category: 'Costas', level: 'Intermediário', active: true },
  { id: '4', name: 'Rosca Direta', category: 'Bíceps', level: 'Iniciante', active: false },
  { id: '5', name: 'Desenvolvimento Militar', category: 'Ombros', level: 'Intermediário', active: true },
];

const mockVersiculos = [
  { id: '1', reference: 'Filipenses 4:13', text: 'Tudo posso naquele que me fortalece.', theme: 'Força', active: true },
  { id: '2', reference: '1 Coríntios 6:19-20', text: 'O vosso corpo é templo do Espírito Santo.', theme: 'Saúde', active: true },
  { id: '3', reference: 'Josué 1:9', text: 'Sê forte e corajoso! Não tenhas medo.', theme: 'Coragem', active: true },
  { id: '4', reference: 'Isaías 40:31', text: 'Os que esperam no Senhor renovam as suas forças.', theme: 'Renovação', active: true },
  { id: '5', reference: 'Romanos 12:1', text: 'Apresentai os vossos corpos como sacrifício vivo.', theme: 'Dedicação', active: false },
];

const mockDevocionais = [
  { id: '1', title: 'Corpo como Templo', author: 'Admin', date: '20/06/2025', reads: 347, active: true },
  { id: '2', title: 'Perseverança na Fé', author: 'Admin', date: '15/06/2025', reads: 289, active: true },
  { id: '3', title: 'Renovação Diária', author: 'Admin', date: '10/06/2025', reads: 412, active: true },
  { id: '4', title: 'Força em Cristo', author: 'Admin', date: '05/06/2025', reads: 231, active: false },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

type SortDir = 'asc' | 'desc' | null;

interface SortIconProps {
  column: string;
  sortKey: string;
  sortDir: SortDir;
}

function SortIcon({ column, sortKey, sortDir }: SortIconProps) {
  if (sortKey !== column) return <ChevronsUpDown size={12} className="text-gray-300 ml-1" />;
  if (sortDir === 'asc') return <ChevronUp size={12} className="text-teal-500 ml-1" />;
  if (sortDir === 'desc') return <ChevronDown size={12} className="text-teal-500 ml-1" />;
  return <ChevronsUpDown size={12} className="text-gray-300 ml-1" />;
}

function PlanBadge({ plan }: { plan: string }) {
  if (plan === 'Anual') return <Badge variant="gold" size="sm">{plan}</Badge>;
  if (plan === 'Mensal') return <Badge variant="teal" size="sm">{plan}</Badge>;
  return <Badge variant="gray" size="sm">{plan}</Badge>;
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'ativo') return <Badge variant="green" size="sm">Ativo</Badge>;
  if (status === 'trial') return <Badge variant="purple" size="sm">Trial</Badge>;
  return <Badge variant="red" size="sm">Inativo</Badge>;
}

// ---------------------------------------------------------------------------
// Section: Users Table
// ---------------------------------------------------------------------------

function UsersTable() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState('name');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [userStatuses, setUserStatuses] = useState<Record<string, string>>(
    Object.fromEntries(mockUsers.map(u => [u.id, u.status]))
  );

  const totalPages = 4;

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function toggleStatus(id: string) {
    setUserStatuses(prev => ({
      ...prev,
      [id]: prev[id] === 'ativo' ? 'inativo' : 'ativo',
    }));
  }

  const filtered = mockUsers.filter(
    u =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const thClass = "px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide cursor-pointer select-none hover:text-teal-600 transition-colors";

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Usuários"
        subtitle="20 cadastros no total"
        icon={<Users size={18} />}
        action={
          <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
            Novo usuário
          </Button>
        }
      />
      <CardContent className="pb-0">
        <div className="relative mb-4">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por nome ou e-mail..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-300 focus:bg-white transition"
          />
        </div>
      </CardContent>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y border-gray-100">
            <tr>
              <th className={thClass} onClick={() => handleSort('name')}>
                <span className="inline-flex items-center">
                  Usuário <SortIcon column="name" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
              <th className={thClass} onClick={() => handleSort('plan')}>
                <span className="inline-flex items-center">
                  Plano <SortIcon column="plan" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
              <th className={thClass} onClick={() => handleSort('status')}>
                <span className="inline-flex items-center">
                  Status <SortIcon column="status" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
              <th className={thClass} onClick={() => handleSort('createdAt')}>
                <span className="inline-flex items-center">
                  Criado em <SortIcon column="createdAt" sortKey={sortKey} sortDir={sortDir} />
                </span>
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(user => {
              const currentStatus = userStatuses[user.id] ?? user.status;
              return (
                <tr key={user.id} className="hover:bg-gray-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={user.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-800 leading-tight">{user.name}</p>
                        <p className="text-xs text-gray-400 leading-tight">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <PlanBadge plan={user.plan} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={currentStatus} />
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{user.createdAt}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title="Ver perfil"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        title={currentStatus === 'ativo' ? 'Desativar' : 'Ativar'}
                        onClick={() => toggleStatus(user.id)}
                        className={cn(
                          'p-1.5 rounded-lg transition-colors',
                          currentStatus === 'ativo'
                            ? 'text-teal-500 hover:bg-teal-50'
                            : 'text-gray-400 hover:text-teal-600 hover:bg-teal-50'
                        )}
                      >
                        {currentStatus === 'ativo' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Mostrando <span className="font-medium text-gray-600">5</span> de{' '}
          <span className="font-medium text-gray-600">20</span> usuários
        </p>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronLeft size={14} />
          </button>
          {[1, 2, 3, 4].map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                'w-7 h-7 text-xs rounded-lg font-medium transition-colors',
                page === p
                  ? 'bg-teal-500 text-white'
                  : 'text-gray-500 hover:bg-gray-100'
              )}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors disabled:opacity-30 disabled:pointer-events-none"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section: Plans Management
// ---------------------------------------------------------------------------

function PlansManagement() {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Planos de Assinatura"
        subtitle="Gerencie preços e benefícios"
        icon={<Shield size={18} />}
        action={
          <Button variant="secondary" size="sm" icon={<Plus size={14} />}>
            Novo plano
          </Button>
        }
      />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-y border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Plano</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Preço</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Duração</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Assinantes</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Benefícios</th>
              <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {mockPlans.map(plan => (
              <tr key={plan.id} className="hover:bg-gray-50/60 transition-colors">
                <td className="px-4 py-3">
                  <PlanBadge plan={plan.name} />
                </td>
                <td className="px-4 py-3 font-semibold text-gray-800">{plan.price}</td>
                <td className="px-4 py-3 text-gray-500">{plan.duration}</td>
                <td className="px-4 py-3 text-gray-800 font-medium">{plan.subscribers}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {plan.features.map(f => (
                      <span key={f} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="inline-flex items-center gap-1 text-xs text-teal-600 font-medium hover:text-teal-700 transition-colors px-2 py-1 rounded-lg hover:bg-teal-50">
                    <Edit2 size={12} /> Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Section: Content Management
// ---------------------------------------------------------------------------

type ContentTab = 'exercicios' | 'versiculos' | 'devocionais';

function ContentManagement() {
  const [activeTab, setActiveTab] = useState<ContentTab>('exercicios');

  const tabs: { key: ContentTab; label: string; icon: React.ReactNode }[] = [
    { key: 'exercicios', label: 'Exercícios', icon: <Dumbbell size={14} /> },
    { key: 'versiculos', label: 'Versículos', icon: <BookOpen size={14} /> },
    { key: 'devocionais', label: 'Devocionais', icon: <Heart size={14} /> },
  ];

  return (
    <Card className="overflow-hidden">
      <CardHeader
        title="Gestão de Conteúdo"
        subtitle="Exercícios, versículos e devocionais"
        icon={<Activity size={18} />}
      />
      <CardContent>
        <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-xl w-fit mb-5">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150',
                activeTab === tab.key
                  ? 'bg-white text-teal-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'exercicios' && (
          <ContentTable
            columns={['Nome', 'Categoria', 'Nível', 'Status']}
            addLabel="Adicionar exercício"
            rows={mockExercicios.map(e => ({
              id: e.id,
              cells: [
                <span className="font-medium text-gray-800">{e.name}</span>,
                <span className="text-gray-500">{e.category}</span>,
                <span className="text-gray-500">{e.level}</span>,
                e.active
                  ? <Badge variant="green" size="sm">Ativo</Badge>
                  : <Badge variant="gray" size="sm">Inativo</Badge>,
              ],
            }))}
          />
        )}

        {activeTab === 'versiculos' && (
          <ContentTable
            columns={['Referência', 'Trecho', 'Tema', 'Status']}
            addLabel="Adicionar versículo"
            rows={mockVersiculos.map(v => ({
              id: v.id,
              cells: [
                <span className="font-medium text-gray-800">{v.reference}</span>,
                <span className="text-gray-500 max-w-xs truncate block">{v.text}</span>,
                <Badge variant="teal" size="sm">{v.theme}</Badge>,
                v.active
                  ? <Badge variant="green" size="sm">Ativo</Badge>
                  : <Badge variant="gray" size="sm">Inativo</Badge>,
              ],
            }))}
          />
        )}

        {activeTab === 'devocionais' && (
          <ContentTable
            columns={['Título', 'Autor', 'Data', 'Leituras', 'Status']}
            addLabel="Adicionar devocional"
            rows={mockDevocionais.map(d => ({
              id: d.id,
              cells: [
                <span className="font-medium text-gray-800">{d.title}</span>,
                <span className="text-gray-500">{d.author}</span>,
                <span className="text-gray-500">{d.date}</span>,
                <span className="text-gray-700 font-medium">{d.reads}</span>,
                d.active
                  ? <Badge variant="green" size="sm">Ativo</Badge>
                  : <Badge variant="gray" size="sm">Inativo</Badge>,
              ],
            }))}
          />
        )}
      </CardContent>
    </Card>
  );
}

interface ContentTableProps {
  columns: string[];
  addLabel: string;
  rows: { id: string; cells: React.ReactNode[] }[];
}

function ContentTable({ columns, addLabel, rows }: ContentTableProps) {
  return (
    <div>
      <div className="flex justify-end mb-3">
        <Button variant="secondary" size="sm" icon={<Plus size={13} />}>
          {addLabel}
        </Button>
      </div>
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {columns.map(col => (
                <th key={col} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  {col}
                </th>
              ))}
              <th className="px-4 py-2.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50/60 transition-colors">
                {row.cells.map((cell, i) => (
                  <td key={i} className="px-4 py-2.5">{cell}</td>
                ))}
                <td className="px-4 py-2.5">
                  <div className="flex items-center justify-end gap-1">
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-teal-600 hover:bg-teal-50 transition-colors" title="Editar">
                      <Edit2 size={13} />
                    </button>
                    <button className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Excluir">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Section: System Status
// ---------------------------------------------------------------------------

type StatusLevel = 'ok' | 'warn' | 'error';

function StatusDot({ level }: { level: StatusLevel }) {
  return (
    <span
      className={cn(
        'inline-block w-2.5 h-2.5 rounded-full shrink-0',
        level === 'ok' && 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.7)]',
        level === 'warn' && 'bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.7)]',
        level === 'error' && 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.7)]'
      )}
    />
  );
}

function SystemStatus() {
  const storagePercent = 67;

  const services: { label: string; status: StatusLevel; detail: string; icon: React.ReactNode }[] = [
    { label: 'Supabase Database', status: 'ok', detail: 'Operacional · latência 24ms', icon: <Database size={16} /> },
    { label: 'Edge Functions', status: 'ok', detail: 'Todas as funções ativas', icon: <Server size={16} /> },
    { label: 'Auth Service', status: 'ok', detail: 'Sem incidentes', icon: <Shield size={16} /> },
    { label: 'Storage', status: 'warn', detail: `${storagePercent}% utilizado`, icon: <HardDrive size={16} /> },
  ];

  return (
    <Card>
      <CardHeader
        title="Status do Sistema"
        subtitle="Atualizado há 2 minutos"
        icon={<Activity size={18} />}
        iconColor="bg-emerald-500"
      />
      <CardContent>
        <div className="space-y-4">
          {services.map(s => (
            <div key={s.label} className="flex items-center gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 text-gray-500 shrink-0">
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-sm font-medium text-gray-700">{s.label}</span>
                  <StatusDot level={s.status} />
                </div>
                <p className="text-xs text-gray-400">{s.detail}</p>
                {s.label === 'Storage' && (
                  <div className="mt-1.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all',
                        storagePercent > 80 ? 'bg-red-400' : storagePercent > 60 ? 'bg-amber-400' : 'bg-teal-400'
                      )}
                      style={{ width: `${storagePercent}%` }}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Último backup</span>
            <span className="font-medium text-gray-700">25/06/2025 às 03:00</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">Uptime (30d)</span>
            <span className="font-medium text-emerald-600">99,97%</span>
          </div>
          <div className="flex items-center justify-between text-sm mt-2">
            <span className="text-gray-500">Versão deploy</span>
            <span className="font-mono text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-lg">v2.4.1</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Tooltip customizado para charts
// ---------------------------------------------------------------------------

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name}: {typeof p.value === 'number' && p.name !== 'users' ? `R$ ${p.value.toLocaleString('pt-BR')}` : p.value}
        </p>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main AdminPage
// ---------------------------------------------------------------------------

export default function AdminPage() {
  const now = new Date();
  const lastUpdated = now.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* ------------------------------------------------------------------ */}
        {/* HEADER                                                              */}
        {/* ------------------------------------------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 leading-tight">Painel Admin</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Atualizado em {lastUpdated}
            </p>
          </div>
          <Button
            variant="primary"
            icon={<Download size={15} />}
            iconPosition="left"
          >
            Exportar Relatório
          </Button>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* KEY METRICS                                                          */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Usuários totais"
            value="1.234"
            change={12}
            icon={<Users size={18} />}
            color="teal"
          />
          <StatCard
            label="Assinantes ativos"
            value="456"
            change={8}
            icon={<TrendingUp size={18} />}
            color="green"
          />
          <StatCard
            label="MRR"
            value="R$ 9.120"
            change={15}
            icon={<DollarSign size={18} />}
            color="gold"
          />
          <StatCard
            label="Churn"
            value="2,3%"
            change={-0.5}
            icon={<TrendingDown size={18} />}
            color="purple"
          />
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* CHARTS ROW                                                           */}
        {/* ------------------------------------------------------------------ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Area Chart: Novos usuários */}
          <Card>
            <CardHeader
              title="Novos usuários (30 dias)"
              subtitle="Total acumulado do mês"
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={newUsersData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="usersGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="users"
                    name="Novos usuários"
                    stroke="#14b8a6"
                    strokeWidth={2}
                    fill="url(#usersGrad)"
                    dot={false}
                    activeDot={{ r: 4, fill: '#14b8a6', strokeWidth: 0 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Bar Chart: Receita por plano */}
          <Card>
            <CardHeader
              title="Receita por plano (mensal)"
              subtitle="Últimos 6 meses"
              action={
                <div className="flex items-center gap-3 text-[11px] text-gray-400">
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-500" />Mensal</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Anual</span>
                  <span className="inline-flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-300" />Trial</span>
                </div>
              }
            />
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={revenueByPlanData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }} barSize={10} barCategoryGap="30%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="plan"
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="Mensal" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Anual" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Trial" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* ------------------------------------------------------------------ */}
        {/* USERS TABLE                                                          */}
        {/* ------------------------------------------------------------------ */}
        <UsersTable />

        {/* ------------------------------------------------------------------ */}
        {/* PLANS MANAGEMENT                                                     */}
        {/* ------------------------------------------------------------------ */}
        <PlansManagement />

        {/* ------------------------------------------------------------------ */}
        {/* CONTENT MANAGEMENT                                                   */}
        {/* ------------------------------------------------------------------ */}
        <ContentManagement />

        {/* ------------------------------------------------------------------ */}
        {/* SYSTEM STATUS                                                        */}
        {/* ------------------------------------------------------------------ */}
        <SystemStatus />
      </div>
    </div>
  );
}
