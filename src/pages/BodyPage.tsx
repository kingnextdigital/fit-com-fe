import React, { useState, useRef } from 'react';
import {
  Scale,
  Ruler,
  Camera,
  PlusCircle,
  TrendingDown,
  TrendingUp,
  Minus,
  ChevronLeft,
  ChevronRight,
  Upload,
  CalendarDays,
  Activity,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { format, subMonths, subDays, differenceInDays, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { ProgressRing } from '@/components/ui/Progress';

// ---------------------------------------------------------------------------
// Utility
// ---------------------------------------------------------------------------

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BodyRecord {
  date: string; // ISO yyyy-MM-dd
  weight: number;
  bfp?: number; // body fat %
  measurements: {
    braco?: number;
    peitoral?: number;
    cintura?: number;
    quadril?: number;
    coxa?: number;
    panturrilha?: number;
    pescoco?: number;
  };
  notes?: string;
  photoUrl?: string;
}

// ---------------------------------------------------------------------------
// Mock data — 6 months of records (roughly one per week)
// ---------------------------------------------------------------------------

function generateMockData(): BodyRecord[] {
  const today = new Date(2026, 5, 25); // June 25 2026
  const records: BodyRecord[] = [];

  const weights    = [95.2, 94.8, 94.3, 93.7, 93.1, 92.8, 92.3, 91.9, 91.4, 90.8, 90.3, 89.8,
                      89.4, 89.0, 88.6, 88.2, 87.9, 87.5, 87.1, 86.8, 86.4, 86.0, 85.7, 85.4, 85.1];
  const bfps       = [24.1, 23.9, 23.7, 23.4, 23.2, 23.0, 22.8, 22.5, 22.3, 22.1, 21.9, 21.7,
                      21.5, 21.3, 21.1, 20.9, 20.8, 20.6, 20.4, 20.2, 20.0, 19.9, 19.7, 19.5, 19.4];
  const bracos     = [38, 38, 38.5, 38.5, 39, 39, 39.5, 39.5, 40, 40, 40.5, 40.5, 41, 41, 41, 41.5, 41.5, 42, 42, 42, 42.5, 42.5, 43, 43, 43];
  const peitorais  = [104, 104, 103.5, 103, 103, 102.5, 102, 102, 101.5, 101, 101, 100.5, 100, 100, 99.5, 99, 99, 98.5, 98, 98, 97.5, 97, 97, 96.5, 96];
  const cinturas   = [99, 98.5, 98, 97.5, 97, 96.5, 96, 95.5, 95, 94.5, 94, 93.5, 93, 92.5, 92, 91.5, 91, 90.5, 90, 89.5, 89, 88.5, 88, 87.5, 87];
  const quadris    = [108, 107.5, 107, 106.5, 106, 105.5, 105, 104.5, 104, 103.5, 103, 102.5, 102, 101.5, 101, 100.5, 100, 99.5, 99, 98.5, 98, 97.5, 97, 96.5, 96];
  const coxas      = [60, 60, 60.5, 60.5, 61, 61, 61.5, 61.5, 62, 62, 62.5, 62.5, 63, 63, 63, 63.5, 63.5, 64, 64, 64, 64.5, 64.5, 65, 65, 65];
  const panturrilhas = [38, 38, 38.5, 38.5, 39, 39, 39, 39.5, 39.5, 40, 40, 40, 40.5, 40.5, 40.5, 41, 41, 41, 41.5, 41.5, 41.5, 42, 42, 42, 42];
  const pescocos   = [40, 40, 40.5, 40.5, 41, 41, 41, 41.5, 41.5, 41.5, 42, 42, 42, 42.5, 42.5, 42.5, 43, 43, 43, 43.5, 43.5, 43.5, 44, 44, 44];

  const photoUrls = [
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1517963879433-6ad2b056d712?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=300&h=400&fit=crop',
    'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=300&h=400&fit=crop',
  ];

  for (let i = 0; i < 25; i++) {
    const date = subDays(today, (24 - i) * 7);
    records.push({
      date: format(date, 'yyyy-MM-dd'),
      weight: weights[i],
      bfp: bfps[i],
      measurements: {
        braco: bracos[i],
        peitoral: peitorais[i],
        cintura: cinturas[i],
        quadril: quadris[i],
        coxa: coxas[i],
        panturrilha: panturrilhas[i],
        pescoco: pescocos[i],
      },
      notes: i % 5 === 0 ? 'Sentindo progresso na dieta e nos treinos.' : undefined,
      photoUrl: i % 4 === 0 ? photoUrls[Math.floor(i / 4) % photoUrls.length] : undefined,
    });
  }
  return records;
}

const MOCK_RECORDS = generateMockData();
const GOAL_WEIGHT = 80;
const USER_HEIGHT = 1.78; // meters

// ---------------------------------------------------------------------------
// IMC helpers
// ---------------------------------------------------------------------------

function calcIMC(weight: number, height: number): number {
  return weight / (height * height);
}

function imcCategory(imc: number): { label: string; color: string; bg: string } {
  if (imc < 18.5) return { label: 'Abaixo do peso', color: 'text-blue-600', bg: 'bg-blue-50' };
  if (imc < 25)   return { label: 'Peso normal',    color: 'text-emerald-600', bg: 'bg-emerald-50' };
  if (imc < 30)   return { label: 'Sobrepeso',      color: 'text-amber-600',   bg: 'bg-amber-50' };
  if (imc < 35)   return { label: 'Obesidade I',    color: 'text-orange-600',  bg: 'bg-orange-50' };
  return              { label: 'Obesidade II+',  color: 'text-red-600',     bg: 'bg-red-50' };
}

// ---------------------------------------------------------------------------
// Measurement labels
// ---------------------------------------------------------------------------

const MEASUREMENT_KEYS = [
  { key: 'braco',       label: 'Braço',       positive: 'up' as const },
  { key: 'peitoral',    label: 'Peitoral',    positive: 'down' as const },
  { key: 'cintura',     label: 'Cintura',     positive: 'down' as const },
  { key: 'quadril',     label: 'Quadril',     positive: 'down' as const },
  { key: 'coxa',        label: 'Coxa',        positive: 'up' as const },
  { key: 'panturrilha', label: 'Panturrilha', positive: 'up' as const },
  { key: 'pescoco',     label: 'Pescoço',     positive: 'up' as const },
] as const;

type MeasurementKey = typeof MEASUREMENT_KEYS[number]['key'];

// ---------------------------------------------------------------------------
// Mini sparkline
// ---------------------------------------------------------------------------

function MiniSparkline({
  data,
  color,
}: {
  data: number[];
  color: 'green' | 'red' | 'gray';
}) {
  if (!data || data.length < 2) return null;
  const W = 64, H = 24;
  const min = Math.min(...data), max = Math.max(...data);
  const range = max - min || 1;
  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => H - ((v - min) / range) * (H - 4) - 2;
  const points = data.map((v, i) => `${toX(i)},${toY(v)}`).join(' ');
  const stroke = color === 'green' ? '#10b981' : color === 'red' ? '#ef4444' : '#9ca3af';
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-16 h-6" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Body silhouette SVG
// ---------------------------------------------------------------------------

function BodySilhouette() {
  return (
    <svg viewBox="0 0 160 340" className="w-full h-auto" aria-hidden="true">
      {/* Head */}
      <ellipse cx="80" cy="28" rx="20" ry="24" fill="#e5e7eb" />
      {/* Neck */}
      <rect x="72" y="50" width="16" height="14" rx="4" fill="#e5e7eb" />
      {/* Shoulders/Peitoral */}
      <path d="M40 64 Q80 58 120 64 L118 110 Q80 118 42 110 Z" fill="#e5e7eb" />
      {/* Arms */}
      <path d="M40 66 L22 130 Q18 136 22 140 L34 140 Q38 136 40 130 L48 70 Z" fill="#d1d5db" />
      <path d="M120 66 L138 130 Q142 136 138 140 L126 140 Q122 136 120 130 L112 70 Z" fill="#d1d5db" />
      {/* Torso */}
      <path d="M42 110 Q80 118 118 110 L114 190 Q80 198 46 190 Z" fill="#e5e7eb" />
      {/* Hips */}
      <path d="M46 190 Q80 198 114 190 L118 220 Q80 228 42 220 Z" fill="#d1d5db" />
      {/* Legs */}
      <path d="M46 220 L52 300 Q54 308 60 308 L72 308 Q78 308 76 300 L74 220 Z" fill="#e5e7eb" />
      <path d="M86 220 L84 300 Q82 308 88 308 L100 308 Q106 308 108 300 L114 220 Z" fill="#e5e7eb" />
      {/* Calves */}
      <path d="M52 280 L54 300 Q56 308 62 308 L72 308 Q76 306 74 300 L70 280 Z" fill="#d1d5db" />
      <path d="M90 280 L86 300 Q84 308 90 308 L100 308 Q106 306 108 300 L106 280 Z" fill="#d1d5db" />

      {/* Label dots and lines */}
      {/* Braço */}
      <circle cx="22" cy="110" r="3" fill="#14b8a6" />
      <line x1="22" y1="110" x2="4" y2="110" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2,2" />

      {/* Peitoral */}
      <circle cx="80" cy="84" r="3" fill="#14b8a6" />
      <line x1="80" y1="84" x2="80" y2="72" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2,2" />

      {/* Cintura */}
      <circle cx="44" cy="152" r="3" fill="#14b8a6" />
      <line x1="44" y1="152" x2="4" y2="152" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2,2" />

      {/* Quadril */}
      <circle cx="42" cy="205" r="3" fill="#14b8a6" />
      <line x1="42" y1="205" x2="4" y2="205" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2,2" />

      {/* Coxa */}
      <circle cx="60" cy="248" r="3" fill="#14b8a6" />
      <line x1="60" y1="248" x2="4" y2="248" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2,2" />

      {/* Panturrilha */}
      <circle cx="62" cy="292" r="3" fill="#14b8a6" />
      <line x1="62" y1="292" x2="4" y2="292" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2,2" />

      {/* Pescoço */}
      <circle cx="80" cy="55" r="3" fill="#14b8a6" />
      <line x1="80" y1="55" x2="140" y2="55" stroke="#14b8a6" strokeWidth="1" strokeDasharray="2,2" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Custom tooltip for weight chart
// ---------------------------------------------------------------------------

function WeightTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-3 py-2 text-sm">
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="font-semibold text-gray-800">{payload[0].value} kg</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Before/After slider component
// ---------------------------------------------------------------------------

function BeforeAfterSlider({ before, after }: { before: string; after: string }) {
  const [position, setPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(95, Math.max(5, pct)));
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-64 rounded-2xl overflow-hidden select-none cursor-col-resize border border-gray-100"
      onMouseMove={(e) => handleMove(e.clientX)}
      onTouchMove={(e) => handleMove(e.touches[0].clientX)}
    >
      {/* After (right side, full width) */}
      <img src={after} alt="Depois" className="absolute inset-0 w-full h-full object-cover" />

      {/* Before (left side, clipped) */}
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${position}%` }}>
        <img src={before} alt="Antes" className="absolute inset-0 w-full h-full object-cover" style={{ minWidth: `${10000 / position}%`, left: 0 }} />
      </div>

      {/* Divider */}
      <div
        className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg"
        style={{ left: `${position}%` }}
      >
        <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center">
          <ChevronLeft className="w-3 h-3 text-gray-500" />
          <ChevronRight className="w-3 h-3 text-gray-500" />
        </div>
      </div>

      {/* Labels */}
      <span className="absolute bottom-3 left-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">Antes</span>
      <span className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2 py-1 rounded-lg backdrop-blur-sm">Depois</span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Register Modal
// ---------------------------------------------------------------------------

interface RegisterForm {
  date: string;
  weight: string;
  bfp: string;
  braco: string;
  peitoral: string;
  cintura: string;
  quadril: string;
  coxa: string;
  panturrilha: string;
  pescoco: string;
  notes: string;
}

function RegisterModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const today = format(new Date(), 'yyyy-MM-dd');
  const [form, setForm] = useState<RegisterForm>({
    date: today,
    weight: '',
    bfp: '',
    braco: '',
    peitoral: '',
    cintura: '',
    quadril: '',
    coxa: '',
    panturrilha: '',
    pescoco: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      onClose();
    }, 900);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Registrar Medidas"
      subtitle="Preencha os campos disponíveis. Todos os campos de medida são opcionais."
      size="lg"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" loading={saving} onClick={handleSave}>Salvar</Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Date + Weight */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Data"
            type="date"
            value={form.date}
            onChange={set('date')}
          />
          <Input
            label="Peso (kg)"
            type="number"
            placeholder="85.4"
            value={form.weight}
            onChange={set('weight')}
          />
        </div>

        {/* Body fat */}
        <Input
          label="% Gordura Corporal (opcional)"
          type="number"
          placeholder="19.5"
          value={form.bfp}
          onChange={set('bfp')}
        />

        {/* Measurements */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-3">Medidas (cm) — opcionais</p>
          <div className="grid grid-cols-2 gap-3">
            {MEASUREMENT_KEYS.map(({ key, label }) => (
              <Input
                key={key}
                label={label}
                type="number"
                placeholder="—"
                value={form[key as keyof RegisterForm]}
                onChange={set(key as keyof RegisterForm)}
              />
            ))}
          </div>
        </div>

        {/* Photo upload */}
        <div>
          <p className="text-sm font-semibold text-gray-700 mb-2">Foto (opcional)</p>
          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors">
            <Upload className="w-6 h-6 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">Clique para selecionar uma foto</span>
            <input type="file" className="hidden" accept="image/*" />
          </label>
        </div>

        {/* Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-gray-700">Observações</label>
          <textarea
            className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none resize-none min-h-[80px] transition-all"
            placeholder="Como você está se sentindo? Alguma observação sobre o treino ou dieta..."
            value={form.notes}
            onChange={set('notes')}
          />
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

type ChartRange = 30 | 90 | 365;
type PhotoView = 'grid' | 'compare';

export default function BodyPage() {
  const [chartRange, setChartRange] = useState<ChartRange>(90);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [photoView, setPhotoView] = useState<PhotoView>('grid');

  // Derive stats from mock data
  const latest = MOCK_RECORDS[MOCK_RECORDS.length - 1];
  const oneMonthAgo = MOCK_RECORDS.find(
    (r) => differenceInDays(parseISO(latest.date), parseISO(r.date)) >= 28,
  ) ?? MOCK_RECORDS[0];

  const weightChange = +(latest.weight - oneMonthAgo.weight).toFixed(1);
  const imc = +calcIMC(latest.weight, USER_HEIGHT).toFixed(1);
  const imcInfo = imcCategory(imc);
  const daysSinceLast = differenceInDays(new Date(), parseISO(latest.date));

  // Weight chart data
  const cutoff = subDays(new Date(), chartRange);
  const chartData = MOCK_RECORDS
    .filter((r) => !cutoff || parseISO(r.date) >= cutoff)
    .map((r) => ({
      date: format(parseISO(r.date), chartRange <= 30 ? 'd/M' : 'MMM', { locale: ptBR }),
      peso: r.weight,
    }));

  // Photos
  const photosWithUrl = MOCK_RECORDS.filter((r) => r.photoUrl);
  const beforePhoto = photosWithUrl[0];
  const afterPhoto = photosWithUrl[photosWithUrl.length - 1];

  // Measurement sparklines
  function getSparkData(key: MeasurementKey): number[] {
    return MOCK_RECORDS
      .filter((r) => r.measurements[key] !== undefined)
      .slice(-10)
      .map((r) => r.measurements[key] as number);
  }

  function getMeasurementChange(key: MeasurementKey): { current: number; change: number } | null {
    const vals = MOCK_RECORDS.filter((r) => r.measurements[key] !== undefined);
    if (vals.length < 2) return null;
    const current = vals[vals.length - 1].measurements[key] as number;
    const prev = vals[vals.length - 2].measurements[key] as number;
    return { current, change: +(current - prev).toFixed(1) };
  }

  const goalProgress = Math.max(0, Math.min(100, ((95.2 - latest.weight) / (95.2 - GOAL_WEIGHT)) * 100));

  return (
    <div className="space-y-6 pb-8">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Evolução Corporal</h1>
          <p className="text-sm text-gray-400 mt-0.5">Acompanhe seu progresso físico semana a semana</p>
        </div>
        <Button
          variant="primary"
          icon={<PlusCircle className="w-4 h-4" />}
          onClick={() => setRegisterOpen(true)}
        >
          Registrar Medidas
        </Button>
      </div>

      {/* ── Current Stats row ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        {/* Weight */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white">
              <Scale className="w-5 h-5" />
            </div>
            <span className={cn(
              'text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-0.5',
              weightChange < 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
            )}>
              {weightChange < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {Math.abs(weightChange)} kg
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800 leading-none mb-1">{latest.weight} kg</p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Peso Atual</p>
        </div>

        {/* IMC */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-violet-500 flex items-center justify-center text-white">
              <Activity className="w-5 h-5" />
            </div>
            <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', imcInfo.bg, imcInfo.color)}>
              {imcInfo.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-gray-800 leading-none mb-1">{imc}</p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">IMC</p>
        </div>

        {/* Body fat */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white">
              <Ruler className="w-5 h-5" />
            </div>
            {latest.bfp && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                {latest.bfp < 20 ? 'Atlético' : latest.bfp < 25 ? 'Bom' : 'Acima'}
              </span>
            )}
          </div>
          <p className="text-2xl font-bold text-gray-800 leading-none mb-1">
            {latest.bfp != null ? `${latest.bfp}%` : '—'}
          </p>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">Gordura Corp.</p>
        </div>

        {/* Goal progress */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 flex items-center justify-center text-white">
              <Target className="w-5 h-5" />
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              Meta {GOAL_WEIGHT} kg
            </span>
          </div>
          <div className="flex items-center gap-3">
            <ProgressRing
              value={goalProgress}
              size={52}
              strokeWidth={6}
              color="green"
              label={`${Math.round(goalProgress)}%`}
              animated
            />
            <div>
              <p className="text-lg font-bold text-gray-800 leading-none mb-0.5">
                {Math.round(goalProgress)}%
              </p>
              <p className="text-xs text-gray-400">
                Faltam {(latest.weight - GOAL_WEIGHT).toFixed(1)} kg
              </p>
            </div>
          </div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mt-2">
            {daysSinceLast === 0 ? 'Medido hoje' : `Há ${daysSinceLast} dia${daysSinceLast > 1 ? 's' : ''}`}
          </p>
        </div>

      </div>

      {/* ── Weight Chart ── */}
      <Card>
        <CardHeader
          title="Evolução do Peso"
          subtitle={`Meta: ${GOAL_WEIGHT} kg`}
          icon={<Scale className="w-5 h-5" />}
          action={
            <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
              {([30, 90, 365] as ChartRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setChartRange(r)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                    chartRange === r
                      ? 'bg-white text-teal-700 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  {r === 365 ? '1 ano' : `${r}d`}
                </button>
              ))}
            </div>
          }
        />
        <CardContent className="pt-2">
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fontSize: 11, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}`}
              />
              <Tooltip content={<WeightTooltip />} />
              <ReferenceLine
                y={GOAL_WEIGHT}
                stroke="#10b981"
                strokeDasharray="6 4"
                strokeWidth={1.5}
                label={{ value: `Meta ${GOAL_WEIGHT}kg`, position: 'right', fontSize: 10, fill: '#10b981' }}
              />
              <Line
                type="monotone"
                dataKey="peso"
                stroke="#14b8a6"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: '#14b8a6', strokeWidth: 2, stroke: '#fff' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* ── Measurements panel ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Body silhouette */}
        <Card className="lg:col-span-1">
          <CardHeader
            title="Mapa Corporal"
            subtitle="Pontos de medição"
            icon={<Activity className="w-5 h-5" />}
          />
          <CardContent>
            <div className="flex">
              {/* Silhouette */}
              <div className="w-28 flex-shrink-0">
                <BodySilhouette />
              </div>
              {/* Labels aligned */}
              <div className="flex-1 flex flex-col justify-between pl-2 py-1 text-xs text-gray-500 font-medium" style={{ minHeight: 300 }}>
                <span className="mt-[30px]">Pescoço</span>
                <span className="mt-[22px]">Braço</span>
                <span className="mt-[14px]">Peitoral</span>
                <span className="mt-[20px]">Cintura</span>
                <span className="mt-[28px]">Quadril</span>
                <span className="mt-[24px]">Coxa</span>
                <span className="mt-[26px]">Panturrilha</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Measurements list */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Medidas Atuais"
            subtitle="Comparado ao registro anterior"
            icon={<Ruler className="w-5 h-5" />}
            action={
              <div className="flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1 text-emerald-500"><span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />Melhora</span>
                <span className="flex items-center gap-1 text-red-400"><span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Regressão</span>
              </div>
            }
          />
          <CardContent>
            <div className="space-y-3">
              {MEASUREMENT_KEYS.map(({ key, label, positive }) => {
                const info = getMeasurementChange(key);
                if (!info) return null;
                const { current, change } = info;

                let trendColor: 'green' | 'red' | 'gray' = 'gray';
                if (change !== 0) {
                  const isImprovement = positive === 'down' ? change < 0 : change > 0;
                  trendColor = isImprovement ? 'green' : 'red';
                }

                const sparkData = getSparkData(key);

                return (
                  <div
                    key={key}
                    className="flex items-center gap-4 py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <div className="w-24 flex-shrink-0">
                      <p className="text-sm font-medium text-gray-700">{label}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-800">{current} cm</span>
                        {change !== 0 && (
                          <span className={cn(
                            'text-xs font-semibold flex items-center gap-0.5',
                            trendColor === 'green' ? 'text-emerald-500' :
                            trendColor === 'red' ? 'text-red-400' : 'text-gray-400'
                          )}>
                            {change > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {change > 0 ? '+' : ''}{change}
                          </span>
                        )}
                        {change === 0 && (
                          <span className="text-xs text-gray-400 flex items-center gap-0.5">
                            <Minus className="w-3 h-3" /> igual
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <MiniSparkline data={sparkData} color={trendColor} />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Progress Photos ── */}
      <Card>
        <CardHeader
          title="Fotos de Progresso"
          subtitle={`${photosWithUrl.length} fotos registradas`}
          icon={<Camera className="w-5 h-5" />}
          action={
            <div className="flex items-center gap-2">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                <button
                  onClick={() => setPhotoView('grid')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                    photoView === 'grid' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Grade
                </button>
                <button
                  onClick={() => setPhotoView('compare')}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-semibold transition-all',
                    photoView === 'compare' ? 'bg-white text-teal-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                  )}
                >
                  Comparar
                </button>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<Upload className="w-3.5 h-3.5" />}
                onClick={() => setRegisterOpen(true)}
              >
                Enviar
              </Button>
            </div>
          }
        />
        <CardContent>
          {photoView === 'grid' ? (
            <div className="grid grid-cols-3 gap-3">
              {photosWithUrl.map((record) => (
                <div key={record.date} className="relative group rounded-xl overflow-hidden aspect-[3/4] bg-gray-100">
                  <img
                    src={record.photoUrl}
                    alt={`Foto ${record.date}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-white text-xs font-semibold">
                        {format(parseISO(record.date), "d 'de' MMM, yyyy", { locale: ptBR })}
                      </p>
                      <p className="text-white/80 text-xs">{record.weight} kg</p>
                    </div>
                  </div>
                  <div className="absolute top-2 left-2">
                    <span className="bg-black/40 backdrop-blur-sm text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md">
                      {format(parseISO(record.date), 'MMM yy', { locale: ptBR })}
                    </span>
                  </div>
                </div>
              ))}

              {/* Upload placeholder */}
              <label className="relative rounded-xl overflow-hidden aspect-[3/4] bg-gray-50 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors group">
                <Upload className="w-6 h-6 text-gray-300 group-hover:text-teal-400 transition-colors mb-2" />
                <span className="text-xs text-gray-400 group-hover:text-teal-500 transition-colors text-center px-2">Nova foto</span>
                <input type="file" className="hidden" accept="image/*" />
              </label>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500 text-center">
                Arraste o divisor para comparar as fotos antes e depois
              </p>
              {beforePhoto && afterPhoto && beforePhoto.photoUrl && afterPhoto.photoUrl ? (
                <BeforeAfterSlider before={beforePhoto.photoUrl} after={afterPhoto.photoUrl} />
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
                  Fotos insuficientes para comparação
                </div>
              )}
              <div className="flex justify-between text-xs text-gray-400">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>
                    Antes: {beforePhoto ? format(parseISO(beforePhoto.date), "d 'de' MMM, yyyy", { locale: ptBR }) : '—'}
                    {beforePhoto ? ` • ${beforePhoto.weight} kg` : ''}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>
                    Depois: {afterPhoto ? format(parseISO(afterPhoto.date), "d 'de' MMM, yyyy", { locale: ptBR }) : '—'}
                    {afterPhoto ? ` • ${afterPhoto.weight} kg` : ''}
                  </span>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Register Modal ── */}
      <RegisterModal open={registerOpen} onClose={() => setRegisterOpen(false)} />
    </div>
  );
}
