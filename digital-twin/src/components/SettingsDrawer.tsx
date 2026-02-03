"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export interface PersonaSettings {
  name: string;
  warmth: number; // 1-5 scale
  formality: number; // 1-5 scale
  humor: boolean;
}

export const DEFAULT_SETTINGS: PersonaSettings = {
  name: "Alex",
  warmth: 3,
  formality: 3,
  humor: true,
};

const STORAGE_KEY = "persona-settings";

export function loadPersonaSettings(): PersonaSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error("Failed to load persona settings:", e);
  }
  return DEFAULT_SETTINGS;
}

export function savePersonaSettings(settings: PersonaSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("Failed to save persona settings:", e);
  }
}

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsChange: (settings: PersonaSettings) => void;
  initialSettings?: PersonaSettings;
}

export default function SettingsDrawer({
  isOpen,
  onClose,
  onSettingsChange,
  initialSettings = DEFAULT_SETTINGS,
}: SettingsDrawerProps) {
  const [settings, setSettings] = useState<PersonaSettings>(initialSettings);

  useEffect(() => {
    setSettings(initialSettings);
  }, [initialSettings]);

  const handleChange = (key: keyof PersonaSettings, value: string | number | boolean) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
  };

  const handleSave = () => {
    savePersonaSettings(settings);
    onSettingsChange(settings);
    onClose();
  };

  const handleReset = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Persona Settings</h2>
                <p className="text-sm text-gray-500 mt-0.5">Customize your digital twin</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8">
              {/* Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Twin Name
                </label>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="Enter name..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-800 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all"
                />
                <p className="text-xs text-gray-400 mt-2">This name will be used in responses</p>
              </div>

              {/* Warmth Slider */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Warmth
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-16">Cold</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={settings.warmth}
                    onChange={(e) => handleChange("warmth", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <span className="text-sm text-gray-500 w-16 text-right">Warm</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {settings.warmth <= 2 && "Direct and matter-of-fact responses"}
                  {settings.warmth === 3 && "Balanced tone"}
                  {settings.warmth >= 4 && "Friendly and encouraging responses"}
                </p>
              </div>

              {/* Formality Slider */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Formality
                </label>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-16">Casual</span>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={settings.formality}
                    onChange={(e) => handleChange("formality", parseInt(e.target.value))}
                    className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-violet-500"
                  />
                  <span className="text-sm text-gray-500 w-16 text-right">Formal</span>
                </div>
                <p className="text-xs text-gray-400 mt-2">
                  {settings.formality <= 2 && "Uses contractions and casual language"}
                  {settings.formality === 3 && "Balanced formality"}
                  {settings.formality >= 4 && "Professional and polished tone"}
                </p>
              </div>

              {/* Humor Toggle */}
              <div>
                <label className="flex items-center justify-between cursor-pointer">
                  <div>
                    <span className="block text-sm font-semibold text-gray-700">Humor</span>
                    <span className="text-xs text-gray-400">Include light humor and witty remarks</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={settings.humor}
                      onChange={(e) => handleChange("humor", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-12 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-violet-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-violet-500" />
                  </div>
                </label>
              </div>

              {/* Preview */}
              <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Preview</h3>
                <p className="text-sm text-gray-600 italic">
                  &quot;{settings.warmth >= 4 ? "Hey there! 😊 " : ""}
                  {settings.formality <= 2 ? "I'm" : "I am"} {settings.name}, your digital twin.
                  {settings.humor ? " Let's have some fun! 🎉" : ""}
                  {settings.warmth >= 4 ? " Looking forward to chatting with you!" : ""}&quot;
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-gray-100 flex gap-3">
              <button
                onClick={handleReset}
                className="px-5 py-3 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors font-medium"
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-semibold hover:shadow-lg hover:shadow-violet-200 transition-all"
              >
                Save Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
