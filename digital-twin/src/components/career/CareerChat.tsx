"use client";

import { Message } from "@/types";
import { ConversationGroup, ConversationKPIs, LeadInfo, Resource } from "@/types/career";
import { useEffect, useState } from "react";
import ChatHeader from "./ChatHeader";
import ChatInputArea from "./ChatInputArea";
import ChatMessages from "./ChatMessages";
import MobileDrawer from "./MobileDrawer";
import RightPanel from "./RightPanel";
import Sidebar from "./Sidebar";
import VoiceOverlay from "./VoiceOverlay";

// Sample data for demonstration
const sampleConversations: ConversationGroup[] = [
  {
    label: "Today",
    conversations: [
      {
        id: "1",
        title: "Resume Review Session",
        lastMessage: "Your experience section looks strong...",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "2",
        title: "Interview Preparation",
        lastMessage: "For behavioral questions, use the STAR method...",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ],
  },
  {
    label: "Yesterday",
    conversations: [
      {
        id: "3",
        title: "Career Path Discussion",
        lastMessage: "Based on your skills, you might consider...",
        createdAt: new Date(Date.now() - 86400000),
        updatedAt: new Date(Date.now() - 86400000),
      },
    ],
  },
  {
    label: "Last Week",
    conversations: [
      {
        id: "4",
        title: "Salary Negotiation Tips",
        lastMessage: "Research market rates before...",
        createdAt: new Date(Date.now() - 7 * 86400000),
        updatedAt: new Date(Date.now() - 7 * 86400000),
      },
      {
        id: "5",
        title: "LinkedIn Profile Optimization",
        lastMessage: "Your headline should highlight...",
        createdAt: new Date(Date.now() - 7 * 86400000),
        updatedAt: new Date(Date.now() - 7 * 86400000),
      },
    ],
  },
];

const sampleLeads: LeadInfo[] = [
  {
    id: "lead-1",
    name: "Sarah Chen",
    email: "sarah.chen@techcorp.com",
    company: "TechCorp",
    position: "Hiring Manager",
    extractedAt: new Date(),
  },
];

const sampleResources: Resource[] = [
  {
    id: "res-1",
    title: "Interview Guide 2026",
    type: "document",
    description: "Comprehensive guide to modern interview techniques",
  },
  {
    id: "res-2",
    title: "Salary Benchmarks",
    type: "link",
    url: "https://example.com/salary",
    description: "Industry salary data and trends",
  },
];

export default function CareerChat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I'm your AI Career Assistant. I can help you with resume reviews, interview preparation, career advice, and job search strategies. How can I assist you today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string>("");
  const [activeConversationId, setActiveConversationId] = useState<string | null>("1");
  const [conversationTitle, setConversationTitle] = useState("Resume Review Session");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // KPIs state
  const [kpis, setKpis] = useState<ConversationKPIs>({
    messageCount: 1,
    userMessageCount: 0,
    assistantMessageCount: 1,
    timeSpentMinutes: 0,
    startedAt: new Date(),
  });

  useEffect(() => {
    setSessionId(`session-${Date.now()}`);
  }, []);

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // Update time spent
  useEffect(() => {
    const interval = setInterval(() => {
      setKpis((prev) => ({
        ...prev,
        timeSpentMinutes: Math.floor((Date.now() - prev.startedAt.getTime()) / 60000),
      }));
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setKpis((prev) => ({
      ...prev,
      messageCount: prev.messageCount + 1,
      userMessageCount: prev.userMessageCount + 1,
    }));
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": "user-123",
        },
        body: JSON.stringify({
          messages: [...messages, { role: "user", content }],
          sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`);
      }

      const data = await response.json();
      setMessages((prev) => [...prev, data.message]);
      setKpis((prev) => ({
        ...prev,
        messageCount: prev.messageCount + 1,
        assistantMessageCount: prev.assistantMessageCount + 1,
      }));
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "I apologize, but I encountered an error. Please try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I'm your AI Career Assistant. I can help you with resume reviews, interview preparation, career advice, and job search strategies. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
    setActiveConversationId(null);
    setConversationTitle("New Conversation");
    setKpis({
      messageCount: 1,
      userMessageCount: 0,
      assistantMessageCount: 1,
      timeSpentMinutes: 0,
      startedAt: new Date(),
    });
    setSessionId(`session-${Date.now()}`);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConversationId(id);
    const conversation = sampleConversations
      .flatMap((g) => g.conversations)
      .find((c) => c.id === id);
    if (conversation) {
      setConversationTitle(conversation.title);
    }
  };

  const handleExport = () => {
    const exportData = messages
      .map((m) => `${m.role === "user" ? "You" : "Career AI"}: ${m.content}`)
      .join("\n\n");
    const blob = new Blob([exportData], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversationTitle.replace(/\s+/g, "-")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: conversationTitle,
        text: "Check out my Career AI conversation!",
      });
    }
  };

  return (
    <div className="h-screen flex bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar
          conversations={sampleConversations}
          activeConversationId={activeConversationId}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onOpenSettings={() => {}}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        conversations={sampleConversations}
        activeConversationId={activeConversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onOpenSettings={() => {}}
      />

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <ChatHeader
          title={conversationTitle}
          isDarkMode={isDarkMode}
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
          onExport={handleExport}
          onShare={handleShare}
          onToggleMobileMenu={() => setIsMobileMenuOpen(true)}
        />
        <ChatMessages messages={messages} isLoading={isLoading} />
        <ChatInputArea
          onSubmit={handleSendMessage}
          isLoading={isLoading}
          onVoiceStart={() => setIsVoiceActive(true)}
          onVoiceEnd={() => setIsVoiceActive(false)}
        />
      </main>

      {/* Desktop Right Panel */}
      <div className="hidden xl:block">
        <RightPanel kpis={kpis} leads={sampleLeads} resources={sampleResources} />
      </div>

      {/* Voice Overlay */}
      <VoiceOverlay
        isActive={isVoiceActive}
        onClose={() => setIsVoiceActive(false)}
      />
    </div>
  );
}
