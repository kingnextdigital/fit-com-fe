import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Check, Dumbbell, Heart, Brain, Trophy, BookOpen } from 'lucide-react';

import { useAuthStore } from '@/store/authStore';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

// ─── Validation Schemas ───────────────────────────────────────────────────────

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

const signupSchema = z
  .object({
    name: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres'),
    email: z.string().email('E-mail inválido'),
    password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
    confirmPassword: z.string().min(6, 'Confirme sua senha'),
    terms: z.literal(true, {
      errorMap: () => ({ message: 'Você deve aceitar os termos de uso' }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

const resetSchema = z.object({
  email: z.string().email('E-mail inválido'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;
type ResetFormData = z.infer<typeof resetSchema>;

// ─── Feature list ─────────────────────────────────────────────────────────────

const FEATURES = [
  { icon: Dumbbell, label: 'Treinos personalizados com IA' },
  { icon: Heart, label: 'Acompanhamento de saúde e bem-estar' },
  { icon: Brain, label: 'Devocional diário integrado' },
  { icon: Trophy, label: 'Conquistas e desafios semanais' },
  { icon: BookOpen, label: 'Versículos de motivação e fé' },
];

// ─── Google SVG Logo ──────────────────────────────────────────────────────────

function GoogleLogo() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      className="w-5 h-5"
      aria-hidden="true"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

// ─── Password Reset Modal ─────────────────────────────────────────────────────

interface ResetModalProps {
  onClose: () => void;
}

function ResetModal({ onClose }: ResetModalProps) {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetFormData>({ resolver: zodResolver(resetSchema) });

  const onSubmit = async (data: ResetFormData) => {
    setLoading(true);
    try {
      const { supabase } = await import('@/lib/supabase');
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar e-mail';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal="true"
      aria-label="Recuperar senha"
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 animate-fade-in">
        {sent ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-14 h-14 rounded-full bg-teal-50 flex items-center justify-center">
              <Check className="w-7 h-7 text-teal-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">E-mail enviado!</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.
            </p>
            <Button variant="primary" fullWidth onClick={onClose} size="lg">
              Fechar
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recuperar senha</h2>
              <p className="mt-1 text-sm text-gray-500">
                Informe seu e-mail e enviaremos um link de redefinição.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                error={errors.email?.message}
                {...register('email')}
              />

              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  fullWidth
                  onClick={onClose}
                  type="button"
                  size="lg"
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  fullWidth
                  type="submit"
                  loading={loading}
                  size="lg"
                >
                  Enviar link
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Brand Panel ──────────────────────────────────────────────────────────────

function BrandPanel() {
  return (
    <div className="hidden lg:flex flex-col justify-between h-full p-10 xl:p-14 bg-gradient-to-br from-teal-950 via-teal-900 to-teal-800 text-white relative overflow-hidden">
      {/* Background decorative circles */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-teal-700/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full bg-teal-600/20 blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center">
          <Dumbbell className="w-5 h-5 text-white" />
        </div>
        <span className="text-xl font-bold tracking-tight">TreinoCristao.AI</span>
      </div>

      {/* Center content */}
      <div className="relative z-10 space-y-8">
        <div className="space-y-3">
          <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight tracking-tight">
            Força com
            <br />
            <span className="text-teal-300">Propósito</span>
          </h1>
          <p className="text-teal-200 text-lg leading-relaxed max-w-xs">
            Treino inteligente, fé inabalável. Alcance seus objetivos com o apoio de IA e da Palavra.
          </p>
        </div>

        {/* Bible verse */}
        <blockquote className="border-l-2 border-teal-400 pl-4 space-y-1">
          <p className="text-teal-100 text-sm leading-relaxed italic">
            "Tudo posso naquele que me fortalece."
          </p>
          <cite className="text-teal-400 text-xs font-semibold not-italic">
            Filipenses 4:13
          </cite>
        </blockquote>

        {/* Feature list */}
        <ul className="space-y-3">
          {FEATURES.map(({ icon: Icon, label }) => (
            <li key={label} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-teal-700/60 flex items-center justify-center shrink-0">
                <Icon className="w-3.5 h-3.5 text-teal-300" />
              </div>
              <span className="text-sm text-teal-100">{label}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom tagline */}
      <div className="relative z-10">
        <p className="text-teal-400 text-xs">
          Mais de 10.000 atletas cristãos confiam em nós
        </p>
      </div>
    </div>
  );
}

// ─── Login Form ───────────────────────────────────────────────────────────────

interface LoginFormProps {
  onSwitchTab: () => void;
  onForgotPassword: () => void;
}

function LoginForm({ onSwitchTab, onForgotPassword }: LoginFormProps) {
  const { signIn, signInWithGoogle, loading, profile } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const handleSuccess = useCallback(
    (onboardingCompleted: boolean) => {
      navigate(onboardingCompleted ? '/' : '/onboarding', { replace: true });
    },
    [navigate]
  );

  const onSubmit = async (data: LoginFormData) => {
    try {
      await signIn(data.email, data.password);
      const currentProfile = useAuthStore.getState().profile;
      toast.success('Bem-vindo de volta!');
      handleSuccess(currentProfile?.onboarding_completed ?? false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar';
      toast.error(msg);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      // navigation happens via auth state change redirect
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao entrar com Google';
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  // Suppress unused warning — profile is used indirectly via getState() after signIn
  void profile;

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
        <p className="text-sm text-gray-500">Bem-vindo de volta, guerreiro!</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <div className="space-y-1">
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            placeholder="Sua senha"
            autoComplete="current-password"
            error={errors.password?.message}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                className="pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            {...register('password')}
          />
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs text-teal-600 hover:text-teal-700 font-medium transition-colors"
            >
              Esqueci a senha
            </button>
          </div>
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          type="submit"
          loading={loading}
        >
          Entrar
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">ou continue com</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
      >
        {googleLoading ? (
          <svg
            className="w-4 h-4 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <GoogleLogo />
        )}
        <span className="text-sm font-medium text-gray-700">Entrar com Google</span>
      </button>

      {/* Switch tab */}
      <p className="text-center text-sm text-gray-500">
        Não tem conta?{' '}
        <button
          type="button"
          onClick={onSwitchTab}
          className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
        >
          Cadastre-se
        </button>
      </p>
    </div>
  );
}

// ─── Signup Form ──────────────────────────────────────────────────────────────

interface SignupFormProps {
  onSwitchTab: () => void;
}

function SignupForm({ onSwitchTab }: SignupFormProps) {
  const { signUp, signInWithGoogle, loading } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signUp(data.email, data.password, data.name);
      const currentProfile = useAuthStore.getState().profile;
      toast.success('Conta criada com sucesso! Bem-vindo!');
      navigate(currentProfile?.onboarding_completed ? '/' : '/onboarding', { replace: true });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao criar conta';
      toast.error(msg);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao continuar com Google';
      toast.error(msg);
      setGoogleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
        <p className="text-sm text-gray-500">Comece sua jornada de fé e força hoje.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <Input
          label="Nome completo"
          type="text"
          placeholder="João Silva"
          autoComplete="name"
          error={errors.name?.message}
          {...register('name')}
        />

        <Input
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />

        <Input
          label="Senha"
          type={showPassword ? 'text' : 'password'}
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          error={errors.password?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              className="pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('password')}
        />

        <Input
          label="Confirmar senha"
          type={showConfirm ? 'text' : 'password'}
          placeholder="Repita a senha"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowConfirm((v) => !v)}
              aria-label={showConfirm ? 'Ocultar senha' : 'Mostrar senha'}
              className="pointer-events-auto text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          {...register('confirmPassword')}
        />

        {/* Terms checkbox */}
        <div className="space-y-1">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              {...register('terms')}
              className="mt-0.5 w-4 h-4 shrink-0 rounded border-gray-300 text-teal-600 focus:ring-teal-500 focus:ring-2 cursor-pointer"
            />
            <span className="text-sm text-gray-600 leading-relaxed select-none group-hover:text-gray-700 transition-colors">
              Li e aceito os{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 font-semibold underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                Termos de Uso
              </a>{' '}
              e{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:text-teal-700 font-semibold underline underline-offset-2"
                onClick={(e) => e.stopPropagation()}
              >
                Política de Privacidade
              </a>
            </span>
          </label>
          {errors.terms && (
            <p className="text-xs font-medium text-red-500 flex items-center gap-1 pl-7">
              <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
                <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11z" />
              </svg>
              {errors.terms.message}
            </p>
          )}
        </div>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          type="submit"
          loading={loading}
        >
          Criar conta
        </Button>
      </form>

      {/* Divider */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-gray-200" />
        <span className="text-xs text-gray-400 font-medium">ou continue com</span>
        <div className="flex-1 h-px bg-gray-200" />
      </div>

      {/* Google button */}
      <button
        type="button"
        onClick={handleGoogle}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 h-12 px-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:bg-gray-50 hover:border-gray-300 active:scale-[0.98] transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none"
      >
        {googleLoading ? (
          <svg
            className="w-4 h-4 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : (
          <GoogleLogo />
        )}
        <span className="text-sm font-medium text-gray-700">Cadastrar com Google</span>
      </button>

      {/* Switch tab */}
      <p className="text-center text-sm text-gray-500">
        Já tem conta?{' '}
        <button
          type="button"
          onClick={onSwitchTab}
          className="text-teal-600 hover:text-teal-700 font-semibold transition-colors"
        >
          Entrar
        </button>
      </p>
    </div>
  );
}

// ─── Tab Toggle ───────────────────────────────────────────────────────────────

type Tab = 'login' | 'signup';

interface TabToggleProps {
  active: Tab;
  onChange: (tab: Tab) => void;
}

function TabToggle({ active, onChange }: TabToggleProps) {
  return (
    <div className="flex p-1 bg-gray-100 rounded-xl mb-8">
      {(['login', 'signup'] as Tab[]).map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={[
            'flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-200',
            active === tab
              ? 'bg-white text-teal-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700',
          ].join(' ')}
        >
          {tab === 'login' ? 'Entrar' : 'Cadastrar'}
        </button>
      ))}
    </div>
  );
}

// ─── AuthPage ─────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState<Tab>('login');
  const [showResetModal, setShowResetModal] = useState(false);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <>
      <div className="min-h-screen flex">
        {/* Left: Brand Panel (desktop only) */}
        <div className="lg:w-[40%] xl:w-[42%] shrink-0">
          <BrandPanel />
        </div>

        {/* Right: Form Panel */}
        <div className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white px-6 py-12 sm:px-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-teal-700 flex items-center justify-center">
              <Dumbbell className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900 tracking-tight">
              TreinoCristao<span className="text-teal-600">.AI</span>
            </span>
          </div>

          {/* Form card */}
          <div className="w-full max-w-md">
            <TabToggle active={activeTab} onChange={handleTabChange} />

            {activeTab === 'login' ? (
              <LoginForm
                onSwitchTab={() => handleTabChange('signup')}
                onForgotPassword={() => setShowResetModal(true)}
              />
            ) : (
              <SignupForm onSwitchTab={() => handleTabChange('login')} />
            )}
          </div>

          {/* Footer */}
          <p className="mt-10 text-xs text-gray-400 text-center">
            &copy; {new Date().getFullYear()} TreinoCristao.AI — Todos os direitos reservados
          </p>
        </div>
      </div>

      {/* Password reset modal */}
      {showResetModal && <ResetModal onClose={() => setShowResetModal(false)} />}
    </>
  );
}
