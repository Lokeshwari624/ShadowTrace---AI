import { motion } from "framer-motion";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { Radar, ShieldAlert, Globe2, TrendingUp } from "lucide-react";
import AnalyticsCard from "@/components/AnalyticsCard";
import { useSimulation } from "@/hooks/useSimulation";

const PIE_COLORS = [
  "hsl(189 94% 53%)", "hsl(258 90% 66%)", "hsl(173 80% 40%)",
  "hsl(0 84% 60%)",   "hsl(38 92% 50%)",  "hsl(217 91% 60%)",
  "hsl(142 71% 45%)", "hsl(280 60% 55%)",
];

const AnalyticsPage = () => {
  const { snapshot } = useSimulation();
  const top = snapshot.platforms.slice(0, 6);

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-3xl lg:text-4xl font-bold">
          Network <span className="text-gradient">Analytics</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Aggregate intelligence over your protected portfolio
        </p>
      </motion.div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Summary icon={Radar}        label="Total Scans"        value={snapshot.totalScans.toLocaleString()}   color="primary" />
        <Summary icon={ShieldAlert}  label="Total Threats"      value={snapshot.totalThreats.toLocaleString()} color="destructive" />
        <Summary icon={Globe2}       label="Active Sources"     value={snapshot.activeSources.toLocaleString()} color="accent" />
        <Summary icon={TrendingUp}   label="Detection Rate"     value={`${snapshot.detectionRate.toFixed(2)}%`} color="teal" />
      </div>

      {/* Trend + Pie */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <AnalyticsCard />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-5 flex flex-col"
        >
          <header className="mb-4">
            <h3 className="font-display text-lg font-semibold">Source Distribution</h3>
            <p className="text-xs text-muted-foreground">Where your content is being tracked</p>
          </header>
          <div className="flex-1 min-h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top}
                  dataKey="scans"
                  nameKey="platform"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={3}
                >
                  {top.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="hsl(222 47% 5%)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(222 47% 5% / 0.95)",
                    border: "1px solid hsl(189 94% 53% / 0.4)",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "11px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Platform breakdown bar chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-2xl p-5"
      >
        <header className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display text-lg font-semibold">Threats by Platform</h3>
            <p className="text-xs text-muted-foreground">Scans vs. confirmed threats per source</p>
          </div>
        </header>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={snapshot.platforms} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(189 94% 53% / 0.08)" />
              <XAxis dataKey="platform" stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="hsl(215 20% 55%)" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip
                cursor={{ fill: "hsl(189 94% 53% / 0.05)" }}
                contentStyle={{
                  background: "hsl(222 47% 5% / 0.95)",
                  border: "1px solid hsl(189 94% 53% / 0.4)",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "11px" }} />
              <Bar dataKey="scans"   fill="hsl(189 94% 53%)" radius={[6, 6, 0, 0]} />
              <Bar dataKey="threats" fill="hsl(258 90% 66%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};

const Summary = ({
  icon: Icon, label, value, color,
}: {
  icon: typeof Radar; label: string; value: string;
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
    <motion.div whileHover={{ y: -3 }} className="glass rounded-2xl p-4 transition-shadow hover:shadow-[0_0_25px_hsl(189_94%_53%/0.2)]">
      <div className={`inline-flex p-2 rounded-xl ${c.bg} border ${c.border}`}>
        <Icon className={`h-4 w-4 ${c.text}`} />
      </div>
      <p className="font-display text-2xl font-bold mt-3">{value}</p>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">{label}</p>
    </motion.div>
  );
};

export default AnalyticsPage;
