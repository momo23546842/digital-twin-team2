"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Box,
  AlertTriangle,
  Settings,
  MessageSquare,
  History,
  HelpCircle,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", active: false },
  { icon: MessageSquare, label: "Chat", active: true },
  { icon: Box, label: "Assets", active: false },
  { icon: AlertTriangle, label: "Alerts", active: false },
  { icon: History, label: "History", active: false },
  { icon: Settings, label: "Settings", active: false },
];

export default function NavigationRail() {
  const [activeIndex, setActiveIndex] = useState(1);

  return (
    <nav className="w-[72px] h-full glass-panel flex flex-col items-center py-6 gap-2">
      {/* User Avatar */}
      <div className="relative mb-6">
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-purple-500 p-[2px]">
          <div className="w-full h-full rounded-full bg-[var(--background-secondary)] flex items-center justify-center">
            <span className="text-sm font-semibold text-cyan-400">DT</span>
          </div>
        </div>
        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[var(--background)]" />
      </div>

      {/* Navigation Items */}
      <div className="flex-1 flex flex-col items-center gap-1">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = activeIndex === index;

          return (
            <button
              key={item.label}
              onClick={() => setActiveIndex(index)}
              className={`
                group relative w-12 h-12 rounded-xl flex items-center justify-center
                transition-all duration-300 ease-out
                ${isActive 
                  ? "bg-cyan-500/15 text-cyan-400 glow-cyan" 
                  : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5"
                }
              `}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-cyan-400" />
              )}

              {/* Tooltip */}
              <div className="
                absolute left-full ml-3 px-3 py-1.5 rounded-lg
                bg-[var(--background-tertiary)] border border-white/10
                text-xs font-medium text-white whitespace-nowrap
                opacity-0 invisible group-hover:opacity-100 group-hover:visible
                transition-all duration-200 z-50
              ">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Help Button */}
      <button className="w-12 h-12 rounded-xl flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/5 transition-all duration-300">
        <HelpCircle className="w-5 h-5" />
      </button>
    </nav>
  );
}
