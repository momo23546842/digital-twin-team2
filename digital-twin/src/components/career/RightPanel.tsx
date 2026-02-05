"use client";

import { ConversationKPIs, LeadInfo, Resource } from "@/types/career";
import { BarChart3, Clock, FileText, Link2, MessageCircle, User, Video } from "lucide-react";

interface RightPanelProps {
  kpis: ConversationKPIs | null;
  leads: LeadInfo[];
  resources: Resource[];
}

export default function RightPanel({ kpis, leads, resources }: RightPanelProps) {
  return (
    <aside className="w-[300px] h-full flex flex-col bg-[var(--surface)] border-l border-[var(--border)]">
      {/* KPIs Section */}
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-[var(--accent)]" />
          Conversation Stats
        </h3>
        {kpis ? (
          <div className="grid grid-cols-2 gap-3">
            <KPICard
              icon={<MessageCircle className="w-4 h-4" />}
              label="Messages"
              value={kpis.messageCount.toString()}
            />
            <KPICard
              icon={<Clock className="w-4 h-4" />}
              label="Time Spent"
              value={`${kpis.timeSpentMinutes}m`}
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">Start a conversation to see stats</p>
        )}
      </div>

      {/* Lead Information */}
      <div className="p-4 border-b border-[var(--border)]">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <User className="w-4 h-4 text-[var(--accent)]" />
          Extracted Leads
        </h3>
        {leads.length > 0 ? (
          <div className="space-y-2">
            {leads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No leads extracted yet</p>
        )}
      </div>

      {/* Related Resources */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-[var(--foreground)] mb-3 flex items-center gap-2">
          <FileText className="w-4 h-4 text-[var(--accent)]" />
          Related Resources
        </h3>
        {resources.length > 0 ? (
          <div className="space-y-2">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-[var(--muted)]">No resources available</p>
        )}
      </div>
    </aside>
  );
}

function KPICard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white dark:bg-[var(--primary-light)] p-3 rounded-lg shadow-sm">
      <div className="flex items-center gap-2 text-[var(--muted)] mb-1">
        {icon}
        <span className="text-xs">{label}</span>
      </div>
      <p className="text-xl font-bold text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function LeadCard({ lead }: { lead: LeadInfo }) {
  return (
    <div className="bg-white dark:bg-[var(--primary-light)] p-3 rounded-lg shadow-sm">
      <p className="font-medium text-sm text-[var(--foreground)]">{lead.name}</p>
      {lead.position && lead.company && (
        <p className="text-xs text-[var(--muted)] mt-0.5">
          {lead.position} at {lead.company}
        </p>
      )}
      {lead.email && (
        <p className="text-xs text-[var(--accent)] mt-1">{lead.email}</p>
      )}
    </div>
  );
}

function ResourceCard({ resource }: { resource: Resource }) {
  const Icon = resource.type === 'document' ? FileText : resource.type === 'video' ? Video : Link2;
  
  return (
    <div className="bg-white dark:bg-[var(--primary-light)] p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded bg-[var(--accent)]/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-4 h-4 text-[var(--accent)]" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm text-[var(--foreground)] truncate">{resource.title}</p>
          {resource.description && (
            <p className="text-xs text-[var(--muted)] mt-0.5 line-clamp-2">{resource.description}</p>
          )}
        </div>
      </div>
    </div>
  );
}
