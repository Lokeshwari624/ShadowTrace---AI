/**
 * Endpoint definitions. Each function returns a structured ApiResponse,
 * shaped exactly like a real backend response so frontend code doesn't
 * need to change when wiring to a live service.
 */
import { apiRequest } from "./client";
import { simulation } from "./simulation";
import type {
  AnalyticsSnapshot,
  LiveAlert,
  ScanRequest,
  ScanResult,
} from "./types";

export const api = {
  /** POST /api/scan — run AI fingerprint + cross-reference */
  scan: (req: ScanRequest) =>
    apiRequest<ScanResult>(
      "/api/scan",
      { method: "POST", body: JSON.stringify(req) },
      () =>
        new Promise<ScanResult>((resolve) =>
          // small artificial latency — real network feel
          setTimeout(() => resolve(simulation.scan(req)), 300),
        ),
    ),

  /** GET /api/detect — current analytics snapshot */
  detect: () =>
    apiRequest<AnalyticsSnapshot>("/api/detect", { method: "GET" }, () =>
      simulation.getSnapshot(),
    ),

  /** GET /api/alerts — live alert feed */
  alerts: () =>
    apiRequest<LiveAlert[]>("/api/alerts", { method: "GET" }, () =>
      simulation.getAlerts(),
    ),
};

export type { ApiResponse } from "./client";
