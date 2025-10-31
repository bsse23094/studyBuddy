export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  meta?: MessageMeta;
}

export interface MessageMeta {
  mode?: string;
  level?: string;
  sourceRefs?: SourceReference[];
  stepIndex?: number;
  isStreaming?: boolean;
  tokens?: number;
  modelUsed?: string;
  confidence?: number;
  error?: boolean | string;
}

export interface SourceReference {
  id: string;
  docId: string;
  snippet: string;
  page?: number;
  score?: number;
  title?: string;
}

export interface Conversation {
  id: string;
  title?: string;
  messages: Message[];
  topics?: string[];
  createdAt: string;
  updatedAt?: string;
  userId?: string;
}

export interface ChatRequest {
  conversationId?: string | null;
  messages: Message[];
  options: ChatOptions;
}

export interface ChatOptions {
  mode: 'explain' | 'solve' | 'quiz' | 'hint';
  level: 'child' | 'highschool' | 'college' | 'expert';
  topK?: number;
  stream?: boolean;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  conversationId: string;
  message: Message;
  sources?: SourceReference[];
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface StreamChunk {
  chunk: string;
  sourceIds?: string[];
  mode?: string;
  stepIndex?: number;
  done?: boolean;
}
