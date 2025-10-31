export type ComprehensionLevel = 'child' | 'highschool' | 'college' | 'expert';

export interface UserProfile {
  id: string;
  name?: string;
  levelPreference?: ComprehensionLevel;
  topics?: string[];
  createdAt: string;
  preferences?: {
    defaultMode?: TutorMode;
    defaultTopK?: number;
    enableStreaming?: boolean;
    enableOfflineMode?: boolean;
  };
}

export type TutorMode = 'explain' | 'solve' | 'quiz' | 'hint' | 'flashcards';

export interface UserProgress {
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  activeMinutes: number;
  topicMastery: { [topic: string]: TopicMastery };
  lastActive: string;
}

export interface TopicMastery {
  topic: string;
  questionsAnswered: number;
  accuracy: number;
  daysStudied: number;
  lastStudied: string;
  masteryLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}
