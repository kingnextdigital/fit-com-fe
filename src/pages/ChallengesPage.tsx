import React, { useState } from 'react';
import {
  Trophy,
  Star,
  Flame,
  Target,
  Zap,
  Crown,
  Medal,
  Lock,
  ChevronRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RankingTab = 'semanal' | 'mensal' | 'total';
type AchievementCategory = 'Todos' | 'Forca' | 'Constancia' | 'Nutricao' | 'Fe' | 'Comunidade';

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_USER_XP = 2340;
const MOCK_USER_LEVEL = 8;
const MOCK_CURRENT_LEVEL_XP = 2000;
const MOCK_NEXT_LEVEL_XP = 3000;

const LEVEL_TITLES: Record<number, string> = {
  1: 'Iniciante',
  2: 'Iniciante',
  3: 'Aprendiz',
  4: 'Aprendiz',
  5: 'Guerreiro',
  6: 'Guerreiro',
  7: 'Atleta',
  8: 'Atleta',
  9: 'Campeao',
  10: 'Campeao',
  11: 'Veterano',
  12: 'Veterano',
  15: 'Lenda',
  20: 'Elite',
};

function getLevelTitle(level: number): string {
  const keys = Object.keys(LEVEL_TITLES)
    .map(Number)
    .sort((a, b) => a - b);
  let title = 'Guerreiro';
  for (const k of keys) {
    if (level >= k) title = LEVEL_TITLES[k];
  }
  return title;
}

const ACTIVE_CHALLENGES = [
  {
    id: 'ac1',
    title: 'Semana Perfeita',
    description: 'Treinar 5x esta semana',
    icon: <Star className="w-5 h-5 text-yellow-400" />,
    progress: 3,
    total: 5,
    daysLeft: 2,
    xpReward: 200,
    color: 'gold' as const,
  },
  {
    id: 'ac2',
    title: 'Devocional Diario',
    description: '7 dias consecutivos de devocional',
    icon: <Flame className="w-5 h-5 text-orange-400" />,
    progress: 5,
    total: 7,
    daysLeft: 2,
    xpReward: 150,
    color: 'teal' as const,
  },
  {
    id: 'ac3',
    title: 'Hidratacao Total',
    description: 'Beber 2L por 14 dias',
    icon: <Zap className="w-5 h-5 text-teal-400" />,
    progress: 9,
    total: 14,
    daysLeft: 5,
    xpReward: 300,
    color: 'green' as const,
  },
];

const AVAILABLE_CHALLENGES = [
  {
    id: 'avl1',
    icon: '🔥',
    name: 'Desafio dos 30 Dias',
    description: 'Treinar 30 dias seguidos sem falhar',
    xpReward: 1000,
    duration: '30 dias',
  },
  {
    id: 'avl2',
    icon: '💯',
    name: '100 Treinos',
    description: 'Completar 100 sessoes de treino',
    xpReward: 2000,
    duration: 'Sem prazo',
  },
  {
    id: 'avl3',
    icon: '⭐',
    name: 'Semana Perfeita',
    description: 'Treinar pelo menos 5x em uma semana',
    xpReward: 200,
    duration: '7 dias',
  },
  {
    id: 'avl4',
    icon: '🏋️',
    name: 'Monstro do Supino',
    description: 'Supinar 100 kg em uma unica sessao',
    xpReward: 500,
    duration: 'Sem prazo',
  },
  {
    id: 'avl5',
    icon: '🌅',
    name: 'Corrida Matinal',
    description: 'Completar 10 treinos antes das 8h da manha',
    xpReward: 400,
    duration: 'Sem prazo',
  },
  {
    id: 'avl6',
    icon: '📖',
    name: 'Devocional Diario',
    description: '7 dias consecutivos de devocional',
    xpReward: 150,
    duration: '7 dias',
  },
  {
    id: 'avl7',
    icon: '💧',
    name: 'Hidratacao Total',
    description: 'Beber 2L de agua por 14 dias seguidos',
    xpReward: 300,
    duration: '14 dias',
  },
  {
    id: 'avl8',
    icon: '🗓️',
    name: 'Primeiro Mes',
    description: 'Completar 1 mes completo de assinatura ativa',
    xpReward: 250,
    duration: '30 dias',
  },
];

type AchievementItem = {
  id: string;
  icon: string;
  title: string;
  description: string;
  xpReward: number;
  category: AchievementCategory;
  unlocked: boolean;
  unlockedDate?: string;
};

const ALL_ACHIEVEMENTS: AchievementItem[] = [
  // Forca
  { id: 'a1', icon: '🏋️', title: 'Primeira Carga', description: 'Complete seu primeiro treino de forca', xpReward: 50, category: 'Forca', unlocked: true, unlockedDate: '01/03/2026' },
  { id: 'a2', icon: '💪', title: 'Forca Crescente', description: '+10 kg no supino em relacao ao inicio', xpReward: 200, category: 'Forca', unlocked: true, unlockedDate: '15/04/2026' },
  { id: 'a3', icon: '🦁', title: 'Rei do Supino', description: 'Supinar 100 kg', xpReward: 500, category: 'Forca', unlocked: false },
  { id: 'a4', icon: '⚡', title: 'Superacao', description: 'Bater um recorde pessoal', xpReward: 300, category: 'Forca', unlocked: true, unlockedDate: '10/05/2026' },
  { id: 'a5', icon: '🎯', title: 'Monstro da Academia', description: 'Completar 50 treinos de forca', xpReward: 800, category: 'Forca', unlocked: false },
  // Constancia
  { id: 'b1', icon: '🔥', title: '7 Dias Seguidos', description: 'Uma semana inteira sem falhar', xpReward: 150, category: 'Constancia', unlocked: true, unlockedDate: '20/02/2026' },
  { id: 'b2', icon: '📅', title: '30 Dias Seguidos', description: 'Um mes completo de consistencia', xpReward: 1000, category: 'Constancia', unlocked: false },
  { id: 'b3', icon: '🏆', title: '10 Treinos', description: 'Dez sessoes de treino concluidas', xpReward: 200, category: 'Constancia', unlocked: true, unlockedDate: '05/03/2026' },
  { id: 'b4', icon: '🥇', title: '100 Treinos', description: 'Cem sessoes de treino concluidas', xpReward: 2000, category: 'Constancia', unlocked: false },
  { id: 'b5', icon: '🌅', title: 'Madrugador', description: '10 treinos antes das 8h da manha', xpReward: 400, category: 'Constancia', unlocked: false },
  // Nutricao
  { id: 'c1', icon: '💧', title: 'Primeira Hidratacao', description: 'Registrar 2L de agua em um dia', xpReward: 50, category: 'Nutricao', unlocked: true, unlockedDate: '12/02/2026' },
  { id: 'c2', icon: '🥗', title: 'Nutricao em Dia', description: 'Registrar refeicoes por 7 dias seguidos', xpReward: 200, category: 'Nutricao', unlocked: false },
  { id: 'c3', icon: '🌿', title: 'Hidratacao Total', description: '14 dias com 2L de agua', xpReward: 300, category: 'Nutricao', unlocked: false },
  { id: 'c4', icon: '🍎', title: 'Mes Saudavel', description: 'Manter nutricao em dia por 30 dias', xpReward: 600, category: 'Nutricao', unlocked: false },
  // Fe
  { id: 'd1', icon: '📖', title: 'Primeiro Devocional', description: 'Completar o primeiro devocional', xpReward: 50, category: 'Fe', unlocked: true, unlockedDate: '08/02/2026' },
  { id: 'd2', icon: '✝️', title: 'Devoto Fiel', description: '7 dias consecutivos de devocional', xpReward: 150, category: 'Fe', unlocked: true, unlockedDate: '22/03/2026' },
  { id: 'd3', icon: '🙏', title: 'Guerreiro da Fe', description: '30 devocionais concluidos', xpReward: 500, category: 'Fe', unlocked: false },
  { id: 'd4', icon: '📿', title: 'Discipulo', description: '100 devocionais ao longo da jornada', xpReward: 1500, category: 'Fe', unlocked: false },
  // Comunidade
  { id: 'e1', icon: '👋', title: 'Bem-vindo!', description: 'Entrou na comunidade TreinoCristao', xpReward: 100, category: 'Comunidade', unlocked: true, unlockedDate: '01/02/2026' },
  { id: 'e2', icon: '❤️', title: 'Inspirador', description: 'Recebeu 10 curtidas em posts', xpReward: 200, category: 'Comunidade', unlocked: false },
  { id: 'e3', icon: '🤝', title: 'Mentor', description: 'Ajudou 5 membros da comunidade', xpReward: 400, category: 'Comunidade', unlocked: false },
  { id: 'e4', icon: '👑', title: 'Lider da Comunidade', description: 'Top 10 no ranking mensal', xpReward: 800, category: 'Comunidade', unlocked: false },
];

const RANKING_DATA: Record<RankingTab, Array<{
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  level: number;
  xp: number;
  isCurrentUser?: boolean;
}>> = {
  semanal: [
    { id: 'r1', name: 'Carlos Eduardo', initials: 'CE', avatarColor: 'bg-teal-500', level: 12, xp: 850 },
    { id: 'r2', name: 'Ana Paula', initials: 'AP', avatarColor: 'bg-violet-500', level: 10, xp: 720 },
    { id: 'r3', name: 'Rafael Souza', initials: 'RS', avatarColor: 'bg-amber-500', level: 9, xp: 680 },
    { id: 'r4', name: 'Mariana Lima', initials: 'ML', avatarColor: 'bg-rose-500', level: 11, xp: 640 },
    { id: 'r5', name: 'Voce', initials: 'VC', avatarColor: 'bg-teal-600', level: 8, xp: 590, isCurrentUser: true },
    { id: 'r6', name: 'Pedro Alves', initials: 'PA', avatarColor: 'bg-blue-500', level: 7, xp: 510 },
    { id: 'r7', name: 'Juliana Costa', initials: 'JC', avatarColor: 'bg-pink-500', level: 9, xp: 480 },
    { id: 'r8', name: 'Bruno Santos', initials: 'BS', avatarColor: 'bg-orange-500', level: 6, xp: 430 },
    { id: 'r9', name: 'Fernanda Reis', initials: 'FR', avatarColor: 'bg-emerald-500', level: 8, xp: 390 },
    { id: 'r10', name: 'Thiago Nunes', initials: 'TN', avatarColor: 'bg-cyan-500', level: 5, xp: 340 },
  ],
  mensal: [
    { id: 'r1', name: 'Ana Paula', initials: 'AP', avatarColor: 'bg-violet-500', level: 10, xp: 3800 },
    { id: 'r2', name: 'Carlos Eduardo', initials: 'CE', avatarColor: 'bg-teal-500', level: 12, xp: 3600 },
    { id: 'r3', name: 'Mariana Lima', initials: 'ML', avatarColor: 'bg-rose-500', level: 11, xp: 3200 },
    { id: 'r4', name: 'Rafael Souza', initials: 'RS', avatarColor: 'bg-amber-500', level: 9, xp: 2900 },
    { id: 'r5', name: 'Juliana Costa', initials: 'JC', avatarColor: 'bg-pink-500', level: 9, xp: 2700 },
    { id: 'r6', name: 'Voce', initials: 'VC', avatarColor: 'bg-teal-600', level: 8, xp: 2340, isCurrentUser: true },
    { id: 'r7', name: 'Pedro Alves', initials: 'PA', avatarColor: 'bg-blue-500', level: 7, xp: 2100 },
    { id: 'r8', name: 'Bruno Santos', initials: 'BS', avatarColor: 'bg-orange-500', level: 6, xp: 1950 },
    { id: 'r9', name: 'Fernanda Reis', initials: 'FR', avatarColor: 'bg-emerald-500', level: 8, xp: 1800 },
    { id: 'r10', name: 'Thiago Nunes', initials: 'TN', avatarColor: 'bg-cyan-500', level: 5, xp: 1600 },
  ],
  total: [
    { id: 'r1', name: 'Carlos Eduardo', initials: 'CE', avatarColor: 'bg-teal-500', level: 12, xp: 18400 },
    { id: 'r2', name: 'Mariana Lima', initials: 'ML', avatarColor: 'bg-rose-500', level: 11, xp: 16200 },
    { id: 'r3', name: 'Ana Paula', initials: 'AP', avatarColor: 'bg-violet-500', level: 10, xp: 14800 },
    { id: 'r4', name: 'Juliana Costa', initials: 'JC', avatarColor: 'bg-pink-500', level: 9, xp: 12300 },
    { id: 'r5', name: 'Rafael Souza', initials: 'RS', avatarColor: 'bg-amber-500', level: 9, xp: 11500 },
    { id: 'r6', name: 'Pedro Alves', initials: 'PA', avatarColor: 'bg-blue-500', level: 7, xp: 9800 },
    { id: 'r7', name: 'Bruno Santos', initials: 'BS', avatarColor: 'bg-orange-500', level: 6, xp: 7600 },
    { id: 'r8', name: 'Fernanda Reis', initials: 'FR', avatarColor: 'bg-emerald-500', level: 8, xp: 6400 },
    { id: 'r9', name: 'Voce', initials: 'VC', avatarColor: 'bg-teal-600', level: 8, xp: 2340, isCurrentUser: true },
    { id: 'r10', name: 'Thiago Nunes', initials: 'TN', avatarColor: 'bg-cyan-500', level: 5, xp: 1900 },
  ],
};

const ACHIEVEMENT_CATEGORIES: AchievementCategory[] = [
  'Todos',
  'Forca',
  'Constancia',
  'Nutricao',
  'Fe',
  'Comunidade',
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RankPosition({ position }: { position: number }) {
  if (position === 1)
    return (
      <div className="w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-md shadow-yellow-400/40">
        <Crown className="w-3.5 h-3.5 text-yellow-900" />
      </div>
    );
  if (position === 2)
    return (
      <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center shadow-md">
        <Medal className="w-3.5 h-3.5 text-gray-600" />
      </div>
    );
  if (position === 3)
    return (
      <div className="w-7 h-7 rounded-full bg-amber-700/70 flex items-center justify-center shadow-md">
        <Medal className="w-3.5 h-3.5 text-amber-200" />
      </div>
    );
  return (
    <div className="w-7 h-7 flex items-center justify-center">
      <span className="text-xs font-bold text-gray-400 tabular-nums">{position}</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ChallengesPage() {
  const [rankingTab, setRankingTab] = useState<RankingTab>('semanal');
  const [achievementCategory, setAchievementCategory] =
    useState<AchievementCategory>('Todos');
  const [joinedChallenges, setJoinedChallenges] = useState<Set<string>>(new Set());

  const xpToNext = MOCK_NEXT_LEVEL_XP - MOCK_USER_XP;
  const xpRange = MOCK_NEXT_LEVEL_XP - MOCK_CURRENT_LEVEL_XP;
  const xpProgress = MOCK_USER_XP - MOCK_CURRENT_LEVEL_XP;
  const xpPercent = Math.round((xpProgress / xpRange) * 100);
  const levelTitle = getLevelTitle(MOCK_USER_LEVEL);

  const filteredAchievements =
    achievementCategory === 'Todos'
      ? ALL_ACHIEVEMENTS
      : ALL_ACHIEVEMENTS.filter((a) => a.category === achievementCategory);

  const unlockedCount = ALL_ACHIEVEMENTS.filter((a) => a.unlocked).length;

  const rankingUsers = RANKING_DATA[rankingTab];

  function handleJoin(id: string) {
    setJoinedChallenges((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 space-y-6">

        {/* ── 1. HEADER ──────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 leading-tight">
              Desafios &amp; Conquistas
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Cresça na fé e no fisico, dia após dia.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <Trophy className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-bold text-amber-600 tabular-nums">
                {MOCK_USER_XP.toLocaleString('pt-BR')} XP
              </span>
            </div>
            <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-200 rounded-full px-3 py-1">
              <Star className="w-3 h-3 text-teal-500" />
              <span className="text-[10px] font-bold text-teal-600">
                Nível {MOCK_USER_LEVEL} · {levelTitle}
              </span>
            </div>
          </div>
        </div>

        {/* ── 2. XP & LEVEL CARD ─────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl shadow-md">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-500 via-yellow-400 to-orange-400" />
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -left-6 w-32 h-32 rounded-full bg-white/8" />

          <div className="relative p-5">
            <div className="flex items-center gap-4 mb-5">
              {/* Big level circle */}
              <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white/20 border-4 border-white/30 flex flex-col items-center justify-center shadow-xl shadow-amber-600/30 backdrop-blur-sm">
                <Crown className="w-5 h-5 text-white mb-0.5" />
                <span className="text-2xl font-black text-white leading-none">
                  {MOCK_USER_LEVEL}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-amber-100 uppercase tracking-widest mb-0.5">
                  Seu nivel atual
                </p>
                <h2 className="text-xl font-black text-white leading-tight">{levelTitle}</h2>
                <p className="text-xs text-amber-100 mt-1">
                  {MOCK_USER_XP.toLocaleString('pt-BR')} XP acumulados
                </p>
              </div>
            </div>

            {/* XP bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                  Progresso para o nível {MOCK_USER_LEVEL + 1}
                </span>
                <span className="text-xs font-bold text-white tabular-nums">{xpPercent}%</span>
              </div>
              <div className="h-3 w-full rounded-full bg-white/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-white shadow-md transition-all duration-700"
                  style={{ width: `${xpPercent}%` }}
                >
                  <div className="h-full w-full rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent" />
                </div>
              </div>
              <p className="text-[11px] text-amber-100 text-right">
                {xpToNext.toLocaleString('pt-BR')} XP para o próximo nivel
              </p>
            </div>
          </div>
        </div>

        {/* ── 3. ACTIVE CHALLENGES ───────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Flame className="w-4 h-4 text-orange-500" />
              Desafios Ativos
            </h2>
            <Badge variant="teal" size="sm">
              {ACTIVE_CHALLENGES.length} ativos
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {ACTIVE_CHALLENGES.map((ch) => {
              const pct = Math.round((ch.progress / ch.total) * 100);
              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
                >
                  {/* Progress ring */}
                  <ProgressRing
                    value={pct}
                    size={72}
                    strokeWidth={7}
                    color={ch.color}
                    label={
                      <span className="text-[11px] font-bold text-gray-700 leading-none">
                        {pct}%
                      </span>
                    }
                    animated
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        {ch.icon}
                        <span className="text-sm font-bold text-gray-800">{ch.title}</span>
                      </div>
                      <Badge variant="gold" size="sm">
                        +{ch.xpReward} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{ch.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-gray-400">
                        <Calendar className="w-3 h-3" />
                        <span className="text-[11px]">
                          {ch.progress}/{ch.total} •{' '}
                          <span className={cn(ch.daysLeft <= 1 ? 'text-red-500 font-semibold' : '')}>
                            {ch.daysLeft}d restantes
                          </span>
                        </span>
                      </div>
                      <button className="text-[11px] font-semibold text-teal-600 flex items-center gap-0.5 hover:text-teal-700 transition-colors">
                        Ver Detalhes <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 4. AVAILABLE CHALLENGES ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Target className="w-4 h-4 text-teal-500" />
              Desafios Disponiveis
            </h2>
          </div>

          <div className="space-y-2">
            {AVAILABLE_CHALLENGES.map((ch) => {
              const joined = joinedChallenges.has(ch.id);
              return (
                <div
                  key={ch.id}
                  className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-3 transition-all duration-200 hover:shadow-md"
                >
                  {/* Icon */}
                  <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-2xl shrink-0">
                    {ch.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span className="text-sm font-bold text-gray-800">{ch.name}</span>
                      <Badge variant="gold" size="sm">
                        +{ch.xpReward} XP
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{ch.description}</p>
                    <div className="flex items-center gap-1 mt-1 text-gray-400">
                      <Clock className="w-3 h-3" />
                      <span className="text-[10px]">{ch.duration}</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {joined ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 bg-teal-50 border border-teal-100 rounded-full px-3 py-1">
                        <Zap className="w-3 h-3" />
                        Inscrito
                      </span>
                    ) : (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleJoin(ch.id)}
                      >
                        Participar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── 5. ACHIEVEMENTS GALLERY ────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              Conquistas
            </h2>
            <span className="text-xs text-gray-400">
              {unlockedCount}/{ALL_ACHIEVEMENTS.length} desbloqueadas
            </span>
          </div>

          {/* Category filter */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide mb-4">
            {ACHIEVEMENT_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setAchievementCategory(cat)}
                className={cn(
                  'flex-shrink-0 text-[11px] font-semibold rounded-full px-3 py-1.5 border transition-all duration-150',
                  achievementCategory === cat
                    ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                    : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-600',
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Achievements grid */}
          <div className="grid grid-cols-3 gap-3">
            {filteredAchievements.map((ach) => (
              <div
                key={ach.id}
                className={cn(
                  'bg-white rounded-2xl border p-3 flex flex-col items-center text-center gap-2 transition-all duration-200',
                  ach.unlocked
                    ? 'border-amber-200 shadow-sm hover:shadow-md hover:-translate-y-0.5'
                    : 'border-gray-100 shadow-sm opacity-60',
                )}
              >
                {/* Icon wrapper */}
                <div
                  className={cn(
                    'w-14 h-14 rounded-full border-2 flex items-center justify-center text-2xl relative',
                    ach.unlocked
                      ? 'border-yellow-400/60 bg-yellow-50 shadow-[0_0_12px_rgba(234,179,8,0.2)]'
                      : 'border-gray-200 bg-gray-50 grayscale',
                  )}
                >
                  <span>{ach.icon}</span>
                  {!ach.unlocked && (
                    <div className="absolute inset-0 rounded-full bg-gray-200/60 flex items-center justify-center">
                      <Lock className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 w-full">
                  <p
                    className={cn(
                      'text-[11px] font-bold leading-tight',
                      ach.unlocked ? 'text-gray-800' : 'text-gray-400',
                    )}
                  >
                    {ach.title}
                  </p>
                  <p className="text-[9px] text-gray-400 leading-tight mt-0.5">
                    {ach.description}
                  </p>
                </div>

                {ach.unlocked ? (
                  <div className="w-full space-y-1">
                    <Badge variant="gold" size="sm">
                      +{ach.xpReward} XP
                    </Badge>
                    <p className="text-[9px] text-gray-400">{ach.unlockedDate}</p>
                  </div>
                ) : (
                  <Badge variant="gray" size="sm">
                    +{ach.xpReward} XP
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. RANKING ─────────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              Ranking
            </h2>
          </div>

          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-4 gap-1">
            {(['semanal', 'mensal', 'total'] as RankingTab[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setRankingTab(tab)}
                className={cn(
                  'flex-1 text-xs font-semibold rounded-lg py-2 transition-all duration-150 capitalize',
                  rankingTab === tab
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700',
                )}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Leaderboard */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {rankingUsers.map((user, idx) => {
              const position = idx + 1;
              return (
                <div
                  key={user.id}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 transition-colors',
                    user.isCurrentUser
                      ? 'bg-teal-50 border-l-2 border-teal-500'
                      : 'hover:bg-gray-50',
                    idx < rankingUsers.length - 1 && 'border-b border-gray-50',
                  )}
                >
                  {/* Position */}
                  <RankPosition position={position} />

                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0',
                      user.avatarColor,
                      user.isCurrentUser && 'ring-2 ring-teal-400 ring-offset-1',
                    )}
                  >
                    {user.initials}
                  </div>

                  {/* Name + level */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'text-sm font-semibold truncate',
                          user.isCurrentUser ? 'text-teal-700' : 'text-gray-800',
                        )}
                      >
                        {user.name}
                      </span>
                      {user.isCurrentUser && (
                        <span className="text-[10px] bg-teal-100 text-teal-600 font-bold rounded-full px-1.5 py-0.5 shrink-0">
                          Voce
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Nível {user.level} · {getLevelTitle(user.level)}
                    </p>
                  </div>

                  {/* XP */}
                  <div className="text-right shrink-0">
                    <p
                      className={cn(
                        'text-sm font-bold tabular-nums',
                        position === 1
                          ? 'text-yellow-500'
                          : user.isCurrentUser
                          ? 'text-teal-600'
                          : 'text-gray-700',
                      )}
                    >
                      {user.xp.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-[10px] text-gray-400">XP</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom spacer */}
        <div className="h-4" />
      </div>
    </div>
  );
}
