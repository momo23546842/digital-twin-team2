"use client";

import { Download, Share2, Moon, Sun, Menu } from "lucide-react";

interface ChatHeaderProps {
  title: string;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExport: () => void;
  onShare: () => void;
  onToggleMobileMenu: () => void;
}

export default function ChatHeader({
  title,
  isDarkMode,
  onToggleDarkMode,
  onExport,
  onShare,
  onToggleMobileMenu,
}: ChatHeaderProps) {
  return (
    <header className="h-14 flex items-center justify-between px-4 bg-white dark:bg-[var(--primary)] border-b border-[var(--border)] shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileMenu}
          className="lg:hidden p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] rounded-lg transition-all"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="font-semibold text-[var(--foreground)] truncate max-w-[200px] sm:max-w-[300px]">
          {title}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Dark mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] dark:hover:bg-[var(--primary-light)] rounded-lg transition-all"
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>

        {/* Export button */}
        <button
          onClick={onExport}
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] dark:hover:bg-[var(--primary-light)] rounded-lg transition-all"
          aria-label="Export conversation"
        >
          <Download className="w-5 h-5" />
        </button>

        {/* Share button */}
        <button
          onClick={onShare}
          className="p-2 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface)] dark:hover:bg-[var(--primary-light)] rounded-lg transition-all"
          aria-label="Share conversation"
        >
          <Share2 className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
