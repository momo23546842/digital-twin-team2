"use client";

import { useState } from "react";
import { 
  Maximize2, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Move3D, 
  Play, 
  Pause,
  Box
} from "lucide-react";

export default function ModelViewport() {
  const [isPlaying, setIsPlaying] = useState(true);

  return (
    <div className="glass-card rounded-xl overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-cyan-500/10">
            <Box className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-zinc-100">3D Model Viewport</h2>
            <p className="text-xs text-zinc-500">Industrial Motor Assembly v2.4</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button 
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-zinc-200"
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-zinc-200">
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Viewport Content */}
      <div className="flex-1 relative grid-pattern">
        {/* 3D Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Animated wireframe cube placeholder */}
            <div 
              className={`w-48 h-48 border-2 border-cyan-500/30 rounded-lg transform rotate-12 ${
                isPlaying ? "animate-spin" : ""
              }`}
              style={{ 
                animationDuration: "20s",
                perspective: "1000px",
              }}
            >
              <div className="absolute inset-4 border border-cyan-500/20 rounded" />
              <div className="absolute inset-8 border border-cyan-500/10 rounded" />
              
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent rounded-lg" />
            </div>
            
            {/* Floating data points */}
            <div className="absolute -top-4 -right-4 px-2 py-1 glass rounded text-xs text-cyan-400">
              78.2 C
            </div>
            <div className="absolute -bottom-4 -left-4 px-2 py-1 glass rounded text-xs text-emerald-400">
              OK
            </div>
            <div className="absolute top-1/2 -right-8 px-2 py-1 glass rounded text-xs text-amber-400">
              1.2 mm/s
            </div>
          </div>
        </div>

        {/* Status overlay */}
        <div className="absolute bottom-4 left-4 flex items-center gap-4">
          <div className="glass rounded-lg px-3 py-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-glow" style={{ color: "#10b981" }} />
            <span className="text-xs text-zinc-400">Connected</span>
          </div>
          <div className="glass rounded-lg px-3 py-2 flex items-center gap-2">
            <span className="text-xs text-zinc-500">Last sync:</span>
            <span className="text-xs text-zinc-300">2 sec ago</span>
          </div>
        </div>

        {/* Coordinates */}
        <div className="absolute bottom-4 right-4 glass rounded-lg px-3 py-2">
          <span className="text-xs font-mono text-zinc-500">
            X: 0.00 Y: 0.00 Z: 0.00
          </span>
        </div>
      </div>

      {/* Controls Footer */}
      <div className="flex items-center justify-between p-3 border-t border-white/5 bg-black/20">
        <div className="flex items-center gap-1">
          <button className="p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-cyan-400">
            <ZoomIn className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-cyan-400">
            <ZoomOut className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-cyan-400">
            <Move3D className="w-4 h-4" />
          </button>
          <button className="p-2 rounded-lg hover:bg-white/5 transition-smooth text-zinc-400 hover:text-cyan-400">
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Zoom</span>
          <div className="w-24 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-cyan-500/50 rounded-full" />
          </div>
          <span className="text-xs text-zinc-400">100%</span>
        </div>
      </div>
    </div>
  );
}
