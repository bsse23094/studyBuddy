/**
 * Flashcard model with SM-2 spaced repetition algorithm support
 * SM-2 algorithm by Piotr Wozniak: https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  
  // SM-2 algorithm fields
  ef: number; // Easiness Factor (starts at 2.5)
  interval: number; // Days until next review
  repetitions: number; // Number of consecutive correct reviews
  nextReview: string; // ISO date string
  
  // Metadata
  deckId?: string;
  topics?: string[];
  sourceRefs?: string[];
  createdAt: string;
  lastReviewed?: string;
  
  // Statistics
  totalReviews: number;
  correctReviews: number;
  difficulty?: 'new' | 'learning' | 'review' | 'mature';
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description?: string;
  cards: Flashcard[];
  topics?: string[];
  createdAt: string;
  updatedAt?: string;
}

export type ReviewQuality = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Complete blackout
// 1: Incorrect, but recognized
// 2: Incorrect, but easy to recall
// 3: Correct, but difficult
// 4: Correct, with hesitation
// 5: Perfect response

export interface ReviewResult {
  cardId: string;
  quality: ReviewQuality;
  timestamp: string;
}

export interface SM2Result {
  ef: number;
  interval: number;
  repetitions: number;
  nextReview: string;
}

export interface FlashcardGenerationRequest {
  sourceDocIds?: string[];
  topics?: string[];
  count: number;
  difficulty?: 'basic' | 'detailed' | 'advanced';
}

export interface FlashcardGenerationResponse {
  cards: Omit<Flashcard, 'id' | 'ef' | 'interval' | 'repetitions' | 'nextReview' | 'createdAt' | 'totalReviews' | 'correctReviews'>[];
  tokensUsed: number;
}

export interface ReviewSession {
  id: string;
  deckId: string;
  userId: string;
  cardsReviewed: number;
  startedAt: string;
  completedAt?: string;
  results: ReviewResult[];
}

export interface ReviewQueue {
  due: Flashcard[];
  upcoming: Flashcard[];
  totalDue: number;
  totalUpcoming: number;
}
