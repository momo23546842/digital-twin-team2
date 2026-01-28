/**
 * Model Context Protocol (MCP) Tool Types
 * Based on design.md Section 3
 * AI-assisted type generation for MCP tools
 */

import { UpstashVectorRecord, SourceCategory } from './vector';

export type QueryPersonalHistoryArgs = {
  query: string;
  topK?: number;
  source_categories?: SourceCategory[];
  role_tags?: string[];
  date_from?: string;
  date_to?: string;
  exclude_private?: boolean;
};

export type QueryPersonalHistoryResult = {
  hits: Array<{
    id: string;
    score: number;
    text_chunk: string;
    metadata: UpstashVectorRecord['metadata'];
  }>;
};

export type GetDocumentByIdArgs = {
  doc_id: string;
};

export type GetDocumentByIdResult = {
  doc_id: string;
  title?: string;
  chunks: Array<{
    id: string;
    text_chunk: string;
    chunk_index?: number;
  }>;
};

export type MCPExecuteRequest = {
  tool: 'query_personal_history' | 'get_document_by_id';
  args: any;
};
