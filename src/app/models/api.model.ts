/**
 * API contract models for serverless worker communication
 */

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    timestamp: string;
    requestId?: string;
    provider?: string;
    tokensUsed?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  retryable?: boolean;
}

export interface ProviderConfig {
  name: string;
  enabled: boolean;
  priority: number; // Lower = higher priority for fallback
  models: {
    chat: string;
    embedding: string;
  };
  limits?: {
    maxTokens?: number;
    rateLimit?: number;
  };
}

export interface WorkerHealth {
  status: 'healthy' | 'degraded' | 'down';
  providers: {
    name: string;
    status: 'available' | 'unavailable';
    latency?: number;
  }[];
  vectorDb: {
    status: 'available' | 'unavailable';
    documentCount?: number;
    chunkCount?: number;
  };
  timestamp: string;
}

// Environment configuration
export interface AppConfig {
  apiBaseUrl: string;
  enableOfflineMode: boolean;
  enableAnalytics: boolean;
  cacheStrategy: 'aggressive' | 'normal' | 'minimal';
  debugMode: boolean;
  features: {
    [featureName: string]: boolean;
  };
}
