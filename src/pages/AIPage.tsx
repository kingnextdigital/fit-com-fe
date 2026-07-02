import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Dumbbell,
  Apple,
  Moon,
  Brain,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import type { Profile } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ---------------------------------------------------------------------------
// Mock AI response logic
// ---------------------------------------------------------------------------

function respondToMessage(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes('treino')) {
    return (
      'Ótimo foco em treino! 💪 A chave para o progresso é a sobrecarga progressiva — ' +
      'aumentar gradualmente o peso, repetições ou diminuir o descanso a cada semana.\n\n' +
      'Para hoje, recomendo focar na execução perfeita antes de subir a carga. ' +
      '"Tudo o que você faz, faça de todo o coração, como para o Senhor." (Colossenses 3:23)\n\n' +
      'Quer que eu monte um plano de progressão personalizado para você?'
    );
  }

  if (
    lower.includes('nutrição') ||
    lower.includes('nutricao') ||
    lower.includes('comer') ||
    lower.includes('proteína') ||
    lower.includes('proteina')
  ) {
    return (
      'Nutrição é 70% do resultado! 🥗 Aqui estão minhas recomendações:\n\n' +
      '• **Proteína:** busque 1,8–2,2g por kg de peso corporal\n' +
      '• **Timing:** consuma proteína em até 2h após o treino\n' +
      '• **Pré-treino:** carboidratos de médio índice glicêmico 1–2h antes\n' +
      '• **Hidratação:** mínimo 35ml de água por kg de peso\n\n' +
      'Fontes excelentes: frango, ovo, peixe, whey, feijão e lentilha. ' +
      'Cuide do templo que Deus lhe deu! (1 Coríntios 6:19–20)'
    );
  }

  if (
    lower.includes('sono') ||
    lower.includes('descanso') ||
    lower.includes('recuperação') ||
    lower.includes('recuperacao') ||
    lower.includes('cansado')
  ) {
    return (
      'Recuperação é onde o músculo realmente cresce! 😴 Sem sono de qualidade, ' +
      'o treino e a dieta perdem até 40% da eficácia.\n\n' +
      '**Protocolo de recuperação:**\n' +
      '• Durma 7–9h por noite em horários regulares\n' +
      '• Evite telas 1h antes de dormir\n' +
      '• Alongamento ou foam rolling pós-treino reduz DOMS\n' +
      '• Nos dias de descanso, caminhadas leves aceleram a recuperação\n\n' +
      '"Ele concede sono ao seu amado." (Salmos 127:2) — O descanso também é uma bênção!'
    );
  }

  if (
    lower.includes('versículo') ||
    lower.includes('versiculo') ||
    lower.includes('oração') ||
    lower.includes('oracao') ||
    lower.includes('bíblia') ||
    lower.includes('biblia') ||
    lower.includes('deus') ||
    lower.includes('fé') ||
    lower.includes('fe')
  ) {
    const verses = [
      {
        verse:
          '"Posso fazer tudo por meio daquele que me fortalece." — Filipenses 4:13',
        reflection:
          'Este versículo nos lembra que nossa força não vem de nós mesmos, mas de Cristo. ' +
          'Quando os treinos ficam pesados, quando a disciplina parece impossível — ' +
          'é exatamente aí que a fé nos sustenta. Cada repetição pode ser uma oração.',
      },
      {
        verse:
          '"Não sabeis que o vosso corpo é templo do Espírito Santo?" — 1 Coríntios 6:19',
        reflection:
          'Cuidar do corpo é um ato de adoração. Cada treino, cada refeição saudável, ' +
          'cada boa noite de sono é uma forma de honrar o Senhor com o que Ele nos deu.',
      },
      {
        verse:
          '"Tudo o que você faz, faça de todo o coração, como para o Senhor." — Colossenses 3:23',
        reflection:
          'Excelência no treino não é vaidade — é caráter. ' +
          'Quando treinamos com inteireza, praticamos a virtude da dedicação ' +
          'que se reflete em todas as áreas da vida.',
      },
    ];
    const pick = verses[Math.floor(Math.random() * verses.length)];
    return `${pick.verse}\n\n**Reflexão:** ${pick.reflection}\n\n🙏 Que este versículo te fortaleça hoje!`;
  }

  // Default motivational response
  return (
    'Que bom ter você aqui! 🌟 Estou aqui para te ajudar em tudo relacionado ' +
    'à sua jornada fitness com fé.\n\n' +
    '**Posso te ajudar com:**\n' +
    '• 🏋️ Treinos e progressão de cargas\n' +
    '• 🥗 Nutrição e timing de refeições\n' +
    '• 😴 Recuperação e qualidade do sono\n' +
    '• 📖 Versículos motivacionais\n' +
    '• 🧠 Saúde mental e foco\n\n' +
    'Me conta mais sobre o que está precisando hoje!'
  );
}

// ---------------------------------------------------------------------------
// Quick chips data
// ---------------------------------------------------------------------------

const QUICK_CHIPS = [
  { label: 'Como foi meu treino de hoje?', icon: Dumbbell },
  { label: 'Qual músculo devo treinar amanhã?', icon: Brain },
  { label: 'Sugestão de pré-treino', icon: Apple },
  { label: 'Preciso ajustar meu treino', icon: Sparkles },
  { label: 'Versículo motivacional', icon: Moon },
];

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function TypingIndicator() {
  return (
    <div className="flex items-end gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center shadow-sm">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-400 mr-1">digitando</span>
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:0ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:150ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce [animation-delay:300ms]" />
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user';

  // Render simple markdown-like bold (**text**)
  const renderContent = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Render line breaks
      return part.split('\n').map((line, j, arr) => (
        <React.Fragment key={`${i}-${j}`}>
          {line}
          {j < arr.length - 1 && <br />}
        </React.Fragment>
      ));
    });
  };

  if (isUser) {
    return (
      <div className="flex items-end justify-end gap-3">
        <div className="max-w-[75%] sm:max-w-[60%]">
          <div className="bg-teal-700 text-white rounded-2xl rounded-br-sm px-4 py-3 shadow-sm">
            <p className="text-sm leading-relaxed">{message.content}</p>
          </div>
          <p className="text-right text-[10px] text-gray-400 mt-1 pr-1">
            {message.timestamp.toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        </div>
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center shadow-sm">
          <User className="w-4 h-4 text-gray-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-end gap-3">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-700 flex items-center justify-center shadow-sm">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="max-w-[75%] sm:max-w-[65%]">
        <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed text-gray-800">
            {renderContent(message.content)}
          </p>
        </div>
        <p className="text-[10px] text-gray-400 mt-1 pl-1">
          {message.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}

interface QuickChipsProps {
  onSelect: (text: string) => void;
  disabled: boolean;
}

function QuickChips({ onSelect, disabled }: QuickChipsProps) {
  return (
    <div className="flex flex-col gap-2">
      {QUICK_CHIPS.map(({ label, icon: Icon }) => (
        <button
          key={label}
          onClick={() => onSelect(label)}
          disabled={disabled}
          className={cn(
            'flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl',
            'border border-gray-100 bg-white hover:bg-teal-50 hover:border-teal-200',
            'text-sm text-gray-700 hover:text-teal-800',
            'transition-all duration-150 ease-out shadow-sm',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
            'disabled:opacity-50 disabled:pointer-events-none',
          )}
        >
          <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 text-teal-700" />
          </span>
          <span className="leading-snug">{label}</span>
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Profile Summary Card (left panel)
// ---------------------------------------------------------------------------

function ProfileSummaryCard({ profile }: { profile: Profile | null }) {
  if (!profile) return null;

  const goalLabels: Record<string, string> = {
    hypertrophy: 'Hipertrofia',
    weight_loss: 'Emagrecimento',
    definition: 'Definição',
    health: 'Saúde Geral',
  };

  const experienceLabels: Record<string, string> = {
    beginner: 'Iniciante',
    intermediate: 'Intermediário',
    advanced: 'Avançado',
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header gradient */}
      <div className="h-20 bg-gradient-to-br from-teal-600 to-teal-800" />

      {/* Avatar */}
      <div className="px-5 pb-5 -mt-10">
        <div className="w-16 h-16 rounded-2xl bg-teal-100 border-4 border-white shadow-md flex items-center justify-center mb-3">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.name}
              className="w-full h-full rounded-xl object-cover"
            />
          ) : (
            <span className="text-2xl font-bold text-teal-700">
              {profile.name?.charAt(0)?.toUpperCase() ?? 'U'}
            </span>
          )}
        </div>

        <p className="font-semibold text-gray-900 text-base leading-tight">
          {profile.name}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {experienceLabels[profile.experience] ?? profile.experience}
        </p>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          <div className="text-center bg-gray-50 rounded-xl py-2 px-1">
            <p className="text-base font-bold text-teal-700">{profile.streak ?? 0}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Streak</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl py-2 px-1">
            <p className="text-base font-bold text-teal-700">{profile.total_workouts ?? 0}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Treinos</p>
          </div>
          <div className="text-center bg-gray-50 rounded-xl py-2 px-1">
            <p className="text-base font-bold text-teal-700">{profile.level ?? 1}</p>
            <p className="text-[10px] text-gray-500 leading-tight">Nível</p>
          </div>
        </div>

        {/* Goal badge */}
        <div className="mt-3 flex items-center gap-2">
          <Dumbbell className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
          <span className="text-xs text-gray-600">
            Objetivo:{' '}
            <span className="font-medium text-gray-800">
              {goalLabels[profile.goal] ?? profile.goal}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page
// ---------------------------------------------------------------------------

export default function AIPage() {
  const { profile } = useAuthStore();

  const firstName = profile?.name?.split(' ')[0] ?? 'Atleta';

  const initialMessage: Message = {
    id: 'init-0',
    role: 'assistant',
    content: `Olá ${firstName}! Sou seu treinador pessoal com IA. Estou aqui para te ajudar com treinos, nutrição, recuperação e motivação. Como posso te ajudar hoje? 🙏`,
    timestamp: new Date(),
  };

  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, [input]);

  const sendMessage = (text?: string) => {
    const content = (text ?? input).trim();
    if (!content || isTyping) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: respondToMessage(content),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleChipSelect = (label: string) => {
    sendMessage(label);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 overflow-hidden">
      {/* ------------------------------------------------------------------ */}
      {/* LEFT PANEL — hidden on mobile                                        */}
      {/* ------------------------------------------------------------------ */}
      <aside className="hidden lg:flex flex-col w-72 xl:w-80 flex-shrink-0 border-r border-gray-100 bg-white overflow-y-auto p-5 gap-5">
        {/* Profile summary */}
        <ProfileSummaryCard profile={profile} />

        {/* Quick actions */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-1">
            Perguntas rápidas
          </p>
          <QuickChips onSelect={handleChipSelect} disabled={isTyping} />
        </div>

        {/* Footer note */}
        <div className="mt-auto pt-4 border-t border-gray-50">
          <p className="text-[11px] text-gray-400 leading-relaxed text-center">
            As respostas são geradas por IA e não substituem orientação médica ou de nutricionista.
          </p>
        </div>
      </aside>

      {/* ------------------------------------------------------------------ */}
      {/* RIGHT PANEL — chat                                                  */}
      {/* ------------------------------------------------------------------ */}
      <main className="flex flex-col flex-1 min-w-0 h-full">
        {/* Header */}
        <header className="flex-shrink-0 flex items-center justify-between px-5 py-4 bg-white border-b border-gray-100 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900 text-sm leading-tight">
                Treinador IA
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-gray-400">Online agora</span>
              </div>
            </div>
          </div>

          {/* Powered by badge + avatar */}
          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-100 text-teal-700 text-[11px] font-medium px-2.5 py-1 rounded-full">
              <Sparkles className="w-3 h-3" />
              Powered by AI
            </span>

            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-teal-100"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-teal-100 border-2 border-teal-200 flex items-center justify-center">
                <span className="text-xs font-bold text-teal-700">
                  {firstName.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-4">
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isTyping && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick chips — mobile only, above input */}
        <div className="lg:hidden flex-shrink-0 px-4 pb-2">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {QUICK_CHIPS.map(({ label, icon: Icon }) => (
              <button
                key={label}
                onClick={() => handleChipSelect(label)}
                disabled={isTyping}
                className={cn(
                  'flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                  'border border-gray-200 bg-white hover:bg-teal-50 hover:border-teal-200',
                  'text-xs text-gray-600 hover:text-teal-700',
                  'transition-all duration-150 shadow-sm',
                  'disabled:opacity-50 disabled:pointer-events-none',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-400',
                )}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 px-4 sm:px-6 py-4 bg-white border-t border-gray-100">
          <div className="flex items-end gap-3 max-w-3xl mx-auto">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem... (Enter para enviar)"
                rows={1}
                disabled={isTyping}
                className={cn(
                  'w-full resize-none rounded-2xl border border-gray-200 bg-gray-50',
                  'px-4 py-3 pr-12 text-sm text-gray-900 placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent focus:bg-white',
                  'transition-all duration-150 leading-relaxed',
                  'disabled:opacity-60 disabled:cursor-not-allowed',
                  'min-h-[48px] max-h-[140px] overflow-y-auto',
                )}
              />
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => sendMessage()}
              disabled={!input.trim() || isTyping}
              className="flex-shrink-0 w-11 h-11 rounded-xl p-0 flex items-center justify-center"
              aria-label="Enviar mensagem"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <p className="text-center text-[10px] text-gray-400 mt-2">
            Shift+Enter para nova linha • Enter para enviar
          </p>
        </div>
      </main>
    </div>
  );
}
