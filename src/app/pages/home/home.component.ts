import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { FlashcardService } from '../../services/flashcard.service';
import { StorageService } from '../../services/storage.service';
import { UserProfile, ReviewQueue } from '../../models';
import { WelcomeDialogComponent } from '../../components/welcome-dialog/welcome-dialog.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, WelcomeDialogComponent],
  template: `
    @if (showWelcomeDialog) {
      <app-welcome-dialog (nameSubmitted)="onNameSubmitted($event)"></app-welcome-dialog>
    }
    
    <div class="home-container">
      <header class="hero">
        <h1>Welcome to StudyBuddy</h1>
        <p class="tagline">Your AI-Powered Study Tutor</p>
        @if (userName) {
          <p class="greeting">Hello, {{ userName }}!</p>
        }
      </header>

      <section class="study-modes">
        <h2>Choose Your Study Mode</h2>
        <div class="mode-grid">
          <a routerLink="/chat" class="mode-card" role="button" aria-label="Start tutoring chat">
            <div class="icon"><i class="fa-solid fa-comment-dots"></i></div>
            <h3>Chat & Learn</h3>
            <p>Get explanations, hints, and step-by-step solutions</p>
          </a>

          <a routerLink="/quiz" class="mode-card" role="button" aria-label="Take a quiz">
            <div class="icon"><i class="fa-solid fa-file-lines"></i></div>
            <h3>Take a Quiz</h3>
            <p>Test your knowledge with adaptive quizzes</p>
          </a>

          <a routerLink="/flashcards" class="mode-card" role="button" aria-label="Review flashcards">
            <div class="icon"><i class="fa-solid fa-layer-group"></i></div>
            <h3>Flashcards</h3>
            <p>Review with spaced repetition</p>
            @if (reviewQueue.totalDue > 0) {
              <span class="badge">{{ reviewQueue.totalDue }} due</span>
            }
          </a>

          <a routerLink="/documents" class="mode-card" role="button" aria-label="Manage documents">
            <div class="icon"><i class="fa-solid fa-book"></i></div>
            <h3>Documents</h3>
            <p>Upload and manage study materials</p>
          </a>

          <a routerLink="/routine" class="mode-card" role="button" aria-label="Create study routine">
            <div class="icon"><i class="fa-solid fa-calendar-days"></i></div>
            <h3>Study Routine</h3>
            <p>AI-powered daily schedules</p>
            <span class="badge new">New</span>
          </a>

          <a routerLink="/focus" class="mode-card" role="button" aria-label="Focus timer">
            <div class="icon"><i class="fa-solid fa-bullseye"></i></div>
            <h3>Focus</h3>
            <p>Track study sessions with customizable timer</p>
            <span class="badge new">New</span>
          </a>
        </div>
      </section>

      <section class="recent-activity" *ngIf="recentConversations.length > 0">
        <h2>Recent Conversations</h2>
        <div class="activity-list">
          @for (conv of recentConversations.slice(0, 3); track conv.id) {
            <a [routerLink]="['/chat']" [queryParams]="{id: conv.id}" class="activity-item">
              <div class="activity-content">
                <h4>{{ conv.title || 'Untitled Conversation' }}</h4>
                <p class="meta">{{ conv.messages.length }} messages • {{ formatDate(conv.updatedAt || conv.createdAt) }}</p>
              </div>
            </a>
          }
        </div>
      </section>

      <section class="quick-stats" *ngIf="progress">
        <h2>Your Progress</h2>
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">{{ progress.totalQuestions }}</div>
            <div class="stat-label">Questions Answered</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ getAccuracy() }}%</div>
            <div class="stat-label">Accuracy</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ progress.activeMinutes }}</div>
            <div class="stat-label">Minutes Studied</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">{{ Object.keys(progress.topicMastery).length }}</div>
            <div class="stat-label">Topics Explored</div>
          </div>
        </div>
        <a routerLink="/progress" class="view-more">View Detailed Progress →</a>
      </section>

      <section class="getting-started" *ngIf="!hasDocuments">
        <h2>Getting Started</h2>
        <div class="steps">
          <div class="step">
            <div class="step-number">1</div>
            <div class="step-content">
              <h3>Upload Your Materials</h3>
              <p>Add PDFs, notes, or text files to your library</p>
              <a routerLink="/documents" class="btn-secondary">Go to Documents</a>
            </div>
          </div>
          <div class="step">
            <div class="step-number">2</div>
            <div class="step-content">
              <h3>Start Chatting</h3>
              <p>Ask questions and get sourced answers</p>
            </div>
          </div>
          <div class="step">
            <div class="step-number">3</div>
            <div class="step-content">
              <h3>Practice & Review</h3>
              <p>Generate quizzes and flashcards to reinforce learning</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 2rem 4rem;
      animation: fadeInUp 0.6s ease-out;
    }

    .hero {
      text-align: center;
      padding: 5rem 3rem;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      color: white;
      margin-bottom: 4rem;
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at center, rgba(212, 175, 55, 0.03) 0%, transparent 70%);
      animation: pulse 6s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.05); opacity: 0.6; }
    }

    .hero h1 {
      font-size: 3.5rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      margin-bottom: 0.75rem;
      position: relative;
      z-index: 1;
      letter-spacing: -0.03em;
      color: #FFFFFF;
    }

    .tagline {
      font-size: 1.375rem;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.7);
      margin-bottom: 1rem;
      position: relative;
      z-index: 1;
      letter-spacing: -0.011em;
    }

    .greeting {
      font-size: 1.125rem;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      font-weight: 500;
      color: #D4AF37;
      position: relative;
      z-index: 1;
      letter-spacing: -0.011em;
    }

    section {
      margin-bottom: 4rem;
    }

    h2 {
      font-size: 2rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 600;
      margin-bottom: 2rem;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }

    .mode-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 2rem;
    }

    .mode-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 20px;
      padding: 2.5rem;
      text-align: center;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      position: relative;
      overflow: hidden;
    }

    .mode-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at center, rgba(212, 175, 55, 0.08) 0%, transparent 70%);
      opacity: 0;
      transition: opacity 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .mode-card:hover::before {
      opacity: 1;
    }

    .mode-card:hover {
      transform: translateY(-6px);
      border-color: rgba(212, 175, 55, 0.3);
      background: #121212;
    }

    .mode-card:focus {
      outline: 2px solid #D4AF37;
      outline-offset: 3px;
    }

    .icon {
      font-size: 3rem;
      color: #D4AF37;
      margin-bottom: 1.5rem;
      position: relative;
      z-index: 1;
    }

    .mode-card h3 {
      font-size: 1.375rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #FFFFFF;
      position: relative;
      z-index: 1;
      letter-spacing: -0.02em;
    }

    .mode-card p {
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      font-size: 0.9375rem;
      position: relative;
      z-index: 1;
      letter-spacing: -0.011em;
      line-height: 1.6;
    }

    .badge {
      position: absolute;
      top: 1.25rem;
      right: 1.25rem;
      background: #D4AF37;
      color: #000000;
      padding: 0.375rem 0.875rem;
      border-radius: 10px;
      font-size: 0.75rem;
      font-weight: 600;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      z-index: 2;
      animation: bounce 2s infinite;
      letter-spacing: -0.011em;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-4px); }
    }

    .activity-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .activity-item {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 1.5rem;
      text-decoration: none;
      color: inherit;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .activity-item:hover {
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateX(4px);
      background: #121212;
    }

    .activity-content h4 {
      font-size: 1.0625rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }

    .meta {
      font-size: 0.875rem;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
      letter-spacing: -0.011em;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .stat-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem;
      text-align: center;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      overflow: hidden;
    }

    .stat-card::after {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.08), transparent);
      transition: left 0.5s ease;
    }

    .stat-card:hover::after {
      left: 100%;
    }

    .stat-card:hover {
      transform: translateY(-4px);
      background: #121212;
      border-color: rgba(212, 175, 55, 0.2);
    }

    .stat-value {
      font-size: 2.5rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      color: #D4AF37;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 1;
      letter-spacing: -0.03em;
    }

    .stat-label {
      font-size: 0.875rem;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.6);
      position: relative;
      z-index: 1;
      letter-spacing: -0.011em;
    }

    .view-more {
      display: inline-block;
      color: #D4AF37;
      text-decoration: none;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      font-weight: 600;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.011em;
    }

    .view-more:hover {
      transform: translateX(4px);
      color: #FFD700;
    }

    .steps {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .step {
      display: flex;
      gap: 1.5rem;
      align-items: flex-start;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .step:hover {
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateX(6px);
      background: #121212;
    }

    .step-number {
      flex-shrink: 0;
      width: 52px;
      height: 52px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      letter-spacing: -0.02em;
    }

    .step-content h3 {
      font-size: 1.1875rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 600;
      margin-bottom: 0.5rem;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }

    .step-content p {
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 0.875rem;
      letter-spacing: -0.011em;
      line-height: 1.6;
    }

    .btn-secondary {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #FFFFFF;
      color: #000000;
      border-radius: 10px;
      text-decoration: none;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      font-weight: 600;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.011em;
    }

    .btn-secondary:hover {
      transform: translateY(-2px);
      background: #D4AF37;
    }

    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    @media (max-width: 768px) {
      .home-container {
        padding: 1.5rem;
      }

      .hero {
        padding: 3rem 2rem;
      }

      .hero h1 {
        font-size: 2.5rem;
      }

      .mode-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .mode-card {
        padding: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  user: UserProfile | null = null;
  progress: any = null;
  recentConversations: any[] = [];
  reviewQueue: ReviewQueue = { due: [], upcoming: [], totalDue: 0, totalUpcoming: 0 };
  hasDocuments = false;
  Object = Object;
  showWelcomeDialog = false;
  userName = '';

  constructor(
    private userService: UserService,
    private flashcardService: FlashcardService,
    private storage: StorageService
  ) {}

  async ngOnInit() {
    // Check if user name exists in localStorage
    const savedName = localStorage.getItem('studybuddy_user_name');
    if (savedName) {
      this.userName = savedName;
      this.showWelcomeDialog = false;
    } else {
      this.showWelcomeDialog = true;
    }

    this.userService.currentUser$.subscribe(user => this.user = user);
    this.loadProgressFromStorage();
    this.flashcardService.reviewQueue$.subscribe(queue => this.reviewQueue = queue);

    await this.storage.init();
    this.recentConversations = await this.storage.getAllConversations();
    const docs = await this.storage.getAllDocuments();
    this.hasDocuments = docs.length > 0;
  }

  private loadProgressFromStorage(): void {
    // Load quiz statistics
    const quizHistory = localStorage.getItem('studybuddy_quiz_history');
    let totalQuestions = 0;
    let correctAnswers = 0;
    let activeMinutes = 0;
    const topicMastery: Record<string, number> = {};

    if (quizHistory) {
      const quizzes = JSON.parse(quizHistory);
      quizzes.forEach((quiz: any) => {
        totalQuestions += quiz.totalQuestions;
        const correct = Math.round((quiz.score / 100) * quiz.totalQuestions);
        correctAnswers += correct;
        activeMinutes += quiz.timeTaken || 0;
        
        // Track topic mastery
        if (quiz.topic) {
          topicMastery[quiz.topic] = (topicMastery[quiz.topic] || 0) + 1;
        }
      });
    }

    // Load flashcard statistics
    const decks = localStorage.getItem('studybuddy_flashcard_decks');
    if (decks) {
      const deckData = JSON.parse(decks);
      deckData.forEach((deck: any) => {
        if (deck.cards) {
          deck.cards.forEach((card: any) => {
            activeMinutes += (card.reviews || 0) * 2; // Estimate 2 minutes per review
          });
        }
      });
    }

    this.progress = {
      totalQuestions,
      correctAnswers,
      activeMinutes,
      topicMastery
    };
  }

  onNameSubmitted(name: string): void {
    if (name.trim()) {
      this.userName = name.trim();
      localStorage.setItem('studybuddy_user_name', this.userName);
      this.showWelcomeDialog = false;
    }
  }

  getAccuracy(): number {
    if (!this.progress || this.progress.totalQuestions === 0) return 0;
    return Math.round((this.progress.correctAnswers / this.progress.totalQuestions) * 100);
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  }
}
