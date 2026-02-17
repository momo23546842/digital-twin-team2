/**
 * Upstash Vector Record Schema
 * Based on design.md Section 2
 * Generated with AI assistance for type safety
 */

export type SourceCategory = 
  | 'resume' 
  | 'portfolio' 
  | 'blog' 
  | 'interview' 
  | 'note' 
  | 'social';

export type UpstashVectorRecord = {
  id: string;
  vector?: number[];
  text_chunk: string;
  metadata: {
    doc_id: string;
    source_category: SourceCategory;
    title?: string;
    date?: string;
    url?: string;
    chunk_index?: number;
    chunk_total?: number;
    language?: string;
    role_tags?: string[];
    confidence?: number;
    private?: boolean;
  };
};
