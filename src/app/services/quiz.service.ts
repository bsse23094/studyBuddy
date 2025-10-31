import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Quiz, QuizAttempt, QuizAnswer, QuizQuestion, GradingResult } from '../models';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private currentQuizSubject = new BehaviorSubject<Quiz | null>(null);
  public currentQuiz$ = this.currentQuizSubject.asObservable();

  private currentAttemptSubject = new BehaviorSubject<QuizAttempt | null>(null);
  public currentAttempt$ = this.currentAttemptSubject.asObservable();

  private quizzesSubject = new BehaviorSubject<Quiz[]>([]);
  public quizzes$ = this.quizzesSubject.asObservable();

  constructor(
    private storage: StorageService,
    private api: ApiService,
    private userService: UserService
  ) {
    this.loadQuizzes();
  }

  private async loadQuizzes(): Promise<void> {
    await this.storage.init();
    const quizzes = await this.storage.getAllQuizzes();
    this.quizzesSubject.next(quizzes);
  }

  async generateQuiz(request: {
    sourceDocIds?: string[];
    topics?: string[];
    questionCount: number;
    difficulty?: 'easy' | 'medium' | 'hard';
  }): Promise<Quiz> {
    try {
      // Call API to generate quiz
      const response = await this.api.generateQuiz(request).toPromise();
      
      if (response && response.success && response.data) {
        const quiz: Quiz = response.data.quiz;
        await this.storage.saveQuiz(quiz);
        await this.loadQuizzes();
        return quiz;
      }
    } catch (error) {
      console.error('Quiz generation error:', error);
    }

    // Fallback: create a sample quiz
    const quiz: Quiz = {
      id: this.generateId(),
      title: `Quiz on ${request.topics?.join(', ') || 'Selected Topics'}`,
      description: 'Auto-generated quiz',
      questions: this.generateSampleQuestions(request.questionCount),
      createdAt: new Date().toISOString(),
      topics: request.topics,
      sourceDocIds: request.sourceDocIds,
      difficulty: request.difficulty
    };

    await this.storage.saveQuiz(quiz);
    await this.loadQuizzes();
    return quiz;
  }

  private generateSampleQuestions(count: number): QuizQuestion[] {
    const questions: QuizQuestion[] = [];
    for (let i = 0; i < count; i++) {
      questions.push({
        id: this.generateId(),
        prompt: `Sample question ${i + 1}?`,
        type: 'multiple-choice',
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctIndex: 0,
        explanation: 'This is a sample question for demonstration.',
        points: 1
      });
    }
    return questions;
  }

  async loadQuiz(id: string): Promise<void> {
    const quiz = await this.storage.getQuiz(id);
    if (quiz) {
      this.currentQuizSubject.next(quiz);
    }
  }

  async startAttempt(quizId: string): Promise<QuizAttempt> {
    const quiz = await this.storage.getQuiz(quizId);
    if (!quiz) {
      throw new Error('Quiz not found');
    }

    const user = this.userService.getCurrentUser();
    const attempt: QuizAttempt = {
      id: this.generateId(),
      quizId,
      userId: user?.id || 'anonymous',
      answers: [],
      score: 0,
      maxScore: quiz.questions.reduce((sum, q) => sum + (q.points || 1), 0),
      startedAt: new Date().toISOString()
    };

    this.currentAttemptSubject.next(attempt);
    return attempt;
  }

  async submitAnswer(questionId: string, answer: string | number): Promise<GradingResult> {
    const attempt = this.currentAttemptSubject.value;
    const quiz = this.currentQuizSubject.value;

    if (!attempt || !quiz) {
      throw new Error('No active attempt or quiz');
    }

    const question = quiz.questions.find(q => q.id === questionId);
    if (!question) {
      throw new Error('Question not found');
    }

    const result = this.gradeAnswer(question, answer);
    
    const quizAnswer: QuizAnswer = {
      questionId,
      userAnswer: answer,
      isCorrect: result.isCorrect,
      feedback: result.feedback,
      pointsEarned: result.pointsEarned
    };

    attempt.answers.push(quizAnswer);
    this.currentAttemptSubject.next({ ...attempt });

    // Record progress
    if (quiz.topics && quiz.topics.length > 0) {
      this.userService.recordQuizResult(quiz.topics[0], result.isCorrect);
    }

    return result;
  }

  async completeAttempt(): Promise<QuizAttempt> {
    const attempt = this.currentAttemptSubject.value;
    if (!attempt) {
      throw new Error('No active attempt');
    }

    attempt.completedAt = new Date().toISOString();
    attempt.score = attempt.answers.reduce((sum, a) => sum + a.pointsEarned, 0);
    
    const startTime = new Date(attempt.startedAt).getTime();
    const endTime = new Date(attempt.completedAt).getTime();
    attempt.timeSpent = Math.round((endTime - startTime) / 1000); // seconds

    await this.storage.saveQuizAttempt(attempt);
    this.currentAttemptSubject.next(null);

    return attempt;
  }

  private gradeAnswer(question: QuizQuestion, answer: string | number): GradingResult {
    const points = question.points || 1;
    let isCorrect = false;
    let feedback = '';

    if (question.type === 'multiple-choice') {
      isCorrect = answer === question.correctIndex;
      feedback = isCorrect 
        ? `Correct! ${question.explanation || ''}` 
        : `Incorrect. The correct answer was: ${question.options?.[question.correctIndex!]}. ${question.explanation || ''}`;
    } else if (question.type === 'short-answer') {
      // Simple string comparison (in production, use semantic similarity)
      const userAnswer = String(answer).trim().toLowerCase();
      const correctAnswer = (question.correctAnswer || '').trim().toLowerCase();
      isCorrect = userAnswer === correctAnswer || this.calculateSimilarity(userAnswer, correctAnswer) > 0.8;
      feedback = isCorrect
        ? `Correct! ${question.explanation || ''}`
        : `Your answer was close but not exact. Expected: ${question.correctAnswer}. ${question.explanation || ''}`;
    } else if (question.type === 'true-false') {
      isCorrect = String(answer).toLowerCase() === String(question.correctAnswer).toLowerCase();
      feedback = isCorrect
        ? `Correct! ${question.explanation || ''}`
        : `Incorrect. ${question.explanation || ''}`;
    }

    return {
      questionId: question.id,
      isCorrect,
      feedback,
      pointsEarned: isCorrect ? points : 0,
      correctAnswer: question.type === 'multiple-choice' 
        ? question.options?.[question.correctIndex!] 
        : question.correctAnswer
    };
  }

  private calculateSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  async getQuizHistory(quizId: string): Promise<QuizAttempt[]> {
    return this.storage.getQuizAttempts(quizId);
  }

  private generateId(): string {
    return `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
