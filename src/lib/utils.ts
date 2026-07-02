import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date, format?: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (format) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');

    return format
      .replace('dd', day)
      .replace('MM', month)
      .replace('yyyy', String(year))
      .replace('HH', hours)
      .replace('mm', minutes);
  }

  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatWeight(value: number): string {
  return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kg`;
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}min`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (mins === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${mins}min`;
}

export function calculateBMI(weight: number, height: number): number {
  // height in meters
  const bmi = weight / (height * height);
  return Math.round(bmi * 10) / 10;
}

export function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) {
    return { label: 'Abaixo do peso', color: 'teal' };
  }
  if (bmi < 25) {
    return { label: 'Normal', color: 'green' };
  }
  if (bmi < 30) {
    return { label: 'Sobrepeso', color: 'yellow' };
  }
  return { label: 'Obesidade', color: 'red' };
}

export function calculateTDEE(
  weight: number,
  height: number,
  age: number,
  sex: 'male' | 'female',
  activityLevel: number
): number {
  // Mifflin-St Jeor equation; height in cm
  let bmr: number;
  if (sex === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  return Math.round(bmr * activityLevel);
}

export function calculateMacros(
  calories: number,
  goal: string
): { protein: number; carbs: number; fat: number } {
  let proteinRatio: number;
  let carbsRatio: number;
  let fatRatio: number;

  switch (goal) {
    case 'lose_weight':
    case 'emagrecimento':
      proteinRatio = 0.35;
      carbsRatio = 0.35;
      fatRatio = 0.30;
      break;
    case 'gain_muscle':
    case 'hipertrofia':
      proteinRatio = 0.30;
      carbsRatio = 0.45;
      fatRatio = 0.25;
      break;
    case 'maintain':
    case 'manutencao':
      proteinRatio = 0.25;
      carbsRatio = 0.50;
      fatRatio = 0.25;
      break;
    default:
      proteinRatio = 0.25;
      carbsRatio = 0.50;
      fatRatio = 0.25;
  }

  // protein and carbs = 4 kcal/g, fat = 9 kcal/g
  return {
    protein: Math.round((calories * proteinRatio) / 4),
    carbs: Math.round((calories * carbsRatio) / 4),
    fat: Math.round((calories * fatRatio) / 9),
  };
}

interface LevelInfo {
  level: number;
  title: string;
  nextLevelXp: number;
  currentLevelXp: number;
}

const LEVELS: Array<{ level: number; title: string; xp: number }> = [
  { level: 1, title: 'Iniciante', xp: 0 },
  { level: 2, title: 'Aprendiz', xp: 500 },
  { level: 3, title: 'Dedicado', xp: 1500 },
  { level: 4, title: 'Guerreiro', xp: 3000 },
  { level: 5, title: 'Atleta', xp: 6000 },
  { level: 6, title: 'Campeão', xp: 10000 },
  { level: 7, title: 'Elite', xp: 15000 },
  { level: 8, title: 'Lenda', xp: 25000 },
];

export function getLevel(xp: number): LevelInfo {
  let currentLevelData = LEVELS[0];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xp) {
      currentLevelData = LEVELS[i];
      break;
    }
  }

  const nextLevelData = LEVELS.find((l) => l.level === currentLevelData.level + 1);

  return {
    level: currentLevelData.level,
    title: currentLevelData.title,
    currentLevelXp: currentLevelData.xp,
    nextLevelXp: nextLevelData ? nextLevelData.xp : currentLevelData.xp,
  };
}

export function getMuscleGroupColor(group: string): string {
  const colors: Record<string, string> = {
    peito: 'text-red-500',
    chest: 'text-red-500',
    costas: 'text-blue-500',
    back: 'text-blue-500',
    ombros: 'text-purple-500',
    shoulders: 'text-purple-500',
    biceps: 'text-orange-500',
    triceps: 'text-yellow-500',
    pernas: 'text-green-500',
    legs: 'text-green-500',
    quadriceps: 'text-green-600',
    posteriores: 'text-emerald-500',
    hamstrings: 'text-emerald-500',
    gluteos: 'text-pink-500',
    glutes: 'text-pink-500',
    panturrilha: 'text-teal-500',
    calves: 'text-teal-500',
    abdomen: 'text-cyan-500',
    abs: 'text-cyan-500',
    core: 'text-cyan-600',
    antebraco: 'text-amber-500',
    forearms: 'text-amber-500',
    trapezio: 'text-indigo-500',
    traps: 'text-indigo-500',
  };

  const normalized = group.toLowerCase().trim();
  return colors[normalized] ?? 'text-gray-500';
}

export function getGoalLabel(goal: string): string {
  const labels: Record<string, string> = {
    lose_weight: 'Perda de Peso',
    emagrecimento: 'Emagrecimento',
    gain_muscle: 'Ganho de Massa Muscular',
    hipertrofia: 'Hipertrofia',
    maintain: 'Manutenção',
    manutencao: 'Manutenção',
    definition: 'Definição Muscular',
    definicao: 'Definição Muscular',
    endurance: 'Resistência',
    resistencia: 'Resistência',
    strength: 'Força',
    forca: 'Força',
    health: 'Saúde Geral',
    saude: 'Saúde Geral',
  };

  return labels[goal] ?? goal;
}

export function getDayName(dayNumber: number): string {
  const days: Record<number, string> = {
    0: 'Domingo',
    1: 'Segunda-feira',
    2: 'Terça-feira',
    3: 'Quarta-feira',
    4: 'Quinta-feira',
    5: 'Sexta-feira',
    6: 'Sábado',
  };

  return days[dayNumber] ?? `Dia ${dayNumber}`;
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) {
    return text;
  }
  return `${text.slice(0, length)}...`;
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
