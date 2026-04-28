import AlertsPanel from "@/components/AlertsPanel";
import { motion } from "framer-motion";

const AlertsPage = () => (
  <div className="space-y-6 max-w-[1400px] mx-auto">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-display text-3xl lg:text-4xl font-bold">
        Threat <span className="text-gradient">Alerts</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        All incoming signals from the ShadowTrace neural mesh
      </p>
    </motion.div>
    <AlertsPanel />
  </div>
);

export default AlertsPage;
