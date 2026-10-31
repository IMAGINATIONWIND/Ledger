const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "/api").replace(/\/$/, "");

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_BASE}${cleanPath}`, init);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// ---------- Workouts ----------
export const getWorkouts = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return apiFetch<WorkoutRow[]>(`/workouts${qs}`);
};

export const createWorkout = (body: WorkoutCreatePayload) =>
  apiFetch<WorkoutRow>("/workouts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

export const deleteWorkout = (id: number) =>
  apiFetch<void>(`/workouts/${id}`, { method: "DELETE" });

export const resetUserHistory = (userId: string, confirmationId: string) =>
  apiFetch<{ success: boolean; deleted_count: number; message: string }>("/workouts/reset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, confirmation_id: confirmationId }),
  });

export const getExercises = () =>
  apiFetch<Exercise[]>("/workouts/exercises");

// ---------- Stats (Parametrized by User ID) ----------
export const getWeeklyVolume = (userId: string = "101") =>
  apiFetch<WeeklyStat[]>(`/stats/weekly?user_id=${encodeURIComponent(userId)}`);

export const getMonthlyVolume = (userId: string = "101") =>
  apiFetch<MonthlyStat[]>(`/stats/monthly?user_id=${encodeURIComponent(userId)}`);

export const getPersonalRecords = (userId: string = "101") =>
  apiFetch<PR[]>(`/stats/prs?user_id=${encodeURIComponent(userId)}`);

export const getCategoryBreakdown = (userId: string = "101") =>
  apiFetch<CategoryStat[]>(`/stats/category-breakdown?user_id=${encodeURIComponent(userId)}`);

export const getRecentSessions = (userId: string = "101") =>
  apiFetch<RecentSession[]>(`/stats/recent-sessions?user_id=${encodeURIComponent(userId)}`);

export const getStreak = (userId: string = "101") =>
  apiFetch<StreakRow[]>(`/stats/streak?user_id=${encodeURIComponent(userId)}`);

export const getWeekOverWeek = (userId: string = "101") =>
  apiFetch<WoWStat[]>(`/stats/week-over-week?user_id=${encodeURIComponent(userId)}`);

export const getProgression = (exercise: string, userId: string = "101") =>
  apiFetch<ProgressionRow[]>(
    `/stats/progression/${encodeURIComponent(exercise)}?user_id=${encodeURIComponent(userId)}`
  );

// ---------- Types ----------
export interface WorkoutRow {
  id: number;
  user_id: string;
  logged_on: string;
  exercise: string;
  category: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes: string | null;
}

export interface WorkoutCreatePayload {
  user_id?: string;
  logged_on?: string;
  exercise: string;
  category: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes?: string;
}

export interface Exercise {
  name: string;
  muscle_group: string;
  is_compound: boolean;
  primary_muscle?: string;
  secondary_muscles?: string;
  anatomy_details?: string;
}

export interface WeeklyStat {
  user_id?: string;
  week_start: string;
  total_volume_kg: number;
  days_trained: number;
  total_sets: number;
}

export interface MonthlyStat {
  user_id?: string;
  month_start: string;
  month_label: string;
  total_volume_kg: number;
  days_trained: number;
  total_sets: number;
}

export interface PR {
  user_id?: string;
  exercise: string;
  pr_weight_kg: number;
  pr_date: string;
}

export interface CategoryStat {
  user_id?: string;
  category: string;
  total_volume_kg: number;
  total_sets: number;
  sessions: number;
}

export interface RecentSession {
  user_id?: string;
  logged_on: string;
  exercises_done: string;
  total_sets: number;
  volume_kg: number;
}

export interface StreakRow {
  streak_start: string;
  streak_end: string;
  days_in_streak: number;
}

export interface WoWStat {
  week_start: string;
  volume_kg: number;
  prev_week_volume: number | null;
  volume_change: number | null;
  pct_change: number | null;
}

export interface ProgressionRow {
  logged_on: string;
  max_weight_kg: number;
  session_volume_kg?: number;
  moving_avg_7d: number;
}
