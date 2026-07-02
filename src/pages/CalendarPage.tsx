import React, { useState, useMemo } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  isPast,
  isFuture,
  addMonths,
  subMonths,
  getDay,
  differenceInCalendarDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Check,
  Flame,
  Dumbbell,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type MoodOption = '😄' | '🙂' | '😐' | '😩' | '😴';

interface WorkoutEntry {
  date: string; // 'yyyy-MM-dd'
  name: string;
  type: 'strength' | 'cardio' | 'stretch';
  done: boolean;
  duration: number; // minutes
  volume?: number; // kg
  exercises?: Array<{ name: string; sets: number; reps: number; weight: number }>;
  mood?: MoodOption;
  fatigue?: MoodOption;
  notes?: string;
  weight?: number; // body weight
  isRestDay?: boolean;
  devotional?: string;
  streakDay?: boolean;
}

// ---------------------------------------------------------------------------
// Mock data — last 3 months
// ---------------------------------------------------------------------------

function buildMockData(): Record<string, WorkoutEntry> {
  const today = new Date();
  const data: Record<string, WorkoutEntry> = {};

  const workoutNames = [
    { name: 'Treino A — Peito & Tríceps', type: 'strength' as const },
    { name: 'Treino B — Costas & Bíceps', type: 'strength' as const },
    { name: 'Treino C — Pernas & Glúteos', type: 'strength' as const },
    { name: 'Treino D — Ombros & Core', type: 'strength' as const },
    { name: 'Cardio HIIT 30 min', type: 'cardio' as const },
    { name: 'Alongamento & Mobilidade', type: 'stretch' as const },
  ];

  const devotionals = [
    '"Posso fazer tudo por meio daquele que me fortalece." — Fp 4:13',
    '"O Senhor é a minha força e o meu escudo." — Sl 28:7',
    '"Sede fortes e corajosos." — Js 1:9',
    '"Tudo o que fizerem, façam de todo o coração, como para o Senhor." — Cl 3:23',
  ];

  const exerciseSets = [
    { name: 'Supino Reto', sets: 4, reps: 10, weight: 80 },
    { name: 'Crossover', sets: 3, reps: 12, weight: 14 },
    { name: 'Tríceps Pulley', sets: 3, reps: 15, weight: 30 },
    { name: 'Remada Curvada', sets: 4, reps: 10, weight: 70 },
    { name: 'Pulldown', sets: 3, reps: 12, weight: 55 },
    { name: 'Rosca Direta', sets: 3, reps: 12, weight: 20 },
    { name: 'Agachamento', sets: 4, reps: 12, weight: 100 },
    { name: 'Leg Press', sets: 3, reps: 15, weight: 180 },
    { name: 'Desenvolvimento', sets: 4, reps: 10, weight: 50 },
  ];

  // Seed 90 days back
  for (let i = 90; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const key = format(d, 'yyyy-MM-dd');
    const dayOfWeek = getDay(d); // 0=Sun

    // Rest days: Sunday and Wednesday
    if (dayOfWeek === 0 || dayOfWeek === 3) {
      data[key] = {
        date: key,
        name: 'Dia de Descanso',
        type: 'stretch',
        done: !isFuture(d),
        duration: 0,
        isRestDay: true,
        devotional: devotionals[i % devotionals.length],
        streakDay: false,
      };
      continue;
    }

    // Future: planned workouts
    if (isFuture(d)) {
      const w = workoutNames[i % workoutNames.length];
      data[key] = {
        date: key,
        name: w.name,
        type: w.type,
        done: false,
        duration: w.type === 'cardio' ? 30 : 55,
        streakDay: false,
      };
      continue;
    }

    // Past: done workouts (skip ~15% randomly, deterministic)
    const skip = (i * 17 + 3) % 13 === 0;
    if (skip) continue;

    const w = workoutNames[i % workoutNames.length];
    const moodOptions: MoodOption[] = ['😄', '🙂', '😐', '😩', '😴'];
    const mood = moodOptions[i % moodOptions.length];
    const fatigue = moodOptions[(i + 2) % moodOptions.length];

    data[key] = {
      date: key,
      name: w.name,
      type: w.type,
      done: true,
      duration: w.type === 'cardio' ? 30 : 55,
      volume: w.type === 'strength' ? 6000 + (i % 10) * 450 : undefined,
      exercises: w.type === 'strength'
        ? exerciseSets.slice(0, 3 + (i % 4))
        : undefined,
      mood,
      fatigue,
      notes: i % 7 === 0 ? 'Ótima sessão! Sinto o progresso. Gratidão ao Senhor pela saúde.' : undefined,
      weight: 78 + (i % 5) * 0.2,
      devotional: devotionals[i % devotionals.length],
      streakDay: (i * 13) % 5 !== 0,
    };
  }

  return data;
}

const MOCK_DATA = buildMockData();

// ---------------------------------------------------------------------------
// Compute current streak
// ---------------------------------------------------------------------------

function computeCurrentStreak(): number {
  const today = new Date();
  let streak = 0;
  let d = new Date(today);
  while (true) {
    const key = format(d, 'yyyy-MM-dd');
    const entry = MOCK_DATA[key];
    if (entry && entry.done && !entry.isRestDay) {
      streak++;
    } else if (!entry || (!entry.done && !isFuture(d))) {
      break;
    }
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

const CURRENT_STREAK = computeCurrentStreak();

// ---------------------------------------------------------------------------
// Day Cell
// ---------------------------------------------------------------------------

interface DayCellProps {
  date: Date;
  currentMonth: Date;
  entry?: WorkoutEntry;
  isSelected: boolean;
  onSelect: (date: Date) => void;
}

function DayCell({ date, currentMonth, entry, isSelected, onSelect }: DayCellProps) {
  const inMonth = isSameMonth(date, currentMonth);
  const today = isToday(date);
  const past = isPast(date) && !today;
  const future = isFuture(date);

  const hasDoneWorkout = entry?.done && !entry?.isRestDay;
  const hasPlannedWorkout = entry && !entry.done && !entry.isRestDay && future;
  const isRestDay = entry?.isRestDay;
  const isStreakDay = entry?.streakDay && hasDoneWorkout;

  return (
    <button
      onClick={() => onSelect(date)}
      className={cn(
        'relative flex flex-col items-center justify-start pt-1.5 pb-1 rounded-xl transition-all duration-150 min-h-[56px] select-none',
        !inMonth && 'opacity-30',
        isSelected
          ? 'bg-teal-500 shadow-md shadow-teal-200'
          : today
          ? 'bg-teal-50 ring-2 ring-teal-400'
          : 'hover:bg-gray-50',
      )}
    >
      {/* Date number */}
      <span
        className={cn(
          'text-[13px] font-semibold leading-none w-6 h-6 flex items-center justify-center rounded-full',
          isSelected ? 'text-white' : today ? 'text-teal-600' : 'text-gray-700',
        )}
      >
        {format(date, 'd')}
      </span>

      {/* Indicators row */}
      <div className="flex items-center gap-0.5 mt-1">
        {/* Done workout dot */}
        {hasDoneWorkout && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isSelected ? 'bg-white' : 'bg-teal-500',
            )}
          />
        )}
        {/* Planned workout indicator */}
        {hasPlannedWorkout && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full border',
              isSelected ? 'border-white' : 'border-teal-400',
            )}
          />
        )}
        {/* Rest day */}
        {isRestDay && inMonth && (
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full',
              isSelected ? 'bg-white/50' : 'bg-gray-300',
            )}
          />
        )}
        {/* Streak flame */}
        {isStreakDay && (
          <Flame
            className={cn(
              'w-2.5 h-2.5',
              isSelected ? 'text-amber-200' : 'text-amber-500',
            )}
          />
        )}
      </div>

      {/* Past done: checkmark overlay */}
      {past && hasDoneWorkout && !isSelected && (
        <span className="absolute top-1 right-1">
          <Check className="w-2.5 h-2.5 text-emerald-500" strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

// ---------------------------------------------------------------------------
// Mood Picker
// ---------------------------------------------------------------------------

const MOOD_OPTIONS: MoodOption[] = ['😄', '🙂', '😐', '😩', '😴'];
const MOOD_LABELS: Record<MoodOption, string> = {
  '😄': 'Ótimo',
  '🙂': 'Bem',
  '😐': 'Ok',
  '😩': 'Cansado',
  '😴': 'Exausto',
};

interface MoodPickerProps {
  label: string;
  value: MoodOption | undefined;
  onChange: (v: MoodOption) => void;
}

function MoodPicker({ label, value, onChange }: MoodPickerProps) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 mb-1.5">{label}</p>
      <div className="flex gap-2">
        {MOOD_OPTIONS.map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            title={MOOD_LABELS[m]}
            className={cn(
              'w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all duration-150',
              value === m
                ? 'bg-teal-100 ring-2 ring-teal-400 scale-110'
                : 'bg-gray-50 hover:bg-gray-100 hover:scale-105',
            )}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Details Panel
// ---------------------------------------------------------------------------

interface DetailsPanelProps {
  selectedDate: Date | null;
  entry: WorkoutEntry | undefined;
  onSave: (date: string, updates: Partial<WorkoutEntry>) => void;
}

function DetailsPanel({ selectedDate, entry, onSave }: DetailsPanelProps) {
  const [mood, setMood] = useState<MoodOption | undefined>(entry?.mood);
  const [fatigue, setFatigue] = useState<MoodOption | undefined>(entry?.fatigue);
  const [notes, setNotes] = useState(entry?.notes ?? '');
  const [weight, setWeight] = useState(entry?.weight?.toString() ?? '');
  const [saved, setSaved] = useState(false);

  // Sync state when entry changes
  React.useEffect(() => {
    setMood(entry?.mood);
    setFatigue(entry?.fatigue);
    setNotes(entry?.notes ?? '');
    setWeight(entry?.weight?.toString() ?? '');
    setSaved(false);
  }, [entry]);

  if (!selectedDate) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center text-gray-400">
        <Dumbbell className="w-10 h-10 mb-3 opacity-30" />
        <p className="text-sm font-medium">Selecione um dia no calendário</p>
        <p className="text-xs mt-1">para ver os detalhes do treino</p>
      </div>
    );
  }

  const dateLabel = format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR });
  const isFutureDay = isFuture(selectedDate) && !isToday(selectedDate);
  const isPastDay = isPast(selectedDate) && !isToday(selectedDate);

  const handleSave = () => {
    if (!selectedDate) return;
    const key = format(selectedDate, 'yyyy-MM-dd');
    onSave(key, { mood, fatigue, notes, weight: weight ? parseFloat(weight) : undefined });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleMarkRest = () => {
    if (!selectedDate) return;
    const key = format(selectedDate, 'yyyy-MM-dd');
    onSave(key, { isRestDay: true, done: true });
  };

  const typeLabel: Record<string, string> = {
    strength: 'Musculação',
    cardio: 'Cardio',
    stretch: 'Mobilidade',
  };

  const typeBg: Record<string, string> = {
    strength: 'bg-teal-100 text-teal-700',
    cardio: 'bg-orange-100 text-orange-700',
    stretch: 'bg-violet-100 text-violet-700',
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-400 capitalize">{dateLabel}</p>
          {isToday(selectedDate) && (
            <span className="inline-block mt-0.5 text-[10px] font-bold bg-teal-500 text-white rounded-full px-2 py-0.5">
              Hoje
            </span>
          )}
        </div>
        {CURRENT_STREAK > 0 && isToday(selectedDate) && (
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <Flame className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-xs font-bold text-amber-600">{CURRENT_STREAK}° dia seguido!</span>
          </div>
        )}
      </div>

      {/* No entry */}
      {!entry && (
        <div className="bg-gray-50 rounded-xl p-4 text-center">
          <p className="text-sm text-gray-500">Nenhum treino registrado para este dia.</p>
          {!isFutureDay && (
            <button
              onClick={handleMarkRest}
              className="mt-3 text-xs font-semibold text-teal-600 hover:text-teal-700 underline underline-offset-2"
            >
              Marcar como dia de descanso
            </button>
          )}
        </div>
      )}

      {/* Rest day */}
      {entry?.isRestDay && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">✝️</span>
            <div>
              <p className="text-sm font-bold text-blue-700">Dia de Descanso</p>
              <p className="text-xs text-blue-500">Recuperação é parte do plano</p>
            </div>
          </div>
          {entry.devotional && (
            <p className="text-xs italic text-blue-600 mt-2 leading-relaxed border-l-2 border-blue-300 pl-3">
              {entry.devotional}
            </p>
          )}
        </div>
      )}

      {/* Workout info */}
      {entry && !entry.isRestDay && (
        <>
          {/* Status banner */}
          <div
            className={cn(
              'rounded-xl p-4',
              entry.done ? 'bg-emerald-50 border border-emerald-100' : 'bg-teal-50 border border-teal-100',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {entry.done ? (
                    <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-teal-400 flex-shrink-0" />
                  )}
                  <p className="text-sm font-bold text-gray-800 leading-tight">{entry.name}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', typeBg[entry.type] ?? 'bg-gray-100 text-gray-600')}>
                    {typeLabel[entry.type] ?? entry.type}
                  </span>
                  {entry.duration > 0 && (
                    <span className="text-[10px] font-medium text-gray-500 px-2 py-0.5 bg-gray-100 rounded-full">
                      {entry.duration} min
                    </span>
                  )}
                  {entry.volume && (
                    <span className="text-[10px] font-medium text-teal-600 px-2 py-0.5 bg-teal-50 rounded-full border border-teal-100">
                      {entry.volume.toLocaleString('pt-BR')} kg volume
                    </span>
                  )}
                </div>
              </div>
              {isFutureDay && !entry.done && (
                <button className="flex items-center gap-1 text-[11px] font-bold text-teal-600 bg-white border border-teal-200 rounded-lg px-2.5 py-1.5 hover:bg-teal-50 transition-colors shrink-0">
                  <Plus className="w-3 h-3" />
                  Iniciar
                </button>
              )}
            </div>
          </div>

          {/* Exercises */}
          {entry.exercises && entry.exercises.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
                Exercícios
              </p>
              <div className="space-y-1.5">
                {entry.exercises.map((ex, i) => (
                  <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-3 h-3 text-teal-400 flex-shrink-0" />
                      <span className="text-xs font-medium text-gray-700">{ex.name}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-mono">
                      {ex.sets}×{ex.reps} · {ex.weight} kg
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Devotional */}
          {entry.devotional && (
            <div className="border-l-2 border-amber-300 pl-3 py-1">
              <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wide mb-0.5">Devocional do dia</p>
              <p className="text-xs italic text-gray-600 leading-relaxed">{entry.devotional}</p>
            </div>
          )}
        </>
      )}

      {/* Log section — only for past/today, non-future days */}
      {!isFutureDay && (
        <>
          <div className="border-t border-gray-100 pt-4 space-y-4">
            {/* Mood / Fatigue */}
            <MoodPicker label="Como você se sentiu?" value={mood} onChange={setMood} />
            <MoodPicker label="Nível de fadiga" value={fatigue} onChange={setFatigue} />

            {/* Body weight */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Peso corporal (kg)</p>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Ex: 78.5"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-300"
              />
            </div>

            {/* Notes */}
            <div>
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Anotações</p>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Como foi o treino? Algum PR? Sensações..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-teal-400 placeholder-gray-300 resize-none"
              />
            </div>

            {/* Save */}
            <button
              onClick={handleSave}
              className={cn(
                'w-full py-2.5 rounded-xl text-sm font-bold transition-all duration-150',
                saved
                  ? 'bg-emerald-500 text-white'
                  : 'bg-teal-500 text-white hover:bg-teal-600 active:scale-98',
              )}
            >
              {saved ? '✓ Salvo!' : 'Salvar Registro'}
            </button>

            {/* Mark rest */}
            {entry && !entry.isRestDay && isPastDay && (
              <button
                onClick={handleMarkRest}
                className="w-full py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-gray-600 hover:bg-gray-50 border border-gray-100 transition-colors"
              >
                Marcar como dia de descanso
              </button>
            )}
          </div>
        </>
      )}

      {/* Streak motivational */}
      {CURRENT_STREAK >= 3 && isToday(selectedDate) && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-3 flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <p className="text-xs font-semibold text-amber-700">
            Você está no seu {CURRENT_STREAK}° dia consecutivo! 🔥 Continue assim!
          </p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Monthly Stats Bar
// ---------------------------------------------------------------------------

interface MonthStatsProps {
  month: Date;
  data: Record<string, WorkoutEntry>;
}

function MonthStats({ month, data }: MonthStatsProps) {
  const stats = useMemo(() => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const days = eachDayOfInterval({ start, end });

    let done = 0;
    let planned = 0;
    let totalVolume = 0;
    let longestStreak = 0;
    let currentStreakCount = 0;

    for (const d of days) {
      const key = format(d, 'yyyy-MM-dd');
      const entry = data[key];
      if (!entry || entry.isRestDay) {
        currentStreakCount = 0;
        continue;
      }
      if (entry.done) {
        done++;
        currentStreakCount++;
        longestStreak = Math.max(longestStreak, currentStreakCount);
        if (entry.volume) totalVolume += entry.volume;
      } else {
        currentStreakCount = 0;
        if (!isPast(d) || isToday(d)) planned++;
      }
    }

    return { done, planned, totalVolume, longestStreak };
  }, [month, data]);

  const monthLabel = format(month, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-4 capitalize">
        Resumo — {monthLabel}
      </p>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-teal-600">{stats.done}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Treinos realizados</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.planned}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">Planejados restantes</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-violet-600">
            {stats.totalVolume > 0 ? `${(stats.totalVolume / 1000).toFixed(1)}t` : '—'}
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">Volume total</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center gap-1">
            <p className="text-2xl font-bold text-amber-500">{stats.longestStreak}</p>
            <Flame className="w-5 h-5 text-amber-400 mb-0.5" />
          </div>
          <p className="text-[11px] text-gray-400 mt-0.5">Maior sequência</p>
        </div>
      </div>
      {/* Mini progress bar */}
      {stats.done + stats.planned > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-[10px] text-gray-400 mb-1">
            <span>{stats.done} de {stats.done + stats.planned} treinos</span>
            <span>{Math.round((stats.done / (stats.done + stats.planned)) * 100)}%</span>
          </div>
          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-400 to-teal-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((stats.done / (stats.done + stats.planned)) * 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

const WEEK_HEADERS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [calendarData, setCalendarData] = useState(MOCK_DATA);

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 0 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
    return eachDayOfInterval({ start: calStart, end: calEnd });
  }, [currentMonth]);

  const selectedEntry = useMemo(() => {
    if (!selectedDate) return undefined;
    return calendarData[format(selectedDate, 'yyyy-MM-dd')];
  }, [selectedDate, calendarData]);

  const goToPrevMonth = () => setCurrentMonth((m) => subMonths(m, 1));
  const goToNextMonth = () => setCurrentMonth((m) => addMonths(m, 1));
  const goToToday = () => {
    setCurrentMonth(new Date());
    setSelectedDate(new Date());
  };

  const handleSave = (date: string, updates: Partial<WorkoutEntry>) => {
    setCalendarData((prev) => ({
      ...prev,
      [date]: {
        ...prev[date],
        date,
        name: prev[date]?.name ?? 'Treino',
        type: prev[date]?.type ?? 'strength',
        done: prev[date]?.done ?? false,
        duration: prev[date]?.duration ?? 0,
        ...updates,
      },
    }));
  };

  const monthLabel = format(currentMonth, "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 pt-6 pb-24">

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-800">Calendário de Treinos</h1>
          <p className="text-sm text-gray-400 mt-0.5">Acompanhe sua jornada e registre como você se sentiu</p>
        </div>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">

          {/* ── LEFT: Calendar ─────────────────────────────────────────────── */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Month navigation header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                <button
                  onClick={goToPrevMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-3">
                  <h2 className="text-sm font-bold text-gray-800 capitalize">{monthLabel}</h2>
                  {!(isSameMonth(currentMonth, new Date())) && (
                    <button
                      onClick={goToToday}
                      className="text-[11px] font-bold text-teal-600 bg-teal-50 border border-teal-200 rounded-full px-2.5 py-0.5 hover:bg-teal-100 transition-colors"
                    >
                      Hoje
                    </button>
                  )}
                </div>

                <button
                  onClick={goToNextMonth}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Week headers */}
              <div className="grid grid-cols-7 px-3 pt-3 pb-1">
                {WEEK_HEADERS.map((h) => (
                  <div key={h} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wide py-1">
                    {h}
                  </div>
                ))}
              </div>

              {/* Day grid */}
              <div className="grid grid-cols-7 gap-1 px-3 pb-4">
                {calendarDays.map((day) => {
                  const key = format(day, 'yyyy-MM-dd');
                  return (
                    <DayCell
                      key={key}
                      date={day}
                      currentMonth={currentMonth}
                      entry={calendarData[key]}
                      isSelected={selectedDate ? isSameDay(day, selectedDate) : false}
                      onSelect={setSelectedDate}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 px-5 py-3 border-t border-gray-50 bg-gray-50/60">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-teal-500" />
                  <span className="text-[10px] text-gray-500">Treino feito</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full border border-teal-400" />
                  <span className="text-[10px] text-gray-500">Planejado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-300" />
                  <span className="text-[10px] text-gray-500">Descanso</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Flame className="w-3 h-3 text-amber-500" />
                  <span className="text-[10px] text-gray-500">Sequência</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3 h-3 text-emerald-500" strokeWidth={3} />
                  <span className="text-[10px] text-gray-500">Concluído</span>
                </div>
              </div>
            </div>

            {/* Monthly stats */}
            <MonthStats month={currentMonth} data={calendarData} />
          </div>

          {/* ── RIGHT: Details panel ───────────────────────────────────────── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 lg:sticky lg:top-6">
            <DetailsPanel
              selectedDate={selectedDate}
              entry={selectedEntry}
              onSave={handleSave}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
