import React, { useState, useMemo } from 'react';
import {
  Trophy,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Clock,
  TrendingUp,
  BarChart2,
  Calendar,
  Flame,
  Star,
  Award,
  Filter,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from '../components/ui/Card';
import { Tabs, TabList, Tab, TabPanel } from '../components/ui/Tabs';
import { Badge } from '../components/ui/Badge';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Mock Data
// ---------------------------------------------------------------------------

interface SetLog {
  reps: number;
  weight: number;
  rest: number;
}

interface WorkoutLog {
  id: string;
  date: string; // ISO
  name: string;
  duration: number; // minutes
  exercisesCount: number;
  volume: number; // kg total
  mood: string;
  intensity: 'light' | 'medium' | 'intense';
  sets: { exercise: string; sets: SetLog[] }[];
}

const WORKOUT_LOGS: WorkoutLog[] = [
  {
    id: '1',
    date: '2026-06-24',
    name: 'Peito & Tríceps',
    duration: 68,
    exercisesCount: 6,
    volume: 4820,
    mood: '💪',
    intensity: 'intense',
    sets: [
      { exercise: 'Supino Reto', sets: [{ reps: 10, weight: 80, rest: 90 }, { reps: 8, weight: 85, rest: 90 }, { reps: 7, weight: 87.5, rest: 120 }] },
      { exercise: 'Crucifixo', sets: [{ reps: 12, weight: 18, rest: 60 }, { reps: 12, weight: 18, rest: 60 }, { reps: 10, weight: 20, rest: 60 }] },
      { exercise: 'Tríceps Pulley', sets: [{ reps: 15, weight: 40, rest: 60 }, { reps: 12, weight: 45, rest: 60 }, { reps: 12, weight: 45, rest: 60 }] },
    ],
  },
  {
    id: '2',
    date: '2026-06-22',
    name: 'Costas & Bíceps',
    duration: 74,
    exercisesCount: 7,
    volume: 5340,
    mood: '🔥',
    intensity: 'intense',
    sets: [
      { exercise: 'Barra Fixa', sets: [{ reps: 10, weight: 0, rest: 90 }, { reps: 9, weight: 0, rest: 90 }, { reps: 8, weight: 0, rest: 90 }] },
      { exercise: 'Remada Curvada', sets: [{ reps: 10, weight: 70, rest: 90 }, { reps: 10, weight: 72.5, rest: 90 }, { reps: 8, weight: 75, rest: 90 }] },
      { exercise: 'Rosca Direta', sets: [{ reps: 12, weight: 30, rest: 60 }, { reps: 10, weight: 32.5, rest: 60 }, { reps: 10, weight: 32.5, rest: 60 }] },
    ],
  },
  {
    id: '3',
    date: '2026-06-21',
    name: 'Pernas Completo',
    duration: 82,
    exercisesCount: 8,
    volume: 9760,
    mood: '😤',
    intensity: 'intense',
    sets: [
      { exercise: 'Agachamento', sets: [{ reps: 8, weight: 100, rest: 120 }, { reps: 8, weight: 105, rest: 120 }, { reps: 6, weight: 110, rest: 120 }] },
      { exercise: 'Leg Press', sets: [{ reps: 12, weight: 200, rest: 90 }, { reps: 12, weight: 210, rest: 90 }, { reps: 10, weight: 210, rest: 90 }] },
    ],
  },
  {
    id: '4',
    date: '2026-06-19',
    name: 'Ombros & Trapézio',
    duration: 55,
    exercisesCount: 5,
    volume: 3210,
    mood: '😊',
    intensity: 'medium',
    sets: [
      { exercise: 'Desenvolvimento', sets: [{ reps: 10, weight: 60, rest: 90 }, { reps: 10, weight: 62.5, rest: 90 }, { reps: 8, weight: 65, rest: 90 }] },
      { exercise: 'Elevação Lateral', sets: [{ reps: 15, weight: 12, rest: 60 }, { reps: 12, weight: 14, rest: 60 }, { reps: 12, weight: 14, rest: 60 }] },
    ],
  },
  {
    id: '5',
    date: '2026-06-17',
    name: 'Peito & Tríceps',
    duration: 65,
    exercisesCount: 6,
    volume: 4560,
    mood: '💪',
    intensity: 'intense',
    sets: [
      { exercise: 'Supino Reto', sets: [{ reps: 10, weight: 78, rest: 90 }, { reps: 8, weight: 82.5, rest: 90 }, { reps: 7, weight: 85, rest: 120 }] },
    ],
  },
  {
    id: '6',
    date: '2026-06-15',
    name: 'Costas & Bíceps',
    duration: 70,
    exercisesCount: 7,
    volume: 5100,
    mood: '🔥',
    intensity: 'intense',
    sets: [
      { exercise: 'Remada Curvada', sets: [{ reps: 10, weight: 70, rest: 90 }, { reps: 10, weight: 70, rest: 90 }, { reps: 8, weight: 72.5, rest: 90 }] },
    ],
  },
  {
    id: '7',
    date: '2026-06-14',
    name: 'Cardio & Core',
    duration: 40,
    exercisesCount: 4,
    volume: 0,
    mood: '😌',
    intensity: 'light',
    sets: [
      { exercise: 'Prancha', sets: [{ reps: 1, weight: 0, rest: 30 }, { reps: 1, weight: 0, rest: 30 }, { reps: 1, weight: 0, rest: 30 }] },
    ],
  },
  {
    id: '8',
    date: '2026-06-12',
    name: 'Pernas Completo',
    duration: 80,
    exercisesCount: 8,
    volume: 9200,
    mood: '😤',
    intensity: 'intense',
    sets: [
      { exercise: 'Agachamento', sets: [{ reps: 8, weight: 100, rest: 120 }, { reps: 8, weight: 100, rest: 120 }, { reps: 7, weight: 102.5, rest: 120 }] },
    ],
  },
  {
    id: '9',
    date: '2026-06-10',
    name: 'Ombros & Trapézio',
    duration: 52,
    exercisesCount: 5,
    volume: 3050,
    mood: '😊',
    intensity: 'medium',
    sets: [
      { exercise: 'Desenvolvimento', sets: [{ reps: 10, weight: 57.5, rest: 90 }, { reps: 10, weight: 60, rest: 90 }, { reps: 8, weight: 62.5, rest: 90 }] },
    ],
  },
  {
    id: '10',
    date: '2026-06-08',
    name: 'Peito & Tríceps',
    duration: 63,
    exercisesCount: 6,
    volume: 4300,
    mood: '💪',
    intensity: 'medium',
    sets: [
      { exercise: 'Supino Reto', sets: [{ reps: 10, weight: 77.5, rest: 90 }, { reps: 8, weight: 80, rest: 90 }, { reps: 7, weight: 82.5, rest: 120 }] },
    ],
  },
  {
    id: '11',
    date: '2026-06-07',
    name: 'Costas & Bíceps',
    duration: 68,
    exercisesCount: 7,
    volume: 4900,
    mood: '🔥',
    intensity: 'intense',
    sets: [
      { exercise: 'Barra Fixa', sets: [{ reps: 10, weight: 0, rest: 90 }, { reps: 9, weight: 0, rest: 90 }, { reps: 8, weight: 0, rest: 90 }] },
    ],
  },
  {
    id: '12',
    date: '2026-06-05',
    name: 'Full Body',
    duration: 90,
    exercisesCount: 9,
    volume: 6800,
    mood: '💪',
    intensity: 'intense',
    sets: [
      { exercise: 'Agachamento', sets: [{ reps: 8, weight: 95, rest: 120 }, { reps: 8, weight: 97.5, rest: 120 }] },
    ],
  },
  {
    id: '13',
    date: '2026-06-03',
    name: 'Cardio & Core',
    duration: 35,
    exercisesCount: 4,
    volume: 0,
    mood: '😌',
    intensity: 'light',
    sets: [],
  },
  {
    id: '14',
    date: '2026-06-01',
    name: 'Pernas Completo',
    duration: 78,
    exercisesCount: 8,
    volume: 8800,
    mood: '😤',
    intensity: 'intense',
    sets: [
      { exercise: 'Leg Press', sets: [{ reps: 12, weight: 190, rest: 90 }, { reps: 12, weight: 200, rest: 90 }, { reps: 10, weight: 200, rest: 90 }] },
    ],
  },
  {
    id: '15',
    date: '2026-05-30',
    name: 'Ombros & Trapézio',
    duration: 50,
    exercisesCount: 5,
    volume: 2900,
    mood: '😊',
    intensity: 'medium',
    sets: [],
  },
  {
    id: '16',
    date: '2026-05-28',
    name: 'Peito & Tríceps',
    duration: 60,
    exercisesCount: 6,
    volume: 4100,
    mood: '💪',
    intensity: 'medium',
    sets: [],
  },
  {
    id: '17',
    date: '2026-05-26',
    name: 'Costas & Bíceps',
    duration: 65,
    exercisesCount: 7,
    volume: 4700,
    mood: '🔥',
    intensity: 'intense',
    sets: [],
  },
  {
    id: '18',
    date: '2026-05-24',
    name: 'Pernas Completo',
    duration: 75,
    exercisesCount: 8,
    volume: 8500,
    mood: '😤',
    intensity: 'intense',
    sets: [],
  },
  {
    id: '19',
    date: '2026-05-21',
    name: 'Full Body',
    duration: 85,
    exercisesCount: 9,
    volume: 6200,
    mood: '💪',
    intensity: 'intense',
    sets: [],
  },
  {
    id: '20',
    date: '2026-05-19',
    name: 'Cardio & Core',
    duration: 38,
    exercisesCount: 4,
    volume: 0,
    mood: '😌',
    intensity: 'light',
    sets: [],
  },
  {
    id: '21',
    date: '2026-05-17',
    name: 'Ombros & Trapézio',
    duration: 48,
    exercisesCount: 5,
    volume: 2750,
    mood: '😊',
    intensity: 'light',
    sets: [],
  },
  {
    id: '22',
    date: '2026-05-15',
    name: 'Peito & Tríceps',
    duration: 58,
    exercisesCount: 6,
    volume: 3900,
    mood: '💪',
    intensity: 'medium',
    sets: [],
  },
];

// Evolution chart mock data
const EVOLUTION_DATA: Record<string, Record<string, { date: string; value: number }[]>> = {
  'peso-levantado': {
    '7d': [
      { date: '18/06', value: 82.5 },
      { date: '19/06', value: 60 },
      { date: '21/06', value: 110 },
      { date: '22/06', value: 75 },
      { date: '23/06', value: 62.5 },
      { date: '24/06', value: 87.5 },
      { date: '25/06', value: 87.5 },
    ],
    '30d': Array.from({ length: 20 }, (_, i) => ({
      date: `${(i + 1).toString().padStart(2, '0')}/06`,
      value: 75 + Math.sin(i * 0.5) * 8 + i * 0.5,
    })),
    '90d': Array.from({ length: 30 }, (_, i) => ({
      date: `Sem ${i + 1}`,
      value: 70 + i * 0.8 + Math.random() * 5,
    })),
    '1a': Array.from({ length: 12 }, (_, i) => ({
      date: format(new Date(2026, i < 6 ? i + 6 : i - 6, 1), 'MMM', { locale: ptBR }),
      value: 60 + i * 2.5 + Math.random() * 3,
    })),
  },
  'repeticoes': {
    '7d': [
      { date: '18/06', value: 10 },
      { date: '19/06', value: 10 },
      { date: '21/06', value: 8 },
      { date: '22/06', value: 10 },
      { date: '23/06', value: 10 },
      { date: '24/06', value: 10 },
      { date: '25/06', value: 10 },
    ],
    '30d': Array.from({ length: 20 }, (_, i) => ({
      date: `${(i + 1).toString().padStart(2, '0')}/06`,
      value: 8 + Math.round(Math.sin(i * 0.3) * 2),
    })),
    '90d': Array.from({ length: 30 }, (_, i) => ({
      date: `Sem ${i + 1}`,
      value: 8 + Math.round(i * 0.1),
    })),
    '1a': Array.from({ length: 12 }, (_, i) => ({
      date: format(new Date(2026, i < 6 ? i + 6 : i - 6, 1), 'MMM', { locale: ptBR }),
      value: 7 + Math.round(i * 0.25),
    })),
  },
  'volume-total': {
    '7d': [
      { date: '18/06', value: 3210 },
      { date: '19/06', value: 3210 },
      { date: '21/06', value: 9760 },
      { date: '22/06', value: 5340 },
      { date: '23/06', value: 3500 },
      { date: '24/06', value: 4820 },
      { date: '25/06', value: 4820 },
    ],
    '30d': Array.from({ length: 20 }, (_, i) => ({
      date: `${(i + 1).toString().padStart(2, '0')}/06`,
      value: 3000 + i * 120 + Math.sin(i) * 800,
    })),
    '90d': Array.from({ length: 30 }, (_, i) => ({
      date: `Sem ${i + 1}`,
      value: 20000 + i * 500 + Math.random() * 2000,
    })),
    '1a': Array.from({ length: 12 }, (_, i) => ({
      date: format(new Date(2026, i < 6 ? i + 6 : i - 6, 1), 'MMM', { locale: ptBR }),
      value: 60000 + i * 4000 + Math.random() * 5000,
    })),
  },
  'peso-corporal': {
    '7d': [
      { date: '18/06', value: 82.8 },
      { date: '19/06', value: 82.6 },
      { date: '21/06', value: 82.4 },
      { date: '22/06', value: 82.9 },
      { date: '23/06', value: 82.5 },
      { date: '24/06', value: 82.3 },
      { date: '25/06', value: 82.1 },
    ],
    '30d': Array.from({ length: 20 }, (_, i) => ({
      date: `${(i + 1).toString().padStart(2, '0')}/06`,
      value: 84.5 - i * 0.12 + Math.sin(i * 0.4) * 0.3,
    })),
    '90d': Array.from({ length: 30 }, (_, i) => ({
      date: `Sem ${i + 1}`,
      value: 87 - i * 0.18,
    })),
    '1a': Array.from({ length: 12 }, (_, i) => ({
      date: format(new Date(2026, i < 6 ? i + 6 : i - 6, 1), 'MMM', { locale: ptBR }),
      value: 91 - i * 0.75,
    })),
  },
};

interface PersonalRecord {
  id: string;
  exercise: string;
  muscleGroup: string;
  weight: number;
  reps: number;
  date: string;
  previousBest?: number;
}

const PERSONAL_RECORDS: PersonalRecord[] = [
  { id: 'pr1', exercise: 'Supino Reto', muscleGroup: 'Peito', weight: 100, reps: 5, date: '2026-06-24', previousBest: 95 },
  { id: 'pr2', exercise: 'Agachamento', muscleGroup: 'Pernas', weight: 130, reps: 3, date: '2026-06-21', previousBest: 125 },
  { id: 'pr3', exercise: 'Levantamento Terra', muscleGroup: 'Costas', weight: 150, reps: 3, date: '2026-06-15', previousBest: 145 },
  { id: 'pr4', exercise: 'Desenvolvimento', muscleGroup: 'Ombros', weight: 70, reps: 8, date: '2026-06-19', previousBest: 67.5 },
  { id: 'pr5', exercise: 'Remada Curvada', muscleGroup: 'Costas', weight: 85, reps: 8, date: '2026-06-22', previousBest: 82.5 },
  { id: 'pr6', exercise: 'Rosca Direta', muscleGroup: 'Bíceps', weight: 40, reps: 10, date: '2026-06-22', previousBest: 37.5 },
  { id: 'pr7', exercise: 'Tríceps Pulley', muscleGroup: 'Tríceps', weight: 55, reps: 12, date: '2026-06-24', previousBest: 52.5 },
  { id: 'pr8', exercise: 'Leg Press', muscleGroup: 'Pernas', weight: 260, reps: 10, date: '2026-06-21', previousBest: 250 },
  { id: 'pr9', exercise: 'Barra Fixa', muscleGroup: 'Costas', weight: 0, reps: 14, date: '2026-06-22', previousBest: 0 },
  { id: 'pr10', exercise: 'Elevação Lateral', muscleGroup: 'Ombros', weight: 18, reps: 15, date: '2026-06-19', previousBest: 16 },
  { id: 'pr11', exercise: 'Hack Squat', muscleGroup: 'Pernas', weight: 180, reps: 10, date: '2026-06-12', previousBest: 170 },
  { id: 'pr12', exercise: 'Crucifixo', muscleGroup: 'Peito', weight: 24, reps: 12, date: '2026-06-24', previousBest: 22 },
];

const METRIC_OPTIONS = [
  { value: 'peso-levantado', label: 'Peso Levantado' },
  { value: 'repeticoes', label: 'Repetições' },
  { value: 'volume-total', label: 'Volume Total' },
  { value: 'peso-corporal', label: 'Peso Corporal' },
];

const TIME_RANGE_OPTIONS = [
  { value: '7d', label: '7 dias' },
  { value: '30d', label: '30 dias' },
  { value: '90d', label: '90 dias' },
  { value: '1a', label: '1 ano' },
];

const MUSCLE_GROUPS = ['Todos', 'Peito', 'Costas', 'Pernas', 'Ombros', 'Bíceps', 'Tríceps'];

// ---------------------------------------------------------------------------
// Calendar Heat Map
// ---------------------------------------------------------------------------

function intensityClass(intensity: WorkoutLog['intensity'] | undefined): string {
  if (!intensity) return 'bg-gray-100';
  if (intensity === 'light') return 'bg-teal-200';
  if (intensity === 'medium') return 'bg-teal-400';
  return 'bg-teal-700';
}

interface CalendarHeatMapProps {
  logs: WorkoutLog[];
  year: number;
  month: number; // 0-indexed
}

function CalendarHeatMap({ logs, year, month }: CalendarHeatMapProps) {
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fill leading blanks so grid starts on correct weekday (Mon=0)
  const startDow = (getDay(monthStart) + 6) % 7; // Monday first
  const cells: (Date | null)[] = [
    ...Array(startDow).fill(null),
    ...days,
  ];
  // Pad to complete row
  while (cells.length % 7 !== 0) cells.push(null);

  const weekDayLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div>
      <div className="grid grid-cols-7 gap-1 mb-1">
        {weekDayLabels.map((d) => (
          <div key={d} className="text-center text-[10px] font-medium text-gray-400 pb-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={`empty-${idx}`} className="aspect-square rounded-md bg-transparent" />;
          }
          const log = logs.find((l) => isSameDay(parseISO(l.date), day));
          const today = isSameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              title={log ? `${format(day, 'dd/MM')}: ${log.name}` : format(day, 'dd/MM')}
              className={cn(
                'aspect-square rounded-md transition-transform duration-150 hover:scale-110 cursor-default',
                log ? intensityClass(log.intensity) : 'bg-gray-100',
                today && 'ring-2 ring-teal-500 ring-offset-1',
              )}
            />
          );
        })}
      </div>
      <div className="flex items-center gap-2 mt-3 justify-end">
        <span className="text-[11px] text-gray-400">Menos</span>
        {(['bg-gray-100', 'bg-teal-200', 'bg-teal-400', 'bg-teal-700'] as string[]).map((c) => (
          <div key={c} className={cn('w-3.5 h-3.5 rounded-sm', c)} />
        ))}
        <span className="text-[11px] text-gray-400">Mais</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Workout Log List
// ---------------------------------------------------------------------------

function groupByWeek(logs: WorkoutLog[]): { weekLabel: string; logs: WorkoutLog[] }[] {
  const sorted = [...logs].sort((a, b) => b.date.localeCompare(a.date));
  const weeks: { weekLabel: string; logs: WorkoutLog[] }[] = [];
  sorted.forEach((log) => {
    const d = parseISO(log.date);
    const weekNum = Math.ceil(d.getDate() / 7);
    const label = `Semana ${weekNum} — ${format(d, 'MMMM yyyy', { locale: ptBR })}`;
    const existing = weeks.find((w) => w.weekLabel === label);
    if (existing) existing.logs.push(log);
    else weeks.push({ weekLabel: label, logs: [log] });
  });
  return weeks;
}

interface WorkoutLogCardProps {
  log: WorkoutLog;
}

function WorkoutLogCard({ log }: WorkoutLogCardProps) {
  const [expanded, setExpanded] = useState(false);
  const d = parseISO(log.date);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-gray-50/70 transition-colors"
        onClick={() => setExpanded((p) => !p)}
      >
        {/* Date block */}
        <div className="flex flex-col items-center justify-center w-12 h-12 rounded-xl bg-teal-50 shrink-0">
          <span className="text-xs font-semibold text-teal-600 uppercase leading-none">
            {format(d, 'MMM', { locale: ptBR })}
          </span>
          <span className="text-xl font-bold text-teal-700 leading-tight">{format(d, 'dd')}</span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-800 text-sm">{log.name}</span>
            <span className="text-base">{log.mood}</span>
          </div>
          <div className="flex flex-wrap gap-3 mt-1.5">
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Clock size={12} className="text-teal-500" />
              {log.duration} min
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-500">
              <Dumbbell size={12} className="text-teal-500" />
              {log.exercisesCount} exercícios
            </span>
            {log.volume > 0 && (
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <BarChart2 size={12} className="text-teal-500" />
                {log.volume.toLocaleString('pt-BR')} kg vol.
              </span>
            )}
          </div>
        </div>

        <div className={cn('text-gray-400 transition-transform duration-200 mt-1', expanded && 'rotate-180')}>
          <ChevronDown size={16} />
        </div>
      </button>

      {expanded && log.sets.length > 0 && (
        <div className="border-t border-gray-100 px-5 py-4 space-y-4 bg-gray-50/40">
          {log.sets.map((exGroup, i) => (
            <div key={i}>
              <p className="text-xs font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                {exGroup.exercise}
              </p>
              <div className="space-y-1">
                {exGroup.sets.map((s, j) => (
                  <div key={j} className="flex items-center gap-3 text-xs text-gray-600">
                    <span className="w-14 text-center font-medium text-teal-600 bg-teal-50 rounded-full py-0.5">
                      Série {j + 1}
                    </span>
                    <span>{s.reps} reps</span>
                    {s.weight > 0 && <span className="text-gray-400">·</span>}
                    {s.weight > 0 && <span>{s.weight} kg</span>}
                    {s.rest > 0 && <span className="text-gray-400 ml-auto">{s.rest}s descanso</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Custom Tooltip for recharts
// ---------------------------------------------------------------------------

function CustomTooltip({
  active,
  payload,
  label,
  unit,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  unit: string;
}) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="bg-gray-900 text-white text-xs px-3 py-2 rounded-xl shadow-xl border border-white/10">
      <p className="text-gray-400 mb-0.5">{label}</p>
      <p className="font-bold text-teal-300">
        {typeof payload[0].value === 'number'
          ? payload[0].value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })
          : payload[0].value}{' '}
        {unit}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 2 – Evolução
// ---------------------------------------------------------------------------

function EvolutionTab() {
  const [metric, setMetric] = useState('peso-levantado');
  const [range, setRange] = useState('30d');

  const chartData = EVOLUTION_DATA[metric]?.[range] ?? [];

  const values = chartData.map((d) => d.value);
  const highest = values.length ? Math.max(...values) : 0;
  const lowest = values.length ? Math.min(...values) : 0;
  const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const improvement = lowest > 0 ? (((highest - lowest) / lowest) * 100) : 0;

  const metricLabel = METRIC_OPTIONS.find((m) => m.value === metric)?.label ?? '';
  const unit = metric === 'volume-total' ? 'kg total' : metric === 'repeticoes' ? 'reps' : 'kg';

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
          {METRIC_OPTIONS.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => setMetric(m.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                metric === m.value
                  ? 'bg-teal-700 text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <div className="flex rounded-xl bg-gray-100 p-1 gap-1 ml-auto">
          {TIME_RANGE_OPTIONS.map((r) => (
            <button
              key={r.value}
              type="button"
              onClick={() => setRange(r.value)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200',
                range === r.value
                  ? 'bg-white text-teal-700 shadow-sm font-semibold'
                  : 'text-gray-500 hover:text-gray-800',
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart card */}
      <Card>
        <CardContent className="pt-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">{metricLabel}</p>
              <p className="text-2xl font-bold text-gray-800 mt-0.5">
                {highest.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}{' '}
                <span className="text-sm font-normal text-teal-600">{unit}</span>
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp size={14} />
              +{improvement.toFixed(1)}%
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0d9488" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(1)}k` : `${v}`)}
              />
              <Tooltip
                content={(props) => (
                  <CustomTooltip
                    active={props.active}
                    payload={props.payload as { value: number }[] | undefined}
                    label={props.label as string | undefined}
                    unit={unit}
                  />
                )}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#0d9488"
                strokeWidth={2.5}
                fill="url(#tealGrad)"
                dot={false}
                activeDot={{ r: 4, fill: '#0d9488', stroke: '#fff', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Máximo', value: highest.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), color: 'bg-teal-50 text-teal-700' },
          { label: 'Média', value: avg.toLocaleString('pt-BR', { maximumFractionDigits: 1 }), color: 'bg-blue-50 text-blue-700' },
          { label: 'Evolução', value: `+${improvement.toFixed(1)}%`, color: 'bg-emerald-50 text-emerald-700' },
        ].map((stat) => (
          <div key={stat.label} className={cn('rounded-2xl px-4 py-4 text-center', stat.color)}>
            <p className="text-lg font-bold">{stat.value}</p>
            <p className="text-xs font-medium opacity-70 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Insight banner */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl px-5 py-4 text-white shadow-lg shadow-teal-500/20">
        <span className="text-2xl">🏆</span>
        <p className="text-sm font-medium leading-snug">
          Seu peso no supino evoluiu <strong>8,5 kg</strong> nos últimos 30 dias!
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 3 – Recordes
// ---------------------------------------------------------------------------

const MUSCLE_COLOR: Record<string, string> = {
  Peito: 'bg-red-100 text-red-700',
  Costas: 'bg-blue-100 text-blue-700',
  Pernas: 'bg-orange-100 text-orange-700',
  Ombros: 'bg-purple-100 text-purple-700',
  Bíceps: 'bg-teal-100 text-teal-700',
  Tríceps: 'bg-cyan-100 text-cyan-700',
};

function RecordsTab() {
  const [filter, setFilter] = useState('Todos');

  const filtered = filter === 'Todos'
    ? PERSONAL_RECORDS
    : PERSONAL_RECORDS.filter((r) => r.muscleGroup === filter);

  return (
    <div className="space-y-5">
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 items-center">
        <Filter size={14} className="text-gray-400 shrink-0" />
        {MUSCLE_GROUPS.map((g) => (
          <button
            key={g}
            type="button"
            onClick={() => setFilter(g)}
            className={cn(
              'px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border',
              filter === g
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'bg-white text-gray-600 border-gray-200 hover:border-teal-300 hover:text-teal-700',
            )}
          >
            {g}
          </button>
        ))}
      </div>

      {/* PR Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((pr) => {
          const improvement = pr.previousBest && pr.previousBest > 0
            ? pr.weight > 0
              ? ((pr.weight - pr.previousBest) / pr.previousBest * 100).toFixed(1)
              : ((pr.reps - (pr.previousBest as number)) / (pr.previousBest as number) * 100).toFixed(1)
            : null;

          return (
            <div
              key={pr.id}
              className="bg-white border border-gray-100 rounded-2xl shadow-sm p-5 flex flex-col gap-3 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{pr.exercise}</p>
                  <span className={cn('inline-block mt-1 text-[11px] font-medium px-2 py-0.5 rounded-full', MUSCLE_COLOR[pr.muscleGroup] ?? 'bg-gray-100 text-gray-600')}>
                    {pr.muscleGroup}
                  </span>
                </div>
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-amber-50 shrink-0">
                  <Trophy size={18} className="text-amber-500" />
                </div>
              </div>

              {/* Best */}
              <div className="flex items-end gap-2">
                {pr.weight > 0 ? (
                  <>
                    <span className="text-3xl font-bold text-gray-800 leading-none">{pr.weight}</span>
                    <span className="text-sm font-semibold text-teal-600 mb-0.5">kg</span>
                    <span className="text-sm text-gray-400 mb-0.5">× {pr.reps} reps</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-gray-800 leading-none">{pr.reps}</span>
                    <span className="text-sm font-semibold text-teal-600 mb-0.5">reps</span>
                    <span className="text-xs text-gray-400 mb-0.5">peso corporal</span>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-auto pt-2 border-t border-gray-50">
                <span className="flex items-center gap-1 text-xs text-gray-400">
                  <Calendar size={11} />
                  {format(parseISO(pr.date), 'dd/MM/yyyy')}
                </span>
                {improvement && (
                  <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <TrendingUp size={10} />
                    +{improvement}%
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Trophy size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum recorde para este grupo muscular ainda.</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tab 1 – Histórico
// ---------------------------------------------------------------------------

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function HistoricoTab() {
  const [selectedYear, setSelectedYear] = useState(2026);
  const [selectedMonth, setSelectedMonth] = useState(5); // June 0-indexed

  const logsInMonth = WORKOUT_LOGS.filter((l) => {
    const d = parseISO(l.date);
    return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
  });

  const weekGroups = useMemo(() => groupByWeek(logsInMonth), [logsInMonth]);

  return (
    <div className="space-y-6">
      {/* Month/year selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1 rounded-xl bg-gray-100 p-1">
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
            onClick={() => {
              if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear((y) => y - 1); }
              else setSelectedMonth((m) => m - 1);
            }}
          >
            <ChevronUp size={14} className="rotate-270" style={{ transform: 'rotate(-90deg)' }} />
          </button>
          <span className="px-2 text-sm font-semibold text-gray-800 min-w-[120px] text-center">
            {MONTHS[selectedMonth]} {selectedYear}
          </span>
          <button
            type="button"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-800 transition-colors"
            onClick={() => {
              if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear((y) => y + 1); }
              else setSelectedMonth((m) => m + 1);
            }}
          >
            <ChevronDown size={14} style={{ transform: 'rotate(-90deg)' }} />
          </button>
        </div>
        <span className="text-sm text-gray-400">
          {logsInMonth.length} treino{logsInMonth.length !== 1 ? 's' : ''} este mês
        </span>
      </div>

      {/* Calendar Heat Map */}
      <Card>
        <CardContent>
          <CalendarHeatMap logs={logsInMonth} year={selectedYear} month={selectedMonth} />
        </CardContent>
      </Card>

      {/* Weekly log list */}
      {weekGroups.length === 0 ? (
        <div className="text-center py-12 text-gray-400">
          <Dumbbell size={40} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum treino registrado neste mês.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {weekGroups.map((group) => (
            <div key={group.weekLabel}>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-gray-100" />
                <span className="text-xs font-medium text-gray-400 capitalize">{group.weekLabel}</span>
                <div className="h-px flex-1 bg-gray-100" />
              </div>
              <div className="space-y-3">
                {group.logs.map((log) => (
                  <WorkoutLogCard key={log.id} log={log} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// HistoryPage
// ---------------------------------------------------------------------------

export default function HistoryPage() {
  const [tab, setTab] = useState('historico');

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white">
          <Flame size={20} />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Meu Progresso</h1>
          <p className="text-xs text-gray-400 mt-0.5">Histórico, evolução e recordes pessoais</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
          <Star size={12} className="text-amber-500" />
          <span>14 dias de streak</span>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onChange={setTab}>
        <TabList variant="pills">
          <Tab value="historico" icon={<Calendar size={14} />}>Histórico</Tab>
          <Tab value="evolucao" icon={<TrendingUp size={14} />}>Evolução</Tab>
          <Tab value="recordes" icon={<Award size={14} />}>Recordes</Tab>
        </TabList>

        <div className="mt-5">
          <TabPanel value="historico">
            <HistoricoTab />
          </TabPanel>
          <TabPanel value="evolucao">
            <EvolutionTab />
          </TabPanel>
          <TabPanel value="recordes">
            <RecordsTab />
          </TabPanel>
        </div>
      </Tabs>
    </div>
  );
}
