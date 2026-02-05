"use client";

import { Activity, Settings, Bell, Search, ChevronDown } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="glass border-b border-white/5 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo and Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 glow-primary">
              <Activity className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-zinc-100">Digital Twin</h1>
              <p className="text-xs text-zinc-500">Industrial IoT Monitor</p>
            </div>
          </div>
          
          {/* Environment Selector */}
          <div className="ml-6 pl-6 border-l border-white/10">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-smooth">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="text-sm text-zinc-300">Production</span>
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            </button>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search components..."
              className="pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-lg text-zinc-300 placeholder-zinc-600 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-smooth w-64"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-zinc-200">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>

          {/* Settings */}
          <button className="p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-zinc-200">
            <Settings className="w-5 h-5" />
          </button>

          {/* User Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 flex items-center justify-center text-xs font-bold text-zinc-900">
            DT
          </div>
        </div>
      </div>
    </header>
  );
}
