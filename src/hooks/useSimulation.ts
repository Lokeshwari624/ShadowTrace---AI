/**
 * React hook bridging components → simulation engine.
 * Re-renders whenever the central state ticks or a scan is triggered.
 */
import { useEffect, useState } from "react";
import { simulation } from "@/api/simulation";
import type { AnalyticsSnapshot, LiveAlert } from "@/api/types";

export function useSimulation() {
  const [snapshot, setSnapshot] = useState<AnalyticsSnapshot>(() =>
    simulation.getSnapshot(),
  );
  const [alerts, setAlerts] = useState<LiveAlert[]>(() => simulation.getAlerts());

  useEffect(() => {
    const update = () => {
      setSnapshot(simulation.getSnapshot());
      setAlerts(simulation.getAlerts());
    };
    const unsub = simulation.subscribe(update);
    return unsub;
  }, []);

  return { snapshot, alerts };
}
