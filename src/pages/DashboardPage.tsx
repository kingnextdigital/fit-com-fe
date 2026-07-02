import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Dumbbell,
  Flame,
  Activity,
  Apple,
  Play,
  Scale,
  Droplets,
  BookOpen,
  Ruler,
  ChevronRight,
  Trophy,
  Star,
  Heart,
  Zap,
  Users,
  Moon,
  ThumbsUp,
  MessageCircle,
  Cross,
} from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import { verses } from '@/data/verses';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Bom dia, ${name}! 💪`;
  if (hour < 18) return `Boa tarde, ${name}! 💪`;
  return `Boa noite, ${name}! 💪`;
}

function getLevelLabel(level: number): string {
  if (level < 5) return 'Iniciante';
  if (level < 10) return 'Intermediário';
  if (level < 20) return 'Avançado';
  return 'Elite';
}

function getLevelColor(level: number): string {
  if (level < 5) return 'from-gray-400 to-gray-500';
  if (level < 10) return 'from-teal-500 to-teal-600';
  if (level < 20) return 'from-violet-500 to-violet-600';
  return 'from-amber-400 to-amber-500';
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_WEEKLY_WORKOUTS = 3;
const MOCK_WEEKLY_GOAL = 5;
const MOCK_STREAK = 12;
const MOCK_WEEKLY_VOLUME = '12.450 kg';
const MOCK_CALORIES_TODAY = '2.340 kcal';

const MOCK_PROGRESS_DATA = Array.from({ length: 7 }, (_, i) => {
  const date = subDays(new Date(), 6 - i);
  const volumes = [8200, 9100, 0, 10500, 11200, 9800, 12450];
  return {
    day: format(date, 'EEE', { locale: ptBR }),
    volume: volumes[i],
  };
});

const MOCK_TODAY_WORKOUT = {
  name: 'Treino B — Costas & Bíceps',
  exercises: 7,
  estimatedTime: 55,
  isRestDay: false,
};

const MOCK_ACHIEVEMENTS = [
  { id: '1', icon: '🔥', title: '7 Dias Seguidos', description: 'Uma semana sem falhar', color: 'bg-amber-50 border-amber-200' },
  { id: '2', icon: '💪', title: 'Força Crescente', description: '+10 kg no supino', color: 'bg-teal-50 border-teal-200' },
  { id: '3', icon: '🏆', title: '10 Treinos', description: 'Dez sessões concluídas', color: 'bg-violet-50 border-violet-200' },
  { id: '4', icon: '📖', title: 'Devoto Fiel', description: '5 devocionais lidos', color: 'bg-blue-50 border-blue-200' },
  { id: '5', icon: '⚡', title: 'Superação', description: 'Novo recorde pessoal', color: 'bg-rose-50 border-rose-200' },
];

const MOCK_COMMUNITY_POSTS = [
  {
    id: '1',
    name: 'Carlos Eduardo',
    avatar: 'CE',
    avatarColor: 'bg-teal-500',
    time: 'há 23 min',
    content: 'Mais um treino concluído para a glória de Deus! 🙏 Supino chegou em 100 kg hoje. Soli Deo Gloria!',
    likes: 24,
    comments: 6,
    badge: 'Elite',
  },
  {
    id: '2',
    name: 'Ana Paula',
    avatar: 'AP',
    avatarColor: 'bg-violet-500',
    time: 'há 1h',
    content: '"Posso fazer tudo por meio daquele que me fortalece." Fp 4:13 — Primeiro treino após lesão. Obrigada Senhor! 💜',
    likes: 51,
    comments: 12,
    badge: 'Avançada',
  },
  {
    id: '3',
    name: 'Rafael Souza',
    avatar: 'RS',
    avatarColor: 'bg-amber-500',
    time: 'há 2h',
    content: 'Semana 4 do plano de hipertrofia concluída! A disciplina é o caminho. Vamos juntos, irmãos! 🏋️',
    likes: 18,
    comments: 4,
    badge: 'Intermediário',
  },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  icon,
  iconBg,
  textColor,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  iconBg: string;
  textColor: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col gap-3 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className={`text-xl font-bold leading-none ${textColor}`}>{value}</p>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-1">{label}</p>
      </div>
    </div>
  );
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

function CustomChartTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs rounded-xl px-3 py-2 shadow-lg">
      <p className="font-semibold capitalize">{label}</p>
      <p className="text-teal-300 font-bold">{payload[0].value.toLocaleString('pt-BR')} kg</p>
    </div>
  );
}

function QuickActionCard({
  icon,
  label,
  sublabel,
  iconBg,
  to,
}: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  iconBg: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center gap-2 text-center transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer group"
    >
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white ${iconBg} group-hover:scale-110 transition-transform duration-200`}>
        {icon}
      </div>
      <div>
        <p className="text-xs font-semibold text-gray-700">{label}</p>
        <p className="text-[10px] text-gray-400 leading-tight">{sublabel}</p>
      </div>
    </Link>
  );
}

// ---------------------------------------------------------------------------
// Main Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  const { profile } = useAuthStore();
  const [todayVerse, setTodayVerse] = useState(verses[0]);

  // Pick a stable verse for the day using date as seed
  useEffect(() => {
    const dayIndex = new Date().getDate() % verses.length;
    setTodayVerse(verses[dayIndex]);
  }, []);

  const firstName = useMemo(() => {
    if (!profile?.name) return 'Atleta';
    return profile.name.split(' ')[0];
  }, [profile?.name]);

  const greeting = getGreeting(firstName);
  const streak = profile?.streak ?? MOCK_STREAK;
  const level = profile?.level ?? 8;
  const levelLabel = getLevelLabel(level);
  const levelGradient = getLevelColor(level);

  const todayDateFormatted = format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">

        {/* ── 1. GREETING HEADER ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-400 capitalize mb-0.5">{todayDateFormatted}</p>
              <h1 className="text-xl font-bold text-gray-800 leading-tight">{greeting}</h1>
              <p className="text-xs italic text-gray-500 mt-2 leading-relaxed">
                "{todayVerse.text}"
                <span className="not-italic font-semibold text-teal-600 ml-1">— {todayVerse.reference}</span>
              </p>
            </div>
            <div className="flex flex-col gap-1.5 items-end shrink-0">
              {/* Streak badge */}
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-bold text-amber-600">{streak} dias</span>
              </div>
              {/* Level badge */}
              <div className={`flex items-center gap-1.5 bg-gradient-to-r ${levelGradient} rounded-full px-3 py-1`}>
                <Star className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white">Nível {level} · {levelLabel}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. STATS ROW ───────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            label="Treinos essa semana"
            value={`${MOCK_WEEKLY_WORKOUTS}/${MOCK_WEEKLY_GOAL}`}
            icon={<Dumbbell className="w-5 h-5" />}
            iconBg="bg-teal-500"
            textColor="text-gray-800"
          />
          <StatCard
            label="Dias consecutivos"
            value={`${streak} 🔥`}
            icon={<Flame className="w-5 h-5" />}
            iconBg="bg-amber-500"
            textColor="text-amber-600"
          />
          <StatCard
            label="Volume semanal"
            value={MOCK_WEEKLY_VOLUME}
            icon={<Activity className="w-5 h-5" />}
            iconBg="bg-violet-500"
            textColor="text-gray-800"
          />
          <StatCard
            label="Calorias hoje"
            value={MOCK_CALORIES_TODAY}
            icon={<Apple className="w-5 h-5" />}
            iconBg="bg-emerald-500"
            textColor="text-emerald-600"
          />
        </div>

        {/* ── 3. TODAY'S WORKOUT ─────────────────────────────────────────── */}
        {MOCK_TODAY_WORKOUT.isRestDay ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Moon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-800">Dia de Descanso ✝️</h2>
                <p className="text-xs text-gray-400">Seu corpo precisa recuperar</p>
              </div>
            </div>
            <div className="space-y-2 mt-4">
              {['Alongamento leve 10 min', 'Hidratação reforçada', 'Leitura devocional', 'Sono de qualidade'].map((tip) => (
                <div key={tip} className="flex items-center gap-2 text-xs text-gray-600">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-400 shrink-0" />
                  {tip}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="relative overflow-hidden rounded-2xl shadow-md">
            {/* Gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-600 via-teal-500 to-emerald-400" />
            {/* Decorative circle */}
            <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
            <div className="absolute -bottom-12 -left-6 w-32 h-32 rounded-full bg-white/5" />

            <div className="relative p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                    <Dumbbell className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-semibold text-teal-100 uppercase tracking-wide">Treino de Hoje</span>
                </div>
                <div className="bg-white/20 rounded-full px-2.5 py-1 text-[10px] font-bold text-white">
                  ~{MOCK_TODAY_WORKOUT.estimatedTime} min
                </div>
              </div>

              <h2 className="text-lg font-bold text-white leading-tight mb-1">
                {MOCK_TODAY_WORKOUT.name}
              </h2>
              <p className="text-sm text-teal-100 mb-5">
                {MOCK_TODAY_WORKOUT.exercises} exercícios · Pronto para começar?
              </p>

              <Link
                to="/treino"
                className="inline-flex items-center gap-2.5 bg-white text-teal-700 font-bold text-sm rounded-xl px-5 py-3 shadow-md hover:bg-teal-50 transition-all duration-200 active:scale-95"
              >
                <Play className="w-4 h-4 fill-teal-600" />
                Iniciar Treino
              </Link>
            </div>
          </div>
        )}

        {/* ── 4. RECENT PROGRESS CHART ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-800">Progresso Recente</h2>
              <p className="text-xs text-gray-400">Volume total — últimos 7 dias</p>
            </div>
            <Link to="/historico" className="text-xs font-semibold text-teal-600 flex items-center gap-0.5 hover:text-teal-700">
              Ver tudo <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="h-36">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={MOCK_PROGRESS_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10, fill: '#9ca3af' }}
                  axisLine={false}
                  tickLine={false}
                  dy={6}
                />
                <YAxis hide />
                <Tooltip content={<CustomChartTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="#14b8a6"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#14b8a6', strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: '#0f766e', strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── 5. QUICK ACTIONS ───────────────────────────────────────────── */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">Ações Rápidas</h2>
          <div className="grid grid-cols-4 gap-3">
            <QuickActionCard
              to="/peso"
              icon={<Scale className="w-5 h-5" />}
              iconBg="bg-teal-500"
              label="Registrar Peso"
              sublabel="Atualizar balança"
            />
            <QuickActionCard
              to="/agua"
              icon={<Droplets className="w-5 h-5" />}
              iconBg="bg-blue-500"
              label="Adicionar Água"
              sublabel="Meta diária"
            />
            <QuickActionCard
              to="/devocional"
              icon={<BookOpen className="w-5 h-5" />}
              iconBg="bg-amber-500"
              label="Devocional"
              sublabel="Palavra do dia"
            />
            <QuickActionCard
              to="/medidas"
              icon={<Ruler className="w-5 h-5" />}
              iconBg="bg-violet-500"
              label="Medir Corpo"
              sublabel="Circunferências"
            />
          </div>
        </div>

        {/* ── 6. ACHIEVEMENTS ────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">Conquistas desta semana</h2>
            <Link to="/conquistas" className="text-xs font-semibold text-teal-600 flex items-center gap-0.5 hover:text-teal-700">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
            {MOCK_ACHIEVEMENTS.map((a) => (
              <div
                key={a.id}
                className={`flex-shrink-0 w-28 rounded-2xl border p-3 flex flex-col items-center text-center gap-1.5 ${a.color}`}
              >
                <span className="text-2xl leading-none">{a.icon}</span>
                <p className="text-[11px] font-bold text-gray-700 leading-tight">{a.title}</p>
                <p className="text-[9px] text-gray-500 leading-tight">{a.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── 7. COMMUNITY FEED ──────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-500" />
              <h2 className="text-sm font-bold text-gray-700">Comunidade</h2>
            </div>
            <Link to="/comunidade" className="text-xs font-semibold text-teal-600 flex items-center gap-0.5 hover:text-teal-700">
              Ver feed <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {MOCK_COMMUNITY_POSTS.map((post) => (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${post.avatarColor}`}>
                    {post.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-bold text-gray-800">{post.name}</span>
                      <span className="text-[10px] bg-teal-50 text-teal-600 font-semibold rounded-full px-2 py-0.5 border border-teal-100">
                        {post.badge}
                      </span>
                      <span className="text-[10px] text-gray-400 ml-auto">{post.time}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed mt-1.5">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2.5">
                      <button className="flex items-center gap-1 text-gray-400 hover:text-rose-500 transition-colors">
                        <Heart className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-1 text-gray-400 hover:text-teal-500 transition-colors">
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span className="text-[10px] font-medium">{post.comments}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom spacer for mobile nav */}
        <div className="h-4" />
      </div>
    </div>
  );
}
