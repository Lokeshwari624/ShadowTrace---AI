/**
 * Central simulation engine for ShadowTrace AI.
 * Produces realistic, time-evolving metrics rather than pure random
 * values. All feature components subscribe to this via useSimulation().
 *
 * Logic rules:
 *   - totalScans grows continuously (steady, with small jitter)
 *   - threats grow occasionally, biased by current activity
 *   - detectionRate = threats / scans * 100
 *   - matchConfidence is weighted (low/med/high bands)
 *   - alerts are derived from match thresholds, never arbitrary
 *   - platform distribution is fixed-weighted, not uniform random
 */
import type {
  AnalyticsSnapshot,
  LiveAlert,
  PlatformDistribution,
  PlatformHit,
  RiskLevel,
  ScanRequest,
  ScanResult,
  TrendPoint,
} from "./types";

const PLATFORM_WEIGHTS: { name: string; weight: number; baseRisk: number }[] = [
  { name: "YouTube", weight: 0.28, baseRisk: 0.18 },
  { name: "Instagram", weight: 0.22, baseRisk: 0.22 },
  { name: "TikTok", weight: 0.16, baseRisk: 0.27 },
  { name: "Torrent Sites", weight: 0.12, baseRisk: 0.62 },
  { name: "Reddit", weight: 0.08, baseRisk: 0.20 },
  { name: "Telegram", weight: 0.07, baseRisk: 0.45 },
  { name: "Dark Web", weight: 0.04, baseRisk: 0.78 },
  { name: "X / Twitter", weight: 0.03, baseRisk: 0.25 },
];

const REGIONS = ["NA-East", "EU-West", "APAC", "LATAM", "Global Mesh"];

// ---------- Helpers ----------
const hex = (len: number) => {
  const c = "abcdef0123456789";
  let s = "";
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
};

const code = (len: number) => {
  const c = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for (let i = 0; i < len; i++) s += c[Math.floor(Math.random() * c.length)];
  return s;
};

const fingerprint = () => `STX-${code(5)}-${code(4)}`;

const riskFromMatch = (m: number): RiskLevel => {
  if (m >= 85) return "high";
  if (m >= 70) return "medium";
  return "low";
};

/**
 * Weighted match confidence: 50% chance medium, 30% low, 20% high.
 * Bands:
 *   low    : 60–74
 *   medium : 75–84
 *   high   : 85–95
 */
const weightedMatch = (): number => {
  const r = Math.random();
  if (r < 0.3) return 60 + Math.floor(Math.random() * 15);  // 60-74
  if (r < 0.8) return 75 + Math.floor(Math.random() * 10);  // 75-84
  return 85 + Math.floor(Math.random() * 11);               // 85-95
};

const pickPlatform = () => {
  const r = Math.random();
  let acc = 0;
  for (const p of PLATFORM_WEIGHTS) {
    acc += p.weight;
    if (r <= acc) return p;
  }
  return PLATFORM_WEIGHTS[0];
};

// ---------- Persistent simulation state ----------
type State = {
  totalScans: number;
  totalThreats: number;
  activeSources: number;
  trend: TrendPoint[];
  alerts: LiveAlert[];
  platforms: Map<string, { scans: number; threats: number }>;
  startedAt: number;
};

const ALERT_TEMPLATES: { title: string; icon: LiveAlert["icon"]; minMatch: number }[] = [
  { title: "Mirror match detected", icon: "mirror", minMatch: 70 },
  { title: "Potential ownership conflict", icon: "conflict", minMatch: 80 },
  { title: "Metadata tampering detected", icon: "tamper", minMatch: 65 },
  { title: "Suspicious re-upload pattern", icon: "mirror", minMatch: 70 },
  { title: "Cross-domain duplicate located", icon: "mirror", minMatch: 75 },
  { title: "Watermark integrity intact", icon: "tamper", minMatch: 0 },
  { title: "Geo-spoofing attempt blocked", icon: "conflict", minMatch: 60 },
];

class SimulationEngine {
  private state: State;
  private listeners = new Set<() => void>();
  private tickHandle: number | null = null;

  constructor() {
    const saved =
      typeof window !== "undefined"
        ? localStorage.getItem("shadowtrace_sim")
        : null;
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.state = {
          ...parsed,
          platforms: new Map(parsed.platforms ?? []),
        };
      } catch {
        this.state = this.seed();
      }
    } else {
      this.state = this.seed();
    }
  }

  private seed(): State {
    const platforms = new Map<string, { scans: number; threats: number }>();
    PLATFORM_WEIGHTS.forEach((p) => {
      const baseScans = Math.floor(800 * p.weight + Math.random() * 80);
      platforms.set(p.name, {
        scans: baseScans,
        threats: Math.floor(baseScans * p.baseRisk * 0.4),
      });
    });

    let scans = 0;
    let threats = 0;
    platforms.forEach((v) => {
      scans += v.scans;
      threats += v.threats;
    });

    // Seed trend with last 12 windows
    const now = Date.now();
    const trend: TrendPoint[] = [];
    let runScans = Math.max(0, scans - 240);
    let runThreats = Math.max(0, threats - 36);
    for (let i = 11; i >= 0; i--) {
      runScans += 14 + Math.floor(Math.random() * 8);
      if (Math.random() < 0.55) runThreats += Math.floor(Math.random() * 4);
      const ts = new Date(now - i * 5000);
      trend.push({
        t: ts.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        scans: runScans,
        threats: runThreats,
      });
    }

    return {
      totalScans: scans,
      totalThreats: threats,
      activeSources: 384,
      trend,
      alerts: [],
      platforms,
      startedAt: now,
    };
  }

  // ---- public API ----
  subscribe(fn: () => void) {
    this.listeners.add(fn);
    if (!this.tickHandle) this.startTicking();
    return () => {
      this.listeners.delete(fn);
      if (this.listeners.size === 0 && this.tickHandle) {
        clearInterval(this.tickHandle);
        this.tickHandle = null;
      }
    };
  }

  getSnapshot(): AnalyticsSnapshot {
    const platforms = this.platformDistribution();
    const detectionRate =
      this.state.totalScans > 0
        ? +((this.state.totalThreats / this.state.totalScans) * 100).toFixed(2)
        : 0;
    return {
      totalScans: this.state.totalScans,
      totalThreats: this.state.totalThreats,
      activeSources: this.state.activeSources,
      detectionRate,
      trend: this.state.trend,
      platforms,
      uptime: 99.97,
    };
  }

  getAlerts(): LiveAlert[] {
    return [...this.state.alerts];
  }

  /** Run a simulated scan based on uploaded file metadata. */
  scan(req: ScanRequest): ScanResult {
    const start = performance.now();
    const match = weightedMatch();
    const risk = riskFromMatch(match);
    const platforms = this.derivePlatformHits(match);
    const mirrors = platforms.reduce((s, p) => s + p.matches, 0);
    const sources = 20 + Math.floor(Math.random() * 60);
    const algo = (["pHash", "SHA-256", "Neural-V4"] as const)[
      Math.floor(Math.random() * 3)
    ];

    // record into state
    this.state.totalScans += 1;
    if (risk !== "low") this.state.totalThreats += 1;
    platforms.forEach((p) => {
      const cur = this.state.platforms.get(p.platform) ?? { scans: 0, threats: 0 };
      cur.scans += 1;
      if (p.risk !== "low") cur.threats += 1;
      this.state.platforms.set(p.platform, cur);
    });

    // create derived alert if risk is meaningful
    if (match >= 65) {
      const tpl = ALERT_TEMPLATES.find((t) => match >= t.minMatch) ?? ALERT_TEMPLATES[0];
      this.pushAlert({
        id: `scan-${Date.now()}`,
        title: `${tpl.title} · ${match}%`,
        source: `${platforms[0]?.platform ?? "unknown"} · ${req.fileName}`,
        risk,
        time: new Date().toISOString(),
        icon: tpl.icon,
        platform: platforms[0]?.platform,
        match,
      });
    }

    this.persist();
    this.emit();

    return {
      fingerprint: fingerprint(),
      algorithm: algo,
      sha256: hex(64),
      pHash: hex(16),
      matchConfidence: match,
      risk,
      mirrorsFound: mirrors,
      sourcesScanned: sources,
      scannedAt: new Date().toISOString(),
      durationMs: Math.max(220, Math.round(performance.now() - start + 600 + Math.random() * 800)),
      region: REGIONS[Math.floor(Math.random() * REGIONS.length)],
      platforms,
    };
  }

  // ---- internal ----
  private derivePlatformHits(match: number): PlatformHit[] {
    // higher match → more platforms involved
    const count = match >= 85 ? 3 + Math.floor(Math.random() * 2)
                : match >= 75 ? 2 + Math.floor(Math.random() * 2)
                : 1 + Math.floor(Math.random() * 2);
    const seen = new Set<string>();
    const hits: PlatformHit[] = [];
    while (hits.length < count) {
      const p = pickPlatform();
      if (seen.has(p.name)) continue;
      seen.add(p.name);
      const matches = 1 + Math.floor(Math.random() * (match >= 85 ? 6 : 3));
      const r: RiskLevel = p.baseRisk > 0.5 || match >= 85 ? "high"
                         : p.baseRisk > 0.25 || match >= 75 ? "medium"
                         : "low";
      hits.push({ platform: p.name, matches, risk: r });
    }
    return hits;
  }

  private platformDistribution(): PlatformDistribution[] {
    const total = Array.from(this.state.platforms.values()).reduce(
      (s, v) => s + v.scans,
      0,
    );
    return PLATFORM_WEIGHTS.map((p) => {
      const s = this.state.platforms.get(p.name) ?? { scans: 0, threats: 0 };
      return {
        platform: p.name,
        scans: s.scans,
        threats: s.threats,
        share: total > 0 ? +((s.scans / total) * 100).toFixed(1) : 0,
      };
    }).sort((a, b) => b.scans - a.scans);
  }

  private pushAlert(a: LiveAlert) {
    this.state.alerts = [a, ...this.state.alerts].slice(0, 12);
  }

  private startTicking() {
    this.tickHandle = window.setInterval(() => this.tick(), 5000);
  }

  /** Background heartbeat — continuous monitoring simulation. */
  private tick() {
    // scans grow steadily
    const newScans = 12 + Math.floor(Math.random() * 9);   // 12-20
    this.state.totalScans += newScans;

    // threats grow occasionally (~55% windows)
    let newThreats = 0;
    if (Math.random() < 0.55) {
      newThreats = 1 + Math.floor(Math.random() * 3);      // 1-3
      this.state.totalThreats += newThreats;
    }

    // distribute across platforms by weight
    PLATFORM_WEIGHTS.forEach((p) => {
      const cur = this.state.platforms.get(p.name) ?? { scans: 0, threats: 0 };
      const sShare = Math.round(newScans * p.weight);
      cur.scans += sShare;
      if (newThreats > 0 && Math.random() < p.baseRisk + 0.15) {
        cur.threats += 1;
      }
      this.state.platforms.set(p.name, cur);
    });

    // add trend point (cumulative)
    const ts = new Date();
    this.state.trend.push({
      t: ts.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      scans: this.state.totalScans,
      threats: this.state.totalThreats,
    });
    if (this.state.trend.length > 24) this.state.trend.shift();

    // occasional ambient alert
    if (Math.random() < 0.45) {
      const match = weightedMatch();
      const risk = riskFromMatch(match);
      const tpl = ALERT_TEMPLATES.find((t) => match >= t.minMatch) ?? ALERT_TEMPLATES[0];
      const platform = pickPlatform().name;
      this.pushAlert({
        id: `tick-${Date.now()}`,
        title: `${tpl.title} · ${match}%`,
        source: `${platform} · node-${Math.floor(Math.random() * 900) + 100}`,
        risk,
        time: ts.toISOString(),
        icon: tpl.icon,
        platform,
        match,
      });
    }

    this.persist();
    this.emit();
  }

  private emit() {
    this.listeners.forEach((fn) => fn());
  }

  private persist() {
    try {
      localStorage.setItem(
        "shadowtrace_sim",
        JSON.stringify({
          ...this.state,
          platforms: Array.from(this.state.platforms.entries()),
        }),
      );
    } catch { /* ignore quota */ }
  }
}

export const simulation = new SimulationEngine();
