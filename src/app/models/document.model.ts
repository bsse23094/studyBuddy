export interface Document {
  id: string;
  title: string;
  filename: string;
  fileType: 'pdf' | 'txt' | 'md' | 'url';
  size?: number;
  uploadedAt: string;
  processedAt?: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  topics?: string[];
  chunkCount?: number;
  error?: string;
  metadata?: {
    author?: string;
    pageCount?: number;
    course?: string;
    tags?: string[];
  };
}

export interface DocChunk {
  id: string;
  docId: string;
  text: string;
  embedding?: number[];
  source: string;
  page?: number;
  chunkIndex: number;
  metadata?: {
    title?: string;
    section?: string;
  };
}

export interface IngestionRequest {
  file: File;
  metadata?: {
    topics?: string[];
    course?: string;
    tags?: string[];
  };
}

export interface IngestionResponse {
  documentId: string;
  status: 'pending' | 'processing';
  estimatedTime?: number;
}

export interface VectorSearchRequest {
  query: string;
  topK?: number;
  filters?: {
    docIds?: string[];
    topics?: string[];
  };
}

export interface VectorSearchResult {
  chunks: DocChunk[];
  query: string;
  executionTime: number;
}
