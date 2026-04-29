import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, ShieldAlert, Copy, Eye, Clock } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import type { LiveAlert, RiskLevel } from "@/api/types";

const iconFor = (k: LiveAlert["icon"]) => {
  switch (k) {
    case "conflict": return ShieldAlert;
    case "tamper":   return AlertTriangle;
    case "mirror":   return Copy;
  }
};

const riskStyle = (r: RiskLevel) => {
  switch (r) {
    case "high":
      return {
        badge: "bg-destructive/15 text-destructive border-destructive/40 shadow-[0_0_15px_hsl(0_84%_60%/0.3)]",
        dot: "bg-destructive", ring: "border-destructive/30",
        iconBg: "bg-destructive/10 text-destructive", label: "HIGH",
      };
    case "medium":
      return {
        badge: "bg-warning/15 text-warning border-warning/40 shadow-[0_0_15px_hsl(38_92%_50%/0.25)]",
        dot: "bg-warning", ring: "border-warning/30",
        iconBg: "bg-warning/10 text-warning", label: "MEDIUM",
      };
    case "low":
      return {
        badge: "bg-success/15 text-success border-success/40",
        dot: "bg-success", ring: "border-success/30",
        iconBg: "bg-success/10 text-success", label: "LOW",
      };
  }
};

const formatTime = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const sec = Math.max(0, Math.floor(diff / 1000));
  if (sec < 60) return `${sec}s ago`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ago`;
  return `${Math.floor(min / 60)}h ago`;
};

const AlertsPanel = () => {
  const { alerts } = useSimulation();
  const [filter, setFilter] = useState<"all" | RiskLevel>("all");

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.risk === filter);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass rounded-2xl p-5"
    >
      <header className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute inset-0 bg-destructive/40 blur-md animate-pulse" />
            <div className="relative bg-destructive/20 p-2 rounded-lg border border-destructive/40">
              <Eye className="h-4 w-4 text-destructive" />
            </div>
          </div>
          <div>
            <h3 className="font-display text-lg font-semibold">Live Alerts</h3>
            <p className="text-xs text-muted-foreground">
              {alerts.length} active · auto-refreshing
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-xl bg-background-alt/60 border border-border">
          {(["all", "high", "medium", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium uppercase tracking-wider transition-all ${
                filter === f
                  ? "bg-primary/20 text-primary shadow-[0_0_10px_hsl(189_94%_53%/0.3)]"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </header>

      <div className="space-y-3">
        <AnimatePresence initial={false}>
          {filtered.map((alert) => {
            const Icon = iconFor(alert.icon);
            const s = riskStyle(alert.risk);
            return (
              <motion.div
                key={alert.id}
                layout
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: "auto" }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                whileHover={{ scale: 1.01 }}
                className={`group flex items-center gap-4 p-4 rounded-xl bg-background-alt/50 border ${s.ring} hover:border-primary/40 hover:shadow-[0_0_20px_hsl(189_94%_53%/0.15)] transition-all`}
              >
                <div className={`relative shrink-0 p-2.5 rounded-xl ${s.iconBg}`}>
                  <Icon className="h-4 w-4" />
                  {alert.risk === "high" && (
                    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-destructive animate-ping" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{alert.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                    <span className="truncate font-mono">{alert.source}</span>
                    <span className="flex items-center gap-1 shrink-0">
                      <Clock className="h-3 w-3" />
                      {formatTime(alert.time)}
                    </span>
                  </div>
                </div>

                <span className={`shrink-0 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider border ${s.badge}`}>
                  <span className={`inline-block h-1.5 w-1.5 rounded-full ${s.dot} mr-1.5 animate-pulse`} />
                  {s.label}
                </span>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filtered.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            No alerts in this category yet — monitoring is live.
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AlertsPanel;
