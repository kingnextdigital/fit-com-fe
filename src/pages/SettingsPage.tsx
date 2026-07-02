import React, { useState, useRef } from 'react';
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Moon,
  Sun,
  LogOut,
  Trash2,
  ChevronRight,
  Save,
  Camera,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';

/* ─── Inline Toggle ──────────────────────────────────────────────────────── */
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent',
        'transition-colors duration-200 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2',
        checked ? 'bg-teal-600' : 'bg-gray-200 dark:bg-gray-700',
        disabled && 'opacity-50 cursor-not-allowed',
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow-md',
          'transform transition-transform duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0',
        )}
      />
    </button>
  );
}

/* ─── Section types ──────────────────────────────────────────────────────── */
type SectionId =
  | 'perfil'
  | 'objetivo'
  | 'notificacoes'
  | 'assinatura'
  | 'privacidade'
  | 'aparencia';

interface Section {
  id: SectionId;
  label: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: 'perfil', label: 'Perfil', icon: <User className="w-4 h-4" /> },
  { id: 'objetivo', label: 'Objetivo & Treino', icon: <Bell className="w-4 h-4" /> },
  { id: 'notificacoes', label: 'Notificações', icon: <Bell className="w-4 h-4" /> },
  { id: 'assinatura', label: 'Assinatura', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'privacidade', label: 'Privacidade & Segurança', icon: <Shield className="w-4 h-4" /> },
  { id: 'aparencia', label: 'Aparência', icon: <Sun className="w-4 h-4" /> },
];

/* ─── SelectCard (onboarding-style) ─────────────────────────────────────── */
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
        'border-2 rounded-2xl p-4 text-left transition-all duration-200 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-teal-500 active:scale-[0.97]',
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

/* ─── Toggle Row ─────────────────────────────────────────────────────────── */
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  children,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  children?: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 py-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800">{label}</p>
          {description && (
            <p className="text-xs text-gray-500 mt-0.5">{description}</p>
          )}
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
      {checked && children && (
        <div className="pl-4 pb-2">{children}</div>
      )}
    </div>
  );
}

/* ─── Delete Confirmation Modal ──────────────────────────────────────────── */
function DeleteModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const [confirmText, setConfirmText] = useState('');
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
            <Trash2 className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-gray-900">Excluir conta</h2>
            <p className="text-xs text-gray-500">Esta ação é irreversível</p>
          </div>
        </div>
        <p className="text-sm text-gray-600">
          Todos os seus dados, treinos e histórico serão permanentemente excluídos.
          Para confirmar, digite <strong>EXCLUIR</strong> abaixo.
        </p>
        <Input
          placeholder="Digite EXCLUIR para confirmar"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
        />
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            fullWidth
            disabled={confirmText !== 'EXCLUIR'}
            onClick={onConfirm}
          >
            Excluir conta
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SECTION — Perfil
   ══════════════════════════════════════════════════════════════════════════ */
function SectionPerfil() {
  const { user, profile, updateProfile } = useAuthStore();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(profile?.name ?? '');
  const [phone, setPhone] = useState(profile?.phone ?? '');
  const [sex, setSex] = useState<'male' | 'female' | ''>(
    (profile?.sex === 'other' ? '' : profile?.sex) ?? ''
  );
  const [age, setAge] = useState(String(profile?.age ?? ''));
  const [weight, setWeight] = useState(String(profile?.weight ?? ''));
  const [height, setHeight] = useState(String(profile?.height ?? ''));
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(
    profile?.avatar_url ?? undefined,
  );

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        name,
        phone,
        sex: sex || undefined,
        age: age ? Number(age) : undefined,
        weight: weight ? Number(weight) : undefined,
        height: height ? Number(height) : undefined,
      } as Parameters<typeof updateProfile>[0]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Perfil" description="Suas informações pessoais" />

      {/* Avatar */}
      <Card>
        <CardContent className="flex items-center gap-5">
          <div className="relative shrink-0">
            <Avatar
              src={avatarPreview}
              name={name || user?.email || 'U'}
              size="xl"
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className={cn(
                'absolute inset-0 rounded-full flex items-center justify-center',
                'bg-black/40 opacity-0 hover:opacity-100 transition-opacity duration-200',
              )}
            >
              <Camera className="w-6 h-6 text-white" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFile}
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">
              {name || 'Seu nome'}
            </p>
            <p className="text-xs text-gray-500 mb-2">{user?.email}</p>
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="text-xs font-medium text-teal-600 hover:text-teal-700 transition-colors"
            >
              Alterar foto
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Basic info */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Dados básicos</h3>
          <Input
            label="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Seu nome"
          />
          <Input
            label="E-mail"
            value={user?.email ?? ''}
            readOnly
            disabled
            hint="O e-mail não pode ser alterado aqui"
          />
          <Input
            label="Celular (WhatsApp)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+55 11 99999-9999"
            type="tel"
          />
        </CardContent>
      </Card>

      {/* Body data */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Dados corporais</h3>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Sexo</p>
            <div className="grid grid-cols-2 gap-3">
              {(['male', 'female'] as const).map((s) => (
                <SelectCard
                  key={s}
                  selected={sex === s}
                  onClick={() => setSex(s)}
                >
                  <span className="text-sm font-medium">
                    {s === 'male' ? 'Masculino' : 'Feminino'}
                  </span>
                </SelectCard>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input
              label="Idade"
              type="number"
              min={10}
              max={100}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="25"
            />
            <Input
              label="Peso (kg)"
              type="number"
              min={30}
              max={300}
              step={0.1}
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70"
            />
            <Input
              label="Altura (cm)"
              type="number"
              min={100}
              max={250}
              value={height}
              onChange={(e) => setHeight(e.target.value)}
              placeholder="170"
            />
          </div>
        </CardContent>
      </Card>

      <Button
        variant="primary"
        icon={<Save className="w-4 h-4" />}
        loading={saving}
        onClick={handleSave}
        fullWidth
      >
        Salvar Alterações
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SECTION — Objetivo & Treino
   ══════════════════════════════════════════════════════════════════════════ */
const GOALS = [
  { id: 'hypertrophy', label: 'Hipertrofia', emoji: '💪', desc: 'Ganhar massa muscular' },
  { id: 'weight_loss', label: 'Emagrecimento', emoji: '🔥', desc: 'Perder gordura' },
  { id: 'definition', label: 'Definição', emoji: '✂️', desc: 'Ficar definido' },
  { id: 'health', label: 'Saúde', emoji: '❤️', desc: 'Bem-estar geral' },
] as const;

const EXPERIENCES = [
  { id: 'beginner', label: 'Iniciante', desc: 'Menos de 1 ano' },
  { id: 'intermediate', label: 'Intermediário', desc: '1 a 3 anos' },
  { id: 'advanced', label: 'Avançado', desc: 'Mais de 3 anos' },
] as const;

const EQUIPMENT_OPTIONS = [
  'Barra', 'Halteres', 'Kettlebell', 'Máquinas', 'Cabo', 'Elástico',
  'TRX', 'Peso corporal', 'Banco', 'Bola',
];

function SectionObjetivo() {
  const { profile, updateProfile } = useAuthStore();

  const [goal, setGoal] = useState(profile?.goal ?? '');
  const [experience, setExperience] = useState(profile?.experience ?? '');
  const [daysPerWeek, setDaysPerWeek] = useState((profile?.available_days ?? []).length || 3);
  const [sessionTime, setSessionTime] = useState(profile?.workout_time ?? 60);
  const [location, setLocation] = useState<'gym' | 'home' | ''>(profile?.location ?? '');
  const [equipment, setEquipment] = useState<string[]>(profile?.equipment ?? []);
  const [saving, setSaving] = useState(false);

  function toggleEquipment(item: string) {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item],
    );
  }

  async function handleSave() {
    setSaving(true);
    try {
      await updateProfile({
        goal: goal || undefined,
        experience: experience || undefined,
        days_per_week: daysPerWeek,
        session_time: sessionTime,
        location: location || undefined,
        equipment,
      } as Parameters<typeof updateProfile>[0]);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Objetivo & Treino" description="Personalize seu plano de treino" />

      {/* Goal */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Meu objetivo</h3>
          <div className="grid grid-cols-2 gap-3">
            {GOALS.map((g) => (
              <SelectCard
                key={g.id}
                selected={goal === g.id}
                onClick={() => setGoal(g.id)}
              >
                <span className="text-2xl mb-1 block">{g.emoji}</span>
                <p className="text-sm font-semibold text-gray-800">{g.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
              </SelectCard>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Experience */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Nível de experiência</h3>
          <div className="grid grid-cols-3 gap-3">
            {EXPERIENCES.map((e) => (
              <SelectCard
                key={e.id}
                selected={experience === e.id}
                onClick={() => setExperience(e.id)}
              >
                <p className="text-sm font-semibold text-gray-800">{e.label}</p>
                <p className="text-xs text-gray-500 mt-0.5">{e.desc}</p>
              </SelectCard>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule & Location */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Agenda & local</h3>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Dias por semana"
              type="number"
              min={1}
              max={7}
              value={String(daysPerWeek)}
              onChange={(e) => setDaysPerWeek(Number(e.target.value))}
            />
            <Input
              label="Duração (min)"
              type="number"
              min={15}
              max={180}
              step={5}
              value={String(sessionTime)}
              onChange={(e) => setSessionTime(Number(e.target.value))}
            />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Local de treino</p>
            <div className="grid grid-cols-2 gap-3">
              {(['gym', 'home'] as const).map((loc) => (
                <SelectCard
                  key={loc}
                  selected={location === loc}
                  onClick={() => setLocation(loc)}
                >
                  <p className="text-sm font-semibold text-gray-800">
                    {loc === 'gym' ? 'Academia' : 'Em casa'}
                  </p>
                </SelectCard>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Equipment */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Equipamentos disponíveis</h3>
          <div className="flex flex-wrap gap-2">
            {EQUIPMENT_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleEquipment(item)}
                className={cn(
                  'px-3 py-1.5 rounded-full border-2 text-sm font-medium transition-all duration-200',
                  equipment.includes(item)
                    ? 'border-teal-700 bg-teal-700 text-white'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-teal-300',
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Button variant="primary" loading={saving} onClick={handleSave} fullWidth>
        Atualizar
      </Button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SECTION — Notificações
   ══════════════════════════════════════════════════════════════════════════ */
function SectionNotificacoes() {
  const [workout, setWorkout] = useState(true);
  const [workoutTime, setWorkoutTime] = useState('07:00');
  const [water, setWater] = useState(true);
  const [waterInterval, setWaterInterval] = useState('60');
  const [devotional, setDevotional] = useState(true);
  const [devotionalTime, setDevotionalTime] = useState('06:00');
  const [weight, setWeight] = useState(false);
  const [achievements, setAchievements] = useState(true);
  const [community, setCommunity] = useState(false);
  const [newsletter, setNewsletter] = useState(true);
  const [promotions, setPromotions] = useState(false);
  const [updates, setUpdates] = useState(true);

  return (
    <div className="space-y-6">
      <SectionHeader title="Notificações" description="Controle os seus alertas e lembretes" />

      {/* Push notifications */}
      <Card>
        <CardContent className="space-y-1 divide-y divide-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 pb-3">Push / App</h3>

          <ToggleRow
            label="Lembrete de treino"
            description="Notificação para não pular o treino"
            checked={workout}
            onChange={setWorkout}
          >
            <Input
              label="Horário"
              type="time"
              value={workoutTime}
              onChange={(e) => setWorkoutTime(e.target.value)}
              className="max-w-[160px]"
            />
          </ToggleRow>

          <ToggleRow
            label="Lembrete de água"
            description="Mantenha-se hidratado"
            checked={water}
            onChange={setWater}
          >
            <div className="flex items-end gap-3">
              <Input
                label="Intervalo (min)"
                type="number"
                min={15}
                max={240}
                step={15}
                value={waterInterval}
                onChange={(e) => setWaterInterval(e.target.value)}
                className="max-w-[140px]"
              />
            </div>
          </ToggleRow>

          <ToggleRow
            label="Devocional diário"
            description="Versículo e reflexão matinal"
            checked={devotional}
            onChange={setDevotional}
          >
            <Input
              label="Horário"
              type="time"
              value={devotionalTime}
              onChange={(e) => setDevotionalTime(e.target.value)}
              className="max-w-[160px]"
            />
          </ToggleRow>

          <ToggleRow
            label="Registro de peso semanal"
            description="Lembrete às segundas-feiras"
            checked={weight}
            onChange={setWeight}
          />

          <ToggleRow
            label="Conquistas"
            description="Ao desbloquear medalhas e marcos"
            checked={achievements}
            onChange={setAchievements}
          />

          <ToggleRow
            label="Comunidade"
            description="Comentários e curtidas nos seus treinos"
            checked={community}
            onChange={setCommunity}
          />
        </CardContent>
      </Card>

      {/* Email notifications */}
      <Card>
        <CardContent className="space-y-1 divide-y divide-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 pb-3">E-mail</h3>

          <ToggleRow
            label="Newsletter"
            description="Dicas de treino e nutrição semanais"
            checked={newsletter}
            onChange={setNewsletter}
          />

          <ToggleRow
            label="Promoções"
            description="Ofertas e descontos exclusivos"
            checked={promotions}
            onChange={setPromotions}
          />

          <ToggleRow
            label="Atualizações do produto"
            description="Novidades e melhorias do app"
            checked={updates}
            onChange={setUpdates}
          />
        </CardContent>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SECTION — Assinatura
   ══════════════════════════════════════════════════════════════════════════ */
const MOCK_HISTORY = [
  { date: '01/06/2026', plan: 'Pro Mensal', amount: 'R$ 39,90', status: 'Pago' },
  { date: '01/05/2026', plan: 'Pro Mensal', amount: 'R$ 39,90', status: 'Pago' },
  { date: '01/04/2026', plan: 'Pro Mensal', amount: 'R$ 39,90', status: 'Pago' },
];

function PlanBadge({ plan }: { plan: 'free' | 'trial' | 'pro' | 'annual' }) {
  const map = {
    free: { label: 'Gratuito', cls: 'bg-gray-100 text-gray-600' },
    trial: { label: 'Trial 7 dias', cls: 'bg-amber-100 text-amber-700' },
    pro: { label: 'Pro', cls: 'bg-teal-100 text-teal-700' },
    annual: { label: 'Anual', cls: 'bg-purple-100 text-purple-700' },
  };
  const { label, cls } = map[plan];
  return (
    <span className={cn('px-2.5 py-0.5 rounded-full text-xs font-semibold', cls)}>
      {label}
    </span>
  );
}

function SectionAssinatura() {
  const currentPlan = 'pro' as 'free' | 'trial' | 'pro' | 'annual';
  const [managing, setManaging] = useState(false);

  const features = [
    'Treinos ilimitados com IA',
    'Devocional diário personalizado',
    'Histórico completo',
    'Comunidade premium',
    'Suporte prioritário',
  ];

  return (
    <div className="space-y-6">
      <SectionHeader title="Assinatura" description="Gerencie seu plano e pagamentos" />

      {/* Current plan */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Plano atual</p>
              <p className="text-xl font-bold text-gray-900 mt-0.5">Pro Mensal</p>
            </div>
            <PlanBadge plan={currentPlan} />
          </div>

          <ul className="space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center shrink-0 text-[10px] font-bold">
                  ✓
                </span>
                {f}
              </li>
            ))}
          </ul>

          {(currentPlan === 'free' || currentPlan === 'trial') && (
            <Button variant="gold" fullWidth>
              Fazer Upgrade para Pro
            </Button>
          )}

          <Button
            variant="secondary"
            fullWidth
            icon={<ChevronRight className="w-4 h-4" />}
            iconPosition="right"
            onClick={() => setManaging(!managing)}
          >
            Gerenciar Assinatura
          </Button>

          {managing && (
            <div className="border border-gray-200 rounded-xl p-4 space-y-3 bg-gray-50">
              <p className="text-sm font-medium text-gray-700">Opções de gerenciamento</p>
              <Button variant="secondary" size="sm" fullWidth>
                Alterar plano
              </Button>
              <Button variant="danger" size="sm" fullWidth>
                Cancelar assinatura
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment history */}
      <Card>
        <CardContent>
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Histórico de pagamentos</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Data</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Plano</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Valor</th>
                  <th className="text-left py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCK_HISTORY.map((row, i) => (
                  <tr key={i}>
                    <td className="py-2.5 text-gray-700">{row.date}</td>
                    <td className="py-2.5 text-gray-700">{row.plan}</td>
                    <td className="py-2.5 text-gray-700">{row.amount}</td>
                    <td className="py-2.5">
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SECTION — Privacidade & Segurança
   ══════════════════════════════════════════════════════════════════════════ */
function SectionPrivacidade() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactor, setTwoFactor] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  async function handleChangePassword() {
    setPwError('');
    if (newPassword !== confirmPassword) {
      setPwError('As senhas não coincidem.');
      return;
    }
    if (newPassword.length < 8) {
      setPwError('A nova senha deve ter pelo menos 8 caracteres.');
      return;
    }
    setSavingPw(true);
    try {
      // In production: call supabase.auth.updateUser({ password: newPassword })
      await new Promise((r) => setTimeout(r, 800));
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } finally {
      setSavingPw(false);
    }
  }

  function handleExportData() {
    const data = JSON.stringify({ exported: new Date().toISOString() }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meus_dados.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Privacidade & Segurança" description="Gerencie suas credenciais e dados" />

      {/* Change password */}
      <Card>
        <CardContent className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700">Alterar senha</h3>
          <Input
            label="Senha atual"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
          />
          <Input
            label="Nova senha"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Mínimo 8 caracteres"
          />
          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            error={pwError}
          />
          <Button
            variant="primary"
            loading={savingPw}
            onClick={handleChangePassword}
            disabled={!currentPassword || !newPassword || !confirmPassword}
            fullWidth
          >
            Alterar senha
          </Button>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-800">Autenticação em dois fatores</p>
              <p className="text-xs text-gray-500 mt-0.5">Proteção adicional para sua conta</p>
            </div>
            <Toggle checked={twoFactor} onChange={setTwoFactor} />
          </div>
          {twoFactor && (
            <p className="mt-3 text-xs text-amber-600 bg-amber-50 rounded-lg p-3">
              Configuração via aplicativo autenticador (em breve).
            </p>
          )}
        </CardContent>
      </Card>

      {/* Data export */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Seus dados</h3>
          <p className="text-xs text-gray-500">
            Exporte uma cópia de todos os seus dados armazenados no aplicativo.
          </p>
          <Button variant="secondary" onClick={handleExportData} fullWidth>
            Exportar meus dados
          </Button>
        </CardContent>
      </Card>

      {/* Delete account */}
      <Card className="border-red-100">
        <CardContent className="space-y-3">
          <h3 className="text-sm font-semibold text-red-600">Zona de perigo</h3>
          <p className="text-xs text-gray-500">
            A exclusão da conta é permanente e não pode ser desfeita. Todos os seus dados serão removidos.
          </p>
          <Button
            variant="danger"
            icon={<Trash2 className="w-4 h-4" />}
            onClick={() => setDeleteOpen(true)}
            fullWidth
          >
            Excluir minha conta
          </Button>
        </CardContent>
      </Card>

      <DeleteModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          // In production: delete account logic
        }}
      />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   SECTION — Aparência
   ══════════════════════════════════════════════════════════════════════════ */
function ThemePreview({ dark }: { dark: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border-2 p-3 w-full transition-all duration-300',
        dark ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-200',
      )}
    >
      <div className="space-y-2">
        <div className={cn('h-2 rounded-full w-3/4', dark ? 'bg-gray-700' : 'bg-gray-200')} />
        <div className={cn('h-2 rounded-full w-1/2', dark ? 'bg-gray-700' : 'bg-gray-200')} />
        <div className="flex gap-1.5 mt-3">
          <div className={cn('h-6 rounded-lg flex-1', dark ? 'bg-teal-700' : 'bg-teal-500')} />
          <div className={cn('h-6 rounded-lg flex-1', dark ? 'bg-gray-700' : 'bg-gray-200')} />
        </div>
      </div>
    </div>
  );
}

function SectionAparencia() {
  const [darkMode, setDarkMode] = useState(
    document.documentElement.classList.contains('dark'),
  );
  const [language, setLanguage] = useState<'pt-BR' | 'en'>('pt-BR');

  function handleDarkMode(val: boolean) {
    setDarkMode(val);
    if (val) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  return (
    <div className="space-y-6">
      <SectionHeader title="Aparência" description="Personalize o visual do aplicativo" />

      {/* Theme */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {darkMode ? (
                <Moon className="w-4 h-4 text-gray-600" />
              ) : (
                <Sun className="w-4 h-4 text-amber-500" />
              )}
              <span className="text-sm font-medium text-gray-800">
                {darkMode ? 'Modo escuro' : 'Modo claro'}
              </span>
            </div>
            <Toggle checked={darkMode} onChange={handleDarkMode} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <p className="text-xs text-center text-gray-500">Claro</p>
              <ThemePreview dark={false} />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-center text-gray-500">Escuro</p>
              <ThemePreview dark={true} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardContent className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700">Idioma</h3>
          <div className="grid grid-cols-2 gap-3">
            {(['pt-BR', 'en'] as const).map((lang) => (
              <SelectCard
                key={lang}
                selected={language === lang}
                onClick={() => setLanguage(lang)}
              >
                <p className="text-sm font-semibold text-gray-800">
                  {lang === 'pt-BR' ? '🇧🇷 Português' : '🇺🇸 English'}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {lang === 'pt-BR' ? 'Padrão' : 'English'}
                </p>
              </SelectCard>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

/* ─── Shared section header ──────────────────────────────────────────────── */
function SectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="pb-1">
      <h2 className="text-lg font-bold text-gray-900">{title}</h2>
      {description && <p className="text-sm text-gray-500 mt-0.5">{description}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════════════════
   MAIN — SettingsPage
   ══════════════════════════════════════════════════════════════════════════ */
export default function SettingsPage() {
  const [active, setActive] = useState<SectionId>('perfil');
  const [mobileOpen, setMobileOpen] = useState(false);
  const { signOut, user, profile } = useAuthStore();

  const sectionComponents: Record<SectionId, React.ReactNode> = {
    perfil: <SectionPerfil />,
    objetivo: <SectionObjetivo />,
    notificacoes: <SectionNotificacoes />,
    assinatura: <SectionAssinatura />,
    privacidade: <SectionPrivacidade />,
    aparencia: <SectionAparencia />,
  };

  const activeSection = SECTIONS.find((s) => s.id === active);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500 mt-1">Gerencie sua conta e preferências</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* ── Sidebar (desktop) / Accordion header (mobile) ── */}
          <aside className="lg:w-60 shrink-0">
            {/* Mobile: dropdown selector */}
            <div className="lg:hidden mb-4">
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-xl shadow-sm text-sm font-medium text-gray-800"
              >
                <span className="flex items-center gap-2">
                  {activeSection?.icon}
                  {activeSection?.label}
                </span>
                <ChevronRight
                  className={cn(
                    'w-4 h-4 text-gray-400 transition-transform duration-200',
                    mobileOpen && 'rotate-90',
                  )}
                />
              </button>

              {mobileOpen && (
                <div className="mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                  {SECTIONS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setActive(s.id);
                        setMobileOpen(false);
                      }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors',
                        active === s.id
                          ? 'bg-teal-50 text-teal-700'
                          : 'text-gray-700 hover:bg-gray-50',
                      )}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Desktop sidebar */}
            <nav className="hidden lg:block bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              {/* User summary */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <Avatar
                    name={profile?.name || user?.email || 'U'}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {profile?.name || 'Usuário'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                  </div>
                </div>
              </div>

              <ul className="py-2">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => setActive(s.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                        active === s.id
                          ? 'bg-teal-50 text-teal-700 border-r-2 border-teal-600'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800',
                      )}
                    >
                      {s.icon}
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>

              <div className="p-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sair da conta
                </button>
              </div>
            </nav>
          </aside>

          {/* ── Main content ── */}
          <main className="flex-1 min-w-0">
            {sectionComponents[active]}

            {/* Mobile logout */}
            <div className="mt-8 lg:hidden">
              <button
                type="button"
                onClick={() => signOut()}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-red-600 bg-white border border-red-100 rounded-xl shadow-sm hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair da conta
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
