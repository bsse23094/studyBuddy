import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserProfile, UserProgress, TopicMastery, ComprehensionLevel } from '../models';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private progressSubject = new BehaviorSubject<UserProgress | null>(null);
  public progress$ = this.progressSubject.asObservable();

  constructor() {
    this.loadUser();
    this.loadProgress();
  }

  private loadUser(): void {
    const stored = localStorage.getItem('user_profile');
    if (stored) {
      this.currentUserSubject.next(JSON.parse(stored));
    } else {
      // Create default user
      const defaultUser: UserProfile = {
        id: this.generateId(),
        levelPreference: 'highschool',
        topics: [],
        createdAt: new Date().toISOString(),
        preferences: {
          defaultMode: 'explain',
          defaultTopK: 5,
          enableStreaming: true,
          enableOfflineMode: false
        }
      };
      this.setUser(defaultUser);
    }
  }

  private loadProgress(): void {
    const stored = localStorage.getItem('user_progress');
    if (stored) {
      this.progressSubject.next(JSON.parse(stored));
    } else {
      const user = this.currentUserSubject.value;
      if (user) {
        const defaultProgress: UserProgress = {
          userId: user.id,
          totalQuestions: 0,
          correctAnswers: 0,
          activeMinutes: 0,
          topicMastery: {},
          lastActive: new Date().toISOString()
        };
        this.setProgress(defaultProgress);
      }
    }
  }

  setUser(user: UserProfile): void {
    localStorage.setItem('user_profile', JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  updateUserPreferences(updates: Partial<UserProfile>): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const updated = { ...current, ...updates };
      this.setUser(updated);
    }
  }

  setLevel(level: ComprehensionLevel): void {
    this.updateUserPreferences({ levelPreference: level });
  }

  addTopic(topic: string): void {
    const current = this.currentUserSubject.value;
    if (current) {
      const topics = current.topics || [];
      if (!topics.includes(topic)) {
        this.updateUserPreferences({ topics: [...topics, topic] });
      }
    }
  }

  private setProgress(progress: UserProgress): void {
    localStorage.setItem('user_progress', JSON.stringify(progress));
    this.progressSubject.next(progress);
  }

  recordQuizResult(topic: string, correct: boolean): void {
    const progress = this.progressSubject.value;
    if (!progress) return;

    progress.totalQuestions++;
    if (correct) progress.correctAnswers++;

    // Update topic mastery
    if (!progress.topicMastery[topic]) {
      progress.topicMastery[topic] = {
        topic,
        questionsAnswered: 0,
        accuracy: 0,
        daysStudied: 1,
        lastStudied: new Date().toISOString(),
        masteryLevel: 'beginner'
      };
    }

    const mastery = progress.topicMastery[topic];
    mastery.questionsAnswered++;
    mastery.accuracy = ((mastery.accuracy * (mastery.questionsAnswered - 1)) + (correct ? 1 : 0)) / mastery.questionsAnswered;
    mastery.lastStudied = new Date().toISOString();
    mastery.masteryLevel = this.calculateMasteryLevel(mastery.accuracy, mastery.questionsAnswered);

    progress.lastActive = new Date().toISOString();
    this.setProgress(progress);
  }

  recordStudyTime(minutes: number): void {
    const progress = this.progressSubject.value;
    if (!progress) return;

    progress.activeMinutes += minutes;
    progress.lastActive = new Date().toISOString();
    this.setProgress(progress);
  }

  private calculateMasteryLevel(accuracy: number, questionsAnswered: number): TopicMastery['masteryLevel'] {
    if (questionsAnswered < 5) return 'beginner';
    if (accuracy >= 0.9 && questionsAnswered >= 20) return 'expert';
    if (accuracy >= 0.8 && questionsAnswered >= 10) return 'advanced';
    if (accuracy >= 0.6) return 'intermediate';
    return 'beginner';
  }

  private generateId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentUser(): UserProfile | null {
    return this.currentUserSubject.value;
  }

  getProgress(): UserProgress | null {
    return this.progressSubject.value;
  }

  exportData(): string {
    const user = this.currentUserSubject.value;
    const progress = this.progressSubject.value;
    const data = { user, progress, exportedAt: new Date().toISOString() };
    return JSON.stringify(data, null, 2);
  }

  clearData(): void {
    localStorage.removeItem('user_profile');
    localStorage.removeItem('user_progress');
    this.loadUser(); // Reset to default
    this.loadProgress();
  }
}
