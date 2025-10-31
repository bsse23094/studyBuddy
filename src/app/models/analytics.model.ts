export interface StudySession {
  id: string;
  userId: string;
  startTime: string;
  endTime?: string;
  duration: number; // minutes
  activity: 'chat' | 'quiz' | 'flashcards' | 'reading';
  topics?: string[];
  metrics?: {
    questionsAsked?: number;
    hintsUsed?: number;
    sourcesViewed?: number;
    [key: string]: any;
  };
}

export interface ProgressReport {
  userId: string;
  reportDate: string;
  period: 'week' | 'month' | 'all-time';
  
  overview: {
    totalMinutes: number;
    totalSessions: number;
    questionsAnswered: number;
    accuracy: number;
    streakDays: number;
  };
  
  topicBreakdown: {
    topic: string;
    accuracy: number;
    questionsAnswered: number;
    minutesSpent: number;
    masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  }[];
  
  quizStats: {
    quizzesTaken: number;
    averageScore: number;
    topPerformingTopics: string[];
    needsImprovement: string[];
  };
  
  flashcardStats: {
    cardsReviewed: number;
    retentionRate: number;
    matureCards: number;
    averageEF: number;
  };
  
  recommendations: string[];
}

export interface LearningMetrics {
  timestamp: string;
  metric: string;
  value: number;
  context?: any;
}

export interface HallucinationEvent {
  id: string;
  timestamp: string;
  conversationId: string;
  messageId: string;
  provider: string;
  model: string;
  unsourcedClaim: string;
  context: string;
  reported: boolean;
}

export interface UsageStats {
  userId: string;
  period: string;
  tokensUsed: number;
  tokensLimit: number;
  apiCalls: number;
  costEstimate: number;
  providerBreakdown: {
    provider: string;
    tokens: number;
    calls: number;
    cost: number;
  }[];
}
