"use client";

import { AlertTriangle, AlertCircle, CheckCircle, Clock } from "lucide-react";

type AlertStatus = "critical" | "warning" | "healthy";

interface Alert {
  id: string;
  message: string;
  status: AlertStatus;
  timestamp: string;
  component: string;
}

const mockAlerts: Alert[] = [
  {
    id: "1",
    message: "Motor bearing temperature exceeding threshold",
    status: "critical",
    timestamp: "2 min ago",
    component: "Motor Unit A",
  },
  {
    id: "2",
    message: "Vibration levels elevated on conveyor belt",
    status: "warning",
    timestamp: "15 min ago",
    component: "Conveyor B3",
  },
  {
    id: "3",
    message: "Hydraulic system pressure normalized",
    status: "healthy",
    timestamp: "32 min ago",
    component: "Hydraulic Pump",
  },
  {
    id: "4",
    message: "Coolant flow rate within optimal range",
    status: "healthy",
    timestamp: "1 hr ago",
    component: "Cooling System",
  },
  {
    id: "5",
    message: "Humidity sensor calibration required",
    status: "warning",
    timestamp: "2 hr ago",
    component: "Sensor Array C",
  },
];

const statusConfig = {
  critical: {
    icon: AlertCircle,
    badgeClass: "status-critical",
    iconColor: "text-red-400",
    label: "Critical",
  },
  warning: {
    icon: AlertTriangle,
    badgeClass: "status-warning",
    iconColor: "text-amber-400",
    label: "Warning",
  },
  healthy: {
    icon: CheckCircle,
    badgeClass: "status-healthy",
    iconColor: "text-emerald-400",
    label: "Healthy",
  },
};

function AlertItem({ alert }: { alert: Alert }) {
  const config = statusConfig[alert.status];
  const Icon = config.icon;

  return (
    <div className="glass-card rounded-lg p-3 hover:border-cyan-500/20 transition-smooth">
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${config.iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded-full ${config.badgeClass}`}>
              {config.label}
            </span>
            <span className="text-xs text-zinc-500">{alert.component}</span>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{alert.message}</p>
          <div className="flex items-center gap-1 mt-2 text-xs text-zinc-500">
            <Clock className="w-3 h-3" />
            <span>{alert.timestamp}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AlertHistory() {
  return (
    <div className="glass-card rounded-xl p-4 h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-zinc-200">Alert History</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">
            {mockAlerts.filter(a => a.status === "critical").length} critical
          </span>
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse-glow" style={{ color: "#ef4444" }} />
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        {mockAlerts.map((alert) => (
          <AlertItem key={alert.id} alert={alert} />
        ))}
      </div>
    </div>
  );
}
