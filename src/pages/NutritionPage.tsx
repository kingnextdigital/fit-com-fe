import React, { useState, useMemo } from 'react';
import {
  Apple,
  Plus,
  Search,
  Droplets,
  Zap,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  Trash2,
  Check,
  Calculator,
  Bell,
  X,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { format, subDays, isToday, isYesterday } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import Input from '@/components/ui/Input';
import { ProgressBar } from '@/components/ui/Progress';
import { cn } from '@/lib/utils';
import { calculateTDEE, calculateMacros } from '@/lib/utils';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
}

interface Meal {
  id: string;
  name: string;
  icon: string;
  items: FoodItem[];
}

interface Supplement {
  id: string;
  name: string;
  dose: string;
  times: string[];
  taken: boolean;
}

// ---------------------------------------------------------------------------
// Mock food database (20 items)
// ---------------------------------------------------------------------------

const FOOD_DATABASE = [
  { id: 'f1',  name: 'Arroz branco cozido',    calories: 128, protein: 2.7, carbs: 28.1, fat: 0.3, unit: 'g'  },
  { id: 'f2',  name: 'Frango grelhado (peito)', calories: 165, protein: 31,  carbs: 0,    fat: 3.6, unit: 'g'  },
  { id: 'f3',  name: 'Feijão carioca cozido',   calories: 76,  protein: 4.8, carbs: 13.6, fat: 0.5, unit: 'g'  },
  { id: 'f4',  name: 'Ovo cozido',              calories: 155, protein: 13,  carbs: 1.1,  fat: 11,  unit: 'un' },
  { id: 'f5',  name: 'Batata-doce cozida',      calories: 90,  protein: 2,   carbs: 21,   fat: 0.1, unit: 'g'  },
  { id: 'f6',  name: 'Aveia em flocos',         calories: 366, protein: 13,  carbs: 66,   fat: 7,   unit: 'g'  },
  { id: 'f7',  name: 'Banana prata',            calories: 89,  protein: 1.1, carbs: 23,   fat: 0.3, unit: 'un' },
  { id: 'f8',  name: 'Leite desnatado',         calories: 35,  protein: 3.5, carbs: 5,    fat: 0.1, unit: 'ml' },
  { id: 'f9',  name: 'Whey protein (scoop)',    calories: 120, protein: 24,  carbs: 3,    fat: 1.5, unit: 'un' },
  { id: 'f10', name: 'Pão integral (fatia)',    calories: 70,  protein: 3,   carbs: 13,   fat: 1,   unit: 'un' },
  { id: 'f11', name: 'Queijo cottage',          calories: 98,  protein: 11,  carbs: 3.4,  fat: 4.3, unit: 'g'  },
  { id: 'f12', name: 'Brócolis cozido',         calories: 35,  protein: 2.4, carbs: 7.2,  fat: 0.4, unit: 'g'  },
  { id: 'f13', name: 'Azeite de oliva',         calories: 884, protein: 0,   carbs: 0,    fat: 100, unit: 'ml' },
  { id: 'f14', name: 'Iogurte grego natural',   calories: 97,  protein: 10,  carbs: 3.6,  fat: 5,   unit: 'g'  },
  { id: 'f15', name: 'Amêndoas',                calories: 579, protein: 21,  carbs: 22,   fat: 50,  unit: 'g'  },
  { id: 'f16', name: 'Salmão grelhado',         calories: 208, protein: 20,  carbs: 0,    fat: 13,  unit: 'g'  },
  { id: 'f17', name: 'Maçã',                    calories: 52,  protein: 0.3, carbs: 14,   fat: 0.2, unit: 'un' },
  { id: 'f18', name: 'Carne bovina (patinho)',  calories: 219, protein: 28,  carbs: 0,    fat: 12,  unit: 'g'  },
  { id: 'f19', name: 'Macarrão cozido',         calories: 131, protein: 5,   carbs: 25,   fat: 1.1, unit: 'g'  },
  { id: 'f20', name: 'Laranja',                 calories: 47,  protein: 0.9, carbs: 12,   fat: 0.1, unit: 'un' },
];

// ---------------------------------------------------------------------------
// Mock data for today
// ---------------------------------------------------------------------------

const INITIAL_MEALS: Meal[] = [
  {
    id: 'breakfast',
    name: 'Cafe da Manha',
    icon: '🌅',
    items: [
      { id: 'b1', name: 'Aveia em flocos', calories: 147, protein: 5.2, carbs: 26.4, fat: 2.8, quantity: 40, unit: 'g' },
      { id: 'b2', name: 'Banana prata', calories: 89, protein: 1.1, carbs: 23, fat: 0.3, quantity: 1, unit: 'un' },
      { id: 'b3', name: 'Leite desnatado', calories: 70, protein: 7, carbs: 10, fat: 0.2, quantity: 200, unit: 'ml' },
    ],
  },
  {
    id: 'lunch',
    name: 'Almoco',
    icon: '☀️',
    items: [
      { id: 'l1', name: 'Arroz branco cozido', calories: 192, protein: 4.1, carbs: 42.2, fat: 0.5, quantity: 150, unit: 'g' },
      { id: 'l2', name: 'Frango grelhado (peito)', calories: 247, protein: 46.5, carbs: 0, fat: 5.4, quantity: 150, unit: 'g' },
      { id: 'l3', name: 'Feijao carioca cozido', calories: 114, protein: 7.2, carbs: 20.4, fat: 0.8, quantity: 150, unit: 'g' },
      { id: 'l4', name: 'Brócolis cozido', calories: 35, protein: 2.4, carbs: 7.2, fat: 0.4, quantity: 100, unit: 'g' },
    ],
  },
  {
    id: 'snack',
    name: 'Lanche',
    icon: '🍎',
    items: [
      { id: 's1', name: 'Iogurte grego natural', calories: 97, protein: 10, carbs: 3.6, fat: 5, quantity: 100, unit: 'g' },
      { id: 's2', name: 'Maca', calories: 52, protein: 0.3, carbs: 14, fat: 0.2, quantity: 1, unit: 'un' },
    ],
  },
  {
    id: 'dinner',
    name: 'Jantar',
    icon: '🌙',
    items: [],
  },
];

const INITIAL_SUPPLEMENTS: Supplement[] = [
  { id: 'sup1', name: 'Whey Protein', dose: '30g', times: ['07:00', '16:00'], taken: true },
  { id: 'sup2', name: 'Creatina', dose: '5g', times: ['12:00'], taken: true },
  { id: 'sup3', name: 'Vitamina D3', dose: '2000 UI', times: ['08:00'], taken: false },
  { id: 'sup4', name: 'Omega-3', dose: '1g', times: ['13:00', '20:00'], taken: false },
  { id: 'sup5', name: 'Magnesio', dose: '300mg', times: ['21:00'], taken: false },
];

const DAILY_GOALS = {
  calories: 2500,
  protein: 188,
  carbs: 313,
  fat: 69,
  water: 8,
};

const MACRO_COLORS = {
  protein: '#14b8a6',
  carbs: '#3b82f6',
  fat: '#f59e0b',
};

// ---------------------------------------------------------------------------
// Helper: label formatter for dates
// ---------------------------------------------------------------------------

function dateLabel(date: Date): string {
  if (isToday(date)) return 'Hoje';
  if (isYesterday(date)) return 'Ontem';
  return format(date, "d 'de' MMM", { locale: ptBR });
}

// ---------------------------------------------------------------------------
// MacroRing — small donut with label
// ---------------------------------------------------------------------------

interface MacroRingProps {
  label: string;
  consumed: number;
  goal: number;
  unit: string;
  color: string;
}

function MacroRing({ label, consumed, goal, unit, color }: MacroRingProps) {
  const pct = Math.min(100, Math.round((consumed / goal) * 100));
  const data = [
    { value: consumed },
    { value: Math.max(0, goal - consumed) },
  ];

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={22}
              outerRadius={30}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
              strokeWidth={0}
            >
              <Cell fill={color} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[10px] font-bold text-gray-700">{pct}%</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-gray-800">{consumed}g</p>
      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
      <div className="w-full px-1">
        <div className="h-1 rounded-full bg-gray-100 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${pct}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <p className="text-[10px] text-gray-400">meta {goal}{unit}</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MealSection
// ---------------------------------------------------------------------------

interface MealSectionProps {
  meal: Meal;
  onAddFood: (mealId: string) => void;
  onDeleteItem: (mealId: string, itemId: string) => void;
}

function MealSection({ meal, onAddFood, onDeleteItem }: MealSectionProps) {
  const [expanded, setExpanded] = useState(meal.items.length > 0);
  const totalCal = meal.items.reduce((s, i) => s + i.calories, 0);

  return (
    <div className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{meal.icon}</span>
          <div className="text-left">
            <p className="text-sm font-semibold text-gray-800">{meal.name}</p>
            <p className="text-xs text-gray-400">
              {meal.items.length > 0
                ? `${meal.items.length} alimento${meal.items.length > 1 ? 's' : ''} • ${totalCal} kcal`
                : 'Sem alimentos'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onAddFood(meal.id); }}
            className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal-50 text-teal-600 hover:bg-teal-100 transition-colors"
            aria-label={`Adicionar alimento em ${meal.name}`}
          >
            <Plus className="w-4 h-4" />
          </button>
          {expanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {expanded && meal.items.length > 0 && (
        <div className="border-t border-gray-50 divide-y divide-gray-50">
          {meal.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-4 py-2.5 group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className="text-xs text-gray-400">{item.quantity} {item.unit}</span>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className="text-xs font-semibold text-gray-600">{item.calories} kcal</span>
                  <span className="text-[10px] text-gray-300">•</span>
                  <span className="text-xs text-teal-600">P {item.protein}g</span>
                  <span className="text-xs text-blue-500">C {item.carbs}g</span>
                  <span className="text-xs text-amber-500">G {item.fat}g</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onDeleteItem(meal.id, item.id)}
                className="ml-3 p-1.5 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                aria-label="Remover alimento"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {expanded && meal.items.length === 0 && (
        <div className="border-t border-gray-50 px-4 py-6 text-center">
          <UtensilsCrossed className="w-8 h-8 text-gray-200 mx-auto mb-2" />
          <p className="text-xs text-gray-400">Nenhum alimento registrado</p>
          <button
            type="button"
            onClick={() => onAddFood(meal.id)}
            className="mt-2 text-xs text-teal-600 font-medium hover:underline"
          >
            + Adicionar alimento
          </button>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// AddFoodModal
// ---------------------------------------------------------------------------

interface AddFoodModalProps {
  open: boolean;
  onClose: () => void;
  mealId: string | null;
  onAdd: (mealId: string, item: Omit<FoodItem, 'id'>) => void;
}

function AddFoodModal({ open, onClose, mealId, onAdd }: AddFoodModalProps) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<typeof FOOD_DATABASE[0] | null>(null);
  const [quantity, setQuantity] = useState('100');
  const [unit, setUnit] = useState('g');
  const [manual, setManual] = useState(false);
  const [manualForm, setManualForm] = useState({ name: '', calories: '', protein: '', carbs: '', fat: '' });

  const results = useMemo(() => {
    if (!query.trim()) return [];
    return FOOD_DATABASE.filter((f) =>
      f.name.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 8);
  }, [query]);

  const preview = useMemo(() => {
    if (!selected) return null;
    const ratio = parseFloat(quantity || '0') / 100;
    return {
      calories: Math.round(selected.calories * ratio),
      protein: Math.round(selected.protein * ratio * 10) / 10,
      carbs: Math.round(selected.carbs * ratio * 10) / 10,
      fat: Math.round(selected.fat * ratio * 10) / 10,
    };
  }, [selected, quantity]);

  function handleAdd() {
    if (!mealId) return;

    if (manual) {
      if (!manualForm.name || !manualForm.calories) return;
      onAdd(mealId, {
        name: manualForm.name,
        calories: parseFloat(manualForm.calories) || 0,
        protein: parseFloat(manualForm.protein) || 0,
        carbs: parseFloat(manualForm.carbs) || 0,
        fat: parseFloat(manualForm.fat) || 0,
        quantity: parseFloat(quantity) || 1,
        unit,
      });
    } else {
      if (!selected || !preview) return;
      onAdd(mealId, {
        name: selected.name,
        calories: preview.calories,
        protein: preview.protein,
        carbs: preview.carbs,
        fat: preview.fat,
        quantity: parseFloat(quantity) || 100,
        unit,
      });
    }

    // reset
    setQuery('');
    setSelected(null);
    setQuantity('100');
    setUnit('g');
    setManual(false);
    setManualForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    onClose();
  }

  function reset() {
    setQuery('');
    setSelected(null);
    setQuantity('100');
    setUnit('g');
    setManual(false);
    setManualForm({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={reset}
      title="Adicionar Alimento"
      subtitle="Busque na base ou insira manualmente"
      size="md"
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" onClick={reset} fullWidth>Cancelar</Button>
          <Button
            variant="primary"
            onClick={handleAdd}
            fullWidth
            disabled={manual ? !manualForm.name || !manualForm.calories : !selected}
          >
            Adicionar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Toggle manual */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Entrada manual</span>
          <button
            type="button"
            onClick={() => setManual((v) => !v)}
            className={cn(
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
              manual ? 'bg-teal-500' : 'bg-gray-200'
            )}
          >
            <span
              className={cn(
                'inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform',
                manual ? 'translate-x-6' : 'translate-x-1'
              )}
            />
          </button>
        </div>

        {manual ? (
          <div className="space-y-3">
            <Input
              label="Nome do alimento"
              placeholder="Ex: Bolo de chocolate"
              value={manualForm.name}
              onChange={(e) => setManualForm((f) => ({ ...f, name: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Calorias (kcal)"
                type="number"
                placeholder="0"
                value={manualForm.calories}
                onChange={(e) => setManualForm((f) => ({ ...f, calories: e.target.value }))}
              />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-gray-700">Quantidade</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    className="w-16 rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <select
                    className="flex-1 rounded-xl border border-gray-200 px-2 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="un">un</option>
                    <option value="fatia">fatia</option>
                    <option value="colher">colher</option>
                    <option value="xicara">xicara</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Proteina (g)"
                type="number"
                placeholder="0"
                value={manualForm.protein}
                onChange={(e) => setManualForm((f) => ({ ...f, protein: e.target.value }))}
              />
              <Input
                label="Carbs (g)"
                type="number"
                placeholder="0"
                value={manualForm.carbs}
                onChange={(e) => setManualForm((f) => ({ ...f, carbs: e.target.value }))}
              />
              <Input
                label="Gordura (g)"
                type="number"
                placeholder="0"
                value={manualForm.fat}
                onChange={(e) => setManualForm((f) => ({ ...f, fat: e.target.value }))}
              />
            </div>
          </div>
        ) : (
          <>
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                placeholder="Buscar alimento..."
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSelected(null); }}
              />
            </div>

            {/* Results */}
            {results.length > 0 && !selected && (
              <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-50 max-h-48 overflow-y-auto">
                {results.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => { setSelected(food); setUnit(food.unit); setQuery(food.name); }}
                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-teal-50 transition-colors text-left"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-800">{food.name}</p>
                      <p className="text-xs text-gray-400">P {food.protein}g • C {food.carbs}g • G {food.fat}g por 100{food.unit}</p>
                    </div>
                    <span className="text-xs font-semibold text-gray-600 ml-2 shrink-0">{food.calories} kcal</span>
                  </button>
                ))}
              </div>
            )}

            {/* Quantity */}
            {selected && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Quantidade</label>
                    <input
                      type="number"
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none transition-all"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-700 block mb-1.5">Unidade</label>
                    <select
                      className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="g">g</option>
                      <option value="ml">ml</option>
                      <option value="un">un</option>
                      <option value="fatia">fatia</option>
                      <option value="colher">colher</option>
                    </select>
                  </div>
                </div>

                {/* Preview */}
                {preview && (
                  <div className="bg-teal-50 rounded-xl p-3">
                    <p className="text-xs font-semibold text-teal-700 mb-2">Valores nutricionais</p>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { label: 'Calorias', value: `${preview.calories} kcal`, color: 'text-gray-800' },
                        { label: 'Proteina', value: `${preview.protein}g`, color: 'text-teal-600' },
                        { label: 'Carbs', value: `${preview.carbs}g`, color: 'text-blue-600' },
                        { label: 'Gordura', value: `${preview.fat}g`, color: 'text-amber-600' },
                      ].map((m) => (
                        <div key={m.label}>
                          <p className={cn('text-sm font-bold', m.color)}>{m.value}</p>
                          <p className="text-[10px] text-gray-500">{m.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {query.length > 1 && results.length === 0 && !selected && (
              <p className="text-sm text-gray-400 text-center py-4">
                Nenhum alimento encontrado. Use a entrada manual.
              </p>
            )}
          </>
        )}
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------
// TDEECalculator
// ---------------------------------------------------------------------------

const ACTIVITY_OPTIONS = [
  { value: 1.2,  label: 'Sedentario (sem exercicio)' },
  { value: 1.375, label: 'Levemente ativo (1-3x/semana)' },
  { value: 1.55,  label: 'Moderadamente ativo (3-5x/semana)' },
  { value: 1.725, label: 'Muito ativo (6-7x/semana)' },
  { value: 1.9,   label: 'Extremamente ativo (atletismo)' },
];

const GOAL_OPTIONS = [
  { value: 'lose_weight', label: 'Emagrecimento' },
  { value: 'maintain',    label: 'Manutencao' },
  { value: 'gain_muscle', label: 'Hipertrofia' },
];

function TDEECalculatorCard() {
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [activity, setActivity] = useState(1.55);
  const [goal, setGoal] = useState('maintain');
  const [result, setResult] = useState<{ tdee: number; macros: { protein: number; carbs: number; fat: number } } | null>(null);

  function handleCalc() {
    const w = parseFloat(weight);
    const h = parseFloat(height);
    const a = parseFloat(age);
    if (!w || !h || !a) return;
    const tdee = calculateTDEE(w, h, a, sex, activity);
    const macros = calculateMacros(tdee, goal);
    setResult({ tdee, macros });
  }

  return (
    <Card>
      <CardHeader
        title="Calcular TDEE"
        subtitle="Gasto energetico total diario + macros recomendados"
        icon={<Calculator className="w-5 h-5" />}
        iconColor="bg-violet-500"
      />
      <CardContent>
        <div className="space-y-4">
          {/* Sex selector */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Sexo</p>
            <div className="flex gap-2">
              {(['male', 'female'] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSex(s)}
                  className={cn(
                    'flex-1 py-2 rounded-xl text-sm font-medium border transition-all',
                    sex === s
                      ? 'bg-teal-600 text-white border-teal-600'
                      : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {s === 'male' ? 'Masculino' : 'Feminino'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Input label="Idade" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} />
            <Input label="Peso (kg)" type="number" placeholder="80" value={weight} onChange={(e) => setWeight(e.target.value)} />
            <Input label="Altura (cm)" type="number" placeholder="175" value={height} onChange={(e) => setHeight(e.target.value)} />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Nivel de atividade</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              value={activity}
              onChange={(e) => setActivity(parseFloat(e.target.value))}
            >
              {ACTIVITY_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1.5">Objetivo</label>
            <select
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            >
              {GOAL_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          <Button variant="primary" fullWidth onClick={handleCalc} icon={<Zap className="w-4 h-4" />}>
            Calcular
          </Button>

          {result && (
            <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-2xl p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-100 mb-1">TDEE diario</p>
              <p className="text-3xl font-bold mb-3">{result.tdee.toLocaleString('pt-BR')} <span className="text-lg font-normal text-teal-200">kcal</span></p>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-teal-500">
                {[
                  { label: 'Proteina', value: result.macros.protein, color: 'text-teal-100' },
                  { label: 'Carboidrato', value: result.macros.carbs, color: 'text-blue-200' },
                  { label: 'Gordura', value: result.macros.fat, color: 'text-yellow-200' },
                ].map((m) => (
                  <div key={m.label} className="text-center">
                    <p className={cn('text-lg font-bold', m.color)}>{m.value}g</p>
                    <p className="text-[10px] text-teal-200">{m.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// NutritionPage
// ---------------------------------------------------------------------------

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState<Meal[]>(INITIAL_MEALS);
  const [waterGlasses, setWaterGlasses] = useState(3);
  const [supplements, setSupplements] = useState<Supplement[]>(INITIAL_SUPPLEMENTS);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [activeMealId, setActiveMealId] = useState<string | null>(null);

  // Totals
  const totals = useMemo(() => {
    const items = meals.flatMap((m) => m.items);
    return {
      calories: items.reduce((s, i) => s + i.calories, 0),
      protein: Math.round(items.reduce((s, i) => s + i.protein, 0) * 10) / 10,
      carbs: Math.round(items.reduce((s, i) => s + i.carbs, 0) * 10) / 10,
      fat: Math.round(items.reduce((s, i) => s + i.fat, 0) * 10) / 10,
    };
  }, [meals]);

  const caloriesRemaining = DAILY_GOALS.calories - totals.calories;

  function handleAddFood(mealId: string) {
    setActiveMealId(mealId);
    setAddModalOpen(true);
  }

  function handleFoodAdded(mealId: string, item: Omit<FoodItem, 'id'>) {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId
          ? { ...m, items: [...m.items, { ...item, id: `item-${Date.now()}-${Math.random()}` }] }
          : m
      )
    );
  }

  function handleDeleteItem(mealId: string, itemId: string) {
    setMeals((prev) =>
      prev.map((m) =>
        m.id === mealId ? { ...m, items: m.items.filter((i) => i.id !== itemId) } : m
      )
    );
  }

  function handleWaterAdd() {
    setWaterGlasses((v) => Math.min(v + 1, DAILY_GOALS.water + 4));
  }

  function toggleSupplement(id: string) {
    setSupplements((prev) =>
      prev.map((s) => (s.id === id ? { ...s, taken: !s.taken } : s))
    );
  }

  const waterMl = waterGlasses * 250;
  const waterGoalMl = DAILY_GOALS.water * 250;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ================================================================
            HEADER
        ================================================================ */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal-600 text-white">
              <Apple className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Nutricao</h1>
              <p className="text-xs text-gray-400">Registro alimentar diario</p>
            </div>
          </div>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2">
          {[0, 1].map((offset) => {
            const d = offset === 0 ? new Date() : subDays(new Date(), 1);
            const active = format(selectedDate, 'yyyy-MM-dd') === format(d, 'yyyy-MM-dd');
            return (
              <button
                key={offset}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={cn(
                  'px-4 py-1.5 rounded-xl text-sm font-medium border transition-all',
                  active
                    ? 'bg-teal-600 text-white border-teal-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                )}
              >
                {dateLabel(d)}
              </button>
            );
          })}
          <input
            type="date"
            className="ml-auto text-sm text-gray-600 border border-gray-200 rounded-xl px-3 py-1.5 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 outline-none bg-white"
            value={format(selectedDate, 'yyyy-MM-dd')}
            max={format(new Date(), 'yyyy-MM-dd')}
            onChange={(e) => {
              if (e.target.value) setSelectedDate(new Date(e.target.value + 'T12:00:00'));
            }}
          />
        </div>

        {/* ================================================================
            MACRO SUMMARY
        ================================================================ */}
        <Card>
          <CardContent className="pt-5">
            {/* Calories remaining */}
            <div className="text-center mb-5">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Calorias restantes</p>
              <p className="text-4xl font-extrabold text-gray-900 leading-none">
                {caloriesRemaining > 0 ? caloriesRemaining.toLocaleString('pt-BR') : '0'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                <span className="text-gray-600 font-medium">{totals.calories}</span> / {DAILY_GOALS.calories.toLocaleString('pt-BR')} kcal
              </p>
              {/* Calorie bar */}
              <div className="mt-3 mx-auto max-w-xs">
                <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full transition-all duration-700',
                      totals.calories > DAILY_GOALS.calories ? 'bg-red-400' : 'bg-teal-500'
                    )}
                    style={{ width: `${Math.min(100, (totals.calories / DAILY_GOALS.calories) * 100)}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Macro rings */}
            <div className="grid grid-cols-3 gap-4">
              <MacroRing
                label="Proteinas"
                consumed={totals.protein}
                goal={DAILY_GOALS.protein}
                unit="g"
                color={MACRO_COLORS.protein}
              />
              <MacroRing
                label="Carboidratos"
                consumed={totals.carbs}
                goal={DAILY_GOALS.carbs}
                unit="g"
                color={MACRO_COLORS.carbs}
              />
              <MacroRing
                label="Gorduras"
                consumed={totals.fat}
                goal={DAILY_GOALS.fat}
                unit="g"
                color={MACRO_COLORS.fat}
              />
            </div>
          </CardContent>
        </Card>

        {/* ================================================================
            WATER INTAKE
        ================================================================ */}
        <Card>
          <CardHeader
            title="Hidratacao"
            subtitle={`${waterMl}ml de ${waterGoalMl}ml`}
            icon={<Droplets className="w-5 h-5" />}
            iconColor="bg-blue-500"
            action={
              <Button
                size="sm"
                variant="secondary"
                icon={<Plus className="w-3.5 h-3.5" />}
                onClick={handleWaterAdd}
              >
                +250ml
              </Button>
            }
          />
          <CardContent>
            {/* Glass grid */}
            <div className="flex flex-wrap gap-2 mb-3">
              {Array.from({ length: DAILY_GOALS.water }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setWaterGlasses(i < waterGlasses ? i : i + 1)}
                  className="group relative"
                  aria-label={`Copo ${i + 1}${i < waterGlasses ? ' (tomado)' : ''}`}
                >
                  <Droplets
                    className={cn(
                      'w-8 h-8 transition-all duration-200',
                      i < waterGlasses
                        ? 'text-blue-500 fill-blue-100 scale-110'
                        : 'text-gray-200 fill-gray-100 group-hover:text-blue-200'
                    )}
                  />
                </button>
              ))}
              {waterGlasses > DAILY_GOALS.water &&
                Array.from({ length: waterGlasses - DAILY_GOALS.water }).map((_, i) => (
                  <Droplets key={`extra-${i}`} className="w-8 h-8 text-blue-300 fill-blue-50" />
                ))
              }
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{waterGlasses} de {DAILY_GOALS.water} copos</span>
              <span className={cn('font-semibold', waterGlasses >= DAILY_GOALS.water ? 'text-blue-600' : 'text-gray-400')}>
                {waterMl >= waterGoalMl ? 'Meta atingida!' : `Faltam ${waterGoalMl - waterMl}ml`}
              </span>
            </div>

            <div className="mt-2">
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-blue-400 transition-all duration-500"
                  style={{ width: `${Math.min(100, (waterGlasses / DAILY_GOALS.water) * 100)}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ================================================================
            MEALS
        ================================================================ */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-gray-800">Refeicoes</h2>
            <span className="text-xs text-gray-400 font-medium">{totals.calories} kcal consumidas</span>
          </div>
          <div className="space-y-3">
            {meals.map((meal) => (
              <MealSection
                key={meal.id}
                meal={meal}
                onAddFood={handleAddFood}
                onDeleteItem={handleDeleteItem}
              />
            ))}
          </div>
        </div>

        {/* ================================================================
            TDEE CALCULATOR
        ================================================================ */}
        <TDEECalculatorCard />

        {/* ================================================================
            SUPPLEMENT REMINDERS
        ================================================================ */}
        <Card>
          <CardHeader
            title="Lembretes de Suplementos"
            subtitle="Marque os que ja tomou hoje"
            icon={<Bell className="w-5 h-5" />}
            iconColor="bg-amber-500"
          />
          <CardContent>
            <div className="space-y-3">
              {supplements.map((sup) => (
                <div
                  key={sup.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-xl border transition-all',
                    sup.taken
                      ? 'bg-teal-50 border-teal-100'
                      : 'bg-white border-gray-100 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleSupplement(sup.id)}
                      className={cn(
                        'flex items-center justify-center w-7 h-7 rounded-lg border-2 transition-all',
                        sup.taken
                          ? 'bg-teal-500 border-teal-500 text-white'
                          : 'border-gray-300 text-transparent hover:border-teal-400'
                      )}
                      aria-label={sup.taken ? 'Marcar como nao tomado' : 'Marcar como tomado'}
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <div>
                      <p className={cn('text-sm font-semibold', sup.taken ? 'text-teal-700 line-through opacity-70' : 'text-gray-800')}>
                        {sup.name}
                      </p>
                      <p className="text-xs text-gray-400">{sup.dose} — {sup.times.join(' e ')}</p>
                    </div>
                  </div>
                  {sup.taken && (
                    <span className="text-xs font-medium text-teal-600 bg-teal-100 px-2 py-0.5 rounded-full">Tomado</span>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between text-sm">
              <span className="text-gray-500">
                {supplements.filter((s) => s.taken).length} de {supplements.length} tomados
              </span>
              <div className="flex-1 mx-4">
                <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{
                      width: `${(supplements.filter((s) => s.taken).length / supplements.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              <span className="text-amber-600 font-semibold">
                {Math.round((supplements.filter((s) => s.taken).length / supplements.length) * 100)}%
              </span>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Add Food Modal */}
      <AddFoodModal
        open={addModalOpen}
        onClose={() => { setAddModalOpen(false); setActiveMealId(null); }}
        mealId={activeMealId}
        onAdd={handleFoodAdded}
      />
    </div>
  );
}
