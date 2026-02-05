"use client";

import { ConversationGroup } from "@/types/career";
import { Briefcase, MessageSquarePlus, Settings, X } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: ConversationGroup[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
}

export default function MobileDrawer({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onOpenSettings,
}: MobileDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 left-0 z-50 w-[280px] bg-[var(--primary)] text-white lg:hidden animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[var(--accent)] flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-lg leading-tight">Career AI</h1>
              <p className="text-xs text-white/60">Your AI Assistant</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* New Conversation */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewConversation();
              onClose();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[var(--accent)] hover:bg-[var(--accent-light)] text-white font-medium rounded-lg transition-all"
          >
            <MessageSquarePlus className="w-5 h-5" />
            <span>New Conversation</span>
          </button>
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2 py-2">
          {conversations.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 py-2 text-xs font-medium text-white/50 uppercase tracking-wider">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => {
                      onSelectConversation(conv.id);
                      onClose();
                    }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all ${
                      conv.id === activeConversationId
                        ? "bg-white/15 text-white"
                        : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-white/50 truncate mt-0.5">{conv.lastMessage}</p>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Settings */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={() => {
              onOpenSettings();
              onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-all"
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">Settings</span>
          </button>
        </div>
      </div>
    </>
  );
}
