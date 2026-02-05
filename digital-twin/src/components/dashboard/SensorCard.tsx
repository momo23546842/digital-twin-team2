"use client";

import { useEffect, useState } from "react";
import { Thermometer, Droplets, Activity } from "lucide-react";

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  type: "temperature" | "humidity" | "vibration";
  trend?: "up" | "down" | "stable";
}

function generateSparklineData(baseValue: number, variance: number): number[] {
  return Array.from({ length: 20 }, () => 
    baseValue + (Math.random() - 0.5) * variance
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  
  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((value - min) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        points={points}
        vectorEffect="non-scaling-stroke"
      />
      <polygon
        fill={`url(#gradient-${color})`}
        points={`0,100 ${points} 100,100`}
      />
    </svg>
  );
}

export default function SensorCard({ title, value, unit, type, trend = "stable" }: SensorCardProps) {
  const [sparklineData, setSparklineData] = useState<number[]>([]);
  const [currentValue, setCurrentValue] = useState(value);

  const iconConfig = {
    temperature: { icon: Thermometer, color: "#ef4444" },
    humidity: { icon: Droplets, color: "#22d3ee" },
    vibration: { icon: Activity, color: "#f59e0b" },
  };

  const { icon: Icon, color } = iconConfig[type];

  useEffect(() => {
    const variance = type === "temperature" ? 5 : type === "humidity" ? 10 : 0.5;
    setSparklineData(generateSparklineData(value, variance));

    const interval = setInterval(() => {
      setSparklineData(prev => {
        const newData = [...prev.slice(1)];
        const lastValue = prev[prev.length - 1];
        newData.push(lastValue + (Math.random() - 0.5) * variance * 0.5);
        return newData;
      });
      setCurrentValue(prev => prev + (Math.random() - 0.5) * 0.5);
    }, 2000);

    return () => clearInterval(interval);
  }, [value, type]);

  const trendArrow = {
    up: "text-red-400",
    down: "text-emerald-400",
    stable: "text-zinc-500",
  };

  return (
    <div className="glass-card rounded-xl p-4 transition-smooth">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div 
            className="p-2 rounded-lg" 
            style={{ backgroundColor: `${color}15` }}
          >
            <Icon className="w-4 h-4" style={{ color }} />
          </div>
          <span className="text-sm text-zinc-400 font-medium">{title}</span>
        </div>
        <div className="flex items-center gap-1">
          <div 
            className="w-2 h-2 rounded-full animate-pulse-glow" 
            style={{ backgroundColor: color, color }}
          />
          <span className="text-xs text-zinc-500">LIVE</span>
        </div>
      </div>
      
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold text-zinc-100">
          {currentValue.toFixed(1)}
        </span>
        <span className="text-sm text-zinc-500">{unit}</span>
        <span className={`ml-2 text-xs ${trendArrow[trend]}`}>
          {trend === "up" ? "+" : trend === "down" ? "-" : ""}
          {trend !== "stable" && "0.2"}
        </span>
      </div>

      <div className="h-12">
        <Sparkline data={sparklineData} color={color} />
      </div>
    </div>
  );
}
