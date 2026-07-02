import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronRight, Play, Info, Dumbbell, X, CheckCircle } from 'lucide-react';
import { exercises } from '@/data/exercises';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import type { Exercise } from '@/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

const MUSCLE_GROUPS = [
  'Peito',
  'Costas',
  'Ombros',
  'Bíceps',
  'Tríceps',
  'Pernas',
  'Glúteos',
  'Abdômen',
  'Panturrilha',
];

const EQUIPMENT_OPTIONS = [
  'Livre',
  'Máquina',
  'Halteres',
  'Barra',
  'Elástico',
  'Peso Corporal',
];

const DIFFICULTY_OPTIONS = ['Iniciante', 'Intermediário', 'Avançado'];

// Map display names to data values used in exercises.ts
const DIFFICULTY_MAP: Record<string, string> = {
  Iniciante: 'beginner',
  Intermediário: 'intermediate',
  Avançado: 'advanced',
};

// Maps muscle group pill labels to substrings that appear in muscle_groups arrays
const MUSCLE_MATCH_MAP: Record<string, string[]> = {
  Peito: ['Peitoral', 'Peito'],
  Costas: ['Dorso', 'Latíssimo', 'Lombar', 'Rombóide', 'Trapézio', 'Costas'],
  Ombros: ['Deltóide', 'Ombro', 'Manguito', 'Levantador'],
  Bíceps: ['Bíceps', 'Biceps'],
  Tríceps: ['Tríceps', 'Triceps'],
  Pernas: ['Quadríceps', 'Isquiotibiais', 'Gastrocnêmio', 'Sóleo', 'Posterior', 'Perna'],
  Glúteos: ['Glúteo', 'Gluteo'],
  Abdômen: ['Core', 'Abdômen', 'Serrátil'],
  Panturrilha: ['Panturrilha', 'Gastrocnêmio', 'Sóleo'],
};

const EQUIPMENT_MATCH_MAP: Record<string, string[]> = {
  Livre: ['livre', 'barra livre', 'kettlebell'],
  Máquina: ['máquina', 'polia', 'cabo', 'lat pulldown', 'peck deck', 'leg press', 'hack squat', 'extensora', 'cadeira flexora', 'mesa flexora'],
  Halteres: ['halter', 'halteres'],
  Barra: ['barra', 'barra reta', 'barra ez', 'barra fixa'],
  Elástico: ['elástico', 'band'],
  'Peso Corporal': ['peso corporal', 'barras paralelas', 'barra fixa', 'degrau'],
};

function matchesMuscleGroup(exercise: Exercise, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const musclesLower = exercise.muscle_groups.map((m) => m.toLowerCase());
  const categoryLower = exercise.category.toLowerCase();

  return selected.some((group) => {
    const keywords = MUSCLE_MATCH_MAP[group] ?? [group];
    return keywords.some((kw) => {
      const kwLower = kw.toLowerCase();
      return (
        musclesLower.some((m) => m.includes(kwLower)) ||
        categoryLower.includes(kwLower)
      );
    });
  });
}

function matchesEquipment(exercise: Exercise, selected: string[]): boolean {
  if (selected.length === 0) return true;
  const equipmentLower = exercise.equipment.toLowerCase();
  return selected.some((opt) => {
    const keywords = EQUIPMENT_MATCH_MAP[opt] ?? [opt.toLowerCase()];
    return keywords.some((kw) => equipmentLower.includes(kw.toLowerCase()));
  });
}

function matchesDifficulty(exercise: Exercise, selected: string[]): boolean {
  if (selected.length === 0) return true;
  return selected.some((d) => exercise.difficulty === DIFFICULTY_MAP[d]);
}

function getDifficultyLabel(difficulty: Exercise['difficulty']): string {
  const map: Record<string, string> = {
    iniciante: 'Iniciante',
    intermediário: 'Intermediário',
    avançado: 'Avançado',
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };
  return map[difficulty] ?? difficulty;
}

function getDifficultyBadgeVariant(
  difficulty: Exercise['difficulty'],
): 'green' | 'gold' | 'red' {
  if (difficulty === 'beginner') return 'green';
  if (difficulty === 'intermediate') return 'gold';
  return 'red';
}

// ---------------------------------------------------------------------------
// FilterPill
// ---------------------------------------------------------------------------

interface FilterPillProps {
  label: string;
  active: boolean;
  onClick: () => void;
}

function FilterPill({ label, active, onClick }: FilterPillProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-150 whitespace-nowrap',
        active
          ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
          : 'bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600',
      )}
    >
      {label}
    </button>
  );
}

// ---------------------------------------------------------------------------
// ExerciseCard
// ---------------------------------------------------------------------------

interface ExerciseCardProps {
  exercise: Exercise;
  onOpen: (exercise: Exercise) => void;
}

function ExerciseCard({ exercise, onOpen }: ExerciseCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden cursor-pointer group transition-all duration-200 hover:shadow-md hover:-translate-y-0.5"
      onClick={() => onOpen(exercise)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen(exercise)}
      role="button"
      aria-label={`Ver detalhes de ${exercise.name}`}
    >
      {/* Image placeholder */}
      <div className="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        <Dumbbell size={40} className="text-gray-300" />

        {/* Hover overlay */}
        <div
          className={cn(
            'absolute inset-0 bg-teal-700/80 flex items-center justify-center transition-opacity duration-200',
            hovered ? 'opacity-100' : 'opacity-0',
          )}
        >
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Info size={16} />
            Ver Detalhes
          </div>
        </div>

        {/* Difficulty badge — top right */}
        <div className="absolute top-2 right-2">
          <span
            className={cn(
              'px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide',
              exercise.difficulty === 'beginner'
                ? 'bg-emerald-100 text-emerald-700'
                : exercise.difficulty === 'intermediate'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700',
            )}
          >
            {getDifficultyLabel(exercise.difficulty)}
          </span>
        </div>

        {/* Category — top left */}
        <div className="absolute top-2 left-2">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 text-gray-600 border border-gray-200">
            {exercise.category}
          </span>
        </div>
      </div>

      {/* Card body */}
      <div className="p-4">
        {/* Muscle group tags */}
        <div className="flex flex-wrap gap-1 mb-2">
          {exercise.muscle_groups.slice(0, 3).map((mg) => (
            <span
              key={mg}
              className="px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 text-[10px] font-medium border border-teal-100"
            >
              {mg}
            </span>
          ))}
          {exercise.muscle_groups.length > 3 && (
            <span className="px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 text-[10px] font-medium border border-gray-100">
              +{exercise.muscle_groups.length - 3}
            </span>
          )}
        </div>

        {/* Name */}
        <h3 className="text-sm font-semibold text-gray-800 leading-snug mb-2 group-hover:text-teal-700 transition-colors">
          {exercise.name}
        </h3>

        {/* Equipment */}
        <p className="text-xs text-gray-400 truncate">{exercise.equipment}</p>

        {/* Footer link */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-teal-600 font-semibold group-hover:underline">
            Ver detalhes
          </span>
          <ChevronRight size={14} className="text-gray-300 group-hover:text-teal-500 transition-colors" />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ExerciseDetailModal
// ---------------------------------------------------------------------------

type ModalTab = 'como-fazer' | 'erros-comuns' | 'alternativas';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  onClose: () => void;
}

function ExerciseDetailModal({ exercise, onClose }: ExerciseDetailModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('como-fazer');

  if (!exercise) return null;

  const tabs: { id: ModalTab; label: string }[] = [
    { id: 'como-fazer', label: 'Como Fazer' },
    { id: 'erros-comuns', label: 'Erros Comuns' },
    { id: 'alternativas', label: 'Alternativas' },
  ];

  return (
    <Modal
      open={!!exercise}
      onClose={onClose}
      title={exercise.name}
      subtitle={exercise.muscle_groups.join(' · ')}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span
            className={cn(
              'px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide',
              exercise.difficulty === 'beginner'
                ? 'bg-emerald-100 text-emerald-700'
                : exercise.difficulty === 'intermediate'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700',
            )}
          >
            {getDifficultyLabel(exercise.difficulty)}
          </span>
          <button
            type="button"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
            onClick={onClose}
          >
            <Play size={14} />
            Adicionar ao Treino
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Image placeholder */}
        <div className="h-32 bg-gray-100 rounded-xl flex items-center justify-center">
          <Dumbbell size={36} className="text-gray-300" />
        </div>

        {/* Equipment + Category pills */}
        <div className="flex flex-wrap gap-2">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200">
            {exercise.equipment}
          </span>
          <span className="px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-medium border border-teal-100">
            {exercise.category}
          </span>
          {exercise.muscle_groups.slice(0, 4).map((mg) => (
            <span
              key={mg}
              className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100"
            >
              {mg}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-4 py-2.5 text-sm font-semibold border-b-2 transition-colors duration-150 -mb-px',
                activeTab === tab.id
                  ? 'border-teal-600 text-teal-700'
                  : 'border-transparent text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'como-fazer' && (
          <div className="space-y-4">
            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Descrição
              </h4>
              <p className="text-sm text-gray-700 leading-relaxed">{exercise.description}</p>
            </div>

            {/* Tips */}
            {exercise.tips.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Dicas de Execução
                </h4>
                <ul className="space-y-2">
                  {exercise.tips.map((tip, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-700">
                      <CheckCircle size={15} className="text-teal-500 flex-shrink-0 mt-0.5" />
                      <span className="leading-relaxed">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Breathing */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <h4 className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <span>Respiração</span>
              </h4>
              <p className="text-sm text-blue-800 leading-relaxed">{exercise.breathing}</p>
            </div>

            {/* Sets / Reps recommendation */}
            <div className="bg-teal-50 rounded-xl p-4 border border-teal-100">
              <h4 className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-2">
                Recomendação de Séries e Repetições
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-lg font-bold text-teal-700">3–4</p>
                  <p className="text-xs text-teal-600">Séries</p>
                </div>
                <div className="text-center border-x border-teal-200">
                  <p className="text-lg font-bold text-teal-700">8–12</p>
                  <p className="text-xs text-teal-600">Repetições</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-bold text-teal-700">60–90s</p>
                  <p className="text-xs text-teal-600">Descanso</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'erros-comuns' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Evite estes erros para maximizar resultados e prevenir lesões:
            </p>
            {exercise.common_errors.length > 0 ? (
              <ul className="space-y-3">
                {exercise.common_errors.map((error, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-100"
                  >
                    <X size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-red-800 leading-relaxed">{error}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nenhum erro listado para este exercício.</p>
            )}
          </div>
        )}

        {activeTab === 'alternativas' && (
          <div className="space-y-3">
            <p className="text-xs text-gray-500 leading-relaxed">
              Exercícios similares que podem substituir este movimento:
            </p>
            {exercise.alternatives.length > 0 ? (
              <ul className="space-y-2">
                {exercise.alternatives.map((alt, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100 hover:border-teal-200 hover:bg-teal-50 transition-colors cursor-pointer group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 group-hover:border-teal-200">
                      <Dumbbell size={14} className="text-gray-400 group-hover:text-teal-500" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-teal-700 flex-1">
                      {alt}
                    </span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-teal-500" />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Nenhuma alternativa listada para este exercício.</p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// ExercisesPage
// ---------------------------------------------------------------------------

export default function ExercisesPage() {
  const [search, setSearch] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const hasActiveFilters =
    selectedMuscles.length > 0 ||
    selectedEquipment.length > 0 ||
    selectedDifficulty.length > 0;

  function toggleItem<T extends string>(
    list: T[],
    setList: React.Dispatch<React.SetStateAction<T[]>>,
    item: T,
  ) {
    setList((prev) =>
      prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item],
    );
  }

  function clearFilters() {
    setSelectedMuscles([]);
    setSelectedEquipment([]);
    setSelectedDifficulty([]);
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return exercises.filter((ex) => {
      // Search filter
      if (q) {
        const haystack = [
          ex.name,
          ex.category,
          ex.equipment,
          ...ex.muscle_groups,
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }

      // Muscle group filter
      if (!matchesMuscleGroup(ex, selectedMuscles)) return false;

      // Equipment filter
      if (!matchesEquipment(ex, selectedEquipment)) return false;

      // Difficulty filter
      if (!matchesDifficulty(ex, selectedDifficulty)) return false;

      return true;
    });
  }, [search, selectedMuscles, selectedEquipment, selectedDifficulty]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ------------------------------------------------------------------ */}
      {/* Header                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          {/* Title row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Exercícios</h1>
              <p className="text-xs text-gray-400 mt-0.5">Biblioteca completa de movimentos</p>
            </div>
            <button
              type="button"
              onClick={() => setFiltersOpen((v) => !v)}
              className={cn(
                'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150',
                filtersOpen || hasActiveFilters
                  ? 'bg-teal-600 border-teal-600 text-white shadow-sm'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-teal-400 hover:text-teal-600',
              )}
            >
              <Filter size={15} />
              Filtros
              {hasActiveFilters && (
                <span className="ml-0.5 px-1.5 py-0.5 rounded-full bg-white/30 text-[10px] font-bold text-white leading-none">
                  {selectedMuscles.length + selectedEquipment.length + selectedDifficulty.length}
                </span>
              )}
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar exercício, músculo ou equipamento..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Filter panel (collapsible)                                          */}
      {/* ------------------------------------------------------------------ */}
      {filtersOpen && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4 space-y-4">
            {/* Muscle group */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Grupo Muscular
              </p>
              <div className="flex flex-wrap gap-2">
                {MUSCLE_GROUPS.map((mg) => (
                  <FilterPill
                    key={mg}
                    label={mg}
                    active={selectedMuscles.includes(mg)}
                    onClick={() => toggleItem(selectedMuscles, setSelectedMuscles, mg)}
                  />
                ))}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Equipamento
              </p>
              <div className="flex flex-wrap gap-2">
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <FilterPill
                    key={eq}
                    label={eq}
                    active={selectedEquipment.includes(eq)}
                    onClick={() => toggleItem(selectedEquipment, setSelectedEquipment, eq)}
                  />
                ))}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Dificuldade
              </p>
              <div className="flex flex-wrap gap-2">
                {DIFFICULTY_OPTIONS.map((d) => (
                  <FilterPill
                    key={d}
                    label={d}
                    active={selectedDifficulty.includes(d)}
                    onClick={() => toggleItem(selectedDifficulty, setSelectedDifficulty, d)}
                  />
                ))}
              </div>
            </div>

            {/* Clear filters */}
            {hasActiveFilters && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="flex items-center gap-1.5 text-xs font-semibold text-red-500 hover:text-red-700 transition-colors"
                >
                  <X size={13} />
                  Limpar filtros
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Main content                                                        */}
      {/* ------------------------------------------------------------------ */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Results count */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500">
            <span className="font-bold text-gray-800">{filtered.length}</span>{' '}
            {filtered.length === 1 ? 'exercício encontrado' : 'exercícios encontrados'}
          </p>
          {(search || hasActiveFilters) && filtered.length < exercises.length && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                clearFilters();
              }}
              className="text-xs text-teal-600 font-semibold hover:underline"
            >
              Mostrar todos
            </button>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onOpen={setSelectedExercise}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
              <Dumbbell size={28} className="text-gray-300" />
            </div>
            <h3 className="text-base font-semibold text-gray-700 mb-1">
              Nenhum exercício encontrado
            </h3>
            <p className="text-sm text-gray-400 max-w-xs">
              Tente ajustar os filtros ou buscar por outro termo.
            </p>
            {(search || hasActiveFilters) && (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  clearFilters();
                }}
                className="mt-4 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Detail Modal                                                        */}
      {/* ------------------------------------------------------------------ */}
      <ExerciseDetailModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
      />
    </div>
  );
}
