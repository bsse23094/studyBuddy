import { Injectable } from '@angular/core';

/**
 * SM-2 Spaced Repetition Algorithm Service
 * Based on SuperMemo SM-2 algorithm by Piotr Wozniak
 * https://www.supermemo.com/en/archives1990-2015/english/ol/sm2
 */

export interface SM2Input {
  ef: number; // Easiness Factor
  interval: number; // Days
  repetitions: number;
  quality: number; // 0-5
}

export interface SM2Output {
  ef: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SpacedRepetitionService {
  private readonly MIN_EF = 1.3;
  private readonly INITIAL_EF = 2.5;

  /**
   * Calculate next review parameters using SM-2 algorithm
   * @param input Current card state and review quality
   * @returns Updated card parameters
   */
  calculateNext(input: SM2Input): SM2Output {
    let { ef, interval, repetitions, quality } = input;

    // Update EF based on quality
    // Formula: EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
    ef = ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    // Ensure EF doesn't go below minimum
    if (ef < this.MIN_EF) {
      ef = this.MIN_EF;
    }

    // Update interval based on quality
    if (quality < 3) {
      // Reset if quality is poor
      repetitions = 0;
      interval = 1;
    } else {
      // Increase interval based on repetitions
      if (repetitions === 0) {
        interval = 1;
      } else if (repetitions === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * ef);
      }
      repetitions++;
    }

    // Calculate next review date
    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    return {
      ef,
      interval,
      repetitions,
      nextReview
    };
  }

  /**
   * Initialize a new flashcard with default SM-2 parameters
   */
  initializeCard() {
    return {
      ef: this.INITIAL_EF,
      interval: 0,
      repetitions: 0,
      nextReview: new Date() // Due immediately
    };
  }

  /**
   * Check if a card is due for review
   */
  isDue(nextReview: string | Date): boolean {
    const reviewDate = typeof nextReview === 'string' ? new Date(nextReview) : nextReview;
    return reviewDate <= new Date();
  }

  /**
   * Get difficulty classification based on card parameters
   */
  getDifficulty(repetitions: number, ef: number): 'new' | 'learning' | 'review' | 'mature' {
    if (repetitions === 0) return 'new';
    if (repetitions < 3) return 'learning';
    if (ef >= 2.5 && repetitions >= 5) return 'mature';
    return 'review';
  }

  /**
   * Calculate retention rate from review history
   */
  calculateRetention(totalReviews: number, correctReviews: number): number {
    if (totalReviews === 0) return 0;
    return correctReviews / totalReviews;
  }

  /**
   * Map user response to SM-2 quality (0-5)
   * 'again' = 0, 'hard' = 3, 'good' = 4, 'easy' = 5
   */
  mapResponseToQuality(response: 'again' | 'hard' | 'good' | 'easy'): number {
    const mapping = {
      'again': 0,
      'hard': 3,
      'good': 4,
      'easy': 5
    };
    return mapping[response];
  }

  /**
   * Get recommended daily review limit to avoid burnout
   */
  getRecommendedDailyLimit(): number {
    return 50; // Standard recommendation
  }

  /**
   * Sort cards by priority (overdue first, then by interval)
   */
  sortByPriority(cards: Array<{ nextReview: string; interval: number }>): typeof cards {
    const now = new Date().getTime();
    return cards.sort((a, b) => {
      const aTime = new Date(a.nextReview).getTime();
      const bTime = new Date(b.nextReview).getTime();
      
      const aOverdue = now - aTime;
      const bOverdue = now - bTime;
      
      // Sort overdue cards first
      if (aOverdue > 0 && bOverdue <= 0) return -1;
      if (bOverdue > 0 && aOverdue <= 0) return 1;
      
      // Both overdue: prioritize more overdue
      if (aOverdue > 0 && bOverdue > 0) {
        return bOverdue - aOverdue;
      }
      
      // Neither overdue: prioritize shorter intervals
      return a.interval - b.interval;
    });
  }
}
