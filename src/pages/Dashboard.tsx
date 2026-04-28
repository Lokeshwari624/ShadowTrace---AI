import { useState } from "react";
import { motion } from "framer-motion";
import { Activity, ShieldCheck, Radar, Globe2 } from "lucide-react";
import UploadCard from "@/components/UploadCard";
import AnalyticsCard from "@/components/AnalyticsCard";
import AlertsPanel, { Alert } from "@/components/AlertsPanel";

const Dashboard = () => {
  const [extraAlert, setExtraAlert] = useState<Alert | null>(null);

  const handleScanComplete = (fp: string, match: number) => {
    const alert: Alert = {
      id: `scan-${Date.now()}`,
      title: `Mirror match found · ${match}% (${fp})`,
      source: "user-uploaded evidence · live scan",
      risk: match >= 80 ? "high" : "medium",
      time: new Date().toISOString(),
      icon: "mirror",
    };
    setExtraAlert(alert);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold">
            Command <span className="text-gradient">Center</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time content intelligence · Sentinel layer engaged
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl glass">
          <span className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_currentColor]" />
          <span className="text-xs font-mono text-foreground/80">all systems nominal</span>
        </div>
      </motion.div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Kpi icon={Radar} label="Active Scans" value="847" trend="+12%" color="primary" />
        <Kpi icon={ShieldCheck} label="Protected Assets" value="12.4K" trend="+3%" color="teal" />
        <Kpi icon={Globe2} label="Network Nodes" value="384" trend="+8%" color="accent" />
        <Kpi icon={Activity} label="Threat Index" value="6.8" trend="+0.4" color="destructive" />
      </div>

      {/* Top grid: Upload + Analytics */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <UploadCard onScanComplete={handleScanComplete} />
        <AnalyticsCard />
      </div>

      {/* Alerts */}
      <AlertsPanel extraAlert={extraAlert} />
    </div>
  );
};

const Kpi = ({
  icon: Icon,
  label,
  value,
  trend,
  color,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  trend: string;
  color: "primary" | "teal" | "accent" | "destructive";
}) => {
  const colors = {
    primary: { text: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
    teal: { text: "text-teal", bg: "bg-teal/10", border: "border-teal/30" },
    accent: { text: "text-accent", bg: "bg-accent/10", border: "border-accent/30" },
    destructive: { text: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/30" },
  };
  const c = colors[color];

  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="glass rounded-2xl p-4 hover:shadow-[0_0_25px_hsl(189_94%_53%/0.2)] transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className={`p-2 rounded-xl ${c.bg} border ${c.border}`}>
          <Icon className={`h-4 w-4 ${c.text}`} />
        </div>
        <span className={`text-[10px] font-mono ${c.text}`}>{trend}</span>
      </div>
      <p className="font-display text-2xl font-bold mt-3">{value}</p>
      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mt-0.5">
        {label}
      </p>
    </motion.div>
  );
};

export default Dashboard;
