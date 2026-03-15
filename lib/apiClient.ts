const API_URL = process.env.NEXT_PUBLIC_API_URL;
if (!API_URL) {
  throw new Error("NEXT_PUBLIC_API_URL is not set");
}

export type ApiErrorPayload = {
  message?: string;
  details?: any;
};

export class ApiError extends Error {
  details?: any;
  constructor(message: string, details?: any) {
    super(message);
    this.details = details;
  }
}

export function resolveAssetUrl(url?: string) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_URL}${url}`;
}

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("accessToken");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("refreshToken");
}

function setTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", accessToken);
  if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
}

function clearTokens() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

async function parseError(res: Response) {
  try {
    const data = (await res.json()) as ApiErrorPayload;
    return new ApiError(data.message || "Request failed", data.details);
  } catch {
    return new ApiError(await res.text());
  }
}

async function refreshTokenIfNeeded() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const res = await fetch(`${API_URL}/api/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    credentials: "include",
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data?.accessToken) setTokens(data.accessToken);
  return true;
}

export async function apiFetch<T>(input: string, init: RequestInit = {}): Promise<T> {
  const accessToken = getAccessToken();
  const headers = new Headers(init.headers || {});
  if (accessToken) headers.set("Authorization", `Bearer ${accessToken}`);
  if (!(init.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${input}`, {
    ...init,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    const refreshed = await refreshTokenIfNeeded();
    if (refreshed) {
      const retryHeaders = new Headers(init.headers || {});
      const newAccessToken = getAccessToken();
      if (newAccessToken) retryHeaders.set("Authorization", `Bearer ${newAccessToken}`);
      if (!(init.body instanceof FormData)) {
        retryHeaders.set("Content-Type", "application/json");
      }
      const retry = await fetch(`${API_URL}${input}`, {
        ...init,
        headers: retryHeaders,
        credentials: "include",
      });
      if (!retry.ok) throw await parseError(retry);
      return retry.json();
    }
  }

  if (!res.ok) throw await parseError(res);
  return res.json();
}

export async function login(email: string, password: string) {
  const data = await apiFetch<{ accessToken: string; refreshToken: string }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logout() {
  const refreshToken = getRefreshToken();
  if (refreshToken) {
    await apiFetch("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  }
  clearTokens();
}

export function formatApiError(err: unknown) {
  if (err instanceof ApiError) {
    if (err.details?.fieldErrors) {
      const messages = Object.values(err.details.fieldErrors).flat().join(" ");
      return messages || err.message;
    }
    return err.message;
  }
  return "Request failed";
}

export { API_URL };
