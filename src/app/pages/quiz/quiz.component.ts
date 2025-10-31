import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  userAnswer?: number;
}

interface QuizResult {
  questions: QuizQuestion[];
  score?: number;
  totalQuestions?: number;
}

@Component({
  selector: 'app-quiz',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <!-- Header -->
      <div class="header">
        <h1><i class="fa-solid fa-file-lines"></i> Quiz Center</h1>
        <p>Test your knowledge with AI-generated quizzes</p>
      </div>

      <!-- Setup Phase -->
      @if (!quizStarted && !showResults) {
        <div class="content">
          <div class="setup-card">
            <h2>Create Your Quiz</h2>
            <p class="setup-subtitle">Generate custom quizzes on any topic</p>

            <div class="form-group">
              <label for="topic">
                <i class="fa-solid fa-book"></i>
                Topic or Subject
              </label>
              <input
                id="topic"
                type="text"
                [(ngModel)]="topic"
                placeholder="e.g., Photosynthesis, Calculus, World War II"
                class="input-field"
                (keyup.enter)="generateQuiz()"
              />
            </div>

            <div class="form-group">
              <label>
                <i class="fa-solid fa-sliders"></i>
                Difficulty Level
              </label>
              <div class="difficulty-options">
                @for (level of difficultyLevels; track level.value) {
                  <button
                    class="difficulty-btn"
                    [class.active]="difficulty === level.value"
                    (click)="difficulty = level.value"
                  >
                    <i [class]="level.icon"></i>
                    <span>{{ level.label }}</span>
                  </button>
                }
              </div>
            </div>

            <div class="form-group">
              <label>
                <i class="fa-solid fa-hashtag"></i>
                Number of Questions
              </label>
              <div class="question-count">
                <button class="count-btn" (click)="decrementQuestions()" [disabled]="questionCount <= 3">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span class="count-display">{{ questionCount }}</span>
                <button class="count-btn" (click)="incrementQuestions()" [disabled]="questionCount >= 10">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
            </div>

            <button
              class="generate-btn"
              (click)="generateQuiz()"
              [disabled]="!topic.trim() || isGenerating"
            >
              @if (isGenerating) {
                <span class="spinner"></span>
                <span>Generating Quiz...</span>
              } @else {
                <i class="fa-solid fa-wand-magic-sparkles"></i>
                <span>Generate Quiz</span>
              }
            </button>

            @if (errorMessage) {
              <div class="error-message">
                <i class="fa-solid fa-circle-exclamation"></i>
                {{ errorMessage }}
              </div>
            }
          </div>
        </div>
      }

      <!-- Quiz Phase -->
      @if (quizStarted && !showResults && questions.length > 0) {
        <div class="quiz-container">
          <div class="quiz-progress">
            <div class="progress-bar">
              <div class="progress-fill" [style.width.%]="(currentQuestionIndex / questions.length) * 100"></div>
            </div>
            <div class="progress-text">
              Question {{ currentQuestionIndex + 1 }} of {{ questions.length }}
            </div>
          </div>

          <div class="question-card">
            <h3 class="question-text">{{ currentQuestion.question }}</h3>

            <div class="options-list">
              @for (option of currentQuestion.options; track $index) {
                <button
                  class="option-btn"
                  [class.selected]="currentQuestion.userAnswer === $index"
                  (click)="selectAnswer($index)"
                  [disabled]="currentQuestion.userAnswer !== undefined"
                >
                  <span class="option-letter">{{ getOptionLetter($index) }}</span>
                  <span class="option-text">{{ option }}</span>
                  @if (currentQuestion.userAnswer !== undefined) {
                    @if ($index === currentQuestion.correctAnswer) {
                      <i class="fa-solid fa-circle-check correct-icon"></i>
                    } @else if ($index === currentQuestion.userAnswer) {
                      <i class="fa-solid fa-circle-xmark incorrect-icon"></i>
                    }
                  }
                </button>
              }
            </div>

            @if (currentQuestion.userAnswer !== undefined) {
              <div class="explanation-box">
                <h4><i class="fa-solid fa-lightbulb"></i> Explanation</h4>
                <p>{{ currentQuestion.explanation }}</p>
              </div>

              <div class="navigation-buttons">
                @if (currentQuestionIndex < questions.length - 1) {
                  <button class="nav-btn next-btn" (click)="nextQuestion()">
                    <span>Next Question</span>
                    <i class="fa-solid fa-arrow-right"></i>
                  </button>
                } @else {
                  <button class="nav-btn finish-btn" (click)="finishQuiz()">
                    <i class="fa-solid fa-flag-checkered"></i>
                    <span>Finish Quiz</span>
                  </button>
                }
              </div>
            }
          </div>
        </div>
      }

      <!-- Results Phase -->
      @if (showResults) {
        <div class="results-container">
          <div class="results-card">
            <div class="results-header">
              <div class="score-circle" [class.perfect]="scorePercentage === 100">
                <div class="score-value">{{ scorePercentage }}%</div>
                <div class="score-label">Score</div>
              </div>
              <h2>{{ getScoreMessage() }}</h2>
              <p class="results-stats">
                You got {{ correctAnswers }} out of {{ questions.length }} questions correct
              </p>
            </div>

            <div class="results-breakdown">
              <h3>Question Breakdown</h3>
              @for (question of questions; track $index) {
                <div class="result-item" [class.correct]="question.userAnswer === question.correctAnswer">
                  <div class="result-number">
                    @if (question.userAnswer === question.correctAnswer) {
                      <i class="fa-solid fa-check"></i>
                    } @else {
                      <i class="fa-solid fa-xmark"></i>
                    }
                  </div>
                  <div class="result-content">
                    <p class="result-question">{{ question.question }}</p>
                    @if (question.userAnswer !== question.correctAnswer) {
                      <p class="result-answer">
                        <span class="wrong">Your answer: {{ getOptionLetter(question.userAnswer!) }}</span>
                        <span class="correct-ans">Correct: {{ getOptionLetter(question.correctAnswer) }}</span>
                      </p>
                    }
                  </div>
                </div>
              }
            </div>

            <div class="results-actions">
              <button class="action-btn secondary" (click)="retryQuiz()">
                <i class="fa-solid fa-rotate-right"></i>
                <span>Try Again</span>
              </button>
              <button class="action-btn primary" (click)="newQuiz()">
                <i class="fa-solid fa-plus"></i>
                <span>New Quiz</span>
              </button>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      padding: 2rem 4rem;
      max-width: 1400px;
      margin: 0 auto;
      animation: fadeInUp 0.6s ease-out;
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

    .header {
      text-align: center;
      padding: 4rem 3rem;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      color: white;
      margin-bottom: 4rem;
    }

    .header h1 {
      font-size: 3rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.03em;
      color: #FFFFFF;
    }

    .header h1 i {
      color: #D4AF37;
      margin-right: 0.5rem;
    }

    .header p {
      margin: 0;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.25rem;
      letter-spacing: -0.011em;
    }

    .content {
      display: flex;
      justify-content: center;
    }

    /* Setup Card Styles */
    .setup-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 3rem;
      max-width: 700px;
      width: 100%;
    }

    .setup-card h2 {
      font-size: 2rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      margin-bottom: 0.5rem;
      color: #FFFFFF;
      letter-spacing: -0.03em;
    }

    .setup-subtitle {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 2.5rem;
      font-size: 1.0625rem;
      letter-spacing: -0.011em;
    }

    .form-group {
      margin-bottom: 2rem;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 600;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 1rem;
      letter-spacing: -0.011em;
    }

    .form-group label i {
      color: #D4AF37;
    }

    .input-field {
      width: 100%;
      padding: 1rem 1.25rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.0625rem;
      color: #FFFFFF;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.011em;
    }

    .input-field:focus {
      outline: none;
      border-color: #D4AF37;
      background: #161616;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
    }

    .input-field::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .difficulty-options {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .difficulty-btn {
      padding: 1rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.011em;
    }

    .difficulty-btn i {
      font-size: 1.5rem;
    }

    .difficulty-btn:hover {
      border-color: rgba(212, 175, 55, 0.3);
      background: #161616;
    }

    .difficulty-btn.active {
      background: rgba(212, 175, 55, 0.12);
      border-color: #D4AF37;
      color: #D4AF37;
    }

    .question-count {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
    }

    .count-btn {
      width: 48px;
      height: 48px;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 50%;
      color: #D4AF37;
      font-size: 1.125rem;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .count-btn:hover:not(:disabled) {
      background: rgba(212, 175, 55, 0.12);
      border-color: #D4AF37;
    }

    .count-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .count-display {
      font-size: 2rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      color: #FFFFFF;
      min-width: 60px;
      text-align: center;
      letter-spacing: -0.02em;
    }

    .generate-btn {
      width: 100%;
      padding: 1.125rem 2rem;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
      border: none;
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.0625rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      letter-spacing: -0.011em;
    }

    .generate-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    .generate-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0, 0, 0, 0.2);
      border-top-color: #000000;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .error-message {
      margin-top: 1.5rem;
      padding: 1rem 1.25rem;
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      color: #EF4444;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      letter-spacing: -0.011em;
    }

    /* Quiz Container Styles */
    .quiz-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .quiz-progress {
      margin-bottom: 2rem;
    }

    .progress-bar {
      height: 8px;
      background: #121212;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 0.75rem;
    }

    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #D4AF37 0%, #FFD700 100%);
      transition: width 0.3s ease;
    }

    .progress-text {
      text-align: center;
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9375rem;
      letter-spacing: -0.011em;
    }

    .question-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 3rem;
    }

    .question-text {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 2.5rem;
      line-height: 1.4;
      letter-spacing: -0.02em;
    }

    .options-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .option-btn {
      padding: 1.25rem 1.5rem;
      background: #121212;
      border: 2px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      text-align: left;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 1rem;
      position: relative;
    }

    .option-btn:hover:not(:disabled) {
      border-color: rgba(212, 175, 55, 0.3);
      background: #161616;
    }

    .option-btn.selected {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.08);
    }

    .option-btn:disabled {
      cursor: default;
    }

    .option-letter {
      width: 40px;
      height: 40px;
      background: #1A1A1A;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      color: #D4AF37;
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .option-text {
      flex: 1;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.0625rem;
      color: #FFFFFF;
      letter-spacing: -0.011em;
    }

    .correct-icon {
      color: #10B981;
      font-size: 1.5rem;
      margin-left: auto;
    }

    .incorrect-icon {
      color: #EF4444;
      font-size: 1.5rem;
      margin-left: auto;
    }

    .explanation-box {
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 16px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .explanation-box h4 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #D4AF37;
      margin-bottom: 0.75rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.02em;
    }

    .explanation-box p {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.6;
      margin: 0;
      letter-spacing: -0.011em;
    }

    .navigation-buttons {
      display: flex;
      justify-content: flex-end;
    }

    .nav-btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      letter-spacing: -0.011em;
    }

    .next-btn {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
    }

    .next-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    .finish-btn {
      background: linear-gradient(135deg, #10B981 0%, #059669 100%);
      color: #FFFFFF;
    }

    .finish-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(16, 185, 129, 0.4);
    }

    /* Results Styles */
    .results-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .results-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 3rem;
    }

    .results-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .score-circle {
      width: 160px;
      height: 160px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.2) 0%, rgba(255, 215, 0, 0.2) 100%);
      border: 3px solid #D4AF37;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .score-circle.perfect {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
      border-color: #10B981;
    }

    .score-value {
      font-family: 'Lexend', sans-serif;
      font-size: 3rem;
      font-weight: 700;
      color: #D4AF37;
      line-height: 1;
      letter-spacing: -0.03em;
    }

    .score-circle.perfect .score-value {
      color: #10B981;
    }

    .score-label {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1rem;
      color: rgba(255, 255, 255, 0.6);
      margin-top: 0.5rem;
      letter-spacing: -0.011em;
    }

    .results-header h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 2.25rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.75rem;
      letter-spacing: -0.03em;
    }

    .results-stats {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: -0.011em;
    }

    .results-breakdown {
      margin-bottom: 2.5rem;
    }

    .results-breakdown h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 1.5rem;
      letter-spacing: -0.02em;
    }

    .result-item {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      background: #121212;
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      margin-bottom: 1rem;
    }

    .result-item.correct {
      border-color: rgba(16, 185, 129, 0.3);
      background: rgba(16, 185, 129, 0.05);
    }

    .result-number {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: rgba(239, 68, 68, 0.2);
      color: #EF4444;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.125rem;
      flex-shrink: 0;
    }

    .result-item.correct .result-number {
      background: rgba(16, 185, 129, 0.2);
      color: #10B981;
    }

    .result-content {
      flex: 1;
    }

    .result-question {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1rem;
      color: #FFFFFF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.011em;
    }

    .result-answer {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      display: flex;
      gap: 1rem;
      letter-spacing: -0.011em;
    }

    .wrong {
      color: #EF4444;
    }

    .correct-ans {
      color: #10B981;
    }

    .results-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
    }

    .action-btn {
      padding: 1rem 2rem;
      border: none;
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.75rem;
      letter-spacing: -0.011em;
    }

    .action-btn.primary {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
    }

    .action-btn.primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    .action-btn.secondary {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
    }

    .action-btn.secondary:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
    }

    @media (max-width: 768px) {
      .page {
        padding: 1.5rem;
      }

      .header {
        padding: 3rem 2rem;
      }

      .header h1 {
        font-size: 2.25rem;
      }

      .setup-card,
      .question-card,
      .results-card {
        padding: 2rem 1.5rem;
      }

      .difficulty-options {
        grid-template-columns: 1fr;
      }

      .question-text {
        font-size: 1.25rem;
      }

      .results-actions {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class QuizComponent {
  // State
  topic = '';
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  questionCount = 5;
  isGenerating = false;
  quizStarted = false;
  showResults = false;
  errorMessage = '';

  // Quiz data
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;

  // Difficulty levels
  difficultyLevels = [
    { value: 'easy' as const, label: 'Easy', icon: 'fa-solid fa-leaf' },
    { value: 'medium' as const, label: 'Medium', icon: 'fa-solid fa-fire' },
    { value: 'hard' as const, label: 'Hard', icon: 'fa-solid fa-bolt' }
  ];

  constructor(private http: HttpClient) {}

  get currentQuestion(): QuizQuestion {
    return this.questions[this.currentQuestionIndex];
  }

  get correctAnswers(): number {
    return this.questions.filter(q => q.userAnswer === q.correctAnswer).length;
  }

  get scorePercentage(): number {
    return Math.round((this.correctAnswers / this.questions.length) * 100);
  }

  incrementQuestions(): void {
    if (this.questionCount < 10) this.questionCount++;
  }

  decrementQuestions(): void {
    if (this.questionCount > 3) this.questionCount--;
  }

  async generateQuiz(): Promise<void> {
    if (!this.topic.trim() || this.isGenerating) return;

    this.isGenerating = true;
    this.errorMessage = '';

    try {
      const response = await this.http.post<{ success: boolean; data?: { questions: QuizQuestion[] }; error?: string }>(
        'https://studybuddy-worker.bsse23094.workers.dev/api/quiz/generate',
        {
          topic: this.topic,
          difficulty: this.difficulty,
          count: this.questionCount
        }
      ).toPromise();

      if (response?.success && response.data?.questions) {
        this.questions = response.data.questions;
        this.quizStarted = true;
        this.currentQuestionIndex = 0;
      } else {
        this.errorMessage = response?.error || 'Failed to generate quiz. Please try again.';
      }
    } catch (error: any) {
      console.error('Quiz generation error:', error);
      this.errorMessage = error.error?.error || 'An error occurred while generating the quiz. Please try again.';
    } finally {
      this.isGenerating = false;
    }
  }

  selectAnswer(index: number): void {
    if (this.currentQuestion.userAnswer === undefined) {
      this.currentQuestion.userAnswer = index;
    }
  }

  nextQuestion(): void {
    if (this.currentQuestionIndex < this.questions.length - 1) {
      this.currentQuestionIndex++;
    }
  }

  finishQuiz(): void {
    this.showResults = true;
    this.quizStarted = false;
    this.saveQuizHistory();
  }

  private saveQuizHistory(): void {
    const quizHistory = {
      id: Date.now().toString(),
      topic: this.topic,
      difficulty: this.difficulty,
      score: this.scorePercentage,
      totalQuestions: this.questions.length,
      timestamp: Date.now(),
      timeTaken: 0 // Could track actual time if needed
    };

    const existingHistory = localStorage.getItem('studybuddy_quiz_history');
    const history = existingHistory ? JSON.parse(existingHistory) : [];
    history.push(quizHistory);
    localStorage.setItem('studybuddy_quiz_history', JSON.stringify(history));
  }

  retryQuiz(): void {
    this.questions.forEach(q => q.userAnswer = undefined);
    this.currentQuestionIndex = 0;
    this.showResults = false;
    this.quizStarted = true;
  }

  newQuiz(): void {
    this.questions = [];
    this.currentQuestionIndex = 0;
    this.showResults = false;
    this.quizStarted = false;
    this.topic = '';
    this.errorMessage = '';
  }

  getOptionLetter(index: number): string {
    return String.fromCharCode(65 + index); // A, B, C, D
  }

  getScoreMessage(): string {
    const percentage = this.scorePercentage;
    if (percentage === 100) return 'Perfect Score! Outstanding!';
    if (percentage >= 80) return 'Excellent Work!';
    if (percentage >= 60) return 'Good Job!';
    if (percentage >= 40) return 'Keep Practicing!';
    return 'Need More Study';
  }
}
