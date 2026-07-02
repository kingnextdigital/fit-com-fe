import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Play,
  Pause,
  SkipForward,
  Check,
  Plus,
  Minus,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Button from '@/components/ui/Button';
import { ProgressBar, ProgressRing } from '@/components/ui/Progress';
import { useAppStore } from '@/store/appStore';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ExerciseSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
}

interface Exercise {
  id: string;
  name: string;
  muscleGroups: string[];
  restSeconds: number;
  previousWeight: number;
  previousReps: number;
  sets: ExerciseSet[];
  icon: string;
}

// ─── Mock Workout Plan ─────────────────────────────────────────────────────────

const MOCK_WORKOUT: { name: string; exercises: Exercise[] } = {
  name: 'Treino A — Peito e Tríceps',
  exercises: [
    {
      id: 'bench-press',
      name: 'Supino Reto com Barra',
      muscleGroups: ['Peito', 'Tríceps', 'Ombros'],
      restSeconds: 90,
      previousWeight: 60,
      previousReps: 10,
      icon: '🏋️',
      sets: [
        { setNumber: 1, weight: 60, reps: 10, completed: false },
        { setNumber: 2, weight: 60, reps: 10, completed: false },
        { setNumber: 3, weight: 60, reps: 8, completed: false },
        { setNumber: 4, weight: 55, reps: 8, completed: false },
      ],
    },
    {
      id: 'incline-db',
      name: 'Supino Inclinado com Halteres',
      muscleGroups: ['Peito Superior', 'Tríceps'],
      restSeconds: 75,
      previousWeight: 20,
      previousReps: 12,
      icon: '💪',
      sets: [
        { setNumber: 1, weight: 20, reps: 12, completed: false },
        { setNumber: 2, weight: 20, reps: 10, completed: false },
        { setNumber: 3, weight: 18, reps: 10, completed: false },
      ],
    },
    {
      id: 'tricep-pushdown',
      name: 'Tríceps Pulley',
      muscleGroups: ['Tríceps'],
      restSeconds: 60,
      previousWeight: 25,
      previousReps: 15,
      icon: '🔻',
      sets: [
        { setNumber: 1, weight: 25, reps: 15, completed: false },
        { setNumber: 2, weight: 25, reps: 12, completed: false },
        { setNumber: 3, weight: 27, reps: 10, completed: false },
      ],
    },
    {
      id: 'chest-fly',
      name: 'Crucifixo na Máquina',
      muscleGroups: ['Peito', 'Bíceps'],
      restSeconds: 60,
      previousWeight: 35,
      previousReps: 12,
      icon: '🦅',
      sets: [
        { setNumber: 1, weight: 35, reps: 12, completed: false },
        { setNumber: 2, weight: 35, reps: 12, completed: false },
        { setNumber: 3, weight: 37, reps: 10, completed: false },
      ],
    },
  ],
};

// ─── Helpers ───────────────────────────────────────────────────────────────────

function formatTimer(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [
    String(h).padStart(2, '0'),
    String(m).padStart(2, '0'),
    String(s).padStart(2, '0'),
  ].join(':');
}

// ─── Sub-components ────────────────────────────────────────────────────────────

function MuscleTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-500/20 text-teal-300 border border-teal-500/30">
      {label}
    </span>
  );
}

function NumberStepper({
  value,
  onChange,
  min = 0,
  step = 1,
  suffix = '',
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => onChange(Math.max(min, value - step))}
        className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 active:scale-95 flex items-center justify-center text-white transition-all touch-manipulation"
        aria-label={`Diminuir ${suffix}`}
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-16 text-center text-white font-semibold text-base tabular-nums">
        {value}{suffix}
      </span>
      <button
        onClick={() => onChange(value + step)}
        className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 active:scale-95 flex items-center justify-center text-white transition-all touch-manipulation"
        aria-label={`Aumentar ${suffix}`}
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

// ─── Rest Timer Overlay ────────────────────────────────────────────────────────

function RestTimerOverlay({
  initialSeconds,
  onDone,
}: {
  initialSeconds: number;
  onDone: () => void;
}) {
  const [remaining, setRemaining] = useState(initialSeconds);
  const [running, setRunning] = useState(true);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const tick = useCallback(() => {
    setRemaining((prev) => {
      if (prev <= 1) {
        clearInterval(intervalRef.current!);
        onDone();
        return 0;
      }
      return prev - 1;
    });
  }, [onDone]);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(tick, 1000);
    } else {
      clearInterval(intervalRef.current!);
    }
    return () => clearInterval(intervalRef.current!);
  }, [running, tick]);

  const progress = ((initialSeconds - remaining) / initialSeconds) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-6 p-8 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl w-80 max-w-[90vw]">
        <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">
          Descanso
        </p>

        {/* Circular countdown */}
        <div className="relative">
          <ProgressRing
            value={progress}
            size={180}
            strokeWidth={10}
            color="teal"
            animated
            label={
              <div className="flex flex-col items-center">
                <span className="text-5xl font-bold text-white tabular-nums leading-none">
                  {remaining}
                </span>
                <span className="text-slate-400 text-xs mt-1">segundos</span>
              </div>
            }
          />
        </div>

        {/* Controls */}
        <div className="flex gap-3 w-full">
          <button
            onClick={() => setRemaining((r) => r + 15)}
            className="flex-1 h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white text-sm font-semibold transition-all active:scale-95 touch-manipulation"
          >
            +15s
          </button>
          <button
            onClick={() => setRunning((r) => !r)}
            className="w-12 h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 active:bg-slate-800 text-white flex items-center justify-center transition-all active:scale-95 touch-manipulation"
            aria-label={running ? 'Pausar' : 'Retomar'}
          >
            {running ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </button>
          <button
            onClick={onDone}
            className="flex-1 h-12 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white text-sm font-semibold transition-all active:scale-95 flex items-center justify-center gap-1.5 touch-manipulation"
          >
            <SkipForward className="w-4 h-4" />
            Pular
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Confirm Exit Modal ────────────────────────────────────────────────────────

function ConfirmExitModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-5 p-7 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl w-80 max-w-[90vw]">
        <div className="w-14 h-14 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center">
          <X className="w-7 h-7 text-red-400" />
        </div>
        <div className="text-center">
          <h3 className="text-white font-bold text-lg">Finalizar treino?</h3>
          <p className="text-slate-400 text-sm mt-1">
            O progresso atual não será salvo.
          </p>
        </div>
        <div className="flex gap-3 w-full">
          <button
            onClick={onCancel}
            className="flex-1 h-12 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-semibold text-sm transition-all active:scale-95 touch-manipulation"
          >
            Continuar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 h-12 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-semibold text-sm transition-all active:scale-95 touch-manipulation"
          >
            Sair
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Complete Workout Modal ────────────────────────────────────────────────────

function CompleteWorkoutModal({
  durationSeconds,
  totalVolume,
  onSave,
}: {
  durationSeconds: number;
  totalVolume: number;
  onSave: (notes: string) => void;
}) {
  const [notes, setNotes] = useState('');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm overflow-y-auto py-8">
      <div className="flex flex-col items-center gap-6 p-7 rounded-3xl bg-slate-900 border border-slate-700 shadow-2xl w-full max-w-sm mx-4">
        {/* Celebration */}
        <div className="text-center">
          <div className="text-6xl mb-3">🎉</div>
          <h2 className="text-2xl font-bold text-white">Treino Concluído!</h2>
          <p className="text-slate-400 text-sm mt-1">
            "Tudo posso naquele que me fortalece." — Filipenses 4:13
          </p>
        </div>

        {/* Stats */}
        <div className="w-full grid grid-cols-2 gap-3">
          <div className="bg-slate-800 rounded-2xl p-4 flex flex-col items-center gap-1">
            <Clock className="w-5 h-5 text-teal-400" />
            <span className="text-xl font-bold text-white tabular-nums">
              {formatTimer(durationSeconds)}
            </span>
            <span className="text-xs text-slate-400">Duração</span>
          </div>
          <div className="bg-slate-800 rounded-2xl p-4 flex flex-col items-center gap-1">
            <Zap className="w-5 h-5 text-yellow-400" />
            <span className="text-xl font-bold text-white tabular-nums">
              {totalVolume.toLocaleString('pt-BR')} kg
            </span>
            <span className="text-xs text-slate-400">Volume Total</span>
          </div>
        </div>

        {/* Notes */}
        <div className="w-full">
          <label className="block text-slate-400 text-xs font-medium mb-2 uppercase tracking-wider">
            Observações (opcional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Como foi o treino? Alguma PR? Dor? Energia?"
            rows={3}
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-teal-500 resize-none transition-colors"
          />
        </div>

        {/* Save button */}
        <button
          onClick={() => onSave(notes)}
          className="w-full h-14 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2 touch-manipulation"
        >
          <Check className="w-6 h-6" />
          Salvar Treino
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function WorkoutModePage() {
  const { endWorkout } = useAppStore();

  // Workout session state
  const [exercises, setExercises] = useState<Exercise[]>(MOCK_WORKOUT.exercises);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);

  // Global session timer
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [sessionRunning, setSessionRunning] = useState(true);
  const sessionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // UI state
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [restSeconds, setRestSeconds] = useState(90);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Session timer effect
  useEffect(() => {
    if (sessionRunning) {
      sessionIntervalRef.current = setInterval(() => {
        setSessionSeconds((s) => s + 1);
      }, 1000);
    } else {
      clearInterval(sessionIntervalRef.current!);
    }
    return () => clearInterval(sessionIntervalRef.current!);
  }, [sessionRunning]);

  // Derived
  const currentExercise = exercises[currentExerciseIndex];
  const totalExercises = exercises.length;

  const totalCompletedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0,
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  const totalVolume = exercises.reduce(
    (acc, ex) =>
      acc +
      ex.sets
        .filter((s) => s.completed)
        .reduce((a, s) => a + s.weight * s.reps, 0),
    0,
  );

  const allDone =
    exercises.every((ex) => ex.sets.every((s) => s.completed));

  // Handlers
  const updateSet = useCallback(
    (setIndex: number, field: 'weight' | 'reps', value: number) => {
      setExercises((prev) => {
        const next = [...prev];
        const ex = { ...next[currentExerciseIndex] };
        const sets = ex.sets.map((s, i) =>
          i === setIndex ? { ...s, [field]: Math.max(0, value) } : s,
        );
        ex.sets = sets;
        next[currentExerciseIndex] = ex;
        return next;
      });
    },
    [currentExerciseIndex],
  );

  const toggleSetComplete = useCallback(
    (setIndex: number) => {
      setExercises((prev) => {
        const next = [...prev];
        const ex = { ...next[currentExerciseIndex] };
        const wasCompleted = ex.sets[setIndex].completed;
        const sets = ex.sets.map((s, i) =>
          i === setIndex ? { ...s, completed: !s.completed } : s,
        );
        ex.sets = sets;
        next[currentExerciseIndex] = ex;

        // If just completed a set, show rest timer
        if (!wasCompleted) {
          setRestSeconds(ex.restSeconds);
          setShowRestTimer(true);
        }

        return next;
      });
    },
    [currentExerciseIndex],
  );

  const handleRestDone = useCallback(() => {
    setShowRestTimer(false);
    // Auto-advance if all sets done and not last exercise
    const ex = exercises[currentExerciseIndex];
    if (ex.sets.every((s) => s.completed) && currentExerciseIndex < totalExercises - 1) {
      setCurrentExerciseIndex((i) => i + 1);
    }
    if (allDone) {
      setSessionRunning(false);
      setShowCompleteModal(true);
    }
  }, [exercises, currentExerciseIndex, totalExercises, allDone]);

  const handleSaveWorkout = useCallback(
    (_notes: string) => {
      setShowCompleteModal(false);
      endWorkout();
    },
    [endWorkout],
  );

  const handleExit = useCallback(() => {
    setSessionRunning(false);
    endWorkout();
  }, [endWorkout]);

  // Exercise thumbnail completion
  const isExerciseComplete = (ex: Exercise) => ex.sets.every((s) => s.completed);
  const isExerciseStarted = (ex: Exercise) => ex.sets.some((s) => s.completed);

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col overflow-hidden select-none">
      {/* ── Modals ── */}
      {showExitModal && (
        <ConfirmExitModal
          onConfirm={handleExit}
          onCancel={() => setShowExitModal(false)}
        />
      )}
      {showRestTimer && (
        <RestTimerOverlay initialSeconds={restSeconds} onDone={handleRestDone} />
      )}
      {showCompleteModal && (
        <CompleteWorkoutModal
          durationSeconds={sessionSeconds}
          totalVolume={totalVolume}
          onSave={handleSaveWorkout}
        />
      )}

      {/* ── Top Bar ── */}
      <div className="flex-none flex items-center gap-3 px-4 pt-safe-top pb-3 pt-4 bg-slate-900 border-b border-slate-800 shadow-lg">
        {/* Back / exit */}
        <button
          onClick={() => setShowExitModal(true)}
          className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 flex items-center justify-center text-slate-400 transition-all active:scale-95 touch-manipulation shrink-0"
          aria-label="Finalizar treino"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Workout name */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-sm truncate">{MOCK_WORKOUT.name}</p>
          <p className="text-slate-500 text-xs">{totalCompletedSets}/{totalSets} séries concluídas</p>
        </div>

        {/* Session timer */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-xl px-3 py-2 shrink-0">
          <button
            onClick={() => setSessionRunning((r) => !r)}
            className="text-teal-400 active:scale-90 transition-transform"
            aria-label={sessionRunning ? 'Pausar timer' : 'Retomar timer'}
          >
            {sessionRunning ? (
              <Pause className="w-3.5 h-3.5" />
            ) : (
              <Play className="w-3.5 h-3.5" />
            )}
          </button>
          <span className="text-white font-mono text-sm tabular-nums font-semibold">
            {formatTimer(sessionSeconds)}
          </span>
        </div>
      </div>

      {/* ── Overall progress bar ── */}
      <div className="flex-none px-4 pt-3 pb-1">
        <ProgressBar
          value={totalCompletedSets}
          max={totalSets}
          color="teal"
          animated
          size="sm"
        />
      </div>

      {/* ── Scrollable main content ── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="px-4 py-4 space-y-4 pb-6">

          {/* ── Current Exercise Panel ── */}
          <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
            {/* Exercise header */}
            <div className="p-5 pb-4">
              <div className="flex items-start gap-4">
                {/* Icon / illustration placeholder */}
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-600/30 to-teal-900/60 border border-teal-500/20 flex items-center justify-center text-4xl shrink-0 shadow-inner">
                  {currentExercise.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-slate-400 text-xs font-semibold uppercase tracking-widest mb-1">
                    Exercício {currentExerciseIndex + 1} de {totalExercises}
                  </p>
                  <h1 className="text-white text-2xl font-bold leading-tight">
                    {currentExercise.name}
                  </h1>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {currentExercise.muscleGroups.map((m) => (
                      <MuscleTag key={m} label={m} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Previous session reference */}
            <div className="mx-5 mb-4 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-slate-500 text-xs">
                Sessão anterior:{' '}
                <span className="text-slate-400 font-medium">
                  {currentExercise.previousWeight} kg × {currentExercise.previousReps} reps
                </span>
              </span>
            </div>

            {/* Sets table */}
            <div className="px-5 pb-5 space-y-2">
              {/* Header row */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <span className="w-6 text-xs text-slate-600 font-medium text-center">#</span>
                <span className="flex-1 text-xs text-slate-500 font-medium text-center">Peso (kg)</span>
                <span className="flex-1 text-xs text-slate-500 font-medium text-center">Reps</span>
                <span className="w-10 text-xs text-slate-500 font-medium text-center">OK</span>
              </div>

              {currentExercise.sets.map((set, idx) => (
                <div
                  key={set.setNumber}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-2xl border transition-all duration-300',
                    set.completed
                      ? 'bg-emerald-900/30 border-emerald-500/30'
                      : 'bg-slate-800 border-slate-700',
                  )}
                >
                  {/* Set number */}
                  <span
                    className={cn(
                      'w-6 text-sm font-bold text-center shrink-0',
                      set.completed ? 'text-emerald-400' : 'text-slate-400',
                    )}
                  >
                    {set.setNumber}
                  </span>

                  {/* Weight stepper */}
                  <div className="flex-1 flex justify-center">
                    <NumberStepper
                      value={set.weight}
                      onChange={(v) => updateSet(idx, 'weight', v)}
                      step={2.5}
                      suffix=" kg"
                    />
                  </div>

                  {/* Reps stepper */}
                  <div className="flex-1 flex justify-center">
                    <NumberStepper
                      value={set.reps}
                      onChange={(v) => updateSet(idx, 'reps', v)}
                      min={1}
                      suffix=" rep"
                    />
                  </div>

                  {/* Complete toggle */}
                  <button
                    onClick={() => toggleSetComplete(idx)}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-90 touch-manipulation shrink-0',
                      set.completed
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40'
                        : 'bg-slate-700 text-slate-500 border border-slate-600',
                    )}
                    aria-label={set.completed ? 'Desmarcar série' : 'Concluir série'}
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── Rest time indicator ── */}
          <div className="flex items-center gap-2 px-1">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="text-slate-500 text-sm">
              Descanso entre séries:{' '}
              <span className="text-slate-300 font-semibold">{currentExercise.restSeconds}s</span>
            </span>
          </div>

          {/* ── Volume tracker ── */}
          {totalVolume > 0 && (
            <div className="flex items-center gap-2 bg-slate-900 rounded-2xl border border-slate-800 px-4 py-3">
              <Zap className="w-4 h-4 text-yellow-400 shrink-0" />
              <div>
                <p className="text-slate-400 text-xs">Volume acumulado</p>
                <p className="text-white font-bold text-sm">
                  {totalVolume.toLocaleString('pt-BR')} kg
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Bottom Bar ── */}
      <div className="flex-none bg-slate-900 border-t border-slate-800 px-4 py-4 space-y-3 pb-safe-bottom">
        {/* Exercise thumbnails */}
        <div className="flex gap-2 justify-center">
          {exercises.map((ex, idx) => (
            <button
              key={ex.id}
              onClick={() => setCurrentExerciseIndex(idx)}
              className={cn(
                'flex flex-col items-center gap-1 transition-all active:scale-90 touch-manipulation',
              )}
              aria-label={`Ir para ${ex.name}`}
            >
              <div
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center text-xl border-2 transition-all',
                  idx === currentExerciseIndex
                    ? 'border-teal-400 bg-teal-500/20 shadow-lg shadow-teal-500/20'
                    : isExerciseComplete(ex)
                    ? 'border-emerald-500/60 bg-emerald-900/30'
                    : isExerciseStarted(ex)
                    ? 'border-yellow-500/40 bg-yellow-900/20'
                    : 'border-slate-700 bg-slate-800',
                )}
              >
                {isExerciseComplete(ex) ? (
                  <Check className="w-5 h-5 text-emerald-400" />
                ) : (
                  <span>{ex.icon}</span>
                )}
              </div>
              <span
                className={cn(
                  'text-[9px] font-medium max-w-[48px] text-center leading-tight truncate',
                  idx === currentExerciseIndex ? 'text-teal-400' : 'text-slate-500',
                )}
              >
                {ex.name.split(' ').slice(0, 2).join(' ')}
              </span>
            </button>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentExerciseIndex((i) => Math.max(0, i - 1))}
            disabled={currentExerciseIndex === 0}
            className={cn(
              'flex items-center gap-1.5 h-12 px-4 rounded-2xl font-semibold text-sm transition-all active:scale-95 touch-manipulation',
              currentExerciseIndex === 0
                ? 'bg-slate-800 text-slate-600 pointer-events-none'
                : 'bg-slate-700 text-white hover:bg-slate-600',
            )}
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <div className="flex-1 text-center">
            <p className="text-slate-400 text-xs font-medium">
              Exercício {currentExerciseIndex + 1} de {totalExercises}
            </p>
          </div>

          {currentExerciseIndex < totalExercises - 1 ? (
            <button
              onClick={() => setCurrentExerciseIndex((i) => Math.min(totalExercises - 1, i + 1))}
              className="flex items-center gap-1.5 h-12 px-4 rounded-2xl bg-teal-600 hover:bg-teal-500 active:bg-teal-700 text-white font-semibold text-sm transition-all active:scale-95 touch-manipulation"
            >
              Próximo
              <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                setSessionRunning(false);
                setShowCompleteModal(true);
              }}
              className="flex items-center gap-1.5 h-12 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-bold text-sm transition-all active:scale-95 touch-manipulation"
            >
              <Check className="w-5 h-5" />
              Concluir
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
