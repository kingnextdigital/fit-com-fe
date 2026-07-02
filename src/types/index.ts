export interface Profile {
  id: string;
  user_id: string;
  name: string;
  email: string;
  phone?: string;
  avatar_url?: string;
  sex?: 'male' | 'female' | 'other';
  age?: number;
  weight?: number;
  height?: number;
  goal: 'hypertrophy' | 'weight_loss' | 'definition' | 'health';
  experience: 'beginner' | 'intermediate' | 'advanced';
  available_days: number[];
  workout_time: number;
  location: 'gym' | 'home';
  equipment: string[];
  restrictions: string[];
  injuries: string[];
  sleep_level: 1 | 2 | 3 | 4 | 5;
  stress_level: 1 | 2 | 3 | 4 | 5;
  diet_type: string;
  water_daily: number;
  created_at: string;
  updated_at: string;
  role: 'user' | 'admin';
  onboarding_completed: boolean;
  streak: number;
  total_workouts: number;
  level: number;
  xp: number;
}

export interface Exercise {
  id: string;
  name: string;
  muscle_groups: string[];
  equipment: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  description: string;
  tips: string[];
  common_errors: string[];
  breathing: string;
  alternatives: string[];
  image_url?: string;
  video_url?: string;
  gif_url?: string;
  created_at: string;
}

export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  split_type: 'ABC' | 'ABCD' | 'ABCDE' | 'Upper Lower' | 'PPL' | 'Full Body';
  goal: Profile['goal'];
  level: Profile['experience'];
  days_per_week: number;
  created_by_ai: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WorkoutDay {
  id: string;
  plan_id: string;
  day_name: string;
  day_number: number;
  exercises: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  day_id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: number;
  reps: string;
  rest_seconds: number;
  weight?: number;
  cadence?: string;
  rpe?: number;
  notes?: string;
  order: number;
}

export interface SetLog {
  set_number: number;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface ExerciseLog {
  id: string;
  log_id: string;
  exercise_id: string;
  exercise?: Exercise;
  sets: SetLog[];
}

export interface WorkoutLog {
  id: string;
  user_id: string;
  plan_id?: string;
  day_id?: string;
  date: string;
  duration_minutes: number;
  notes?: string;
  mood: 1 | 2 | 3 | 4 | 5;
  fatigue: 1 | 2 | 3 | 4 | 5;
  exercise_logs: ExerciseLog[];
  created_at: string;
}

export interface BodyMeasurement {
  id: string;
  user_id: string;
  date: string;
  weight?: number;
  arm?: number;
  chest?: number;
  waist?: number;
  hip?: number;
  thigh?: number;
  calf?: number;
  neck?: number;
  body_fat?: number;
  photo_url?: string;
  notes?: string;
  created_at: string;
}

export interface NutritionEntry {
  id: string;
  user_id: string;
  date: string;
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  food_name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  quantity: number;
  unit: string;
  created_at: string;
}

export interface WaterIntake {
  id: string;
  user_id: string;
  date: string;
  amount_ml: number;
  created_at: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: string;
  target: number;
  duration_days: number;
  xp_reward: number;
  badge_url?: string;
  created_at: string;
}

export interface UserChallenge {
  id: string;
  user_id: string;
  challenge_id: string;
  challenge?: Challenge;
  progress: number;
  completed: boolean;
  started_at: string;
  completed_at?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  xp_reward: number;
  condition_type: string;
  condition_value: number;
}

export interface UserAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  achievement?: Achievement;
  unlocked_at: string;
}

export interface ChristianVerse {
  id: string;
  text: string;
  reference: string;
  theme?: string;
  created_at: string;
}

export interface ChristianDevotional {
  id: string;
  title: string;
  content: string;
  verse_id?: string;
  verse?: ChristianVerse;
  date: string;
  created_at: string;
}

export interface CommunityPost {
  id: string;
  user_id: string;
  profile?: Profile;
  content: string;
  image_url?: string;
  workout_log_id?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
}

export interface AIMessage {
  id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface Supplement {
  id: string;
  user_id: string;
  name: string;
  dose: string;
  unit: string;
  reminder_times: string[];
  active: boolean;
  created_at: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price_monthly: number;
  price_annual: number;
  features: string[];
  is_popular?: boolean;
}

export interface UserSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  trial_ends_at?: string;
  current_period_end?: string;
  created_at: string;
}

export interface AdminStats {
  total_users: number;
  active_subscribers: number;
  mrr: number;
  new_users_today: number;
  workouts_today: number;
  churn_rate: number;
}

export type NavItem = {
  label: string;
  icon: string;
  path: string;
  badge?: number;
};

export type ChartData = { name: string; value: number }[];

export type GoalType = Profile['goal'];

export type ExperienceLevel = Profile['experience'];
