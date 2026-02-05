"use client";

import { Cpu, HardDrive, Wifi, Clock } from "lucide-react";

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  status: "good" | "warning" | "critical";
}

function StatItem({ icon: Icon, label, value, status }: StatItemProps) {
  const statusColors = {
    good: "text-emerald-400",
    warning: "text-amber-400",
    critical: "text-red-400",
  };

  return (
    <div className="flex items-center gap-3">
      <Icon className="w-4 h-4 text-zinc-500" />
      <div className="flex-1">
        <p className="text-xs text-zinc-500">{label}</p>
        <p className={`text-sm font-medium ${statusColors[status]}`}>{value}</p>
      </div>
    </div>
  );
}

export default function SystemStats() {
  return (
    <div className="glass-card rounded-xl p-4">
      <h3 className="text-sm font-semibold text-zinc-200 mb-4">System Status</h3>
      <div className="space-y-4">
        <StatItem
          icon={Cpu}
          label="CPU Usage"
          value="42%"
          status="good"
        />
        <StatItem
          icon={HardDrive}
          label="Memory"
          value="6.2 GB / 16 GB"
          status="good"
        />
        <StatItem
          icon={Wifi}
          label="Network"
          value="128 Mbps"
          status="good"
        />
        <StatItem
          icon={Clock}
          label="Uptime"
          value="14d 6h 32m"
          status="good"
        />
      </div>
    </div>
  );
}
