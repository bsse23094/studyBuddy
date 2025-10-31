export interface Quiz {
  id: string;
  title: string;
  description?: string;
  questions: QuizQuestion[];
  createdAt: string;
  topics?: string[];
  sourceDocIds?: string[];
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface QuizQuestion {
  id: string;
  prompt: string;
  type: 'multiple-choice' | 'short-answer' | 'true-false';
  options?: string[]; // For multiple choice
  correctIndex?: number; // For multiple choice
  correctAnswer?: string; // For short answer
  explanation?: string;
  sourceRefs?: string[];
  points?: number;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  userId: string;
  answers: QuizAnswer[];
  score: number;
  maxScore: number;
  startedAt: string;
  completedAt?: string;
  timeSpent?: number; // seconds
}

export interface QuizAnswer {
  questionId: string;
  userAnswer: string | number; // Index for MC, text for short answer
  isCorrect: boolean;
  feedback?: string;
  pointsEarned: number;
}

export interface QuizGenerationRequest {
  sourceDocIds?: string[];
  topics?: string[];
  questionCount: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  questionTypes?: ('multiple-choice' | 'short-answer' | 'true-false')[];
}

export interface QuizGenerationResponse {
  quiz: Quiz;
  tokensUsed: number;
}

export interface GradingResult {
  questionId: string;
  isCorrect: boolean;
  confidence?: number; // For short-answer grading
  feedback: string;
  pointsEarned: number;
  correctAnswer?: string;
}
