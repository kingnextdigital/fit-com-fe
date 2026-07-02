import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Dumbbell,
  Flame,
  Scissors,
  Heart,
  Home,
  Building2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Droplets,
  Moon,
  Zap,
  Star,
  Trophy,
  ArrowRight,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const TOTAL_STEPS = 8;

interface OnboardingData {
  sex: 'male' | 'female' | '';
  age: number;
  weight: number;
  height: number;
  goal: 'hypertrophy' | 'weight_loss' | 'definition' | 'health' | '';
  experience: 'beginner' | 'intermediate' | 'advanced' | '';
  daysPerWeek: number;
  sessionTime: number;
  location: 'gym' | 'home' | '';
  equipment: string[];
  restrictions: string;
  sleepQuality: number;
  stressLevel: number;
  waterIntake: number;
}

const initialData: OnboardingData = {
  sex: '',
  age: 25,
  weight: 70,
  height: 170,
  goal: '',
  experience: '',
  daysPerWeek: 3,
  sessionTime: 60,
  location: '',
  equipment: [],
  restrictions: '',
  sleepQuality: 3,
  stressLevel: 3,
  waterIntake: 2,
};

/* ─── Confetti particle ──────────────────────────────────────────────── */
function ConfettiParticle({ index }: { index: number }) {
  const colors = [
    'bg-teal-400', 'bg-emerald-400', 'bg-cyan-400',
    'bg-yellow-400', 'bg-pink-400', 'bg-indigo-400', 'bg-orange-400',
  ];
  const color = colors[index % colors.length];
  const left = `${(index * 13 + 7) % 100}%`;
  const delay = `${(index * 0.15) % 1.5}s`;
  const duration = `${1.2 + (index % 4) * 0.3}s`;
  const size = index % 3 === 0 ? 'w-3 h-3' : index % 3 === 1 ? 'w-2 h-2' : 'w-1.5 h-3';

  return (
    <div
      className={cn('absolute top-0 rounded-sm opacity-0', color, size)}
      style={{
        left,
        animationName: 'confettiFall',
        animationDuration: duration,
        animationDelay: delay,
        animationTimingFunction: 'ease-in',
        animationFillMode: 'forwards',
        transform: `rotate(${(index * 37) % 360}deg)`,
      }}
    />
  );
}

/* ─── Step indicator ─────────────────────────────────────────────────── */
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5 justify-center pt-6 pb-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            'rounded-full transition-all duration-300',
            i < current
              ? 'bg-teal-700 w-6 h-2'
              : i === current
              ? 'bg-teal-600 w-8 h-2.5'
              : 'bg-gray-200 w-2 h-2',
          )}
        />
      ))}
    </div>
  );
}

/* ─── Selection card ─────────────────────────────────────────────────── */
function SelectCard({
  selected,
  onClick,
  children,
  className,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'border-2 rounded-2xl p-4 text-left transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 active:scale-[0.97]',
        selected
          ? 'border-teal-700 bg-teal-50 shadow-sm'
          : 'border-gray-200 bg-white hover:border-teal-300 hover:bg-teal-50/40',
        className,
      )}
    >
      {children}
    </button>
  );
}

/* ─── Pill button ────────────────────────────────────────────────────── */
function Pill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-4 py-2 rounded-full border-2 text-sm font-medium transition-all duration-200 active:scale-95',
        selected
          ? 'border-teal-700 bg-teal-700 text-white shadow-sm'
          : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300',
      )}
    >
      {children}
    </button>
  );
}

/* ─── Number input with unit ─────────────────────────────────────────── */
function UnitInput({
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  label,
}: {
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  label: string;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - step))}
          className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-teal-400 hover:bg-teal-50 active:scale-90 transition-all"
        >
          −
        </button>
        <div className="flex items-baseline gap-1 min-w-[80px] justify-center">
          <span className="text-4xl font-bold text-gray-900 tabular-nums">{value}</span>
          <span className="text-base text-teal-700 font-semibold">{unit}</span>
        </div>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + step))}
          className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center text-lg font-bold text-gray-600 hover:border-teal-400 hover:bg-teal-50 active:scale-90 transition-all"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ─── Emoji scale ────────────────────────────────────────────────────── */
function EmojiScale({
  value,
  onChange,
  emojis,
  labels,
}: {
  value: number;
  onChange: (v: number) => void;
  emojis: string[];
  labels: string[];
}) {
  return (
    <div className="flex gap-2 justify-between">
      {emojis.map((emoji, i) => {
        const level = i + 1;
        return (
          <button
            key={level}
            type="button"
            onClick={() => onChange(level)}
            className={cn(
              'flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border-2 transition-all duration-200 active:scale-95',
              value === level
                ? 'border-teal-700 bg-teal-50'
                : 'border-gray-200 bg-white hover:border-teal-300',
            )}
          >
            <span className="text-2xl">{emoji}</span>
            <span className="text-[10px] text-gray-500 font-medium leading-tight text-center">
              {labels[i]}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   STEP COMPONENTS
   ════════════════════════════════════════════════════════════════════════ */

/* Step 1 — Bem-vindo */
function StepWelcome({ onNext }: { onNext: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center gap-6 px-4 transition-all duration-700',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
      )}
    >
      {/* Logo / icon */}
      <div className="relative">
        <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-teal-300">
          <Dumbbell className="w-12 h-12 text-white" />
        </div>
        <div className="absolute -top-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center shadow">
          <Star className="w-4 h-4 text-white fill-white" />
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">
          Bem-vindo ao<br />
          <span className="text-teal-700">TreinoCristao AI</span>
        </h1>
        <p className="text-gray-500 text-base leading-relaxed max-w-xs mx-auto">
          Seu treinador cristao personalizado. Vamos criar o treino perfeito para voce em menos de 2 minutos.
        </p>
      </div>

      <div className="flex flex-col gap-2 w-full max-w-xs">
        <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
          <Zap className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="text-sm text-teal-800 font-medium">Treinos gerados por IA</span>
        </div>
        <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
          <Heart className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="text-sm text-teal-800 font-medium">Baseado em seus objetivos</span>
        </div>
        <div className="flex items-center gap-3 bg-teal-50 rounded-xl p-3">
          <Trophy className="w-5 h-5 text-teal-600 shrink-0" />
          <span className="text-sm text-teal-800 font-medium">Progressao gamificada</span>
        </div>
      </div>

      <Button
        size="lg"
        fullWidth
        onClick={onNext}
        icon={<ArrowRight />}
        iconPosition="right"
        className="max-w-xs"
      >
        Vamos comecar
      </Button>
    </div>
  );
}

/* Step 2 — Informacoes basicas */
function StepBasicInfo({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Sobre voce</h2>
        <p className="text-gray-500 text-sm mt-1">Vamos comecar com o basico</p>
      </div>

      {/* Sex */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Sexo</p>
        <div className="grid grid-cols-2 gap-3">
          <SelectCard selected={data.sex === 'male'} onClick={() => onChange({ sex: 'male' })}>
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-3xl">♂</span>
              <span className="font-semibold text-gray-800">Masculino</span>
            </div>
          </SelectCard>
          <SelectCard selected={data.sex === 'female'} onClick={() => onChange({ sex: 'female' })}>
            <div className="flex flex-col items-center gap-2 py-2">
              <span className="text-3xl">♀</span>
              <span className="font-semibold text-gray-800">Feminino</span>
            </div>
          </SelectCard>
        </div>
      </div>

      {/* Age */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Idade</p>
          <span className="text-2xl font-bold text-teal-700">{data.age} anos</span>
        </div>
        <input
          type="range"
          min={15}
          max={70}
          value={data.age}
          onChange={(e) => onChange({ age: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>15</span>
          <span>70</span>
        </div>
      </div>
    </div>
  );
}

/* Step 3 — Medidas corporais */
function StepBodyMeasures({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  return (
    <div className="flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Medidas corporais</h2>
        <p className="text-gray-500 text-sm mt-1">Para calcular treinos e metas precisas</p>
      </div>

      <div className="flex flex-col gap-8">
        <UnitInput
          value={data.weight}
          onChange={(v) => onChange({ weight: v })}
          min={30}
          max={200}
          step={1}
          unit="kg"
          label="Peso"
        />

        <div className="border-t border-gray-100" />

        <UnitInput
          value={data.height}
          onChange={(v) => onChange({ height: v })}
          min={130}
          max={220}
          step={1}
          unit="cm"
          label="Altura"
        />
      </div>

      {/* BMI preview */}
      {data.weight > 0 && data.height > 0 && (
        <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl p-4 text-center border border-teal-100">
          <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">IMC</p>
          <p className="text-3xl font-bold text-teal-700">
            {(data.weight / Math.pow(data.height / 100, 2)).toFixed(1)}
          </p>
        </div>
      )}
    </div>
  );
}

/* Step 4 — Objetivo */
function StepGoal({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  const goals = [
    {
      key: 'hypertrophy' as const,
      label: 'Hipertrofia',
      icon: <Dumbbell className="w-6 h-6" />,
      desc: 'Ganhar massa muscular e forca',
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      key: 'weight_loss' as const,
      label: 'Emagrecimento',
      icon: <Flame className="w-6 h-6" />,
      desc: 'Queimar gordura e perder peso',
      color: 'text-red-500',
      bg: 'bg-red-50',
    },
    {
      key: 'definition' as const,
      label: 'Definicao',
      icon: <Scissors className="w-6 h-6" />,
      desc: 'Definir e tonificar o corpo',
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      key: 'health' as const,
      label: 'Saude',
      icon: <Heart className="w-6 h-6" />,
      desc: 'Bem-estar e qualidade de vida',
      color: 'text-green-500',
      bg: 'bg-green-50',
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Qual e seu objetivo?</h2>
        <p className="text-gray-500 text-sm mt-1">Vamos personalizar tudo para voce</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {goals.map((g) => (
          <SelectCard
            key={g.key}
            selected={data.goal === g.key}
            onClick={() => onChange({ goal: g.key })}
          >
            <div className="flex flex-col gap-2">
              <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', g.bg)}>
                <span className={g.color}>{g.icon}</span>
              </div>
              <p className="font-bold text-gray-900 text-sm">{g.label}</p>
              <p className="text-xs text-gray-500 leading-snug">{g.desc}</p>
            </div>
          </SelectCard>
        ))}
      </div>
    </div>
  );
}

/* Step 5 — Experiencia e frequencia */
function StepExperience({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  const experiences = [
    { key: 'beginner' as const, label: 'Iniciante', desc: 'Menos de 1 ano' },
    { key: 'intermediate' as const, label: 'Intermediario', desc: '1 a 3 anos' },
    { key: 'advanced' as const, label: 'Avancado', desc: 'Mais de 3 anos' },
  ];

  const times = [30, 45, 60, 90];

  return (
    <div className="flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Experiencia</h2>
        <p className="text-gray-500 text-sm mt-1">Conte sobre sua jornada fitness</p>
      </div>

      {/* Experience level */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Nivel de experiencia</p>
        <div className="flex flex-col gap-2">
          {experiences.map((exp) => (
            <SelectCard
              key={exp.key}
              selected={data.experience === exp.key}
              onClick={() => onChange({ experience: exp.key })}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">{exp.label}</p>
                  <p className="text-xs text-gray-500">{exp.desc}</p>
                </div>
                {data.experience === exp.key && (
                  <CheckCircle2 className="w-5 h-5 text-teal-700 shrink-0" />
                )}
              </div>
            </SelectCard>
          ))}
        </div>
      </div>

      {/* Days per week */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Dias por semana</p>
        <div className="flex gap-2 flex-wrap">
          {[2, 3, 4, 5, 6].map((d) => (
            <Pill key={d} selected={data.daysPerWeek === d} onClick={() => onChange({ daysPerWeek: d })}>
              {d}x
            </Pill>
          ))}
        </div>
      </div>

      {/* Session time */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Duracao por sessao</p>
        <div className="flex gap-2 flex-wrap">
          {times.map((t) => (
            <Pill key={t} selected={data.sessionTime === t} onClick={() => onChange({ sessionTime: t })}>
              {t}min
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Step 6 — Local e equipamentos */
function StepEquipment({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  const allEquipment = ['Halteres', 'Barras', 'Maquinas', 'Elasticos', 'Kettlebell', 'Nenhum'];

  const toggleEquipment = (item: string) => {
    if (item === 'Nenhum') {
      onChange({ equipment: data.equipment.includes('Nenhum') ? [] : ['Nenhum'] });
      return;
    }
    const without = data.equipment.filter((e) => e !== 'Nenhum');
    if (without.includes(item)) {
      onChange({ equipment: without.filter((e) => e !== item) });
    } else {
      onChange({ equipment: [...without, item] });
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Local e equipamentos</h2>
        <p className="text-gray-500 text-sm mt-1">Onde voce vai treinar?</p>
      </div>

      {/* Location */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Local de treino</p>
        <div className="grid grid-cols-2 gap-3">
          <SelectCard
            selected={data.location === 'gym'}
            onClick={() => onChange({ location: 'gym' })}
          >
            <div className="flex flex-col items-center gap-2 py-2">
              <Building2 className={cn('w-8 h-8', data.location === 'gym' ? 'text-teal-700' : 'text-gray-400')} />
              <span className="font-semibold text-gray-800">Academia</span>
            </div>
          </SelectCard>
          <SelectCard
            selected={data.location === 'home'}
            onClick={() => onChange({ location: 'home' })}
          >
            <div className="flex flex-col items-center gap-2 py-2">
              <Home className={cn('w-8 h-8', data.location === 'home' ? 'text-teal-700' : 'text-gray-400')} />
              <span className="font-semibold text-gray-800">Em casa</span>
            </div>
          </SelectCard>
        </div>
      </div>

      {/* Equipment */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Equipamentos disponíveis</p>
        <div className="grid grid-cols-2 gap-2">
          {allEquipment.map((eq) => {
            const selected = data.equipment.includes(eq);
            return (
              <button
                key={eq}
                type="button"
                onClick={() => toggleEquipment(eq)}
                className={cn(
                  'flex items-center gap-2 p-3 border-2 rounded-xl text-sm font-medium transition-all duration-200 active:scale-95',
                  selected
                    ? 'border-teal-700 bg-teal-50 text-teal-800'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300',
                )}
              >
                <div
                  className={cn(
                    'w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all',
                    selected ? 'border-teal-700 bg-teal-700' : 'border-gray-300',
                  )}
                >
                  {selected && <CheckCircle2 className="w-3 h-3 text-white fill-white" />}
                </div>
                {eq}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* Step 7 — Saude e bem-estar */
function StepHealth({
  data,
  onChange,
}: {
  data: OnboardingData;
  onChange: (d: Partial<OnboardingData>) => void;
}) {
  const sleepEmojis = ['😴', '😪', '😐', '😊', '⚡'];
  const sleepLabels = ['Ruim', 'Regular', 'Medio', 'Bom', 'Otimo'];
  const stressEmojis = ['😌', '🙂', '😐', '😤', '🤯'];
  const stressLabels = ['Baixo', 'Leve', 'Medio', 'Alto', 'Critico'];

  return (
    <div className="flex flex-col gap-6 px-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Saude e bem-estar</h2>
        <p className="text-gray-500 text-sm mt-1">Para adaptar o treino a sua rotina</p>
      </div>

      {/* Restrictions */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-gray-700">Restricoes ou lesoes</p>
        <textarea
          value={data.restrictions}
          onChange={(e) => onChange({ restrictions: e.target.value })}
          placeholder="Ex: dor no joelho, lesao no ombro, hérnia de disco... (opcional)"
          rows={3}
          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:border-teal-500 resize-none transition-colors"
        />
      </div>

      {/* Sleep quality */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Moon className="w-4 h-4 text-teal-600" />
          <p className="text-sm font-semibold text-gray-700">Qualidade do sono</p>
        </div>
        <EmojiScale
          value={data.sleepQuality}
          onChange={(v) => onChange({ sleepQuality: v })}
          emojis={sleepEmojis}
          labels={sleepLabels}
        />
      </div>

      {/* Stress level */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-teal-600" />
          <p className="text-sm font-semibold text-gray-700">Nivel de estresse</p>
        </div>
        <EmojiScale
          value={data.stressLevel}
          onChange={(v) => onChange({ stressLevel: v })}
          emojis={stressEmojis}
          labels={stressLabels}
        />
      </div>

      {/* Water intake */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Droplets className="w-4 h-4 text-teal-600" />
            <p className="text-sm font-semibold text-gray-700">Agua diaria</p>
          </div>
          <span className="text-xl font-bold text-teal-700">{data.waterIntake}L</span>
        </div>
        <input
          type="range"
          min={1}
          max={4}
          step={0.5}
          value={data.waterIntake}
          onChange={(e) => onChange({ waterIntake: parseFloat(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-teal-600"
        />
        <div className="flex justify-between text-xs text-gray-400">
          <span>1L</span>
          <span>4L</span>
        </div>
      </div>
    </div>
  );
}

/* Step 8 — Tudo pronto */
function StepComplete({ data }: { data: OnboardingData }) {
  const goalLabels: Record<string, string> = {
    hypertrophy: 'Hipertrofia',
    weight_loss: 'Emagrecimento',
    definition: 'Definicao',
    health: 'Saude',
  };
  const expLabels: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediario',
    advanced: 'Avancado',
  };

  const summaryItems = [
    { label: 'Sexo', value: data.sex === 'male' ? 'Masculino' : 'Feminino' },
    { label: 'Idade / Peso / Altura', value: `${data.age} anos · ${data.weight}kg · ${data.height}cm` },
    { label: 'Objetivo', value: goalLabels[data.goal] ?? data.goal },
    { label: 'Experiencia', value: expLabels[data.experience] ?? data.experience },
    { label: 'Frequencia', value: `${data.daysPerWeek}x/semana · ${data.sessionTime}min` },
    { label: 'Local', value: data.location === 'gym' ? 'Academia' : 'Em casa' },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 text-center">
      {/* Confetti area */}
      <div className="relative h-20 overflow-hidden rounded-2xl">
        <style>{`
          @keyframes confettiFall {
            0%   { transform: translateY(-20px) rotate(0deg); opacity: 1; }
            100% { transform: translateY(80px) rotate(360deg); opacity: 0; }
          }
        `}</style>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl" />
        {Array.from({ length: 20 }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}
        <div className="absolute inset-0 flex items-center justify-center">
          <Trophy className="w-10 h-10 text-teal-700" />
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-gray-900">Tudo pronto!</h2>
        <p className="text-gray-500 text-sm mt-1">
          Seu perfil esta configurado. Hora de gerar seu treino personalizado!
        </p>
      </div>

      {/* Summary */}
      <div className="bg-gray-50 rounded-2xl p-4 text-left space-y-3">
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-start justify-between gap-2">
            <span className="text-xs text-gray-500 font-medium whitespace-nowrap">{item.label}</span>
            <span className="text-xs font-semibold text-gray-800 text-right">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════════════════════════════ */
export default function OnboardingPage() {
  const navigate = useNavigate();
  const { updateProfile } = useAuthStore();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(initialData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('right');
  const [visible, setVisible] = useState(true);

  const update = (partial: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...partial }));
  };

  const goTo = (next: number) => {
    setSlideDir(next > step ? 'right' : 'left');
    setVisible(false);
    setTimeout(() => {
      setStep(next);
      setVisible(true);
    }, 180);
  };

  const canAdvance = (): boolean => {
    switch (step) {
      case 0: return true;
      case 1: return data.sex !== '';
      case 2: return data.weight > 0 && data.height > 0;
      case 3: return data.goal !== '';
      case 4: return data.experience !== '' && data.daysPerWeek > 0 && data.sessionTime > 0;
      case 5: return data.location !== '';
      case 6: return true;
      case 7: return true;
      default: return true;
    }
  };

  const handleComplete = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      await updateProfile({
        sex: data.sex as 'male' | 'female',
        age: data.age,
        weight: data.weight,
        height: data.height,
        goal: data.goal as 'hypertrophy' | 'weight_loss' | 'definition' | 'health',
        experience: data.experience as 'beginner' | 'intermediate' | 'advanced',
        available_days: Array.from({ length: data.daysPerWeek }, (_, i) => i + 1),
        workout_time: data.sessionTime,
        location: data.location as 'gym' | 'home',
        equipment: data.equipment,
        restrictions: data.restrictions ? [data.restrictions] : [],
        sleep_level: data.sleepQuality as 1 | 2 | 3 | 4 | 5,
        stress_level: data.stressLevel as 1 | 2 | 3 | 4 | 5,
        water_daily: data.waterIntake,
        onboarding_completed: true,
      });
      navigate('/');
    } catch (err: any) {
      console.error('Error saving onboarding data:', err);
      setSubmitError(err?.message ?? 'Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const isLastStep = step === TOTAL_STEPS - 1;
  const isFirstStep = step === 0;
  const isWelcome = step === 0;

  const slideClass = visible
    ? 'opacity-100 translate-x-0'
    : slideDir === 'right'
    ? 'opacity-0 translate-x-4'
    : 'opacity-0 -translate-x-4';

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-teal-50/30 to-white flex flex-col">
      {/* Step indicator — hidden on welcome */}
      {!isWelcome && (
        <div className="px-4 pt-safe">
          <StepIndicator current={step} />
          <p className="text-center text-xs text-gray-400 mt-1 mb-2">
            Passo {step} de {TOTAL_STEPS - 1}
          </p>
        </div>
      )}

      {/* Content area */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={cn(
            'max-w-lg mx-auto w-full py-6 transition-all duration-200 ease-out',
            isWelcome ? 'pt-16' : 'pt-4',
            slideClass,
          )}
        >
          {step === 0 && <StepWelcome onNext={() => goTo(1)} />}
          {step === 1 && <StepBasicInfo data={data} onChange={update} />}
          {step === 2 && <StepBodyMeasures data={data} onChange={update} />}
          {step === 3 && <StepGoal data={data} onChange={update} />}
          {step === 4 && <StepExperience data={data} onChange={update} />}
          {step === 5 && <StepEquipment data={data} onChange={update} />}
          {step === 6 && <StepHealth data={data} onChange={update} />}
          {step === 7 && <StepComplete data={data} />}
        </div>
      </div>

      {/* Bottom navigation — hidden on welcome (has its own CTA) */}
      {!isWelcome && (
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-4 py-4 safe-bottom">
          <div className="max-w-lg mx-auto flex gap-3">
            {!isFirstStep && (
              <Button
                variant="secondary"
                size="lg"
                onClick={() => goTo(step - 1)}
                icon={<ChevronLeft />}
                iconPosition="left"
                className="shrink-0"
              >
                Voltar
              </Button>
            )}

            {isLastStep ? (
              <div className="flex flex-col gap-2 flex-1">
                {submitError && (
                  <p className="text-red-500 text-xs text-center px-2">{submitError}</p>
                )}
                <Button
                  size="lg"
                  fullWidth
                  loading={submitting}
                  onClick={handleComplete}
                  icon={<Zap />}
                  iconPosition="right"
                >
                  Gerar Meu Treino
                </Button>
              </div>
            ) : (
              <Button
                size="lg"
                fullWidth
                disabled={!canAdvance()}
                onClick={() => goTo(step + 1)}
                icon={<ChevronRight />}
                iconPosition="right"
              >
                Continuar
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
