/**
 * ShadowTrace API client
 * --------------------------------------------------------
 * Centralised, modular API layer. Simulated by default but
 * structured exactly like a real backend so endpoints can be
 * swapped to live services without touching feature code.
 *
 * Configure via environment variables (see .env.example):
 *   VITE_API_BASE_URL   – when set + VITE_USE_MOCK_API=false,
 *                         requests are sent to the real backend.
 *   VITE_USE_MOCK_API   – "true" (default) uses local simulation.
 *
 * IMPORTANT: never embed private API keys in the frontend.
 * Secrets must be proxied through a backend or edge function.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const USE_MOCK =
  (import.meta.env.VITE_USE_MOCK_API ?? "true").toString() === "true" ||
  !BASE_URL;

export type ApiResponse<T> = {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  source: "mock" | "live";
};

export async function apiRequest<T>(
  path: string,
  init: RequestInit | undefined,
  mockResolver: () => Promise<T> | T,
): Promise<ApiResponse<T>> {
  if (USE_MOCK) {
    try {
      const data = await mockResolver();
      return { ok: true, status: 200, data, source: "mock" };
    } catch (e) {
      return {
        ok: false,
        status: 500,
        error: (e as Error).message,
        source: "mock",
      };
    }
  }

  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...(init?.headers ?? {}),
      },
    });
    if (!res.ok) {
      // Fallback to mock so UI never breaks in production preview.
      const data = await mockResolver();
      return {
        ok: true,
        status: res.status,
        data,
        source: "mock",
        error: `Live endpoint failed (${res.status}); using mock fallback.`,
      };
    }
    const data = (await res.json()) as T;
    return { ok: true, status: res.status, data, source: "live" };
  } catch (e) {
    const data = await mockResolver();
    return {
      ok: true,
      status: 0,
      data,
      source: "mock",
      error: (e as Error).message,
    };
  }
}

export const isMock = USE_MOCK;
