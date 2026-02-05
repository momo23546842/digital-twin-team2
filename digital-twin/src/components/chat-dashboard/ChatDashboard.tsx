"use client";

import NavigationRail from "./NavigationRail";
import ChatPanel from "./ChatPanel";
import StatusPanel from "./StatusPanel";

export default function ChatDashboard() {
  return (
    <div className="min-h-screen h-screen flex bg-[var(--background)] grid-pattern overflow-hidden">
      {/* Left Navigation Rail */}
      <NavigationRail />

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 p-4 overflow-hidden">
        {/* Center Chat Panel */}
        <ChatPanel />

        {/* Right Status Panel */}
        <StatusPanel />
      </div>
    </div>
  );
}
