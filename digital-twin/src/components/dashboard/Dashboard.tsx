"use client";

import DashboardHeader from "./DashboardHeader";
import ModelViewport from "./ModelViewport";
import SensorCard from "./SensorCard";
import AlertHistory from "./AlertHistory";
import LayerControls from "./LayerControls";
import SystemStats from "./SystemStats";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--background)]">
      <DashboardHeader />
      
      <main className="flex-1 p-6 grid-pattern">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full">
          {/* Left Sidebar - Sensor Cards */}
          <aside className="lg:col-span-3 flex flex-col gap-4">
            <SensorCard
              title="Temperature"
              value={78.4}
              unit="C"
              type="temperature"
              trend="up"
            />
            <SensorCard
              title="Humidity"
              value={45.2}
              unit="%"
              type="humidity"
              trend="stable"
            />
            <SensorCard
              title="Vibration"
              value={1.24}
              unit="mm/s"
              type="vibration"
              trend="down"
            />
            <SystemStats />
          </aside>

          {/* Center - 3D Viewport */}
          <section className="lg:col-span-6 min-h-[500px]">
            <ModelViewport />
          </section>

          {/* Right Sidebar - Controls & Alerts */}
          <aside className="lg:col-span-3 flex flex-col gap-4">
            <LayerControls />
            <div className="flex-1 min-h-[300px]">
              <AlertHistory />
            </div>
          </aside>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="glass border-t border-white/5 px-6 py-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" style={{ color: "#10b981" }} />
              <span className="text-zinc-400">All systems operational</span>
            </div>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">24 sensors active</span>
            <span className="text-zinc-600">|</span>
            <span className="text-zinc-500">Last data sync: 2 seconds ago</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-zinc-500">API Latency: <span className="text-emerald-400">12ms</span></span>
            <span className="text-zinc-500">Version 2.4.1</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
