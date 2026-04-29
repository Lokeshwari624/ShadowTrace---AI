export type RiskLevel = "high" | "medium" | "low";

export type ScanRequest = {
  fileName: string;
  fileSize: number;
  fileType: string;
};

export type ScanResult = {
  fingerprint: string;          // STX-XXXXX-XXXX
  algorithm: "pHash" | "SHA-256" | "Neural-V4";
  sha256: string;
  pHash: string;
  matchConfidence: number;      // 0-100, weighted
  risk: RiskLevel;
  mirrorsFound: number;
  sourcesScanned: number;
  scannedAt: string;            // ISO
  durationMs: number;
  region: string;
  platforms: PlatformHit[];
};

export type PlatformHit = {
  platform: string;             // YouTube, Instagram, ...
  matches: number;
  risk: RiskLevel;
};

export type LiveAlert = {
  id: string;
  title: string;
  source: string;
  risk: RiskLevel;
  time: string;                 // ISO
  icon: "conflict" | "tamper" | "mirror";
  platform?: string;
  match?: number;
};

export type AnalyticsSnapshot = {
  totalScans: number;
  totalThreats: number;
  activeSources: number;
  detectionRate: number;        // %
  trend: TrendPoint[];
  platforms: PlatformDistribution[];
  uptime: number;               // %
};

export type TrendPoint = {
  t: string;                    // HH:mm:ss
  scans: number;                // cumulative window
  threats: number;
};

export type PlatformDistribution = {
  platform: string;
  scans: number;
  threats: number;
  share: number;                // %
};
