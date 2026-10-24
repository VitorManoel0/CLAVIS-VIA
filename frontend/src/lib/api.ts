import { queryOptions } from "@tanstack/react-query";
import { API_URL, clearToken, getToken } from "./auth";

export type Checkin = { id: string; mood: string; note: string | null; created_at: string };
export type Plan = {
  id: string;
  title: string;
  description: string;
  theme: string;
  minutes: string;
  total_days: number;
  sort_order: number;
};
export type PlanDay = {
  id: string;
  plan_id: string;
  day_number: number;
  title: string;
  subtitle: string;
  content: string;
  reflection: string;
  action: string;
};
export type Completion = {
  id: string;
  plan_day_id: string;
  reflection: string | null;
  completed_at: string;
};

export const checkinsQuery = queryOptions({
  queryKey: ["checkins"],
  queryFn: () => backendRequest<Checkin[]>("/checkins"),
});

export async function createCheckin(mood: string, note?: string) {
  return backendRequest<Checkin>("/checkins", {
    method: "POST",
    body: JSON.stringify({ mood, note: note || null }),
  });
}

async function backendRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  if (!token) throw new Error("Sessão expirada. Entre novamente.");

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new Error("Não foi possível conectar ao servidor.");
  }

  const data = await response.json().catch(() => ({}));
  if (response.status === 401) {
    clearToken();
    throw new Error("Sessão expirada. Entre novamente.");
  }
  if (!response.ok) {
    throw new Error(data.detail || "Não foi possível concluir a operação.");
  }
  return data as T;
}

export const plansQuery = queryOptions({
  queryKey: ["plans"],
  queryFn: () => backendRequest<Plan[]>("/plans"),
});

export const planDaysQuery = (planId: string) =>
  queryOptions({
    queryKey: ["plan_days", planId],
    queryFn: () => backendRequest<PlanDay[]>(`/plan-days?plan_id=${encodeURIComponent(planId)}`),
  });

export const completionsQuery = queryOptions({
  queryKey: ["completions"],
  queryFn: () => backendRequest<Completion[]>("/completions"),
});

export const allPlanDaysQuery = queryOptions({
  queryKey: ["plan_days", "all"],
  queryFn: () => backendRequest<PlanDay[]>("/plan-days"),
});

export async function completeDay(planDayId: string, reflection?: string) {
  return backendRequest<Completion>(`/plan-days/${planDayId}/completion`, {
    method: "PUT",
    body: JSON.stringify({ reflection: reflection || null }),
  });
}
