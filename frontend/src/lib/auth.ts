// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
export const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:3001";
const TOKEN_KEY = "clavis_access_token";
export type AuthUser = {
  id: string;
  name: string;
  email: string;
  onboarding_completed: boolean;
};
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}
async function request(path: string, body: unknown) {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(
      `Não foi possível conectar ao servidor em ${API_URL}. Verifique se o backend está iniciado.`,
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.detail || "Não foi possível concluir a operação.");
  return data as { user: AuthUser; access_token: string };
}
export async function login(email: string, password: string) {
  const data = await request("/auth/login", { email, password });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data.user;
}
export async function register(name: string, email: string, password: string) {
  const data = await request("/auth/register", { name, email, password });
  localStorage.setItem(TOKEN_KEY, data.access_token);
  return data.user;
}
export async function getCurrentUser(): Promise<AuthUser | null> {
  const token = getToken();
  if (!token) return null;
  const response = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    clearToken();
    return null;
  }
  return response.json();
}

export async function completeOnboarding(): Promise<AuthUser> {
  const token = getToken();
  if (!token) throw new Error("Sessão expirada. Entre novamente.");

  let response: Response;
  try {
    response = await fetch(`${API_URL}/auth/onboarding`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
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
    throw new Error(data.detail || "Não foi possível concluir a apresentação.");
  }
  return data as AuthUser;
}
