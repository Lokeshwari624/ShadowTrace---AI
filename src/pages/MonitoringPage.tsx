import { motion } from "framer-motion";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from "recharts";
import { Activity, Cpu, Wifi, Zap } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

const MonitoringPage = () => {
  const { snapshot } = useSimulation();

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl lg:text-4xl font-bold">
          Real-Time <span className="text-gradient">Monitoring</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Continuous heartbeat across the ShadowTrace neural mesh · 5s sampling
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricTile icon={Activity} label="Throughput" value={`${Math.round(snapshot.totalScans / Math.max(1, snapshot.trend.length))}/win`} color="primary" />
        <MetricTile icon={Zap}      label="Latency"    value="187ms" color="teal" />
        <MetricTile icon={Wifi}     label="Mesh Nodes" value={`${snapshot.activeSources}`} color="accent" />
        <MetricTile icon={Cpu}      label="Engine Load" value="62%" color="destructive" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-5"
      >
        <header className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Activity Stream</h3>
            <p className="text-xs text-muted-foreground">Cumulative scans vs. detected threats</p>
          </div>
          <span className="px-3 py-1 rounded-full text-[10px] font-mono bg-success/10 text-success border border-success/30 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" /> LIVE
          </span>
        </header>

        <div className="h-[360px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={snapshot.trend} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(189 94% 53% / 0.08)" />
              <XAxis dataKey="t" stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  background: "hsl(222 47% 5% / 0.95)",
                  border: "1px solid hsl(189 94% 53% / 0.4)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "hsl(189 94% 53%)", fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Line type="monotone" dataKey="scans"   stroke="hsl(189 94% 53%)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="threats" stroke="hsl(258 90% 66%)" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass rounded-2xl p-5"
      >
        <h3 className="font-display text-lg font-semibold mb-4">Platform Heat Map</h3>
        <div className="space-y-3">
          {snapshot.platforms.map((p) => {
            const threatPct = p.scans > 0 ? (p.threats / p.scans) * 100 : 0;
            const tone = threatPct > 35 ? "bg-destructive" : threatPct > 20 ? "bg-warning" : "bg-success";
            return (
              <div key={p.platform} className="flex items-center gap-3">
                <span className="w-28 text-xs font-mono text-foreground/80 shrink-0">{p.platform}</span>
                <div className="flex-1 h-2 rounded-full bg-background-alt overflow-hidden">
                  <motion.div
                    className={`h-full ${tone}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(100, threatPct * 2.5)}%` }}
                    transition={{ duration: 0.6 }}
                  />
                </div>
                <span className="w-20 text-right text-[11px] font-mono text-muted-foreground">
                  {p.threats}/{p.scans}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

const MetricTile = ({
  icon: Icon, label, value, color,
}: {
  icon: typeof Activity; label: string; value: string;
  color: "primary" | "teal" | "accent" | "destructive";
}) => {
  const colors = {
    primary:     { text: "text-primary",     bg: "bg-primary/10",     border: "border-primary/30" },
    teal:        { text: "text-teal",        bg: "bg-teal/10",        border: "border-teal/30" },
    accent:      { text: "text-accent",      bg: "bg-accent/10",      border: "border-accent/30" },
    destructive: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  };
  const c = colors[color];
  return (
    <div className="glass rounded-2xl p-4">
      <div className={`inline-flex p-2 rounded-xl ${c.bg} border ${c.border}`}>
        <Icon className={`h-4 w-4 ${c.text}`} />
      </div>
      <p className="font-display text-2xl font-bold mt-3">{value}</p>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </div>
  );
};

export default MonitoringPage;
