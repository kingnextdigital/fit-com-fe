import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Share2,
  Image,
  Send,
  Bookmark,
  MoreHorizontal,
  Award,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Comment {
  id: string;
  author: string;
  text: string;
}

interface WorkoutSummary {
  name: string;
  duration: string;
  volume: string;
}

interface Achievement {
  icon: string;
  name: string;
}

interface Post {
  id: string;
  author: string;
  level: number;
  levelLabel: string;
  levelVariant: 'teal' | 'gold' | 'purple' | 'green' | 'gray' | 'red';
  timestamp: string;
  isOwn: boolean;
  text: string;
  imageBg?: string;
  workout?: WorkoutSummary;
  achievement?: Achievement;
  likes: number;
  comments: number;
  liked: boolean;
  saved: boolean;
  commentPreviews: Comment[];
}

interface Story {
  id: string;
  name: string;
  seen: boolean;
  isOwn?: boolean;
}

interface FeaturedAthlete {
  name: string;
  workouts: number;
  streak: number;
}

interface TrendingAchievement {
  icon: string;
  name: string;
  unlocks: number;
}

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const INITIAL_POSTS: Post[] = [
  {
    id: '1',
    author: 'Lucas Ferreira',
    level: 18,
    levelLabel: 'Nível 18',
    levelVariant: 'teal',
    timestamp: 'há 12 min',
    isOwn: false,
    text: 'Treino de peito e tríceps destruído hoje! "Tudo posso naquele que me fortalece." — Filipenses 4:13. Nunca esqueço desse versículo antes de cada sessão.',
    workout: { name: 'Peito & Tríceps', duration: '58 min', volume: '14.200 kg' },
    likes: 47,
    comments: 8,
    liked: false,
    saved: false,
    commentPreviews: [
      { id: 'c1', author: 'Ana Paula', text: 'Arrasou! Que volume incrível!' },
      { id: 'c2', author: 'Marcos V.', text: 'Filipenses 4:13 é o escudo!' },
    ],
  },
  {
    id: '2',
    author: 'Fernanda Costa',
    level: 31,
    levelLabel: 'Nível 31',
    levelVariant: 'gold',
    timestamp: 'há 34 min',
    isOwn: false,
    text: 'NOVO RECORDE PESSOAL no agachamento! 120kg x 5! Dois anos de consistência chegando a esse momento. Glória a Deus!',
    achievement: { icon: '🏆', name: 'Novo PR — Agachamento 120kg' },
    likes: 132,
    comments: 24,
    liked: true,
    saved: false,
    commentPreviews: [
      { id: 'c3', author: 'Carlos D.', text: 'IMPRESSIONANTE! Parabens!' },
      { id: 'c4', author: 'Rafaela M.', text: 'Que inspiracao voce e!' },
    ],
  },
  {
    id: '3',
    author: 'Bruno Oliveira',
    level: 9,
    levelLabel: 'Nível 9',
    levelVariant: 'gray',
    timestamp: 'há 1h',
    isOwn: false,
    text: '3 meses de antes e depois! Diferenca que a disciplina faz. Sigo firme na missao que Deus colocou no meu coracao. Obrigado a todos que me apoiaram nessa jornada!',
    imageBg: 'from-blue-400 to-indigo-600',
    likes: 89,
    comments: 16,
    liked: false,
    saved: true,
    commentPreviews: [
      { id: 'c5', author: 'Juliana S.', text: 'Que transformacao! Voce e demais!' },
    ],
  },
  {
    id: '4',
    author: 'Eu',
    level: 12,
    levelLabel: 'Nível 12',
    levelVariant: 'teal',
    timestamp: 'há 2h',
    isOwn: true,
    text: 'Mais um treino de costas concluido. Foco total, sem desculpas. A jornada e longa mas cada rep conta.',
    workout: { name: 'Costas & Biceps', duration: '1h 10min', volume: '11.800 kg' },
    likes: 23,
    comments: 5,
    liked: false,
    saved: false,
    commentPreviews: [
      { id: 'c6', author: 'Pedro R.', text: 'Consistencia e tudo!' },
    ],
  },
  {
    id: '5',
    author: 'Camila Souza',
    level: 25,
    levelLabel: 'Nível 25',
    levelVariant: 'purple',
    timestamp: 'há 3h',
    isOwn: false,
    text: 'Conquistei a badge "Atleta de Ferro" depois de 100 treinos registrados! Que jornada inesquecivel. Deus tem sido fiel em cada passo.',
    achievement: { icon: '⚡', name: 'Atleta de Ferro — 100 Treinos' },
    likes: 210,
    comments: 41,
    liked: true,
    saved: true,
    commentPreviews: [
      { id: 'c7', author: 'Rodrigo A.', text: '100 treinos! Lenda!' },
      { id: 'c8', author: 'Maria F.', text: 'Voce e uma inspiracao!' },
    ],
  },
  {
    id: '6',
    author: 'Daniel Mendes',
    level: 6,
    levelLabel: 'Nível 6',
    levelVariant: 'teal',
    timestamp: 'há 4h',
    isOwn: false,
    text: 'Primeira semana completa de treinos sem faltar nenhum dia! Parece pouco mas pra mim e uma vitoria enorme. Cada inicio e sagrado.',
    likes: 54,
    comments: 12,
    liked: false,
    saved: false,
    commentPreviews: [
      { id: 'c9', author: 'Lucas F.', text: 'Primeira semana eh a mais difícil. Parabéns!' },
    ],
  },
  {
    id: '7',
    author: 'Patricia Lima',
    level: 22,
    levelLabel: 'Nível 22',
    levelVariant: 'purple',
    timestamp: 'há 5h',
    isOwn: false,
    text: 'Treino funcional na praia ao nascer do sol. Nao existe academia melhor que a criacao de Deus. Que manha abençoada!',
    imageBg: 'from-orange-400 to-rose-500',
    likes: 178,
    comments: 19,
    liked: false,
    saved: false,
    commentPreviews: [
      { id: 'c10', author: 'Amanda K.', text: 'Que foto linda!' },
      { id: 'c11', author: 'Thiago N.', text: 'Isso sim e motivacao manha!' },
    ],
  },
  {
    id: '8',
    author: 'Rafael Torres',
    level: 14,
    levelLabel: 'Nível 14',
    levelVariant: 'teal',
    timestamp: 'há 7h',
    isOwn: false,
    text: '"Nao tenhas medo, porque eu sou contigo; nao te assombres, porque eu sou teu Deus." Isaias 41:10. Esse versículo me deu forca hoje no treino mais pesado da minha vida. Gratidao.',
    workout: { name: 'Full Body Power', duration: '1h 25min', volume: '18.600 kg' },
    likes: 66,
    comments: 9,
    liked: false,
    saved: false,
    commentPreviews: [
      { id: 'c12', author: 'Isabela C.', text: 'Amei esse verso! Obrigada por compartilhar!' },
    ],
  },
  {
    id: '9',
    author: 'Giovanna Reis',
    level: 19,
    levelLabel: 'Nível 19',
    levelVariant: 'teal',
    timestamp: 'há 9h',
    isOwn: false,
    text: 'Streak de 30 dias consecutivos! Nao parei nem nos feriados. Quando voce tem um proposito maior, nao existe desculpa pequena o suficiente pra te parar.',
    achievement: { icon: '🔥', name: 'Chama Viva — 30 Dias Seguidos' },
    likes: 143,
    comments: 27,
    liked: false,
    saved: false,
    commentPreviews: [
      { id: 'c13', author: 'Bruno O.', text: '30 dias! Minha referencia!' },
      { id: 'c14', author: 'Daniel M.', text: 'Eu chego la tambem! Inspira!' },
    ],
  },
  {
    id: '10',
    author: 'Thiago Nunes',
    level: 35,
    levelLabel: 'Nível 35',
    levelVariant: 'gold',
    timestamp: 'há 11h',
    isOwn: false,
    text: 'Volume semanal: 85.000kg movimentados. Minha meta anual eh superar 4 milhoes de kg. A disciplina eh uma forma de adoracao.',
    workout: { name: 'Semana Completa', duration: '6h 40min', volume: '85.000 kg' },
    likes: 301,
    comments: 55,
    liked: true,
    saved: true,
    commentPreviews: [
      { id: 'c15', author: 'Fernanda C.', text: 'Absurdo esse volume! Respeito demais!' },
      { id: 'c16', author: 'Camila S.', text: 'Que meta incrivel!' },
    ],
  },
];

const STORIES: Story[] = [
  { id: 'own', name: 'Seu story', isOwn: true, seen: false },
  { id: 's1', name: 'Lucas F.', seen: false },
  { id: 's2', name: 'Fernanda', seen: false },
  { id: 's3', name: 'Bruno O.', seen: true },
  { id: 's4', name: 'Camila S.', seen: false },
  { id: 's5', name: 'Daniel M.', seen: true },
  { id: 's6', name: 'Patricia', seen: false },
  { id: 's7', name: 'Rafael T.', seen: true },
];

const FEATURED_ATHLETES: FeaturedAthlete[] = [
  { name: 'Thiago Nunes', workouts: 312, streak: 45 },
  { name: 'Fernanda Costa', workouts: 287, streak: 38 },
  { name: 'Camila Souza', workouts: 241, streak: 29 },
];

const TRENDING_ACHIEVEMENTS: TrendingAchievement[] = [
  { icon: '🔥', name: 'Chama Viva — 30 Dias', unlocks: 48 },
  { icon: '⚡', name: 'Atleta de Ferro — 100 Treinos', unlocks: 31 },
  { icon: '💪', name: 'Primeira Semana Completa', unlocks: 74 },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StoriesRow() {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
      {STORIES.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer select-none">
          <div
            className={cn(
              'w-14 h-14 rounded-full p-[2px] flex items-center justify-center',
              story.isOwn
                ? 'bg-gray-200'
                : story.seen
                ? 'bg-gray-300'
                : 'bg-gradient-to-tr from-teal-400 to-teal-600',
            )}
          >
            <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center">
              {story.isOwn ? (
                <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                  <span className="text-xl font-light text-teal-600">+</span>
                </div>
              ) : (
                <Avatar name={story.name} size="sm" className="w-full h-full" />
              )}
            </div>
          </div>
          <span className="text-[11px] text-gray-500 font-medium max-w-[56px] text-center leading-tight truncate">
            {story.name}
          </span>
        </div>
      ))}
    </div>
  );
}

interface OptionsMenuProps {
  isOwn: boolean;
  onClose: () => void;
}

function OptionsMenu({ isOwn, onClose }: OptionsMenuProps) {
  const options = isOwn
    ? ['Editar', 'Excluir']
    : ['Reportar', 'Salvar', 'Deixar de seguir'];

  return (
    <div className="absolute right-0 top-8 z-20 bg-white rounded-xl shadow-lg border border-gray-100 py-1 min-w-[160px]">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={onClose}
          className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

interface PostCardProps {
  post: Post;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
}

function PostCard({ post, onLike, onSave }: PostCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [followed, setFollowed] = useState(false);

  return (
    <Card className="overflow-visible">
      <CardContent className="p-0">
        {/* Post header */}
        <div className="flex items-start gap-3 px-4 pt-4 pb-3">
          <Avatar name={post.author} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-800 leading-tight">{post.author}</span>
              <Badge variant={post.levelVariant} size="sm">{post.levelLabel}</Badge>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">{post.timestamp}</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {!post.isOwn && (
              <button
                onClick={() => setFollowed((f) => !f)}
                className={cn(
                  'text-xs font-semibold px-3 py-1 rounded-full border transition-colors',
                  followed
                    ? 'border-gray-200 text-gray-400 bg-gray-50'
                    : 'border-teal-500 text-teal-600 bg-teal-50 hover:bg-teal-100',
                )}
              >
                {followed ? 'Seguindo' : 'Seguir'}
              </button>
            )}
            <div className="relative">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              {menuOpen && (
                <OptionsMenu isOwn={post.isOwn} onClose={() => setMenuOpen(false)} />
              )}
            </div>
          </div>
        </div>

        {/* Post text */}
        <p className="px-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{post.text}</p>

        {/* Optional image */}
        {post.imageBg && (
          <div
            className={cn(
              'mx-4 mt-3 rounded-xl h-48 bg-gradient-to-br flex items-center justify-center',
              post.imageBg,
            )}
          >
            <Image size={36} className="text-white/60" />
          </div>
        )}

        {/* Optional workout card */}
        {post.workout && (
          <div className="mx-4 mt-3 rounded-xl border border-teal-100 bg-teal-50 px-4 py-3 flex items-center gap-4">
            <div className="w-9 h-9 rounded-lg bg-teal-600 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 6.5h11M6.5 17.5h11M4 12h16" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-teal-800 truncate">{post.workout.name}</p>
              <p className="text-xs text-teal-600 mt-0.5">{post.workout.duration} &middot; {post.workout.volume}</p>
            </div>
            <span className="text-[10px] font-semibold text-teal-500 bg-teal-100 rounded-full px-2 py-0.5 flex-shrink-0">Treino</span>
          </div>
        )}

        {/* Optional achievement card */}
        {post.achievement && (
          <div className="mx-4 mt-3 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-3 flex items-center gap-3">
            <span className="text-2xl">{post.achievement.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-amber-900 truncate">Conquista Desbloqueada</p>
              <p className="text-xs text-amber-800 font-medium mt-0.5 truncate">{post.achievement.name}</p>
            </div>
            <Award size={18} className="text-amber-900 flex-shrink-0" />
          </div>
        )}

        {/* Action row */}
        <div className="flex items-center gap-1 px-4 pt-3 pb-2">
          <button
            onClick={() => onLike(post.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
              post.liked
                ? 'text-rose-500 bg-rose-50 hover:bg-rose-100'
                : 'text-gray-500 hover:bg-gray-100',
            )}
          >
            <Heart size={15} className={post.liked ? 'fill-rose-500' : ''} />
            <span>{post.likes}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
            <MessageCircle size={15} />
            <span>{post.comments}</span>
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
            <Share2 size={15} />
          </button>
          <div className="flex-1" />
          <button
            onClick={() => onSave(post.id)}
            className={cn(
              'p-1.5 rounded-full transition-colors',
              post.saved
                ? 'text-teal-600 bg-teal-50 hover:bg-teal-100'
                : 'text-gray-400 hover:bg-gray-100',
            )}
          >
            <Bookmark size={15} className={post.saved ? 'fill-teal-600' : ''} />
          </button>
        </div>

        {/* Comments preview */}
        {post.commentPreviews.length > 0 && (
          <div className="border-t border-gray-50 px-4 pt-2.5 pb-4 space-y-1.5">
            {post.commentPreviews.map((c) => (
              <p key={c.id} className="text-xs text-gray-600">
                <span className="font-semibold text-gray-700">{c.author}</span>{' '}
                {c.text}
              </p>
            ))}
            {post.comments > post.commentPreviews.length && (
              <button className="text-xs text-teal-600 font-medium hover:underline mt-0.5">
                Ver {post.comments} comentários
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function NewPostComposer() {
  const [text, setText] = useState('');

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-3">
          <Avatar name="Eu" size="md" className="flex-shrink-0" />
          <div className="flex-1 space-y-3">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Compartilhe sua evolução..."
              rows={3}
              className="w-full resize-none text-sm text-gray-700 placeholder-gray-400 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all"
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                  <Image size={14} />
                  <span>Foto</span>
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Treino</span>
                </button>
                <button className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors">
                  <Award size={14} />
                  <span>Conquista</span>
                </button>
              </div>
              <button
                disabled={!text.trim()}
                className={cn(
                  'flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all',
                  text.trim()
                    ? 'bg-teal-600 text-white hover:bg-teal-700 active:scale-95'
                    : 'bg-gray-100 text-gray-300 cursor-not-allowed',
                )}
              >
                <Send size={13} />
                Publicar
              </button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RightSidebar() {
  return (
    <aside className="hidden xl:flex flex-col gap-4 w-72 flex-shrink-0">
      {/* Featured athletes */}
      <Card>
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-bold text-gray-800">Atletas em Destaque</h3>
        </div>
        <CardContent className="px-4 pt-0 pb-4 space-y-3">
          {FEATURED_ATHLETES.map((athlete, i) => (
            <div key={athlete.name} className="flex items-center gap-3">
              <div className="relative">
                <Avatar name={athlete.name} size="sm" />
                <span className="absolute -top-1 -left-1 w-4 h-4 rounded-full bg-amber-400 text-[9px] font-bold text-white flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 truncate">{athlete.name}</p>
                <p className="text-[11px] text-gray-400">{athlete.workouts} treinos &middot; {athlete.streak}d streak</p>
              </div>
              <button className="text-[11px] font-semibold text-teal-600 hover:text-teal-700 flex-shrink-0">
                Seguir
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Trending achievements */}
      <Card>
        <div className="px-4 pt-4 pb-2">
          <h3 className="text-sm font-bold text-gray-800">Conquistas em Alta</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">Essa semana</p>
        </div>
        <CardContent className="px-4 pt-0 pb-4 space-y-3">
          {TRENDING_ACHIEVEMENTS.map((a) => (
            <div key={a.name} className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-lg flex-shrink-0">
                {a.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-gray-700 leading-tight">{a.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{a.unlocks} atletas desbloquearam</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Weekly challenge */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-600 to-teal-800 p-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">⚔️</span>
          <h3 className="text-sm font-bold">Desafio da Semana</h3>
        </div>
        <p className="text-xs text-teal-100 leading-relaxed mb-3">
          Complete 5 treinos esta semana e ganhe a badge exclusiva "Guerreiro da Fe".
        </p>
        <div className="bg-teal-900/40 rounded-xl p-3 mb-3">
          <div className="flex justify-between text-[11px] text-teal-200 mb-1.5">
            <span>Progresso</span>
            <span>3 / 5 treinos</span>
          </div>
          <div className="h-1.5 rounded-full bg-teal-900/60">
            <div className="h-full rounded-full bg-white w-[60%] transition-all" />
          </div>
        </div>
        <button className="w-full text-xs font-semibold bg-white text-teal-700 rounded-xl py-2 hover:bg-teal-50 transition-colors">
          Ver detalhes
        </button>
      </div>
    </aside>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CommunityPage() {
  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS);

  function handleLike(id: string) {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, liked: !p.liked, likes: p.liked ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  }

  function handleSave(id: string) {
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, saved: !p.saved } : p)),
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Comunidade</h1>
            <p className="text-sm text-gray-400 mt-0.5">Inspire e seja inspirado</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-600 text-white text-sm font-semibold hover:bg-teal-700 active:scale-95 transition-all shadow-sm">
            <span className="text-base leading-none">+</span>
            Nova Publicação
          </button>
        </div>

        <div className="flex gap-6">
          {/* Main feed */}
          <div className="flex-1 min-w-0 space-y-4">
            {/* Stories */}
            <Card>
              <CardContent className="py-3">
                <StoriesRow />
              </CardContent>
            </Card>

            {/* New post composer */}
            <NewPostComposer />

            {/* Posts */}
            {posts.map((post) => (
              <PostCard key={post.id} post={post} onLike={handleLike} onSave={handleSave} />
            ))}
          </div>

          {/* Sidebar */}
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
