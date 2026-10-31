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

export const getExercises = () =>
  apiFetch<Exercise[]>("/workouts/exercises");

// ---------- Stats ----------
export const getWeeklyVolume    = () => apiFetch<WeeklyStat[]>("/stats/weekly");
export const getMonthlyVolume   = () => apiFetch<MonthlyStat[]>("/stats/monthly");
export const getPersonalRecords = () => apiFetch<PR[]>("/stats/prs");
export const getCategoryBreakdown = () => apiFetch<CategoryStat[]>("/stats/category-breakdown");
export const getRecentSessions  = () => apiFetch<RecentSession[]>("/stats/recent-sessions");
export const getStreak          = () => apiFetch<StreakRow[]>("/stats/streak");
export const getWeekOverWeek    = () => apiFetch<WoWStat[]>("/stats/week-over-week");
export const getProgression     = (exercise: string) =>
  apiFetch<ProgressionRow[]>(`/stats/progression/${encodeURIComponent(exercise)}`);

// ---------- Types ----------
export interface WorkoutRow {
  id: number;
  logged_on: string;
  exercise: string;
  category: string;
  sets: number;
  reps: number;
  weight_kg: number;
  notes: string | null;
}

export interface WorkoutCreatePayload {
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
}

export interface WeeklyStat {
  week_start: string;
  total_volume_kg: number;
  days_trained: number;
  total_sets: number;
}

export interface MonthlyStat {
  month_start: string;
  month_label: string;
  total_volume_kg: number;
  days_trained: number;
  total_sets: number;
}

export interface PR {
  exercise: string;
  pr_weight_kg: number;
  pr_date: string;
}

export interface CategoryStat {
  category: string;
  total_volume_kg: number;
  total_sets: number;
  sessions: number;
}

export interface RecentSession {
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
  moving_avg_7d: number;
}
