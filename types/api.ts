/**
 * API Request/Response Types
 * Based on design.md Section 5
 */

import { SourceCategory } from './vector';

export type ChatRequest = {
  sessionId?: string;
  message: string;
  systemAction?: 'show_resume' | 'list_projects' | null;
  topK?: number;
};

export type Citation = {
  id: string;
  title?: string;
  url?: string;
  source_category?: SourceCategory;
  score?: number;
};

export type ChatResponse = {
  assistant_text: string;
  citations: Citation[];
  status: 'ok' | 'error';
};
