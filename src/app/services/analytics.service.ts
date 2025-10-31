import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StudySession, ProgressReport, UserProgress } from '../models';
import { StorageService } from './storage.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private currentSessionSubject = new BehaviorSubject<StudySession | null>(null);
  public currentSession$ = this.currentSessionSubject.asObservable();

  private sessionStartTime: Date | null = null;

  constructor(
    private storage: StorageService,
    private userService: UserService
  ) {}

  async startSession(activity: 'chat' | 'quiz' | 'flashcards' | 'reading', topics?: string[]): Promise<StudySession> {
    // End previous session if exists
    if (this.currentSessionSubject.value) {
      await this.endSession();
    }

    const user = this.userService.getCurrentUser();
    const session: StudySession = {
      id: this.generateId(),
      userId: user?.id || 'anonymous',
      startTime: new Date().toISOString(),
      duration: 0,
      activity,
      topics,
      metrics: {
        questionsAsked: 0,
        hintsUsed: 0,
        sourcesViewed: 0
      }
    };

    this.sessionStartTime = new Date();
    this.currentSessionSubject.next(session);
    
    return session;
  }

  async endSession(): Promise<StudySession | null> {
    const session = this.currentSessionSubject.value;
    if (!session || !this.sessionStartTime) {
      return null;
    }

    const endTime = new Date();
    session.endTime = endTime.toISOString();
    session.duration = Math.round((endTime.getTime() - this.sessionStartTime.getTime()) / 60000); // minutes

    await this.storage.saveSession(session);
    this.userService.recordStudyTime(session.duration);

    this.currentSessionSubject.next(null);
    this.sessionStartTime = null;

    return session;
  }

  updateSessionMetric(key: string, value: any): void {
    const session = this.currentSessionSubject.value;
    if (session && session.metrics) {
      session.metrics[key] = value;
      this.currentSessionSubject.next({ ...session });
    }
  }

  incrementMetric(key: string): void {
    const session = this.currentSessionSubject.value;
    if (session && session.metrics) {
      const current = session.metrics[key] || 0;
      session.metrics[key] = current + 1;
      this.currentSessionSubject.next({ ...session });
    }
  }

  async generateProgressReport(period: 'week' | 'month' | 'all-time'): Promise<ProgressReport> {
    await this.storage.init();
    
    const user = this.userService.getCurrentUser();
    const progress = this.userService.getProgress();
    const sessions = await this.storage.getRecentSessions(100);
    const quizAttempts = await this.getAllQuizAttempts();

    // Filter sessions by period
    const filteredSessions = this.filterByPeriod(sessions, period);
    const filteredAttempts = this.filterByPeriod(quizAttempts, period);

    const report: ProgressReport = {
      userId: user?.id || 'anonymous',
      reportDate: new Date().toISOString(),
      period,
      
      overview: {
        totalMinutes: filteredSessions.reduce((sum, s) => sum + s.duration, 0),
        totalSessions: filteredSessions.length,
        questionsAnswered: progress?.totalQuestions || 0,
        accuracy: progress ? (progress.correctAnswers / Math.max(progress.totalQuestions, 1)) : 0,
        streakDays: this.calculateStreak(filteredSessions)
      },

      topicBreakdown: this.generateTopicBreakdown(progress),
      
      quizStats: {
        quizzesTaken: filteredAttempts.length,
        averageScore: this.calculateAverageScore(filteredAttempts),
        topPerformingTopics: this.getTopPerformingTopics(progress, 3),
        needsImprovement: this.getNeedsImprovementTopics(progress, 3)
      },

      flashcardStats: await this.getFlashcardStats(),
      
      recommendations: this.generateRecommendations(progress, filteredSessions)
    };

    return report;
  }

  private filterByPeriod<T extends { startTime?: string; startedAt?: string; createdAt?: string }>(
    items: T[], 
    period: 'week' | 'month' | 'all-time'
  ): T[] {
    if (period === 'all-time') return items;

    const now = new Date();
    const cutoff = new Date();
    
    if (period === 'week') {
      cutoff.setDate(now.getDate() - 7);
    } else if (period === 'month') {
      cutoff.setMonth(now.getMonth() - 1);
    }

    return items.filter(item => {
      const dateStr = item.startTime || item.startedAt || item.createdAt;
      if (!dateStr) return false;
      return new Date(dateStr) >= cutoff;
    });
  }

  private async getAllQuizAttempts(): Promise<any[]> {
    // Get all quizzes and their attempts
    const quizzes = await this.storage.getAllQuizzes();
    const attempts: any[] = [];
    
    for (const quiz of quizzes) {
      const quizAttempts = await this.storage.getQuizAttempts(quiz.id);
      attempts.push(...quizAttempts);
    }
    
    return attempts;
  }

  private calculateStreak(sessions: StudySession[]): number {
    if (sessions.length === 0) return 0;

    const dates = sessions
      .map(s => new Date(s.startTime).toDateString())
      .filter((date, index, self) => self.indexOf(date) === index)
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toDateString();
    let currentDate = new Date(today);

    for (const date of dates) {
      if (date === currentDate.toDateString()) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }

  private generateTopicBreakdown(progress: UserProgress | null): ProgressReport['topicBreakdown'] {
    if (!progress || !progress.topicMastery) return [];

    return Object.values(progress.topicMastery).map(mastery => ({
      topic: mastery.topic,
      accuracy: mastery.accuracy,
      questionsAnswered: mastery.questionsAnswered,
      minutesSpent: 0, // Would need to track from sessions
      masteryLevel: mastery.masteryLevel
    }));
  }

  private calculateAverageScore(attempts: any[]): number {
    if (attempts.length === 0) return 0;
    
    const totalScore = attempts.reduce((sum, attempt) => {
      return sum + (attempt.score / attempt.maxScore);
    }, 0);
    
    return totalScore / attempts.length;
  }

  private getTopPerformingTopics(progress: UserProgress | null, count: number): string[] {
    if (!progress || !progress.topicMastery) return [];

    return Object.values(progress.topicMastery)
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, count)
      .map(m => m.topic);
  }

  private getNeedsImprovementTopics(progress: UserProgress | null, count: number): string[] {
    if (!progress || !progress.topicMastery) return [];

    return Object.values(progress.topicMastery)
      .filter(m => m.questionsAnswered >= 3) // Only topics with enough data
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, count)
      .map(m => m.topic);
  }

  private async getFlashcardStats(): Promise<ProgressReport['flashcardStats']> {
    const allDecks = await this.storage.getAllDecks();
    let totalCards = 0;
    let totalReviews = 0;
    let totalCorrect = 0;
    let matureCards = 0;
    let totalEF = 0;

    for (const deck of allDecks) {
      const cards = await this.storage.getFlashcardsByDeck(deck.id);
      totalCards += cards.length;

      for (const card of cards) {
        totalReviews += card.totalReviews;
        totalCorrect += card.correctReviews;
        totalEF += card.ef;
        if (card.difficulty === 'mature') matureCards++;
      }
    }

    return {
      cardsReviewed: totalReviews,
      retentionRate: totalReviews > 0 ? totalCorrect / totalReviews : 0,
      matureCards,
      averageEF: totalCards > 0 ? totalEF / totalCards : 0
    };
  }

  private generateRecommendations(progress: UserProgress | null, sessions: StudySession[]): string[] {
    const recommendations: string[] = [];

    // Study frequency
    if (sessions.length < 3) {
      recommendations.push('Try to study more regularly - aim for at least 3 sessions per week');
    }

    // Weak topics
    if (progress) {
      const weakTopics = this.getNeedsImprovementTopics(progress, 2);
      if (weakTopics.length > 0) {
        recommendations.push(`Focus on improving: ${weakTopics.join(', ')}`);
      }

      // Overall accuracy
      const accuracy = progress.correctAnswers / Math.max(progress.totalQuestions, 1);
      if (accuracy < 0.6 && progress.totalQuestions >= 10) {
        recommendations.push('Consider using "Hint" mode more often to build understanding');
      }
    }

    // Streak building
    const streak = this.calculateStreak(sessions);
    if (streak === 0) {
      recommendations.push('Start a study streak today!');
    } else if (streak < 7) {
      recommendations.push(`Great job! You're on a ${streak}-day streak. Keep it going!`);
    }

    if (recommendations.length === 0) {
      recommendations.push('Great work! Keep up the excellent study habits.');
    }

    return recommendations;
  }

  async exportReport(report: ProgressReport): Promise<string> {
    return JSON.stringify(report, null, 2);
  }

  private generateId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
