import { NavLink, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Upload, Bell, BarChart3, LogOut, Shield } from "lucide-react";
import Logo from "@/components/Logo";
import { toast } from "sonner";

const items = [
  { label: "Upload Content", to: "/dashboard", icon: Upload, end: true },
  { label: "Alerts", to: "/dashboard/alerts", icon: Bell },
  { label: "Analytics", to: "/dashboard/analytics", icon: BarChart3 },
];

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("shadowtrace_user");
    toast.success("Session terminated");
    setTimeout(() => navigate("/"), 300);
  };

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 bg-sidebar border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <Logo size="sm" />
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_hsl(var(--primary)),0_0_20px_hsl(189_94%_53%/0.15)]"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-primary"
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="active-pill"
                    className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-primary rounded-r-full shadow-[0_0_10px_hsl(189_94%_53%/0.8)]"
                  />
                )}
                <item.icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 space-y-3 border-t border-sidebar-border">
        <div className="glass rounded-xl p-3 flex items-center gap-3">
          <div className="relative">
            <Shield className="h-4 w-4 text-success" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-foreground">System Online</p>
            <p className="text-[10px] text-muted-foreground">All scanners active</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
