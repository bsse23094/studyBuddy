import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { 
  Flashcard, 
  FlashcardDeck, 
  ReviewResult, 
  ReviewQueue, 
  ReviewQuality 
} from '../models';
import { StorageService } from './storage.service';
import { SpacedRepetitionService } from './spaced-repetition.service';
import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class FlashcardService {
  private currentDeckSubject = new BehaviorSubject<FlashcardDeck | null>(null);
  public currentDeck$ = this.currentDeckSubject.asObservable();

  private reviewQueueSubject = new BehaviorSubject<ReviewQueue>({
    due: [],
    upcoming: [],
    totalDue: 0,
    totalUpcoming: 0
  });
  public reviewQueue$ = this.reviewQueueSubject.asObservable();

  private decksSubject = new BehaviorSubject<FlashcardDeck[]>([]);
  public decks$ = this.decksSubject.asObservable();

  constructor(
    private storage: StorageService,
    private sm2: SpacedRepetitionService,
    private api: ApiService,
    private userService: UserService
  ) {
    this.loadDecks();
    this.updateReviewQueue();
  }

  private async loadDecks(): Promise<void> {
    await this.storage.init();
    const decks = await this.storage.getAllDecks();
    this.decksSubject.next(decks);
  }

  private async updateReviewQueue(): Promise<void> {
    const dueCards = await this.storage.getDueFlashcards();
    const allCards = await this.getAllCards();
    
    const now = new Date();
    const upcomingCards = allCards.filter(card => {
      const reviewDate = new Date(card.nextReview);
      return reviewDate > now && reviewDate <= new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    });

    // Sort due cards by priority
    const sortedDue = dueCards.sort((a, b) => {
      const now = new Date().getTime();
      const aTime = new Date(a.nextReview).getTime();
      const bTime = new Date(b.nextReview).getTime();
      
      const aOverdue = now - aTime;
      const bOverdue = now - bTime;
      
      if (aOverdue > 0 && bOverdue <= 0) return -1;
      if (bOverdue > 0 && aOverdue <= 0) return 1;
      if (aOverdue > 0 && bOverdue > 0) return bOverdue - aOverdue;
      return a.interval - b.interval;
    });

    const queue: ReviewQueue = {
      due: sortedDue,
      upcoming: upcomingCards,
      totalDue: dueCards.length,
      totalUpcoming: upcomingCards.length
    };

    this.reviewQueueSubject.next(queue);
  }

  private async getAllCards(): Promise<Flashcard[]> {
    const decks = await this.storage.getAllDecks();
    const allCards: Flashcard[] = [];
    
    for (const deck of decks) {
      const cards = await this.storage.getFlashcardsByDeck(deck.id);
      allCards.push(...cards);
    }
    
    return allCards;
  }

  async createDeck(name: string, description?: string): Promise<FlashcardDeck> {
    const deck: FlashcardDeck = {
      id: this.generateId(),
      name,
      description,
      cards: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await this.storage.saveDeck(deck);
    await this.loadDecks();
    return deck;
  }

  async loadDeck(id: string): Promise<void> {
    const deck = await this.storage.getDeck(id);
    if (deck) {
      // Load cards for this deck
      const cards = await this.storage.getFlashcardsByDeck(id);
      deck.cards = cards;
      this.currentDeckSubject.next(deck);
    }
  }

  async generateFlashcards(request: {
    sourceDocIds?: string[];
    topics?: string[];
    count: number;
    difficulty?: string;
  }, deckId: string): Promise<Flashcard[]> {
    try {
      const response = await this.api.generateFlashcards(request).toPromise();
      
      if (response && response.success && response.data) {
        const generatedCards = response.data.cards;
        const flashcards: Flashcard[] = [];

        for (const cardData of generatedCards) {
          const sm2Params = this.sm2.initializeCard();
          const flashcard: Flashcard = {
            id: this.generateId(),
            question: cardData.question,
            answer: cardData.answer,
            ef: sm2Params.ef,
            interval: sm2Params.interval,
            repetitions: sm2Params.repetitions,
            nextReview: sm2Params.nextReview.toISOString(),
            deckId,
            topics: cardData.topics,
            sourceRefs: cardData.sourceRefs,
            createdAt: new Date().toISOString(),
            totalReviews: 0,
            correctReviews: 0,
            difficulty: 'new'
          };

          await this.storage.saveFlashcard(flashcard);
          flashcards.push(flashcard);
        }

        await this.updateReviewQueue();
        return flashcards;
      }
    } catch (error) {
      console.error('Flashcard generation error:', error);
    }

    // Fallback: create sample cards
    return this.createSampleFlashcards(request.count, deckId, request.topics);
  }

  private async createSampleFlashcards(count: number, deckId: string, topics?: string[]): Promise<Flashcard[]> {
    const flashcards: Flashcard[] = [];
    
    for (let i = 0; i < count; i++) {
      const sm2Params = this.sm2.initializeCard();
      const flashcard: Flashcard = {
        id: this.generateId(),
        question: `Sample question ${i + 1}?`,
        answer: `Sample answer ${i + 1}`,
        ef: sm2Params.ef,
        interval: sm2Params.interval,
        repetitions: sm2Params.repetitions,
        nextReview: sm2Params.nextReview.toISOString(),
        deckId,
        topics,
        createdAt: new Date().toISOString(),
        totalReviews: 0,
        correctReviews: 0,
        difficulty: 'new'
      };

      await this.storage.saveFlashcard(flashcard);
      flashcards.push(flashcard);
    }

    await this.updateReviewQueue();
    return flashcards;
  }

  async reviewCard(cardId: string, quality: ReviewQuality): Promise<Flashcard> {
    const card = await this.storage.getFlashcard(cardId);
    if (!card) {
      throw new Error('Card not found');
    }

    // Update review statistics
    card.totalReviews++;
    if (quality >= 3) {
      card.correctReviews++;
    }
    card.lastReviewed = new Date().toISOString();

    // Calculate next review using SM-2
    const sm2Result = this.sm2.calculateNext({
      ef: card.ef,
      interval: card.interval,
      repetitions: card.repetitions,
      quality
    });

    card.ef = sm2Result.ef;
    card.interval = sm2Result.interval;
    card.repetitions = sm2Result.repetitions;
    card.nextReview = sm2Result.nextReview.toISOString();
    card.difficulty = this.sm2.getDifficulty(card.repetitions, card.ef);

    await this.storage.saveFlashcard(card);
    await this.updateReviewQueue();

    // Record progress
    if (card.topics && card.topics.length > 0) {
      this.userService.recordQuizResult(card.topics[0], quality >= 3);
    }

    return card;
  }

  async addCard(deckId: string, question: string, answer: string, metadata?: {
    topics?: string[];
    sourceRefs?: string[];
  }): Promise<Flashcard> {
    const sm2Params = this.sm2.initializeCard();
    const flashcard: Flashcard = {
      id: this.generateId(),
      question,
      answer,
      ef: sm2Params.ef,
      interval: sm2Params.interval,
      repetitions: sm2Params.repetitions,
      nextReview: sm2Params.nextReview.toISOString(),
      deckId,
      topics: metadata?.topics,
      sourceRefs: metadata?.sourceRefs,
      createdAt: new Date().toISOString(),
      totalReviews: 0,
      correctReviews: 0,
      difficulty: 'new'
    };

    await this.storage.saveFlashcard(flashcard);
    await this.updateReviewQueue();
    return flashcard;
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.storage.deleteFlashcard(cardId);
    await this.updateReviewQueue();
  }

  async deleteDeck(deckId: string): Promise<void> {
    await this.storage.deleteDeck(deckId);
    
    if (this.currentDeckSubject.value?.id === deckId) {
      this.currentDeckSubject.next(null);
    }
    
    await this.loadDecks();
    await this.updateReviewQueue();
  }

  async getDeckStatistics(deckId: string): Promise<{
    totalCards: number;
    newCards: number;
    learningCards: number;
    reviewCards: number;
    matureCards: number;
    averageEF: number;
    retentionRate: number;
  }> {
    const cards = await this.storage.getFlashcardsByDeck(deckId);
    
    const stats = {
      totalCards: cards.length,
      newCards: 0,
      learningCards: 0,
      reviewCards: 0,
      matureCards: 0,
      averageEF: 0,
      retentionRate: 0
    };

    if (cards.length === 0) return stats;

    let totalEF = 0;
    let totalReviews = 0;
    let totalCorrect = 0;

    for (const card of cards) {
      const difficulty = this.sm2.getDifficulty(card.repetitions, card.ef);
      
      switch (difficulty) {
        case 'new': stats.newCards++; break;
        case 'learning': stats.learningCards++; break;
        case 'review': stats.reviewCards++; break;
        case 'mature': stats.matureCards++; break;
      }

      totalEF += card.ef;
      totalReviews += card.totalReviews;
      totalCorrect += card.correctReviews;
    }

    stats.averageEF = totalEF / cards.length;
    stats.retentionRate = totalReviews > 0 ? totalCorrect / totalReviews : 0;

    return stats;
  }

  private generateId(): string {
    return `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getReviewQueue(): ReviewQueue {
    return this.reviewQueueSubject.value;
  }
}
