"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Zap,
  Gauge,
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  FileText,
  Wrench,
  ShieldAlert,
  ChevronRight,
} from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  trend: number[];
  color: "cyan" | "purple" | "emerald";
}

function MiniSparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <svg className="w-full h-8" viewBox={`0 0 ${data.length * 8} 32`}>
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`M0,${32 - ((data[0] - min) / range) * 28} ${data.map((d, i) => `L${i * 8},${32 - ((d - min) / range) * 28}`).join(" ")} L${(data.length - 1) * 8},32 L0,32 Z`}
        fill={`url(#gradient-${color})`}
      />
      <path
        d={`M0,${32 - ((data[0] - min) / range) * 28} ${data.map((d, i) => `L${i * 8},${32 - ((d - min) / range) * 28}`).join(" ")}`}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MetricCard({ title, value, unit, icon, trend, color }: MetricCardProps) {
  const colorMap = {
    cyan: { text: "text-cyan-400", bg: "bg-cyan-500/10", border: "border-cyan-500/20", stroke: "#22d3ee" },
    purple: { text: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", stroke: "#a855f7" },
    emerald: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", stroke: "#10b981" },
  };

  const colors = colorMap[color];

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colors.bg} ${colors.border} border`}>
          <span className={colors.text}>{icon}</span>
        </div>
        <span className="text-xs text-zinc-500">{title}</span>
      </div>
      <div className="mb-2">
        <span className={`text-2xl font-bold ${colors.text}`}>{value}</span>
        <span className="text-sm text-zinc-500 ml-1">{unit}</span>
      </div>
      <MiniSparkline data={trend} color={colors.stroke} />
    </div>
  );
}

interface Alert {
  id: string;
  type: "critical" | "warning" | "info";
  message: string;
  timestamp: string;
}

const alerts: Alert[] = [
  { id: "1", type: "critical", message: "Turbine B2 temperature exceeds threshold", timestamp: "2 min ago" },
  { id: "2", type: "warning", message: "Vibration anomaly detected in Compressor C1", timestamp: "15 min ago" },
  { id: "3", type: "warning", message: "Oil pressure below optimal range", timestamp: "32 min ago" },
  { id: "4", type: "info", message: "Scheduled maintenance reminder: Turbine A3", timestamp: "1 hr ago" },
];

export default function StatusPanel() {
  const [metrics, setMetrics] = useState({
    operational: { value: "Online", trend: [85, 88, 92, 89, 95, 97, 98, 99] },
    energy: { value: "847.3", trend: [820, 835, 842, 851, 847, 839, 845, 847] },
    performance: { value: "94.2", trend: [91, 92, 93, 92, 94, 93, 95, 94] },
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics((prev) => ({
        operational: {
          ...prev.operational,
          trend: [...prev.operational.trend.slice(1), 95 + Math.random() * 5],
        },
        energy: {
          value: (840 + Math.random() * 20).toFixed(1),
          trend: [...prev.energy.trend.slice(1), 840 + Math.random() * 20],
        },
        performance: {
          value: (92 + Math.random() * 5).toFixed(1),
          trend: [...prev.performance.trend.slice(1), 92 + Math.random() * 5],
        },
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-amber-400" />;
      default:
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    }
  };

  const getAlertStyle = (type: Alert["type"]) => {
    switch (type) {
      case "critical":
        return "border-l-red-500 bg-red-500/5";
      case "warning":
        return "border-l-amber-500 bg-amber-500/5";
      default:
        return "border-l-emerald-500 bg-emerald-500/5";
    }
  };

  return (
    <aside className="w-[320px] h-full glass-panel flex flex-col overflow-hidden">
      {/* Header */}
      <header className="px-5 py-4 border-b border-white/5">
        <h2 className="text-sm font-semibold text-white">System Overview</h2>
        <p className="text-xs text-zinc-500 mt-0.5">Real-time metrics</p>
      </header>

      {/* Metrics */}
      <div className="p-4 space-y-3">
        <MetricCard
          title="Operational Status"
          value={metrics.operational.value}
          unit=""
          icon={<Activity className="w-4 h-4" />}
          trend={metrics.operational.trend}
          color="emerald"
        />
        <MetricCard
          title="Energy Consumption"
          value={metrics.energy.value}
          unit="kWh"
          icon={<Zap className="w-4 h-4" />}
          trend={metrics.energy.trend}
          color="cyan"
        />
        <MetricCard
          title="Performance Index"
          value={metrics.performance.value}
          unit="%"
          icon={<Gauge className="w-4 h-4" />}
          trend={metrics.performance.trend}
          color="purple"
        />
      </div>

      {/* Alerts */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-white/5">
        <header className="px-5 py-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Recent Alerts</h3>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
            4 Active
          </span>
        </header>
        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border-l-2 ${getAlertStyle(alert.type)} border border-white/5 cursor-pointer hover:bg-white/5 transition-all`}
            >
              <div className="flex items-start gap-2.5">
                {getAlertIcon(alert.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-zinc-200 leading-relaxed">{alert.message}</p>
                  <p className="text-[10px] text-zinc-500 mt-1">{alert.timestamp}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-zinc-600" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 border-t border-white/5 space-y-2">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Quick Controls</h3>
        <button className="w-full px-4 py-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-cyan-500/20 transition-all btn-glow">
          <Wrench className="w-4 h-4" />
          Initiate Diagnostics
        </button>
        <button className="w-full px-4 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium flex items-center justify-center gap-2 hover:bg-purple-500/20 transition-all">
          <ShieldAlert className="w-4 h-4" />
          System Override
        </button>
        <button className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-zinc-300 text-sm font-medium flex items-center justify-center gap-2 hover:bg-white/10 transition-all">
          <FileText className="w-4 h-4" />
          Generate Report
        </button>
      </div>
    </aside>
  );
}
