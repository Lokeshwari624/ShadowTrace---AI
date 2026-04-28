import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Search, Zap } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import ThreeBackground from "@/components/ThreeBackground";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const stored = localStorage.getItem("shadowtrace_user");
    if (!stored) {
      navigate("/");
      return;
    }
    setUser(JSON.parse(stored));
  }, [navigate]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!user) return null;

  return (
    <div className="relative flex min-h-screen w-full bg-background">
      <ThreeBackground />
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass-strong border-b border-border h-16 flex items-center px-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              placeholder="Search fingerprints, sources, signatures…"
              className="w-full bg-background-alt/60 border border-border rounded-xl pl-10 pr-4 py-2 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_15px_hsl(189_94%_53%/0.15)] transition"
            />
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-background-alt/60 border border-border">
            <Zap className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-mono text-foreground/80">
              {time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} UTC
            </span>
          </div>

          <button className="relative p-2 rounded-xl bg-background-alt/60 border border-border hover:border-primary/40 transition">
            <Bell className="h-4 w-4 text-foreground/80" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full animate-pulse" />
          </button>

          <div className="flex items-center gap-3 pl-3 border-l border-border">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-medium leading-tight">{user.name}</p>
              <p className="text-[10px] text-muted-foreground">Operative · L3</p>
            </div>
            <div className="h-9 w-9 rounded-xl bg-gradient-primary flex items-center justify-center font-display font-bold text-background text-sm shadow-[0_0_15px_hsl(189_94%_53%/0.4)]">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 p-6"
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  );
};

export default DashboardLayout;
