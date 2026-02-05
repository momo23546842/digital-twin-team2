"use client";

import { Conversation, ConversationGroup } from "@/types/career";
import { Briefcase, MessageSquarePlus, Settings, ChevronRight } from "lucide-react";

interface SidebarProps {
  conversations: ConversationGroup[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onOpenSettings,
}: SidebarProps) {
  return (
    <aside className="w-[250px] h-full flex flex-col bg-[var(--primary)] text-white">
      {/* Logo + App Name */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-lg leading-tight">Career AI</h1>
            <p className="text-xs text-white/60">Your AI Assistant</p>
          </div>
        </div>
      </div>

      {/* New Conversation Button */}
      <div className="p-3">
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-medium rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <MessageSquarePlus className="w-5 h-5" />
          <span>New Conversation</span>
        </button>
      </div>

      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.map((group) => (
          <div key={group.label} className="mb-4">
            <p className="px-3 py-2 text-xs font-medium text-white/50 uppercase tracking-wider">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.conversations.map((conv) => (
                <ConversationItem
                  key={conv.id}
                  conversation={conv}
                  isActive={conv.id === activeConversationId}
                  onClick={() => onSelectConversation(conv.id)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Settings */}
      <div className="p-3 border-t border-white/10">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </aside>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left px-3 py-2.5 rounded-lg transition-all duration-200 group
        ${isActive 
          ? "bg-white/15 text-white" 
          : "text-white/70 hover:bg-white/10 hover:text-white"
        }
      `}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium truncate flex-1">{conversation.title}</p>
        <ChevronRight className={`w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'opacity-100' : ''}`} />
      </div>
      <p className="text-xs text-white/50 truncate mt-0.5">{conversation.lastMessage}</p>
    </button>
  );
}
