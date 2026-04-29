import { motion } from "framer-motion";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid,
} from "recharts";
import { TrendingUp, Activity } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

const AnalyticsCard = () => {
  const { snapshot } = useSimulation();
  const trendData = snapshot.trend;

  // compute % delta of scans across the window
  const first = trendData[0]?.scans ?? 0;
  const last  = trendData[trendData.length - 1]?.scans ?? 0;
  const delta = first > 0 ? (((last - first) / first) * 100).toFixed(1) : "0.0";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass rounded-2xl p-5 h-full flex flex-col"
    >
      <header className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display text-lg font-semibold">Threat Activity</h3>
          <p className="text-xs text-muted-foreground">Live stream · 5s windows</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-success/10 border border-success/30">
          <TrendingUp className="h-3 w-3 text-success" />
          <span className="text-[10px] font-mono text-success">+{delta}%</span>
        </div>
      </header>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <Stat label="Total Scans" value={snapshot.totalScans.toLocaleString()} accent="primary" />
        <Stat label="Threats" value={snapshot.totalThreats.toLocaleString()} accent="destructive" />
        <Stat label="Detection" value={`${snapshot.detectionRate.toFixed(1)}%`} accent="success" />
      </div>

      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trendData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(189 94% 53%)" stopOpacity={0.5} />
                <stop offset="100%" stopColor="hsl(189 94% 53%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="threatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="hsl(258 90% 66%)" stopOpacity={0.4} />
                <stop offset="100%" stopColor="hsl(258 90% 66%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(189 94% 53% / 0.1)" />
            <XAxis dataKey="t" stroke="hsl(215 20% 55%)" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                background: "hsl(222 47% 5% / 0.95)",
                border: "1px solid hsl(189 94% 53% / 0.4)",
                borderRadius: "12px",
                fontSize: "12px",
                boxShadow: "0 0 20px hsl(189 94% 53% / 0.3)",
              }}
              labelStyle={{ color: "hsl(189 94% 53%)", fontWeight: 600 }}
            />
            <Area type="monotone" dataKey="scans" stroke="hsl(189 94% 53%)" strokeWidth={2.5} fill="url(#scanGradient)" />
            <Area type="monotone" dataKey="threats" stroke="hsl(258 90% 66%)" strokeWidth={2} fill="url(#threatGradient)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-2 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary shadow-[0_0_6px_currentColor]" />Scans
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-accent shadow-[0_0_6px_currentColor]" />Threats
        </div>
        <div className="ml-auto flex items-center gap-1 text-primary">
          <Activity className="h-3 w-3 animate-pulse" /><span className="font-mono">live</span>
        </div>
      </div>
    </motion.div>
  );
};

const Stat = ({
  label, value, accent,
}: { label: string; value: string; accent: "primary" | "destructive" | "success" }) => {
  const colors = {
    primary: "text-primary",
    destructive: "text-destructive",
    success: "text-success",
  };
  return (
    <div className="rounded-xl bg-background-alt/40 border border-border p-3">
      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{label}</p>
      <p className={`font-display text-xl font-bold mt-1 ${colors[accent]}`}>{value}</p>
    </div>
  );
};

export default AnalyticsCard;
