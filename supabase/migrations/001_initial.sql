-- ================================================================
-- TREINO CRISTÃO AI — Schema inicial
-- Execute no SQL Editor do seu projeto Supabase
-- ================================================================

-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- PROFILES (extensão de auth.users)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  phone TEXT,
  avatar_url TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  sex TEXT CHECK (sex IN ('male', 'female', 'other')),
  age INTEGER CHECK (age BETWEEN 10 AND 120),
  weight NUMERIC(5,2),
  height NUMERIC(5,1),
  goal TEXT NOT NULL DEFAULT 'hypertrophy' CHECK (goal IN ('hypertrophy', 'weight_loss', 'definition', 'health')),
  experience TEXT NOT NULL DEFAULT 'beginner' CHECK (experience IN ('beginner', 'intermediate', 'advanced')),
  available_days INTEGER[] DEFAULT '{}',
  workout_time INTEGER DEFAULT 60,
  location TEXT DEFAULT 'gym' CHECK (location IN ('gym', 'home')),
  equipment TEXT[] DEFAULT '{}',
  restrictions TEXT[] DEFAULT '{}',
  injuries TEXT[] DEFAULT '{}',
  sleep_level INTEGER DEFAULT 3 CHECK (sleep_level BETWEEN 1 AND 5),
  stress_level INTEGER DEFAULT 3 CHECK (stress_level BETWEEN 1 AND 5),
  diet_type TEXT DEFAULT 'normal',
  water_daily NUMERIC(3,1) DEFAULT 2.0,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  streak INTEGER DEFAULT 0,
  total_workouts INTEGER DEFAULT 0,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ================================================================
-- EXERCISES (biblioteca global)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  muscle_groups TEXT[] NOT NULL DEFAULT '{}',
  equipment TEXT NOT NULL DEFAULT 'livre',
  difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  category TEXT NOT NULL DEFAULT 'strength',
  description TEXT DEFAULT '',
  tips TEXT[] DEFAULT '{}',
  common_errors TEXT[] DEFAULT '{}',
  breathing TEXT DEFAULT '',
  alternatives TEXT[] DEFAULT '{}',
  image_url TEXT DEFAULT '',
  video_url TEXT DEFAULT '',
  gif_url TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view exercises" ON public.exercises FOR SELECT USING (true);
CREATE POLICY "Admins can manage exercises" ON public.exercises FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ================================================================
-- WORKOUT PLANS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT DEFAULT '',
  split_type TEXT NOT NULL DEFAULT 'ABC',
  goal TEXT NOT NULL DEFAULT 'hypertrophy',
  level TEXT NOT NULL DEFAULT 'beginner',
  days_per_week INTEGER DEFAULT 3,
  created_by_ai BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their own plans" ON public.workout_plans FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- WORKOUT DAYS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.workout_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES public.workout_plans(id) ON DELETE CASCADE NOT NULL,
  day_name TEXT NOT NULL,
  day_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_days ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their plan days" ON public.workout_days FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.workout_plans WHERE id = plan_id AND user_id = auth.uid())
);
CREATE POLICY "Users manage their plan days" ON public.workout_days FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workout_plans WHERE id = plan_id AND user_id = auth.uid())
);

-- ================================================================
-- WORKOUT EXERCISES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  day_id UUID REFERENCES public.workout_days(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id),
  sets INTEGER NOT NULL DEFAULT 3,
  reps TEXT NOT NULL DEFAULT '8-12',
  rest_seconds INTEGER DEFAULT 90,
  weight NUMERIC(6,2),
  cadence TEXT,
  rpe INTEGER CHECK (rpe BETWEEN 1 AND 10),
  notes TEXT,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their workout exercises" ON public.workout_exercises FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.workout_days wd
    JOIN public.workout_plans wp ON wp.id = wd.plan_id
    WHERE wd.id = day_id AND wp.user_id = auth.uid()
  )
);
CREATE POLICY "Users manage their workout exercises" ON public.workout_exercises FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.workout_days wd
    JOIN public.workout_plans wp ON wp.id = wd.plan_id
    WHERE wd.id = day_id AND wp.user_id = auth.uid()
  )
);

-- ================================================================
-- WORKOUT LOGS (sessões concluídas)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.workout_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.workout_plans(id) ON DELETE SET NULL,
  day_id UUID REFERENCES public.workout_days(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  duration_minutes INTEGER DEFAULT 0,
  notes TEXT,
  mood INTEGER DEFAULT 3 CHECK (mood BETWEEN 1 AND 5),
  fatigue INTEGER DEFAULT 3 CHECK (fatigue BETWEEN 1 AND 5),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their workout logs" ON public.workout_logs FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- EXERCISE LOGS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.exercise_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID REFERENCES public.workout_logs(id) ON DELETE CASCADE NOT NULL,
  exercise_id UUID REFERENCES public.exercises(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.exercise_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their exercise logs" ON public.exercise_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.workout_logs WHERE id = log_id AND user_id = auth.uid())
);

-- ================================================================
-- SET LOGS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.set_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exercise_log_id UUID REFERENCES public.exercise_logs(id) ON DELETE CASCADE NOT NULL,
  set_number INTEGER NOT NULL,
  reps INTEGER DEFAULT 0,
  weight NUMERIC(6,2) DEFAULT 0,
  completed BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their set logs" ON public.set_logs FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.exercise_logs el
    JOIN public.workout_logs wl ON wl.id = el.log_id
    WHERE el.id = exercise_log_id AND wl.user_id = auth.uid()
  )
);

-- ================================================================
-- BODY MEASUREMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.body_measurements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  weight NUMERIC(5,2),
  arm NUMERIC(5,1),
  chest NUMERIC(5,1),
  waist NUMERIC(5,1),
  hip NUMERIC(5,1),
  thigh NUMERIC(5,1),
  calf NUMERIC(5,1),
  neck NUMERIC(5,1),
  body_fat NUMERIC(4,1),
  photo_url TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their measurements" ON public.body_measurements FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- NUTRITION ENTRIES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.nutrition_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  meal_type TEXT NOT NULL DEFAULT 'lunch' CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
  food_name TEXT NOT NULL,
  calories NUMERIC(7,2) DEFAULT 0,
  protein NUMERIC(6,2) DEFAULT 0,
  carbs NUMERIC(6,2) DEFAULT 0,
  fat NUMERIC(6,2) DEFAULT 0,
  quantity NUMERIC(7,2) DEFAULT 100,
  unit TEXT DEFAULT 'g',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.nutrition_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their nutrition" ON public.nutrition_entries FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- WATER INTAKE
-- ================================================================
CREATE TABLE IF NOT EXISTS public.water_intake (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount_ml INTEGER NOT NULL DEFAULT 250,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.water_intake ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their water intake" ON public.water_intake FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- CHRISTIAN VERSES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.christian_verses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  text TEXT NOT NULL,
  reference TEXT NOT NULL,
  theme TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.christian_verses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view verses" ON public.christian_verses FOR SELECT USING (true);
CREATE POLICY "Admins manage verses" ON public.christian_verses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
);

-- ================================================================
-- CHRISTIAN DEVOTIONALS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.christian_devotionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  verse_id UUID REFERENCES public.christian_verses(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.christian_devotionals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view devotionals" ON public.christian_devotionals FOR SELECT USING (true);

-- ================================================================
-- CHALLENGES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  type TEXT NOT NULL DEFAULT 'streak',
  target INTEGER NOT NULL DEFAULT 30,
  duration_days INTEGER NOT NULL DEFAULT 30,
  xp_reward INTEGER DEFAULT 500,
  badge_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view challenges" ON public.challenges FOR SELECT USING (true);

-- ================================================================
-- USER CHALLENGES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES public.challenges(id) ON DELETE CASCADE NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE (user_id, challenge_id)
);

ALTER TABLE public.user_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their challenges" ON public.user_challenges FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- ACHIEVEMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  icon TEXT DEFAULT '🏆',
  xp_reward INTEGER DEFAULT 100,
  condition_type TEXT NOT NULL DEFAULT 'workouts',
  condition_value INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view achievements" ON public.achievements FOR SELECT USING (true);

-- ================================================================
-- USER ACHIEVEMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE NOT NULL,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (user_id, achievement_id)
);

ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their achievements" ON public.user_achievements FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- COMMUNITY POSTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  image_url TEXT,
  workout_log_id UUID REFERENCES public.workout_logs(id) ON DELETE SET NULL,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view posts" ON public.community_posts FOR SELECT USING (true);
CREATE POLICY "Users manage their posts" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their posts" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- COMMUNITY LIKES
-- ================================================================
CREATE TABLE IF NOT EXISTS public.community_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE (post_id, user_id)
);

ALTER TABLE public.community_likes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their likes" ON public.community_likes FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- COMMUNITY COMMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.community_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.community_comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view comments" ON public.community_comments FOR SELECT USING (true);
CREATE POLICY "Users manage their comments" ON public.community_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete their comments" ON public.community_comments FOR DELETE USING (auth.uid() = user_id);

-- ================================================================
-- AI CONVERSATIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.ai_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their AI conversations" ON public.ai_conversations FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- SUPPLEMENTS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.supplements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  dose TEXT NOT NULL DEFAULT '5g',
  unit TEXT DEFAULT 'g',
  reminder_times TEXT[] DEFAULT '{}',
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.supplements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage their supplements" ON public.supplements FOR ALL USING (auth.uid() = user_id);

-- ================================================================
-- SUBSCRIPTION PLANS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  price_monthly NUMERIC(8,2) NOT NULL DEFAULT 0,
  price_annual NUMERIC(8,2) NOT NULL DEFAULT 0,
  features TEXT[] DEFAULT '{}',
  is_popular BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can view plans" ON public.subscription_plans FOR SELECT USING (true);

-- ================================================================
-- USER SUBSCRIPTIONS
-- ================================================================
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  plan_id UUID REFERENCES public.subscription_plans(id),
  status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('active', 'cancelled', 'expired', 'trial')),
  trial_ends_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days'),
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view their subscription" ON public.user_subscriptions FOR SELECT USING (auth.uid() = user_id);

-- ================================================================
-- INDEXES
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON public.workout_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_user_id ON public.workout_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_workout_logs_date ON public.workout_logs(date);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_id ON public.body_measurements(user_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_date ON public.body_measurements(date);
CREATE INDEX IF NOT EXISTS idx_nutrition_entries_user_date ON public.nutrition_entries(user_id, date);
CREATE INDEX IF NOT EXISTS idx_water_intake_user_date ON public.water_intake(user_id, date);
CREATE INDEX IF NOT EXISTS idx_community_posts_created ON public.community_posts(created_at DESC);

-- ================================================================
-- SEED DATA — Planos de assinatura
-- ================================================================
INSERT INTO public.subscription_plans (name, price_monthly, price_annual, features, is_popular) VALUES
('Gratuito', 0, 0, ARRAY['3 treinos por mês', 'Biblioteca de exercícios', 'Versículo do dia'], false),
('Pro', 29.90, 239.90, ARRAY['Treinos ilimitados', 'Treinador IA', 'Nutrição completa', 'Histórico avançado', 'Desafios', 'Comunidade', 'Área Cristã completa'], true),
('Elite', 49.90, 399.90, ARRAY['Tudo do Pro', 'Planos personalizados por IA', 'Suporte prioritário', 'Consultoria mensal'], false)
ON CONFLICT DO NOTHING;

-- ================================================================
-- SEED DATA — Conquistas
-- ================================================================
INSERT INTO public.achievements (title, description, icon, xp_reward, condition_type, condition_value) VALUES
('Primeiro Passo', 'Completou seu primeiro treino', '👟', 100, 'workouts', 1),
('Semana Completa', 'Treinou 5 vezes em uma semana', '🔥', 250, 'weekly_workouts', 5),
('30 Treinos', 'Completou 30 treinos', '💪', 500, 'workouts', 30),
('100 Treinos', 'Completou 100 treinos', '🏆', 1500, 'workouts', 100),
('Streak de Fogo', '7 dias consecutivos de treino', '🔥', 300, 'streak', 7),
('Mês Perfeito', '30 dias consecutivos de treino', '👑', 1000, 'streak', 30),
('Templo de Deus', 'Registrou medidas 10 vezes', '✝️', 200, 'measurements', 10),
('Hidratado', 'Atingiu a meta de água 14 dias', '💧', 150, 'water_streak', 14),
('Fé em Ação', 'Leu 30 devocionais', '📖', 300, 'devotionals', 30),
('Comunidade', 'Fez 5 publicações na comunidade', '🤝', 200, 'posts', 5)
ON CONFLICT DO NOTHING;

-- ================================================================
-- SEED DATA — Desafios
-- ================================================================
INSERT INTO public.challenges (title, description, type, target, duration_days, xp_reward) VALUES
('30 Dias de Consistência', 'Treine pelo menos 4x por semana durante 30 dias', 'weekly_workouts', 16, 30, 1000),
('100 Treinos', 'Complete 100 sessões de treino', 'workouts', 100, 180, 2000),
('Semana Perfeita', 'Treine 5 dias nesta semana', 'weekly_workouts', 5, 7, 250),
('Devocional Diário', 'Leia o devocional por 7 dias seguidos', 'devotionals', 7, 7, 200),
('Hidratação Total', 'Beba 2L de água por 14 dias', 'water_streak', 14, 14, 300)
ON CONFLICT DO NOTHING;
