"use client";

import { useState } from "react";
import { Layers, Zap, Flame, Box } from "lucide-react";

interface Layer {
  id: string;
  name: string;
  icon: React.ElementType;
  color: string;
  description: string;
}

const layers: Layer[] = [
  {
    id: "structural",
    name: "Structural",
    icon: Box,
    color: "#22d3ee",
    description: "Physical components and assembly",
  },
  {
    id: "electrical",
    name: "Electrical",
    icon: Zap,
    color: "#f59e0b",
    description: "Wiring and power distribution",
  },
  {
    id: "thermal",
    name: "Thermal",
    icon: Flame,
    color: "#ef4444",
    description: "Heat zones and cooling paths",
  },
];

export default function LayerControls() {
  const [activeLayers, setActiveLayers] = useState<string[]>(["structural"]);

  const toggleLayer = (layerId: string) => {
    setActiveLayers((prev) =>
      prev.includes(layerId)
        ? prev.filter((id) => id !== layerId)
        : [...prev, layerId]
    );
  };

  return (
    <div className="glass-card rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-4 h-4 text-cyan-400" />
        <h3 className="text-sm font-semibold text-zinc-200">Digital Layers</h3>
      </div>

      <div className="space-y-2">
        {layers.map((layer) => {
          const isActive = activeLayers.includes(layer.id);
          const Icon = layer.icon;

          return (
            <button
              key={layer.id}
              onClick={() => toggleLayer(layer.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-smooth ${
                isActive
                  ? "bg-white/5 border border-cyan-500/30"
                  : "bg-transparent border border-transparent hover:bg-white/5 hover:border-white/10"
              }`}
            >
              <div
                className={`p-2 rounded-lg transition-smooth ${
                  isActive ? "opacity-100" : "opacity-50"
                }`}
                style={{ backgroundColor: `${layer.color}20` }}
              >
                <Icon
                  className="w-4 h-4"
                  style={{ color: isActive ? layer.color : "#71717a" }}
                />
              </div>
              <div className="flex-1 text-left">
                <p
                  className={`text-sm font-medium transition-smooth ${
                    isActive ? "text-zinc-100" : "text-zinc-500"
                  }`}
                >
                  {layer.name}
                </p>
                <p className="text-xs text-zinc-600">{layer.description}</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full p-0.5 transition-smooth ${
                  isActive ? "bg-cyan-500/30" : "bg-zinc-700/50"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-smooth ${
                    isActive
                      ? "bg-cyan-400 translate-x-5"
                      : "bg-zinc-500 translate-x-0"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
