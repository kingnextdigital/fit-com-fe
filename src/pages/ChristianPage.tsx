import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Heart,
  Star,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react';
import { verses } from '@/data/verses';
import { Card, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type VerseTheme =
  | 'strength'
  | 'faith'
  | 'perseverance'
  | 'health'
  | 'purpose'
  | 'discipline'
  | 'endurance'
  | 'renewal'
  | 'courage';

interface FilterOption {
  key: VerseTheme | 'all';
  label: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FILTER_OPTIONS: FilterOption[] = [
  { key: 'all', label: 'Todos' },
  { key: 'strength', label: 'Força' },
  { key: 'faith', label: 'Fé' },
  { key: 'perseverance', label: 'Perseverança' },
  { key: 'health', label: 'Corpo' },
  { key: 'purpose', label: 'Propósito' },
];

const THEME_LABEL: Record<VerseTheme, string> = {
  strength: 'Força',
  faith: 'Fé',
  perseverance: 'Perseverança',
  health: 'Corpo',
  purpose: 'Propósito',
  discipline: 'Disciplina',
  endurance: 'Resistência',
  renewal: 'Renovação',
  courage: 'Coragem',
};

const DEVOTIONAL = {
  title: 'Seu corpo é um instrumento, não um ornamento',
  category: 'Corpo & Espiritualidade',
  readingTime: '3 min',
  preview:
    'Paulo nos lembra que somos templos vivos do Espírito. Isso transforma completamente a forma como encaramos o treino e a saúde...',
  full: `Paulo escreve em 1 Coríntios 6:19: "Não sabeis que o vosso corpo é o templo do Espírito Santo, que habita em vós?"

Esta não é uma metáfora poética — é uma declaração teológica com implicações práticas profundas para cada atleta e cada pessoa que busca saúde.

Na cultura grega da época, o corpo era frequentemente visto como uma prisão da alma, algo a ser transcendido. Paulo subverte essa visão. O corpo importa. Ele tem dignidade. E mais: ele é habitado.

Quando você levanta cedo para treinar, está cuidando de um templo. Quando escolhe alimentos que nutrem em vez de destruir, está sendo um bom mordomo. Quando descansa adequadamente, está respeitando os limites que Deus construiu no próprio design humano.

Isso não significa que o treino vira religião — significa que ele pode ser ato de gratidão. A diferença é sutil, mas transforma tudo: você deixa de treinar por culpa, por comparação ou por vaidade, e começa a treinar por gratidão e propósito.

"Portanto, glorificai a Deus no vosso corpo." (1Co 6:20)

A disciplina física, quando ancorada nessa perspectiva, ganha uma dimensão nova. Não se trata de performance para os outros. Trata-se de fidelidade — ser um bom guardião do que foi confiado a você.`,
  reflectionQuestion:
    'Como sua motivação para treinar mudaria se você enxergasse cada sessão como um ato de gratidão ao criador?',
  prayer:
    'Senhor, que eu cuide do meu corpo como templo do Teu Espírito — não por vaidade, mas por gratidão. Dá-me força para ser fiel na disciplina que Tu mesmo construíste em mim. Amém.',
};

const READING_PLAN = {
  title: 'Salmos para Atletas',
  totalDays: 30,
  completedDays: 17,
  streak: 5,
  todayReading: 'Salmo 23',
};

// Deterministically pick verse of the day based on date
function getVerseOfDay() {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000,
  );
  return verses[dayOfYear % verses.length];
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function VerseOfDayHero() {
  const verse = getVerseOfDay();
  const today = format(new Date(), "d 'de' MMMM, yyyy", { locale: ptBR });
  const [meditated, setMeditated] = useState(false);

  return (
    <div
      className="relative rounded-2xl overflow-hidden p-6 md:p-8"
      style={{
        background: 'linear-gradient(135deg, #0f4c57 0%, #134e58 40%, #1a3a4a 100%)',
      }}
    >
      {/* Subtle decorative ring */}
      <div
        className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Date */}
      <div className="flex items-center gap-2 mb-6">
        <Sun size={14} className="text-amber-400 opacity-80" />
        <span className="text-xs font-medium text-teal-200/70 tracking-wider uppercase">
          {today}
        </span>
      </div>

      {/* Verse text */}
      <blockquote className="relative mb-5">
        <span
          className="absolute -top-4 -left-1 text-5xl leading-none text-amber-400/30 font-serif select-none"
          aria-hidden="true"
        >
          &ldquo;
        </span>
        <p className="text-xl font-light text-white/95 leading-relaxed tracking-wide pl-3">
          {verse.text}
        </p>
      </blockquote>

      {/* Reference */}
      <p className="text-sm font-semibold tracking-widest uppercase mb-6"
        style={{ color: '#f59e0b' }}>
        {verse.reference}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          onClick={() => setMeditated(true)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
            meditated
              ? 'bg-amber-500/20 text-amber-300 border border-amber-400/40'
              : 'bg-white/10 text-white/80 border border-white/15 hover:bg-white/15',
          )}
        >
          <Heart size={14} className={meditated ? 'fill-amber-400 text-amber-400' : ''} />
          {meditated ? 'Meditado' : 'Meditar'}
        </button>
        <button
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                text: `"${verse.text}" — ${verse.reference}`,
              });
            }
          }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/10 text-white/80 border border-white/15 hover:bg-white/15 transition-all duration-200"
        >
          <Star size={14} />
          Compartilhar
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------

interface DevotionalCardProps {
  onReadFull: () => void;
}

function DevotionalCard({ onReadFull }: DevotionalCardProps) {
  return (
    <Card className="border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
              <BookOpen size={15} className="text-teal-600" />
            </div>
            <span className="text-xs font-semibold text-teal-600 tracking-wide uppercase">
              Devocional de Hoje
            </span>
          </div>
          <span className="text-xs text-gray-400 whitespace-nowrap">{DEVOTIONAL.readingTime}</span>
        </div>

        <h2 className="text-base font-semibold text-gray-800 mb-2 leading-snug">
          {DEVOTIONAL.title}
        </h2>

        <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
          {DEVOTIONAL.preview}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xs px-2.5 py-1 rounded-full bg-teal-50 text-teal-600 font-medium border border-teal-100">
            {DEVOTIONAL.category}
          </span>
          <button
            onClick={onReadFull}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-700 hover:text-teal-600 transition-colors"
          >
            Ler Completo
            <ChevronRight size={15} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------

interface DevotionalModalProps {
  open: boolean;
  onClose: () => void;
  onMarkRead: () => void;
  isRead: boolean;
}

function DevotionalModal({ open, onClose, onMarkRead, isRead }: DevotionalModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={DEVOTIONAL.title}
      subtitle={DEVOTIONAL.category}
      size="lg"
      footer={
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs text-gray-400">
            {DEVOTIONAL.readingTime} de leitura
          </span>
          <Button
            variant={isRead ? 'secondary' : 'primary'}
            size="sm"
            onClick={onMarkRead}
            icon={isRead ? <Star size={14} /> : undefined}
          >
            {isRead ? 'Lido' : 'Marcar como lido'}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {/* Full text */}
        <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {DEVOTIONAL.full}
        </div>

        {/* Verse highlight */}
        <div className="rounded-xl bg-teal-50 border border-teal-100 px-5 py-4">
          <p className="text-xs font-semibold text-teal-500 uppercase tracking-widest mb-2">
            Versículo em destaque
          </p>
          <p className="text-sm font-light text-teal-900 leading-relaxed italic">
            "Não sabeis que o vosso corpo é o templo do Espírito Santo, que habita em vós?"
          </p>
          <p className="text-xs font-semibold text-teal-600 mt-2">1 Coríntios 6:19</p>
        </div>

        {/* Reflection */}
        <div className="rounded-xl bg-amber-50 border border-amber-100 px-5 py-4">
          <p className="text-xs font-semibold text-amber-600 uppercase tracking-widest mb-2">
            Para refletir
          </p>
          <p className="text-sm text-amber-900 leading-relaxed">
            {DEVOTIONAL.reflectionQuestion}
          </p>
        </div>

        {/* Prayer */}
        <div className="rounded-xl bg-gray-50 border border-gray-100 px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <Moon size={13} className="text-gray-400" />
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-widest">
              Sugestão de oração
            </p>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed italic">
            {DEVOTIONAL.prayer}
          </p>
        </div>
      </div>
    </Modal>
  );
}

// ---------------------------------------------------------------------------

function ReadingPlanCard() {
  const { title, totalDays, completedDays, streak, todayReading } = READING_PLAN;
  const progress = Math.round((completedDays / totalDays) * 100);

  return (
    <Card className="border-gray-100">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
              Plano de Leitura
            </p>
            <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100">
            <Star size={12} className="text-amber-500 fill-amber-500" />
            <span className="text-xs font-semibold text-amber-700">{streak} dias</span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-gray-400">
              {completedDays} de {totalDays} dias
            </span>
            <span className="text-xs font-semibold text-teal-600">{progress}%</span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full bg-teal-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Today's reading */}
        <div className="flex items-center justify-between bg-teal-50 rounded-xl px-4 py-3 border border-teal-100">
          <div className="flex items-center gap-2.5">
            <BookOpen size={14} className="text-teal-600" />
            <div>
              <p className="text-xs text-teal-500 font-medium">Leitura de hoje</p>
              <p className="text-sm font-semibold text-teal-800">{todayReading}</p>
            </div>
          </div>
          <button className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-600 transition-colors">
            Ler
            <ChevronRight size={13} />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------

interface VersesCollectionProps {
  activeFilter: FilterOption['key'];
  onFilterChange: (key: FilterOption['key']) => void;
  saved: Set<string>;
  onToggleSave: (id: string) => void;
}

function VersesCollection({
  activeFilter,
  onFilterChange,
  saved,
  onToggleSave,
}: VersesCollectionProps) {
  const filtered =
    activeFilter === 'all'
      ? verses
      : verses.filter((v) => v.theme === activeFilter);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Versículos</h2>
        <span className="text-xs text-gray-400">{filtered.length} versículos</span>
      </div>

      {/* Filter pills */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onFilterChange(opt.key)}
            className={cn(
              'flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-150 border',
              activeFilter === opt.key
                ? 'bg-teal-700 text-white border-teal-700 shadow-sm'
                : 'bg-white text-gray-500 border-gray-200 hover:border-teal-300 hover:text-teal-700',
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Masonry-style grid */}
      <div className="columns-1 sm:columns-2 gap-4 space-y-0">
        {filtered.map((verse) => (
          <div key={verse.id} className="break-inside-avoid mb-4">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow duration-200">
              <p className="text-sm font-light text-gray-700 leading-relaxed mb-3">
                &ldquo;{verse.text}&rdquo;
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-teal-700 tracking-wide">
                    {verse.reference}
                  </span>
                  {verse.theme && verse.theme in THEME_LABEL && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-50 text-gray-400 border border-gray-100 font-medium">
                      {THEME_LABEL[verse.theme as VerseTheme]}
                    </span>
                  )}
                </div>
                <button
                  onClick={() => onToggleSave(verse.id)}
                  aria-label={saved.has(verse.id) ? 'Remover dos salvos' : 'Salvar versículo'}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 hover:bg-amber-50"
                >
                  <Heart
                    size={15}
                    className={cn(
                      'transition-colors',
                      saved.has(verse.id)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-gray-300 hover:text-amber-400',
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------

interface PrayerSectionProps {
  dismissed: boolean;
  onDismiss: () => void;
}

function PrayerSection({ dismissed, onDismiss }: PrayerSectionProps) {
  const [text, setText] = useState('');
  const [saved, setSaved] = useState(false);

  // Build a simple 7-day dot history (mock)
  const today = new Date();
  const dotDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    // Mock: days 0,2,4,5 have prayers
    const hasPrayer = [0, 2, 4, 5].includes(i);
    return { date: d, hasPrayer };
  });

  if (dismissed) return null;

  const handleSave = () => {
    if (!text.trim()) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-gray-700">Oração</h2>
        <button
          onClick={onDismiss}
          className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Recolher
        </button>
      </div>

      <Card className="border-gray-100">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Moon size={14} className="text-gray-400" />
            <p className="text-xs font-medium text-gray-500">Privado — apenas você vê</p>
          </div>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escreva sua oração de hoje..."
            rows={4}
            className="w-full text-sm text-gray-700 leading-relaxed placeholder-gray-300 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-teal-300 focus:border-transparent transition-all"
          />

          <div className="flex items-center justify-between mt-3">
            {/* History dots */}
            <div className="flex items-center gap-1.5">
              {dotDays.map((day, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full transition-colors',
                      day.hasPrayer ? 'bg-teal-400' : 'bg-gray-200',
                    )}
                    title={format(day.date, 'EEE', { locale: ptBR })}
                  />
                </div>
              ))}
              <span className="text-[10px] text-gray-400 ml-1">7 dias</span>
            </div>

            <button
              onClick={handleSave}
              disabled={!text.trim()}
              className={cn(
                'text-xs font-semibold px-3 py-1.5 rounded-lg transition-all duration-150',
                text.trim()
                  ? 'bg-teal-700 text-white hover:bg-teal-600'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed',
              )}
            >
              {saved ? 'Salvo!' : 'Salvar'}
            </button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function ChristianPage() {
  const [devotionalOpen, setDevotionalOpen] = useState(false);
  const [devotionalRead, setDevotionalRead] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterOption['key']>('all');
  const [savedVerses, setSavedVerses] = useState<Set<string>>(new Set());
  const [prayerDismissed, setPrayerDismissed] = useState(false);

  // Load saved verses from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('christian_saved_verses');
      if (raw) setSavedVerses(new Set(JSON.parse(raw)));

      const readFlag = localStorage.getItem('christian_devotional_read');
      if (readFlag) setDevotionalRead(true);
    } catch {
      // ignore
    }
  }, []);

  const handleToggleSave = (id: string) => {
    setSavedVerses((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem('christian_saved_verses', JSON.stringify([...next]));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleMarkRead = () => {
    setDevotionalRead(true);
    try {
      localStorage.setItem('christian_devotional_read', '1');
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800 tracking-tight">
            Espaço Cristão
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        {devotionalRead && (
          <Badge variant="teal" size="sm">
            Devocional lido
          </Badge>
        )}
      </header>

      {/* 1. Verse of the Day */}
      <VerseOfDayHero />

      {/* 2. Daily Devotional */}
      <DevotionalCard onReadFull={() => setDevotionalOpen(true)} />

      {/* 3. Devotional Modal */}
      <DevotionalModal
        open={devotionalOpen}
        onClose={() => setDevotionalOpen(false)}
        onMarkRead={handleMarkRead}
        isRead={devotionalRead}
      />

      {/* 4. Bible Reading Plan */}
      <ReadingPlanCard />

      {/* 5. Verses Collection */}
      <VersesCollection
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        saved={savedVerses}
        onToggleSave={handleToggleSave}
      />

      {/* 6. Prayer Section */}
      <PrayerSection
        dismissed={prayerDismissed}
        onDismiss={() => setPrayerDismissed(true)}
      />
    </div>
  );
}
