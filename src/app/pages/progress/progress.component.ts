import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface QuizHistory {
  id: string;
  topic: string;
  difficulty: string;
  score: number;
  totalQuestions: number;
  timestamp: number;
  timeTaken?: number;
}

interface StudyStats {
  totalQuizzes: number;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
  flashcardsReviewed: number;
  documentsUploaded: number;
  totalStudyTime: number;
  currentStreak: number;
  longestStreak: number;
  averageQuizScore: number;
}

interface ActivityDay {
  date: string;
  quizzes: number;
  flashcards: number;
  intensity: number;
}

@Component({
  selector: 'app-progress',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="progress-page">
      <div class="progress-container">
        <header class="progress-header">
          <div class="header-content">
            <i class="fa-solid fa-chart-line header-icon"></i>
            <div>
              <h1 class="page-title">Progress Dashboard</h1>
              <p class="page-subtitle">Track your learning journey</p>
            </div>
          </div>
          <button class="refresh-btn" (click)="loadProgress()">
            <i class="fa-solid fa-rotate-right"></i>
            Refresh
          </button>
        </header>

        <!-- Stats Overview -->
        <section class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon quiz-icon">
              <i class="fa-solid fa-graduation-cap"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Quizzes Taken</p>
              <h3 class="stat-value">{{ stats.totalQuizzes }}</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon questions-icon">
              <i class="fa-solid fa-circle-question"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Questions Answered</p>
              <h3 class="stat-value">{{ stats.totalQuestions }}</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon accuracy-icon">
              <i class="fa-solid fa-bullseye"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Overall Accuracy</p>
              <h3 class="stat-value">{{ stats.accuracy }}%</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon flashcard-icon">
              <i class="fa-solid fa-layer-group"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Cards Reviewed</p>
              <h3 class="stat-value">{{ stats.flashcardsReviewed }}</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon document-icon">
              <i class="fa-solid fa-file-lines"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Documents Uploaded</p>
              <h3 class="stat-value">{{ stats.documentsUploaded }}</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon streak-icon">
              <i class="fa-solid fa-fire"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Current Streak</p>
              <h3 class="stat-value">{{ stats.currentStreak }} days</h3>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon focus-icon">
              <i class="fa-solid fa-clock"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Focus Time</p>
              <h3 class="stat-value">{{ formatFocusTime(stats.totalStudyTime) }}</h3>
            </div>
          </div>
        </section>

        <!-- Focus Sessions -->
        <section class="focus-sessions-section" *ngIf="focusSessions.length > 0">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-bullseye"></i>
              Focus Sessions
            </h2>
            <p class="section-subtitle">Your recent study sessions</p>
          </div>
          <div class="sessions-grid">
            <div *ngFor="let session of focusSessions.slice(0, 6)" class="session-card">
              <div class="session-header">
                <div class="session-topic">
                  <i class="fa-solid fa-book"></i>
                  <h3>{{ session.topic }}</h3>
                </div>
                <div class="session-duration">
                  <i class="fa-solid fa-clock"></i>
                  <span>{{ session.duration }}m</span>
                </div>
              </div>
              <div class="session-date">
                {{ formatSessionDate(session.startTime) }}
              </div>
              <div class="session-subtopics" *ngIf="session.subtopics.length > 0">
                <h4>Covered Topics:</h4>
                <div class="subtopics-tags">
                  <span *ngFor="let subtopic of session.subtopics.slice(0, 4)" class="subtopic-tag">
                    {{ subtopic }}
                  </span>
                  <span *ngIf="session.subtopics.length > 4" class="more-tag">
                    +{{ session.subtopics.length - 4 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="section-footer" *ngIf="focusSessions.length > 6">
            <button class="view-all-btn" (click)="showAllSessions = !showAllSessions">
              <i class="fa-solid" [class.fa-chevron-down]="!showAllSessions" [class.fa-chevron-up]="showAllSessions"></i>
              {{ showAllSessions ? 'Show Less' : 'View All Sessions' }}
            </button>
          </div>
        </section>

        <!-- All Sessions (when expanded) -->
        <section class="all-sessions-section" *ngIf="showAllSessions && focusSessions.length > 6">
          <div class="sessions-grid">
            <div *ngFor="let session of focusSessions.slice(6)" class="session-card">
              <div class="session-header">
                <div class="session-topic">
                  <i class="fa-solid fa-book"></i>
                  <h3>{{ session.topic }}</h3>
                </div>
                <div class="session-duration">
                  <i class="fa-solid fa-clock"></i>
                  <span>{{ session.duration }}m</span>
                </div>
              </div>
              <div class="session-date">
                {{ formatSessionDate(session.startTime) }}
              </div>
              <div class="session-subtopics" *ngIf="session.subtopics.length > 0">
                <h4>Covered Topics:</h4>
                <div class="subtopics-tags">
                  <span *ngFor="let subtopic of session.subtopics.slice(0, 4)" class="subtopic-tag">
                    {{ subtopic }}
                  </span>
                  <span *ngIf="session.subtopics.length > 4" class="more-tag">
                    +{{ session.subtopics.length - 4 }} more
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Activity Heatmap -->
        <section class="heatmap-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-calendar-days"></i>
              Weekly Activity
            </h2>
            <p class="section-subtitle">Last 7 days</p>
          </div>
          <div class="heatmap-grid">
            @for (day of activityDays; track day.date) {
              <div class="heatmap-day" [style.opacity]="day.intensity">
                <div class="day-label">{{ getDayLabel(day.date) }}</div>
                <div class="day-bar">
                  <div class="bar-fill" [style.height.%]="getBarHeight(day)"></div>
                </div>
                <div class="day-stats">
                  @if (day.quizzes > 0) {
                    <span class="day-stat">{{ day.quizzes }} quizzes</span>
                  }
                  @if (day.flashcards > 0) {
                    <span class="day-stat">{{ day.flashcards }} cards</span>
                  }
                  @if (day.quizzes === 0 && day.flashcards === 0) {
                    <span class="day-stat no-activity">No activity</span>
                  }
                </div>
              </div>
            }
          </div>
        </section>

        <!-- Recent Quizzes -->
        <section class="recent-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-clock-rotate-left"></i>
              Recent Quizzes
            </h2>
          </div>
          @if (recentQuizzes.length > 0) {
            <div class="quiz-history">
              @for (quiz of recentQuizzes; track quiz.id) {
                <div class="quiz-card">
                  <div class="quiz-info">
                    <h3 class="quiz-topic">{{ quiz.topic }}</h3>
                    <div class="quiz-meta">
                      <span class="quiz-difficulty" [class]="'difficulty-' + quiz.difficulty.toLowerCase()">
                        {{ quiz.difficulty }}
                      </span>
                      <span class="quiz-date">{{ formatDate(quiz.timestamp) }}</span>
                    </div>
                  </div>
                  <div class="quiz-score">
                    <div class="score-circle" [class.perfect]="quiz.score === 100">
                      <span class="score-value">{{ quiz.score }}%</span>
                    </div>
                    <p class="score-text">{{ quiz.totalQuestions }} questions</p>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="empty-state">
              <i class="fa-solid fa-inbox"></i>
              <p>No quizzes taken yet</p>
              <a routerLink="/quiz" class="start-quiz-btn">Take Your First Quiz</a>
            </div>
          }
        </section>

        <!-- Performance Insights -->
        <section class="insights-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-lightbulb"></i>
              Performance Insights
            </h2>
          </div>
          <div class="insights-grid">
            <div class="insight-card">
              <div class="insight-icon">
                <i class="fa-solid fa-trophy"></i>
              </div>
              <div class="insight-content">
                <h4>Average Score</h4>
                <p class="insight-value">{{ stats.averageQuizScore }}%</p>
                <p class="insight-desc">
                  @if (stats.averageQuizScore >= 80) {
                    Excellent performance! Keep it up!
                  } @else if (stats.averageQuizScore >= 60) {
                    Good work! Room for improvement.
                  } @else {
                    Keep practicing to improve your scores.
                  }
                </p>
              </div>
            </div>

            <div class="insight-card">
              <div class="insight-icon">
                <i class="fa-solid fa-fire-flame-curved"></i>
              </div>
              <div class="insight-content">
                <h4>Study Streak</h4>
                <p class="insight-value">{{ stats.currentStreak }} days</p>
                <p class="insight-desc">
                  @if (stats.currentStreak === 0) {
                    Start studying today to begin your streak!
                  } @else if (stats.currentStreak >= stats.longestStreak) {
                    New record! This is your longest streak!
                  } @else {
                    Your longest streak: {{ stats.longestStreak }} days
                  }
                </p>
              </div>
            </div>

            <div class="insight-card">
              <div class="insight-icon">
                <i class="fa-solid fa-chart-simple"></i>
              </div>
              <div class="insight-content">
                <h4>Total Study Time</h4>
                <p class="insight-value">{{ formatStudyTime(stats.totalStudyTime) }}</p>
                <p class="insight-desc">Time spent on quizzes and flashcards</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  `,
  styles: [`
    .progress-page {
      min-height: 100vh;
      background: #000000;
      padding: 2rem;
    }

    .progress-container {
      max-width: 1400px;
      margin: 0 auto;
    }

    .progress-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .header-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #000000;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
    }

    .page-title {
      font-family: 'Lexend', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0;
    }

    .page-subtitle {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.6);
      margin: 0.25rem 0 0 0;
    }

    .refresh-btn {
      display: flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.875rem 1.5rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: #ffffff;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      letter-spacing: -0.011em;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .refresh-btn:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(212, 175, 55, 0.4);
      transform: translateY(-2px);
    }

    .refresh-btn i {
      font-size: 1rem;
      color: #D4AF37;
    }

    /* Stats Grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .stat-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 1.75rem;
      display: flex;
      align-items: center;
      gap: 1.25rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .stat-card:hover {
      background: #121212;
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }

    .quiz-icon {
      background: rgba(212, 175, 55, 0.12);
      color: #D4AF37;
    }

    .questions-icon {
      background: rgba(96, 165, 250, 0.12);
      color: #60A5FA;
    }

    .accuracy-icon {
      background: rgba(34, 197, 94, 0.12);
      color: #22C55E;
    }

    .flashcard-icon {
      background: rgba(168, 85, 247, 0.12);
      color: #A855F7;
    }

    .document-icon {
      background: rgba(251, 146, 60, 0.12);
      color: #FB923C;
    }

    .streak-icon {
      background: rgba(239, 68, 68, 0.12);
      color: #EF4444;
    }

    .stat-content {
      flex: 1;
    }

    .stat-label {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0 0 0.375rem 0;
      text-transform: uppercase;
    }

    .stat-value {
      font-family: 'Lexend', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0;
    }

    /* Section Headers */
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-title {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-title i {
      color: #D4AF37;
      font-size: 1.25rem;
    }

    .section-subtitle {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    /* Heatmap Section */
    .heatmap-section {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 3rem;
    }

    .heatmap-grid {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .heatmap-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .heatmap-day:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateY(-2px);
    }

    .day-label {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.7);
      text-transform: uppercase;
    }

    .day-bar {
      width: 100%;
      height: 80px;
      background: rgba(255, 255, 255, 0.04);
      border-radius: 8px;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
    }

    .bar-fill {
      width: 100%;
      background: linear-gradient(180deg, #FFD700 0%, #D4AF37 100%);
      border-radius: 8px 8px 0 0;
      transition: height 400ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 -4px 12px rgba(212, 175, 55, 0.3);
    }

    .day-stats {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.25rem;
    }

    .day-stat {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.6);
    }

    .day-stat.no-activity {
      color: rgba(255, 255, 255, 0.3);
    }

    /* Recent Section */
    .recent-section {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 3rem;
    }

    /* Focus Sessions Section */
    .focus-sessions-section {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 3rem;
    }

    .sessions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .session-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 1.5rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .session-card:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.15);
    }

    .session-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 1rem;
    }

    .session-topic {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      flex: 1;
    }

    .session-topic i {
      color: #D4AF37;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .session-topic h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.0625rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0;
      line-height: 1.4;
    }

    .session-duration {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.375rem 0.75rem;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      white-space: nowrap;
    }

    .session-duration i {
      color: #D4AF37;
      font-size: 0.875rem;
    }

    .session-duration span {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.875rem;
      font-weight: 600;
      color: #D4AF37;
    }

    .session-date {
      font-size: 0.8125rem;
      color: rgba(255, 255, 255, 0.5);
      margin-bottom: 1rem;
    }

    .session-subtopics h4 {
      font-family: 'Lexend', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 0.75rem 0;
    }

    .subtopics-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .subtopic-tag {
      padding: 0.375rem 0.75rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 6px;
      font-size: 0.8125rem;
      color: rgba(255, 255, 255, 0.8);
      white-space: nowrap;
    }

    .more-tag {
      padding: 0.375rem 0.75rem;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 6px;
      font-size: 0.8125rem;
      color: #D4AF37;
      font-weight: 600;
    }

    .section-footer {
      text-align: center;
      margin-top: 2rem;
    }

    .view-all-btn {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 10px;
      color: #D4AF37;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .view-all-btn:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: #D4AF37;
      transform: translateY(-2px);
    }

    .all-sessions-section {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 3rem;
    }

    .stat-icon.focus-icon {
      background: linear-gradient(135deg, #8B5CF6 0%, #6366F1 100%);
    }

    .quiz-history {
      display: grid;
      gap: 1rem;
    }

    .quiz-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .quiz-card:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateX(4px);
    }

    .quiz-info {
      flex: 1;
    }

    .quiz-topic {
      font-family: 'Lexend', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0 0 0.625rem 0;
    }

    .quiz-meta {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .quiz-difficulty {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: -0.011em;
      padding: 0.375rem 0.875rem;
      border-radius: 8px;
      text-transform: uppercase;
    }

    .difficulty-easy {
      background: rgba(34, 197, 94, 0.12);
      color: #22C55E;
    }

    .difficulty-medium {
      background: rgba(251, 146, 60, 0.12);
      color: #FB923C;
    }

    .difficulty-hard {
      background: rgba(239, 68, 68, 0.12);
      color: #EF4444;
    }

    .quiz-date {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
    }

    .quiz-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .score-circle {
      width: 72px;
      height: 72px;
      border-radius: 50%;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
    }

    .score-circle.perfect {
      background: linear-gradient(135deg, #22C55E 0%, #10B981 100%);
      box-shadow: 0 8px 24px rgba(34, 197, 94, 0.25);
    }

    .score-value {
      font-family: 'Lexend', sans-serif;
      font-size: 1.25rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      color: #000000;
    }

    .score-text {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    /* Empty State */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem 2rem;
      text-align: center;
    }

    .empty-state i {
      font-size: 4rem;
      color: rgba(255, 255, 255, 0.2);
      margin-bottom: 1.5rem;
    }

    .empty-state p {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0 0 1.5rem 0;
    }

    .start-quiz-btn {
      display: inline-flex;
      align-items: center;
      padding: 0.875rem 1.75rem;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border: none;
      border-radius: 12px;
      color: #000000;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 600;
      letter-spacing: -0.011em;
      text-decoration: none;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
    }

    .start-quiz-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(212, 175, 55, 0.35);
    }

    /* Insights Section */
    .insights-section {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 2rem;
    }

    .insights-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
      gap: 1.5rem;
      margin-top: 1.5rem;
    }

    .insight-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 12px;
      padding: 1.75rem;
      display: flex;
      gap: 1.25rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .insight-card:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateY(-2px);
    }

    .insight-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: rgba(212, 175, 55, 0.12);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      color: #D4AF37;
      flex-shrink: 0;
    }

    .insight-content {
      flex: 1;
    }

    .insight-content h4 {
      font-family: 'Lexend', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0 0 0.625rem 0;
    }

    .insight-value {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #D4AF37;
      margin: 0 0 0.625rem 0;
    }

    .insight-desc {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .progress-page {
        padding: 1rem;
      }

      .progress-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.5rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }

      .heatmap-grid {
        grid-template-columns: repeat(4, 1fr);
        gap: 0.75rem;
      }

      .insights-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ProgressComponent implements OnInit {
  stats: StudyStats = {
    totalQuizzes: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    accuracy: 0,
    flashcardsReviewed: 0,
    documentsUploaded: 0,
    totalStudyTime: 0,
    currentStreak: 0,
    longestStreak: 0,
    averageQuizScore: 0
  };

  recentQuizzes: QuizHistory[] = [];
  activityDays: ActivityDay[] = [];
  focusSessions: any[] = [];
  showAllSessions = false;

  ngOnInit() {
    this.loadProgress();
  }

  loadProgress() {
    this.loadQuizStats();
    this.loadFlashcardStats();
    this.loadDocumentStats();
    this.loadFocusSessions();
    this.loadActivityData();
    this.calculateStreaks();
  }

  private loadQuizStats() {
    const quizHistory = localStorage.getItem('studybuddy_quiz_history');
    if (quizHistory) {
      const quizzes: QuizHistory[] = JSON.parse(quizHistory);
      this.stats.totalQuizzes = quizzes.length;
      
      let totalScore = 0;
      let totalCorrect = 0;
      let totalQuestions = 0;
      let totalTime = 0;

      quizzes.forEach(quiz => {
        totalScore += quiz.score;
        const correct = Math.round((quiz.score / 100) * quiz.totalQuestions);
        totalCorrect += correct;
        totalQuestions += quiz.totalQuestions;
        totalTime += quiz.timeTaken || 0;
      });

      this.stats.totalQuestions = totalQuestions;
      this.stats.correctAnswers = totalCorrect;
      this.stats.accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
      this.stats.averageQuizScore = quizzes.length > 0 ? Math.round(totalScore / quizzes.length) : 0;
      this.stats.totalStudyTime = totalTime;

      // Get recent quizzes (last 5)
      this.recentQuizzes = quizzes
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 5);
    }
  }

  private loadFlashcardStats() {
    const decks = localStorage.getItem('studybuddy_flashcard_decks');
    if (decks) {
      const deckData = JSON.parse(decks);
      let totalReviews = 0;
      deckData.forEach((deck: any) => {
        if (deck.cards) {
          deck.cards.forEach((card: any) => {
            totalReviews += card.reviews || 0;
          });
        }
      });
      this.stats.flashcardsReviewed = totalReviews;
    }
  }

  private loadDocumentStats() {
    const documents = localStorage.getItem('studybuddy_documents');
    if (documents) {
      const docs = JSON.parse(documents);
      this.stats.documentsUploaded = docs.length;
    }
  }

  private loadActivityData() {
    const today = new Date();
    const activityMap = new Map<string, ActivityDay>();

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      activityMap.set(dateStr, {
        date: dateStr,
        quizzes: 0,
        flashcards: 0,
        intensity: 0.3
      });
    }

    // Load quiz activity
    const quizHistory = localStorage.getItem('studybuddy_quiz_history');
    if (quizHistory) {
      const quizzes: QuizHistory[] = JSON.parse(quizHistory);
      quizzes.forEach(quiz => {
        const dateStr = new Date(quiz.timestamp).toISOString().split('T')[0];
        const activity = activityMap.get(dateStr);
        if (activity) {
          activity.quizzes++;
        }
      });
    }

    // Load flashcard activity
    const decks = localStorage.getItem('studybuddy_flashcard_decks');
    if (decks) {
      const deckData = JSON.parse(decks);
      deckData.forEach((deck: any) => {
        if (deck.cards) {
          deck.cards.forEach((card: any) => {
            if (card.nextReview) {
              const reviewDate = new Date(card.nextReview);
              const dateStr = reviewDate.toISOString().split('T')[0];
              const activity = activityMap.get(dateStr);
              if (activity && card.reviews > 0) {
                activity.flashcards++;
              }
            }
          });
        }
      });
    }

    // Calculate intensity
    const maxActivity = Math.max(...Array.from(activityMap.values()).map(a => a.quizzes + a.flashcards), 1);
    activityMap.forEach(activity => {
      const total = activity.quizzes + activity.flashcards;
      activity.intensity = total > 0 ? 0.3 + (total / maxActivity) * 0.7 : 0.3;
    });

    this.activityDays = Array.from(activityMap.values());
  }

  private calculateStreaks() {
    const quizHistory = localStorage.getItem('studybuddy_quiz_history');
    if (!quizHistory) {
      this.stats.currentStreak = 0;
      this.stats.longestStreak = 0;
      return;
    }

    const quizzes: QuizHistory[] = JSON.parse(quizHistory);
    const dates = quizzes.map(q => new Date(q.timestamp).toISOString().split('T')[0]);
    const uniqueDates = [...new Set(dates)].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    if (uniqueDates.length === 0) {
      this.stats.currentStreak = 0;
      this.stats.longestStreak = 0;
      return;
    }

    // Calculate current streak
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString().split('T')[0];
    
    let currentStreak = 0;
    if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = new Date(uniqueDates[i - 1]);
        const currDate = new Date(uniqueDates[i]);
        const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    let longestStreak = 1;
    let tempStreak = 1;
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i - 1]);
      const currDate = new Date(uniqueDates[i]);
      const diffDays = Math.floor((prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }
    }

    this.stats.currentStreak = currentStreak;
    this.stats.longestStreak = Math.max(longestStreak, currentStreak);
  }

  getDayLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  }

  getBarHeight(day: ActivityDay): number {
    const total = day.quizzes + day.flashcards;
    const maxActivity = Math.max(...this.activityDays.map(d => d.quizzes + d.flashcards), 1);
    return (total / maxActivity) * 100;
  }

  formatDate(timestamp: number): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }

  formatStudyTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }

  private loadFocusSessions() {
    const sessions = localStorage.getItem('focusSessions');
    if (sessions) {
      this.focusSessions = JSON.parse(sessions)
        .sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
      
      // Calculate total focus time
      const totalMinutes = this.focusSessions.reduce((sum, session) => sum + session.duration, 0);
      this.stats.totalStudyTime += totalMinutes;
    }
  }

  formatFocusTime(minutes: number): string {
    if (minutes < 60) {
      return `${minutes}m`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours >= 24) {
        const days = Math.floor(hours / 24);
        const remainingHours = hours % 24;
        return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
      }
      return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
    }
  }

  formatSessionDate(dateStr: string): string {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) {
      return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  }
}
