import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Sparkles,
  Dumbbell,
  Calendar,
  ChevronDown,
  Play,
  Pause,
  Edit2,
  Copy,
  Trash2,
  CheckCircle2,
  Clock,
  Target,
  Zap,
  BarChart2,
  Star,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { workoutTemplates } from '@/data/workoutPlans';
import Button from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { WorkoutPlan } from '@/types';

// ─── Helpers ────────────────────────────────────────────────────────────────

const SPLIT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  ABC: { bg: 'bg-violet-100', text: 'text-violet-700', border: 'border-violet-200' },
  ABCD: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  ABCDE: { bg: 'bg-indigo-100', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Upper Lower': { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' },
  PPL: { bg: 'bg-rose-100', text: 'text-rose-700', border: 'border-rose-200' },
  'Full Body': { bg: 'bg-emerald-100', text: 'text-emerald-700', border: 'border-emerald-200' },
};

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  beginner: { bg: 'bg-green-100', text: 'text-green-700' },
  intermediate: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  advanced: { bg: 'bg-red-100', text: 'text-red-700' },
};

const LEVEL_LABELS: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const GOAL_LABELS: Record<string, string> = {
  hypertrophy: 'Hipertrofia',
  weight_loss: 'Emagrecimento',
  definition: 'Definicao',
  health: 'Saude',
};

const GOAL_COLORS: Record<string, string> = {
  hypertrophy: 'bg-teal-100 text-teal-700',
  weight_loss: 'bg-orange-100 text-orange-700',
  definition: 'bg-purple-100 text-purple-700',
  health: 'bg-green-100 text-green-700',
};

function SplitBadge({ split }: { split: string }) {
  const colors = SPLIT_COLORS[split] ?? {
    bg: 'bg-gray-100',
    text: 'text-gray-600',
    border: 'border-gray-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        colors.bg,
        colors.text,
        colors.border,
      )}
    >
      {split}
    </span>
  );
}

function LevelBadge({ level }: { level: string }) {
  const colors = LEVEL_COLORS[level] ?? { bg: 'bg-gray-100', text: 'text-gray-600' };
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
      )}
    >
      {LEVEL_LABELS[level] ?? level}
    </span>
  );
}

// ─── Mock data ───────────────────────────────────────────────────────────────

const MOCK_PLANS: WorkoutPlan[] = [
  {
    id: '1',
    user_id: 'me',
    name: 'Meu ABC Personalizado',
    description: 'Treino ABC focado em hipertrofia com progressao de carga.',
    split_type: 'ABC',
    goal: 'hypertrophy',
    level: 'intermediate',
    days_per_week: 3,
    created_by_ai: false,
    is_active: true,
    created_at: '2025-06-01T10:00:00Z',
    updated_at: '2025-06-01T10:00:00Z',
  },
  {
    id: '2',
    user_id: 'me',
    name: 'Plano IA - Forca',
    description: 'Criado pela IA com base no seu perfil e objetivo.',
    split_type: 'PPL',
    goal: 'hypertrophy',
    level: 'intermediate',
    days_per_week: 6,
    created_by_ai: true,
    is_active: false,
    created_at: '2025-05-15T08:30:00Z',
    updated_at: '2025-05-15T08:30:00Z',
  },
  {
    id: '3',
    user_id: 'me',
    name: 'Emagrecimento Verao',
    description: 'Circuitos de alta intensidade para queimar gordura.',
    split_type: 'Full Body',
    goal: 'weight_loss',
    level: 'beginner',
    days_per_week: 4,
    created_by_ai: false,
    is_active: false,
    created_at: '2025-04-20T14:00:00Z',
    updated_at: '2025-04-20T14:00:00Z',
  },
];

// ─── Dropdown Menu ────────────────────────────────────────────────────────────

interface PlanMenuProps {
  plan: WorkoutPlan;
  onActivate: (id: string) => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

function PlanMenu({ plan, onActivate, onEdit, onDuplicate, onDelete }: PlanMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors text-xs font-medium"
      >
        Acoes <ChevronDown className="w-3 h-3" />
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden py-1">
            {!plan.is_active && (
              <button
                onClick={() => { onActivate(plan.id); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-teal-50 hover:text-teal-700 transition-colors"
              >
                <Play className="w-3.5 h-3.5" /> Ativar
              </button>
            )}
            <button
              onClick={() => { onEdit(plan.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" /> Editar
            </button>
            <button
              onClick={() => { onDuplicate(plan.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-700 hover:bg-gray-50 transition-colors"
            >
              <Copy className="w-3.5 h-3.5" /> Duplicar
            </button>
            <div className="h-px bg-gray-100 mx-2 my-1" />
            <button
              onClick={() => { onDelete(plan.id); setOpen(false); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-600 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Excluir
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── Create Plan Modal ───────────────────────────────────────────────────────

interface CreatePlanModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (data: { name: string; split_type: string; goal: string; days_per_week: number }) => void;
}

function CreatePlanModal({ open, onClose, onCreate }: CreatePlanModalProps) {
  const [name, setName] = useState('');
  const [splitType, setSplitType] = useState('ABC');
  const [goal, setGoal] = useState('hypertrophy');
  const [days, setDays] = useState(3);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), split_type: splitType, goal, days_per_week: days });
    setName('');
    setSplitType('ABC');
    setGoal('hypertrophy');
    setDays(3);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Criar Novo Treino"
      subtitle="Configure as informacoes basicas do seu plano."
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!name.trim()}>
            Criar Treino
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Nome do Treino
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Meu ABC de Hipertrofia"
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition"
          />
        </div>

        {/* Split Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Divisao de Treino
          </label>
          <select
            value={splitType}
            onChange={(e) => setSplitType(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-white"
          >
            <option value="ABC">ABC (3 dias)</option>
            <option value="ABCD">ABCD (4 dias)</option>
            <option value="ABCDE">ABCDE (5 dias)</option>
            <option value="Upper Lower">Upper Lower (4 dias)</option>
            <option value="PPL">PPL - Push Pull Legs</option>
            <option value="Full Body">Full Body</option>
          </select>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Objetivo
          </label>
          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition bg-white"
          >
            <option value="hypertrophy">Hipertrofia (ganho de massa)</option>
            <option value="weight_loss">Emagrecimento</option>
            <option value="definition">Definicao muscular</option>
            <option value="health">Saude e bem-estar</option>
          </select>
        </div>

        {/* Days per week slider */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Dias por semana
            <span className="ml-2 px-2 py-0.5 rounded-full bg-teal-100 text-teal-700 text-xs font-bold">
              {days}x
            </span>
          </label>
          <input
            type="range"
            min={2}
            max={6}
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="w-full accent-teal-600"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>2 dias</span>
            <span>6 dias</span>
          </div>
        </div>
      </form>
    </Modal>
  );
}

// ─── AI Generate Modal ───────────────────────────────────────────────────────

interface AIGenerateModalProps {
  open: boolean;
  onClose: () => void;
}

function AIGenerateModal({ open, onClose }: AIGenerateModalProps) {
  const [phase, setPhase] = useState<'loading' | 'done'>('loading');

  React.useEffect(() => {
    if (!open) {
      setPhase('loading');
      return;
    }
    const t = setTimeout(() => setPhase('done'), 2000);
    return () => clearTimeout(t);
  }, [open]);

  const generatedPlan = {
    name: 'Treino Personalizado IA',
    split: 'PPL',
    days: 5,
    level: 'Intermediario',
    exercises: 24,
    goal: 'Hipertrofia',
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={phase === 'loading' ? 'Gerando seu treino...' : 'Treino Gerado com Sucesso!'}
      size="md"
      footer={
        phase === 'done' ? (
          <div className="flex justify-end gap-3">
            <Button variant="secondary" size="sm" onClick={onClose}>
              Fechar
            </Button>
            <Button variant="primary" size="sm" onClick={onClose}>
              Usar este Treino
            </Button>
          </div>
        ) : undefined
      }
    >
      {phase === 'loading' ? (
        <div className="flex flex-col items-center py-8 text-center gap-5">
          {/* Pulsing icon */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-teal-100 flex items-center justify-center">
              <Sparkles className="w-9 h-9 text-teal-600 animate-pulse" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-teal-400 border-t-transparent animate-spin" />
          </div>

          <div>
            <p className="text-base font-semibold text-gray-800">
              Gerando seu treino personalizado com IA...
            </p>
            <p className="mt-2 text-sm text-gray-500 max-w-xs">
              Nossa IA esta analisando seu perfil, objetivo e historico para criar o plano ideal para voce.
            </p>
          </div>

          {/* Animated steps */}
          <div className="w-full max-w-xs space-y-2 text-left">
            {[
              'Analisando seu perfil...',
              'Verificando historico de treinos...',
              'Selecionando exercicios ideais...',
            ].map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-gray-500">
                <div
                  className="w-4 h-4 rounded-full border-2 border-teal-400 border-t-transparent animate-spin flex-shrink-0"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
                {step}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Success banner */}
          <div className="flex items-center gap-3 p-3 bg-teal-50 rounded-xl border border-teal-100">
            <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
            <p className="text-sm text-teal-700 font-medium">
              Treino criado com base no seu perfil e objetivos!
            </p>
          </div>

          {/* Plan preview card */}
          <div className="bg-gradient-to-br from-teal-700 to-teal-900 rounded-2xl p-5 text-white">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-300" />
                  <span className="text-xs text-teal-300 font-medium">Gerado por IA</span>
                </div>
                <h3 className="text-lg font-bold">{generatedPlan.name}</h3>
              </div>
              <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                {generatedPlan.split}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold">{generatedPlan.days}x</p>
                <p className="text-xs text-teal-200">por semana</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-lg font-bold">{generatedPlan.exercises}</p>
                <p className="text-xs text-teal-200">exercicios</p>
              </div>
              <div className="bg-white/10 rounded-xl p-2.5 text-center">
                <p className="text-xs font-bold">{generatedPlan.level}</p>
                <p className="text-xs text-teal-200">nivel</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-gray-400 text-center">
            Voce pode editar este treino depois de salvar.
          </p>
        </div>
      )}
    </Modal>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function WorkoutsPage() {
  const { profile } = useAuthStore();

  const [plans, setPlans] = useState<WorkoutPlan[]>(MOCK_PLANS);
  const [showCreate, setShowCreate] = useState(false);
  const [showAI, setShowAI] = useState(false);

  const activePlan = plans.find((p) => p.is_active) ?? null;
  const otherPlans = plans.filter((p) => !p.is_active);

  function handleActivate(id: string) {
    setPlans((prev) =>
      prev.map((p) => ({ ...p, is_active: p.id === id })),
    );
  }

  function handleDelete(id: string) {
    setPlans((prev) => prev.filter((p) => p.id !== id));
  }

  function handleDuplicate(id: string) {
    const source = plans.find((p) => p.id === id);
    if (!source) return;
    const copy: WorkoutPlan = {
      ...source,
      id: Math.random().toString(36).slice(2),
      name: `${source.name} (copia)`,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPlans((prev) => [...prev, copy]);
  }

  function handleEdit(_id: string) {
    // Placeholder — navigate to editor
  }

  function handlePause() {
    setPlans((prev) => prev.map((p) => ({ ...p, is_active: false })));
  }

  function handleCreate(data: { name: string; split_type: string; goal: string; days_per_week: number }) {
    const newPlan: WorkoutPlan = {
      id: Math.random().toString(36).slice(2),
      user_id: profile?.id ?? 'me',
      name: data.name,
      description: '',
      split_type: data.split_type as WorkoutPlan['split_type'],
      goal: data.goal as WorkoutPlan['goal'],
      level: profile?.experience ?? 'beginner',
      days_per_week: data.days_per_week,
      created_by_ai: false,
      is_active: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPlans((prev) => [...prev, newPlan]);
  }

  function handleUseTemplate(index: number) {
    const tpl = workoutTemplates[index];
    if (!tpl) return;
    const newPlan: WorkoutPlan = {
      id: Math.random().toString(36).slice(2),
      user_id: profile?.id ?? 'me',
      ...tpl.plan,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setPlans((prev) => [...prev, newPlan]);
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });

  const countExercises = (template: typeof workoutTemplates[0]) =>
    template.days.reduce((acc, d) => acc + d.exercises.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── HEADER ─────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Meus Treinos</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Gerencie seus planos de treino e acompanhe seu progresso.
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="secondary"
              size="md"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => setShowCreate(true)}
            >
              Criar Treino
            </Button>
            <Button
              variant="primary"
              size="md"
              icon={<Sparkles className="w-4 h-4" />}
              onClick={() => setShowAI(true)}
            >
              Gerar com IA
            </Button>
          </div>
        </div>

        {/* ── ACTIVE PLAN ────────────────────────────────────────── */}
        {activePlan && (
          <section>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
              Plano Ativo
            </h2>
            <div className="relative bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 rounded-2xl p-6 text-white overflow-hidden">
              {/* Decorative blobs */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />

              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 bg-white/20 rounded-full text-xs font-semibold">
                        {activePlan.split_type}
                      </span>
                      <span className={cn(
                        'px-2.5 py-0.5 rounded-full text-xs font-semibold',
                        activePlan.created_by_ai ? 'bg-amber-400/20 text-amber-200' : 'bg-white/10 text-white/70',
                      )}>
                        {activePlan.created_by_ai ? 'Gerado por IA' : 'Manual'}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold">{activePlan.name}</h2>
                    <div className="flex items-center gap-4 text-sm text-teal-200 flex-wrap">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {activePlan.days_per_week}x por semana
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        Desde {formatDate(activePlan.created_at)}
                      </span>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="bg-white/10 rounded-2xl p-4 text-center min-w-[120px]">
                    <p className="text-3xl font-bold">8</p>
                    <p className="text-xs text-teal-200 mt-0.5">treinos este mes</p>
                    <div className="mt-2 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-300 rounded-full" style={{ width: '53%' }} />
                    </div>
                    <p className="text-xs text-teal-300 mt-1">meta: 15</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 mt-5">
                  <Link to={`/treinos/${activePlan.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<Play className="w-3.5 h-3.5" />}
                      className="bg-white text-teal-700 hover:bg-teal-50 border-0"
                    >
                      Ver Treino
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Pause className="w-3.5 h-3.5" />}
                    onClick={handlePause}
                    className="text-white hover:bg-white/10"
                  >
                    Pausar
                  </Button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── MY PLANS ───────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">
            Meus Planos
          </h2>

          {otherPlans.length === 0 && !activePlan && (
            <Card className="py-12 text-center">
              <Dumbbell className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-gray-500">Nenhum plano criado ainda.</p>
              <p className="text-xs text-gray-400 mt-1">
                Crie seu primeiro treino ou use um dos templates abaixo.
              </p>
            </Card>
          )}

          {(otherPlans.length > 0 || activePlan) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {otherPlans.map((plan) => (
                <Card key={plan.id} hover className="group flex flex-col">
                  <CardContent className="flex-1 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1.5 flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <SplitBadge split={plan.split_type} />
                          {plan.created_by_ai && (
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-xs font-medium">
                              <Sparkles className="w-3 h-3" /> IA
                            </span>
                          )}
                        </div>
                        <h3 className="font-semibold text-gray-800 text-sm leading-tight truncate">
                          {plan.name}
                        </h3>
                      </div>
                      <PlanMenu
                        plan={plan}
                        onActivate={handleActivate}
                        onEdit={handleEdit}
                        onDuplicate={handleDuplicate}
                        onDelete={handleDelete}
                      />
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {plan.days_per_week}x /semana
                      </span>
                      <LevelBadge level={plan.level} />
                    </div>

                    {/* Goal tag */}
                    <span className={cn('inline-block px-2 py-0.5 rounded-full text-xs font-medium', GOAL_COLORS[plan.goal])}>
                      {GOAL_LABELS[plan.goal] ?? plan.goal}
                    </span>

                    {/* Date */}
                    <p className="text-xs text-gray-400 border-t border-gray-50 pt-2">
                      Criado em {formatDate(plan.created_at)}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* ── TEMPLATES ──────────────────────────────────────────── */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-4 h-4 text-amber-500" />
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              Planos Prontos
            </h2>
          </div>
          <p className="text-sm text-gray-500 mb-4 -mt-1">
            Escolha um template profissional e personalize como quiser.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {workoutTemplates.map((tpl, i) => (
              <div key={i} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden">
                {/* Color stripe */}
                <div
                  className={cn(
                    'h-1 w-full',
                    SPLIT_COLORS[tpl.plan.split_type]?.bg ?? 'bg-gray-200',
                  )}
                />

                <div className="p-5 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <SplitBadge split={tpl.plan.split_type} />
                        <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', GOAL_COLORS[tpl.plan.goal])}>
                          {GOAL_LABELS[tpl.plan.goal] ?? tpl.plan.goal}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-800 text-sm leading-tight">
                        {tpl.plan.name}
                      </h3>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {tpl.plan.description}
                  </p>

                  {/* Meta */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      {tpl.plan.days_per_week}x /semana
                    </span>
                    <span className="flex items-center gap-1">
                      <Dumbbell className="w-3.5 h-3.5 text-gray-400" />
                      {countExercises(tpl)} exercicios
                    </span>
                    <LevelBadge level={tpl.plan.level} />
                  </div>

                  {/* CTA — visible on hover */}
                  <div className="pt-1">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      icon={<Zap className="w-3.5 h-3.5" />}
                      onClick={() => handleUseTemplate(i)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    >
                      Usar Template
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* ── MODALS ─────────────────────────────────────────────────── */}
      <CreatePlanModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onCreate={handleCreate}
      />

      <AIGenerateModal
        open={showAI}
        onClose={() => setShowAI(false)}
      />
    </div>
  );
}
