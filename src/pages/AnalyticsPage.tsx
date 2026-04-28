import AnalyticsCard from "@/components/AnalyticsCard";
import { motion } from "framer-motion";

const AnalyticsPage = () => (
  <div className="space-y-6 max-w-[1400px] mx-auto">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="font-display text-3xl lg:text-4xl font-bold">
        Network <span className="text-gradient">Analytics</span>
      </h1>
      <p className="text-sm text-muted-foreground mt-1">
        Aggregate intelligence over your protected portfolio
      </p>
    </motion.div>
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      <AnalyticsCard />
      <AnalyticsCard />
    </div>
  </div>
);

export default AnalyticsPage;
