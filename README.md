# 📚 StudyBuddy - AI-Powered Study Platform

> **Your intelligent study companion for smarter, more effective learning**

[![Angular](https://img.shields.io/badge/Angular-17+-DD0031?style=for-the-badge&logo=angular)](https://angular.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5+-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=for-the-badge&logo=cloudflare)](https://workers.cloudflare.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**Live Demo:** [https://bsse23094.github.io/studyBuddy/](https://bsse23094.github.io/studyBuddy/)

StudyBuddy is a comprehensive, AI-powered educational platform that revolutionizes the way students learn. Built with Angular 17+ and powered by cutting-edge AI technologies, it provides an all-in-one study environment with intelligent tutoring, adaptive quizzes, smart flashcards, document management, focus timers, and detailed progress tracking.

---

## 🎯 Table of Contents

- [Features Overview](#-features-overview)
- [Architecture](#-architecture)
- [Frontend Deep Dive](#-frontend-deep-dive)
- [Backend & APIs](#-backend--apis)
- [Design System](#-design-system)
- [Installation & Setup](#-installation--setup)
- [Deployment](#-deployment)
- [Usage Guide](#-usage-guide)
- [Technologies Used](#-technologies-used)
- [Contributing](#-contributing)
- [License](#-license)

---

---

## ✨ Features Overview

### 🤖 AI Chat - Intelligent Tutoring Assistant
- **Context-Aware Conversations**: Multi-turn dialogue with memory of previous interactions
- **RAG Integration**: Retrieval-Augmented Generation using uploaded documents for accurate, sourced answers
- **Code Syntax Highlighting**: Beautiful code blocks with Prism.js integration
- **Markdown Rendering**: Full markdown support with math equations (KaTeX)
- **Conversation Management**: Save, load, delete, and organize chat sessions
- **Export Capabilities**: Download conversations as text files
- **Real-time Streaming**: Token-by-token response streaming for better UX
- **Error Handling**: Graceful error recovery with retry mechanisms

**Technical Implementation:**
- Uses Google Gemini 1.5 Flash API for fast, cost-effective responses
- Implements conversation history management with localStorage persistence
- Vector search integration for document-based Q&A
- Automatic context window management (up to 1M tokens)

### 🧠 Quiz Generator - Adaptive Testing System
- **AI-Generated Quizzes**: Create quizzes from any topic or uploaded documents
- **Multiple Question Types**: Multiple choice, true/false, and short answer
- **Difficulty Levels**: Easy, Medium, Hard - adaptive based on performance
- **Real-time Scoring**: Instant feedback with detailed explanations
- **Performance Analytics**: Track scores, identify weak areas, and monitor improvement
- **Quiz History**: Review past attempts with full answer breakdowns
- **Timed Mode**: Optional time limits for exam preparation
- **Randomization**: Question and answer order shuffling for varied practice

**Technical Implementation:**
- JSON-based quiz generation via AI API
- State management for quiz sessions (in-progress, completed)
- Scoring algorithm with weighted difficulty factors
- localStorage for quiz history and analytics
- Performance metrics calculation (accuracy, speed, consistency)

### 📇 Flashcards - Spaced Repetition Learning
- **Smart Study System**: SM-2 algorithm for optimal review scheduling
- **Deck Organization**: Create, organize, and categorize flashcard sets
- **Multi-format Cards**: Support for text, markdown, and code snippets
- **Study Modes**: 
  - **Learn Mode**: First-time card review
  - **Review Mode**: Spaced repetition for mastery
  - **Rapid Fire**: Quick practice sessions
- **Progress Tracking**: Track cards learned, mastered, and needing review
- **Confidence Rating**: Self-assess understanding (Again, Hard, Good, Easy)
- **Visual Progress**: Charts showing mastery distribution and study streaks
- **Bulk Import**: Upload cards via CSV or generate from documents

**Technical Implementation:**
- SuperMemo 2 (SM-2) spaced repetition algorithm
- Interval calculation based on ease factor and repetition count
- Card state management (new, learning, reviewing, mastered)
- Due date calculation and scheduling system
- Performance analytics with streak tracking

### 📅 Study Routine - Personalized Schedule Planner
- **Smart Scheduling**: AI-powered study plan generation based on goals
- **Time Management**: Define study hours, work hours, and break times
- **Activity Planning**: Schedule study sessions, work blocks, and personal time
- **24-Hour Timeline**: Visual representation of daily schedule
- **12-Hour Format**: User-friendly AM/PM time display
- **Activity Descriptions**: Detailed breakdown of each scheduled block
- **Morning/Afternoon/Evening Indicators**: Context-aware time period labels
- **Flexible Adjustments**: Increment/decrement study and work hours easily
- **Routine Templates**: Save and reuse successful schedules

**Technical Implementation:**
- Time calculation utilities (formatTime, getTimeRange, formatDuration)
- Activity generation algorithm based on available time slots
- Time period classification logic (Morning, Afternoon, Evening)
- localStorage persistence for routine preferences
- Responsive timeline visualization with gold-themed design

### 📁 Documents - Advanced File Management
- **PDF Viewer**: In-browser PDF rendering without downloads
- **Zoom Controls**: 50% to 200% zoom levels for comfortable reading
- **Page Navigation**: Jump to specific pages with keyboard shortcuts
- **Fullscreen Mode**: Distraction-free reading experience
- **Document Upload**: Drag-and-drop or click-to-upload interface
- **Search Functionality**: Find specific content within documents
- **Folder Organization**: Hierarchical folder structure for categorization
- **Metadata Management**: Track upload date, file size, and last accessed
- **Sharing Options**: Share documents with study groups (future feature)
- **AI Integration**: Extract text for quiz/flashcard generation

**Technical Implementation:**
- DomSanitizer for safe PDF URL handling
- iframe-based PDF rendering with PostMessage API
- Zoom state management with bounds checking (50-200%)
- Page navigation with total page calculation
- Fullscreen API for immersive viewing
- File upload with FormData and base64 encoding
- Document metadata storage in localStorage

### ⏱️ Focus Timer - Pomodoro & Custom Sessions
- **Customizable Timers**: Set any duration (15, 25, 45, 60+ minutes)
- **4 Clock Styles**: 
  - **Digital**: BIG BOLD segmented display (14rem font)
  - **Circular**: Animated progress ring (8rem display)
  - **Minimal**: Ultra-clean single number (18rem font)
  - **Flip**: Card-flip style display (11rem numbers)
- **8 Color Themes**: Gold, Blue, Green, Purple, Pink, Orange, Red, Cyan
- **Topic Tracking**: Log what you're studying before each session
- **Subtopic Checklist**: Mark completed topics after session ends
- **Pause/Resume**: Flexible control with elegant pause overlay
- **Session History**: Track all focus sessions with timestamps
- **Progress Integration**: Sessions automatically logged to progress page
- **Audio Notifications**: Completion sound alerts
- **Keyboard Shortcuts**: Space to pause/resume, Esc to stop

**Technical Implementation:**
- Interval-based countdown with 1-second precision
- localStorage for clock style and color preferences
- SVG circular progress animation with stroke-dashoffset
- CSS font-weight: 900 for BOLD aesthetic (Lexend font)
- Pause overlay with backdrop-filter: blur(20px)
- Session data model with topic, duration, subtopics, timestamps
- Web Audio API for completion sounds
- Responsive design with font-size scaling (18rem → 8rem on mobile)

### 📊 Progress Tracking - Comprehensive Analytics
- **Overview Dashboard**: Quick stats on study time, quizzes completed, streaks
- **Quiz Performance**: Detailed breakdown of scores, accuracy trends
- **Flashcard Mastery**: Track cards learned, review progress, mastery distribution
- **Focus Sessions**: Complete history of all timer sessions with topics covered
- **Topic Analysis**: Identify strengths and weaknesses across subjects
- **Time Analytics**: Daily, weekly, monthly study time aggregation
- **Streak Tracking**: Maintain study momentum with streak counters
- **Visual Charts**: Interactive graphs for data visualization (Chart.js)
- **Goal Setting**: Set and track study goals
- **Export Reports**: Download progress reports as PDF or CSV

**Technical Implementation:**
- Aggregation functions for quiz scores, flashcard stats, focus time
- Date-based filtering for time range analysis
- Streak calculation with localStorage persistence
- Chart.js integration for visual analytics
- Topic clustering algorithm for subject identification
- Performance metrics: average score, improvement rate, consistency
- Session filtering by date, topic, duration

### 📄 Legal & Information Pages
- **Privacy Policy**: Comprehensive data protection and usage policies
- **Terms of Service**: Detailed terms, acceptable use, and disclaimers
- **FAQ**: 16+ frequently asked questions across 6 categories
- **Interactive FAQ**: Expandable accordion-style Q&A with category filtering
- **Contact Information**: Direct email and GitHub support links

**Technical Implementation:**
- Standalone Angular components for each page
- Category-based FAQ filtering system
- Smooth expand/collapse animations with max-height transitions
- Responsive card layouts with gold-themed design
- RouterLink integration for seamless navigation

---

**API Integration:**
```typescript
async sendMessage(message: string, conversationId: string) {
  const response = await fetch('https://studybuddy-worker.bsse23094.workers.dev/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversationId,
      history: this.getConversationHistory(conversationId)
    })
  });
  
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  // Stream response token by token
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    this.currentResponse += chunk;
    // Update UI in real-time
  }
}
```

**State Management:**
- Conversation history stored in localStorage
- Active conversation tracked in component state
- Message queue for reliable delivery
- Error recovery with automatic retry

**Performance Optimizations:**
- Virtual scrolling for long conversations (1000+ messages)
- Debounced typing indicators
- Lazy loading of conversation history
- Efficient DOM updates with OnPush change detection

### Quiz Component (`quiz.component.ts`)

**Quiz Generation Algorithm:**
```typescript
async generateQuiz(topic: string, difficulty: string, count: number) {
  const prompt = `Generate ${count} ${difficulty} questions about ${topic}.
  Format: JSON array with objects containing:
  - question: string
  - options: string[] (4 options)
  - correctAnswer: number (0-3 index)
  - explanation: string
  - difficulty: number (1-3)`;
  
  const response = await this.aiService.generate(prompt);
  return JSON.parse(response);
}
```

**Scoring System:**
- Base score: 100 points per question
- Difficulty multiplier: Easy (1x), Medium (1.5x), Hard (2x)
- Time bonus: Extra points for fast answers
- Streak bonus: Consecutive correct answers
- Accuracy calculation: (correct / total) * 100

**Analytics Tracking:**
```typescript
interface QuizAnalytics {
  totalQuizzes: number;
  averageScore: number;
  topicBreakdown: Map<string, {
    attempts: number;
    averageScore: number;
    improvement: number;
  }>;
  timeSpent: number;
  accuracyTrend: number[];
}
```

### Flashcard Component (`flashcards.component.ts`)

**SM-2 Algorithm Implementation:**
```typescript
calculateNextReview(card: Flashcard, quality: number): Date {
  if (quality < 3) {
    // Card failed - reset interval
    card.interval = 1;
    card.repetition = 0;
  } else {
    // Card passed
    if (card.repetition === 0) {
      card.interval = 1;
    } else if (card.repetition === 1) {
      card.interval = 6;
    } else {
      card.interval = Math.round(card.interval * card.easeFactor);
    }
    card.repetition++;
    
    // Update ease factor
    card.easeFactor = card.easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    if (card.easeFactor < 1.3) {
      card.easeFactor = 1.3;
    }
  }
  
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + card.interval);
  return nextReview;
}
```

**Study Session Management:**
- Queue system for due cards
- Randomization to prevent pattern memorization
- Session statistics (cards studied, time spent, accuracy)
- Adaptive difficulty based on performance

### Focus Timer Component (`focus.component.ts`)

**Clock Rendering Logic:**
```typescript
// Digital Clock - Segmented Display
formatDigitalTime(): { minutes: string[], seconds: string[] } {
  const mins = Math.floor(this.timeRemaining / 60).toString().padStart(2, '0');
  const secs = (this.timeRemaining % 60).toString().padStart(2, '0');
  return {
    minutes: mins.split(''),
    seconds: secs.split('')
  };
}

// Circular Clock - SVG Progress Ring
get circleProgress(): number {
  const radius = 236;
  const circumference = 2 * Math.PI * radius;
  return circumference * (1 - this.progress);
}

// Minimal Clock - Simple Display
get minimalTimeDisplay(): string {
  const mins = Math.floor(this.timeRemaining / 60);
  const secs = this.timeRemaining % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Flip Clock - Card Flip Animation
get flipMinutes(): number {
  return Math.floor(this.timeRemaining / 60);
}
get flipSeconds(): number {
  return this.timeRemaining % 60;
}
```

**Session Data Model:**
```typescript
interface FocusSession {
  topic: string;
  duration: number;          // minutes
  subtopics: string[];       // completed subtopics
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}
```

**Clock Style System:**
- 4 distinct clock designs with unique rendering
- Real-time style switching without session interruption
- Color customization with 8 preset themes
- Responsive scaling for mobile devices
- BIG BOLD fonts (14rem-18rem) for maximum impact

### Document Component (`documents.component.ts`)

**PDF Viewer Implementation:**
```typescript
getPdfUrl(url: string): SafeResourceUrl {
  // Sanitize URL for iframe embedding
  const viewerUrl = `${url}#zoom=${this.zoomLevel}&page=${this.currentPage}`;
  return this.sanitizer.bypassSecurityTrustResourceUrl(viewerUrl);
}

zoomIn() {
  if (this.zoomLevel < 200) {
    this.zoomLevel += 10;
    this.updatePdfView();
  }
}

toggleFullscreen() {
  const elem = document.querySelector('.pdf-viewer');
  if (!document.fullscreenElement) {
    elem.requestFullscreen();
    this.isFullscreen = true;
  } else {
    document.exitFullscreen();
    this.isFullscreen = false;
  }
}
```

**File Upload Handling:**
```typescript
async uploadDocument(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('metadata', JSON.stringify({
    name: file.name,
    size: file.size,
    type: file.type,
    uploadDate: new Date()
  }));
  
  const response = await fetch('/api/documents/upload', {
    method: 'POST',
    body: formData
  });
  
  return await response.json();
}
```

### Progress Component (`progress.component.ts`)

**Analytics Calculation:**
```typescript
calculateOverallStats() {
  // Quiz statistics
  const quizzes = this.getQuizHistory();
  const totalQuizzes = quizzes.length;
  const averageScore = quizzes.reduce((sum, q) => sum + q.score, 0) / totalQuizzes;
  
  // Flashcard statistics
  const flashcards = this.getFlashcardStats();
  const masteredCards = flashcards.filter(c => c.interval >= 21).length;
  
  // Focus session statistics
  const sessions = this.getFocusHistory();
  const totalFocusTime = sessions.reduce((sum, s) => sum + s.duration, 0);
  
  // Streak calculation
  const streak = this.calculateStudyStreak();
  
  return {
    totalQuizzes,
    averageScore,
    masteredCards,
    totalFocusTime,
    currentStreak: streak.current,
    longestStreak: streak.longest
  };
}

calculateStudyStreak(): { current: number, longest: number } {
  const dates = this.getAllActivityDates().sort();
  let current = 0;
  let longest = 0;
  let tempStreak = 1;
  
  for (let i = 1; i < dates.length; i++) {
    const diffDays = (dates[i] - dates[i-1]) / (1000 * 60 * 60 * 24);
    if (diffDays === 1) {
      tempStreak++;
      longest = Math.max(longest, tempStreak);
    } else if (diffDays > 1) {
      tempStreak = 1;
    }
  }
  
  // Check if streak is current
  const today = new Date();
  const lastActivity = dates[dates.length - 1];
  const daysSinceLastActivity = (today - lastActivity) / (1000 * 60 * 60 * 24);
  current = daysSinceLastActivity <= 1 ? tempStreak : 0;
  
  return { current, longest };
}
```

**Focus Session Integration:**
```typescript
getFocusSessions(): FocusSession[] {
  const sessions = localStorage.getItem('focusSessions');
  return sessions ? JSON.parse(sessions) : [];
}

formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

getTopicSummary(): Map<string, { sessions: number, totalTime: number }> {
  const sessions = this.getFocusSessions();
  const summary = new Map();
  
  sessions.forEach(session => {
    if (summary.has(session.topic)) {
      const existing = summary.get(session.topic);
      summary.set(session.topic, {
        sessions: existing.sessions + 1,
        totalTime: existing.totalTime + session.duration
      });
    } else {
      summary.set(session.topic, {
        sessions: 1,
        totalTime: session.duration
      });
    }
  });
  
  return summary;
}
```

---

## 🔌 Backend & APIs

### Cloudflare Worker Architecture

**Entry Point (`worker/src/index.ts`):**
```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    
    // CORS handling
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
          'Access-Control-Allow-Headers': 'Content-Type'
        }
      });
    }
    
    // Route handling
    switch (url.pathname) {
      case '/chat':
        return handleChat(request, env);
      case '/quiz/generate':
        return handleQuizGeneration(request, env);
      case '/documents/upload':
        return handleDocumentUpload(request, env);
      case '/health':
        return new Response(JSON.stringify({ status: 'ok' }));
      default:
        return new Response('Not Found', { status: 404 });
    }
  }
};
```

### API Endpoints

#### 1. Chat Endpoint (`/chat`)
**Request:**
```typescript
interface ChatRequest {
  message: string;
  conversationId: string;
  history: Array<{ role: 'user' | 'assistant', content: string }>;
  useRAG?: boolean;          // Use document context
  documentIds?: string[];    // Specific documents to reference
}
```

**Response:**
```typescript
// Streaming response with Server-Sent Events
interface ChatResponse {
  token: string;           // Individual token
  done: boolean;          // Completion flag
  conversationId: string;
  metadata?: {
    model: string;        // e.g., "gemini-1.5-flash"
    tokensUsed: number;
    sources?: string[];   // Referenced documents
  };
}
```

**Implementation:**
```typescript
async function handleChat(request: Request, env: Env): Promise<Response> {
  const { message, conversationId, history, useRAG, documentIds } = await request.json();
  
  // Build context from documents if RAG is enabled
  let context = '';
  if (useRAG && documentIds) {
    context = await getDocumentContext(documentIds, message, env);
  }
  
  // Construct prompt with history and context
  const prompt = buildPrompt(message, history, context);
  
  // Stream response from Gemini API
  const stream = await env.GEMINI_API.generate({
    model: 'gemini-1.5-flash',
    prompt,
    stream: true,
    temperature: 0.7,
    maxTokens: 2048
  });
  
  // Return streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    }
  });
}
```

#### 2. Quiz Generation Endpoint (`/quiz/generate`)
**Request:**
```typescript
interface QuizGenerationRequest {
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionCount: number;
  questionTypes?: ('multiple-choice' | 'true-false' | 'short-answer')[];
  useDocuments?: boolean;
  documentIds?: string[];
}
```

**Response:**
```typescript
interface QuizGenerationResponse {
  quizId: string;
  questions: Question[];
  metadata: {
    generatedAt: Date;
    topic: string;
    difficulty: string;
    estimatedTime: number;  // minutes
  };
}

interface Question {
  id: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  difficulty: number;
  points: number;
}
```

**Implementation:**
```typescript
async function handleQuizGeneration(request: Request, env: Env): Promise<Response> {
  const { topic, difficulty, questionCount, useDocuments, documentIds } = await request.json();
  
  // Get document context if requested
  let documentContent = '';
  if (useDocuments && documentIds) {
    documentContent = await extractDocumentContent(documentIds, env);
  }
  
  // Generate quiz using AI
  const prompt = `Generate a ${difficulty} quiz about ${topic} with ${questionCount} questions.
${documentContent ? `Base questions on this content:\n${documentContent}` : ''}

Return JSON array of questions with format:
{
  "question": "Question text",
  "options": ["A", "B", "C", "D"],
  "correctAnswer": 0,
  "explanation": "Why this is correct",
  "difficulty": 1-3,
  "points": 100
}`;
  
  const response = await env.GEMINI_API.generate({
    model: 'gemini-1.5-flash',
    prompt,
    temperature: 0.8,
    responseFormat: 'json'
  });
  
  const questions = JSON.parse(response.text);
  const quizId = generateUUID();
  
  // Store quiz in KV storage
  await env.QUIZ_STORAGE.put(`quiz:${quizId}`, JSON.stringify({
    quizId,
    questions,
    metadata: {
      generatedAt: new Date(),
      topic,
      difficulty,
      estimatedTime: questionCount * 1.5
    }
  }));
  
  return new Response(JSON.stringify({ quizId, questions, metadata }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

#### 3. Document Upload Endpoint (`/documents/upload`)
**Request:**
```typescript
// Multipart form data
interface DocumentUploadRequest {
  file: File;
  metadata: {
    name: string;
    folder?: string;
    tags?: string[];
  };
}
```

**Response:**
```typescript
interface DocumentUploadResponse {
  documentId: string;
  url: string;
  thumbnail?: string;
  extractedText?: string;
  metadata: {
    name: string;
    size: number;
    type: string;
    uploadDate: Date;
    pageCount?: number;
  };
}
```

**Implementation:**
```typescript
async function handleDocumentUpload(request: Request, env: Env): Promise<Response> {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const metadata = JSON.parse(formData.get('metadata') as string);
  
  const documentId = generateUUID();
  const fileBuffer = await file.arrayBuffer();
  
  // Store file in R2 bucket
  await env.DOCUMENT_STORAGE.put(`documents/${documentId}`, fileBuffer, {
    httpMetadata: {
      contentType: file.type
    }
  });
  
  // Extract text for RAG (if PDF)
  let extractedText = '';
  if (file.type === 'application/pdf') {
    extractedText = await extractPDFText(fileBuffer);
    
    // Store in vector database for semantic search
    await storeInVectorDB(documentId, extractedText, env);
  }
  
  // Generate thumbnail
  const thumbnail = await generateThumbnail(fileBuffer, file.type);
  
  // Store metadata in KV
  await env.DOCUMENT_METADATA.put(`doc:${documentId}`, JSON.stringify({
    documentId,
    name: metadata.name,
    size: file.size,
    type: file.type,
    uploadDate: new Date(),
    folder: metadata.folder,
    tags: metadata.tags
  }));
  
  return new Response(JSON.stringify({
    documentId,
    url: `https://studybuddy.r2.dev/documents/${documentId}`,
    thumbnail,
    extractedText: extractedText.substring(0, 500), // Preview
    metadata: {
      name: metadata.name,
      size: file.size,
      type: file.type,
      uploadDate: new Date()
    }
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
```

### RAG (Retrieval-Augmented Generation)

**Vector Search Implementation:**
```typescript
async function getDocumentContext(
  documentIds: string[],
  query: string,
  env: Env
): Promise<string> {
  // Generate query embedding
  const queryEmbedding = await env.EMBEDDING_API.embed(query);
  
  // Search for relevant chunks in vector database
  const results = await env.VECTOR_DB.search({
    vector: queryEmbedding,
    filter: { documentId: { $in: documentIds } },
    limit: 5,
    minScore: 0.7
  });
  
  // Concatenate relevant chunks
  const context = results
    .map(r => r.text)
    .join('\n\n');
  
  return context;
}
```

**Document Processing Pipeline:**
1. **Upload**: File received and stored in R2
2. **Text Extraction**: PDF parsed to extract text content
3. **Chunking**: Text split into semantic chunks (512 tokens)
4. **Embedding**: Each chunk converted to vector embedding
5. **Storage**: Vectors stored in vector database with metadata
6. **Indexing**: Full-text search index updated

### API Authentication & Rate Limiting

**API Key Management:**
```typescript
async function validateAPIKey(request: Request, env: Env): Promise<boolean> {
  const apiKey = request.headers.get('X-API-Key');
  if (!apiKey) return false;
  
  const validKey = await env.API_KEYS.get(apiKey);
  return validKey !== null;
}
```

**Rate Limiting:**
```typescript
async function checkRateLimit(userId: string, env: Env): Promise<boolean> {
  const key = `ratelimit:${userId}`;
  const current = await env.RATE_LIMITER.get(key);
  
  if (!current) {
    // First request - set counter
    await env.RATE_LIMITER.put(key, '1', { expirationTtl: 60 });
    return true;
  }
  
  const count = parseInt(current);
  if (count >= 100) {  // 100 requests per minute
    return false;
  }
  
  await env.RATE_LIMITER.put(key, (count + 1).toString(), { expirationTtl: 60 });
  return true;
}
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+
- Git
- Cloudflare account (for deployment)
- Google AI API key (for Gemini)

### Frontend Architecture (Angular 17+)

```
studyBuddy/
├── src/
│   ├── app/
│   │   ├── components/          # Reusable UI components
│   │   │   └── footer/          # Universal footer component
│   │   ├── pages/               # Feature pages (routes)
│   │   │   ├── home/            # Landing page
│   │   │   ├── chat/            # AI Chat interface
│   │   │   ├── quiz/            # Quiz generator & taker
│   │   │   ├── flashcards/      # Flashcard study system
│   │   │   ├── routine/         # Study schedule planner
│   │   │   ├── documents/       # Document manager & PDF viewer
│   │   │   ├── focus/           # Focus timer with custom clocks
│   │   │   ├── progress/        # Analytics dashboard
│   │   │   ├── settings/        # User preferences
│   │   │   ├── privacy/         # Privacy policy
│   │   │   ├── terms/           # Terms of service
│   │   │   └── faq/             # Frequently asked questions
│   │   ├── services/            # Business logic & API calls
│   │   │   ├── chat.service.ts      # AI chat API integration
│   │   │   ├── quiz.service.ts      # Quiz generation & scoring
│   │   │   ├── flashcard.service.ts # Flashcard management & SM-2
│   │   │   ├── routine.service.ts   # Schedule generation
│   │   │   ├── document.service.ts  # File upload & management
│   │   │   └── progress.service.ts  # Analytics aggregation
│   │   ├── models/              # TypeScript interfaces
│   │   │   ├── chat.model.ts        # Message, Conversation
│   │   │   ├── quiz.model.ts        # Quiz, Question, Answer
│   │   │   ├── flashcard.model.ts   # Card, Deck, StudySession
│   │   │   ├── routine.model.ts     # Schedule, Activity
│   │   │   ├── document.model.ts    # Document, Folder
│   │   │   └── focus.model.ts       # FocusSession, ClockStyle
│   │   ├── app.component.ts     # Root component
│   │   ├── app.routes.ts        # Route configuration
│   │   └── app.config.ts        # App-wide configuration
│   ├── styles.css               # Global styles
│   └── index.html               # Entry HTML
├── public/                      # Static assets
├── worker/                      # Cloudflare Worker (backend)
│   ├── src/
│   │   └── index.ts            # Worker entry point
│   ├── wrangler.toml           # Worker configuration
│   └── package.json            # Worker dependencies
├── angular.json                 # Angular CLI configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Project dependencies
```

### Component Architecture

**Standalone Components Pattern:**
- All components are standalone (no NgModules)
- Direct imports of dependencies
- Lazy loading for optimal performance
- Tree-shakable for minimal bundle size

**State Management:**
- Services with RxJS for reactive state
- localStorage for persistence
- In-memory caching for performance
- Event-driven architecture for real-time updates

**Routing Strategy:**
- Lazy-loaded routes for code splitting
- Route guards for authentication (future)
- Preloading strategy for better UX
- Deep linking support for shareable content

---

## 🎨 Design System

### Typography
- **Primary Font**: Lexend (headings, UI elements)
  - Weight: 700-900 for BOLD aesthetic
  - Optimized for readability and modern look
- **Body Font**: Instrument Sans (body text, descriptions)
  - Weight: 400-600 for comfortable reading
- **Monospace Font**: JetBrains Mono (code, timers)
  - Used for digital displays and code blocks

### Color Palette
```css
/* Primary Colors */
--gold-primary: #D4AF37;        /* Main accent color */
--gold-light: #F4D03F;          /* Hover states, gradients */
--gold-dark: #B8941E;           /* Active states */

/* Background Colors */
--bg-primary: #0A0A0A;          /* Main background */
--bg-secondary: #1A1A1A;        /* Cards, sections */
--bg-tertiary: rgba(255, 255, 255, 0.05); /* Subtle overlays */

/* Text Colors */
--text-primary: #FFFFFF;         /* Primary text */
--text-secondary: rgba(255, 255, 255, 0.8);  /* Body text */
--text-tertiary: rgba(255, 255, 255, 0.6);   /* Muted text */
--text-quaternary: rgba(255, 255, 255, 0.4); /* Disabled text */

/* Semantic Colors */
--success: #22C55E;             /* Success states */
--error: #EF4444;               /* Error states */
--warning: #FB923C;             /* Warning states */
--info: #3B82F6;                /* Info states */
```

### Design Principles
1. **BOLD Typography**: Heavy font weights (900) for visual impact
2. **Minimal UI**: Clean interfaces with ample whitespace
3. **Dark Theme**: Easy on the eyes for extended study sessions
4. **Gold Accents**: Luxurious, premium feel throughout
5. **Smooth Animations**: 280ms cubic-bezier transitions
6. **Responsive Design**: Mobile-first with breakpoints at 640px, 768px, 1024px
7. **Accessibility**: WCAG AA compliant with proper contrast ratios

### Component Styling Patterns
```css
/* Card Pattern */
.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
}

/* Button Pattern */
.btn-primary {
  background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
  color: #0A0A0A;
  font-weight: 600;
  padding: 0.875rem 2rem;
  border-radius: 8px;
  transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Input Pattern */
.input {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: 8px;
  color: #FFFFFF;
  padding: 0.875rem 1rem;
}
```

---

## 🔧 Frontend Deep Dive

### AI Chat Component (`chat.component.ts`)

**Key Features:**
- Multi-turn conversation management
- Real-time message streaming
- Code syntax highlighting with Prism.js
- Markdown rendering with marked.js
- Math equation support with KaTeX

**API Integration:**

### Prerequisites
- Node.js 18+ and npm
- Angular CLI 17+
- Git
- Cloudflare account (for deployment)
- Google AI API key (for Gemini)

### Local Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/bsse23094/studyBuddy.git
cd studyBuddy
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install worker dependencies**
```bash
cd worker
npm install
cd ..
```

4. **Configure environment variables**

Create `.env` file in root:
```env
GEMINI_API_KEY=your_api_key_here
CLOUDFLARE_ACCOUNT_ID=your_account_id
CLOUDFLARE_API_TOKEN=your_api_token
```

Create `worker/.dev.vars` file:
```env
GEMINI_API_KEY=your_api_key_here
```

5. **Start development servers**

Frontend (Angular):
```bash
ng serve
```
Navigate to `http://localhost:4200/`

Backend (Cloudflare Worker):
```bash
cd worker
npm run dev
```
Worker runs on `http://localhost:8787`

### Building for Production

**Frontend Build:**
```bash
ng build --configuration production --base-href=/studyBuddy/
```

Output: `dist/study-buddy/browser/`

**Worker Build:**
```bash
cd worker
npm run build
```

Output: `worker/dist/`

---

## 📦 Deployment

### Frontend Deployment (GitHub Pages)

1. **Build the application**
```bash
ng build --configuration production --base-href=/studyBuddy/
```

2. **Deploy to GitHub Pages**
```bash
npx angular-cli-ghpages --dir=dist/study-buddy/browser
```

Or use GitHub Actions (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build -- --base-href=/studyBuddy/
      
      - name: Deploy
        uses: JamesIves/github-pages-deploy-action@v4
        with:
          branch: gh-pages
          folder: dist/study-buddy/browser
```

**Live URL:** https://bsse23094.github.io/studyBuddy/

### Backend Deployment (Cloudflare Workers)

1. **Configure `worker/wrangler.toml`**
```toml
name = "studybuddy-worker"
main = "src/index.ts"
compatibility_date = "2024-01-01"

[env.production]
workers_dev = false
route = "https://studybuddy-worker.bsse23094.workers.dev/*"

[[kv_namespaces]]
binding = "QUIZ_STORAGE"
id = "your_kv_namespace_id"

[[kv_namespaces]]
binding = "DOCUMENT_METADATA"
id = "your_kv_namespace_id"

[[r2_buckets]]
binding = "DOCUMENT_STORAGE"
bucket_name = "studybuddy-documents"

[vars]
ENVIRONMENT = "production"
```

2. **Deploy worker**
```bash
cd worker
npx wrangler deploy
```

**Live URL:** https://studybuddy-worker.bsse23094.workers.dev

### Environment Configuration

**Production Environment Variables:**
- `GEMINI_API_KEY`: Google AI API key (secret)
- `VECTOR_DB_URL`: Vector database endpoint
- `EMBEDDING_MODEL`: Model for text embeddings
- `ALLOWED_ORIGINS`: CORS allowed origins

**Cloudflare Bindings:**
- `QUIZ_STORAGE`: KV namespace for quiz data
- `DOCUMENT_METADATA`: KV namespace for document metadata
- `DOCUMENT_STORAGE`: R2 bucket for file storage
- `RATE_LIMITER`: KV namespace for rate limiting
- `VECTOR_DB`: Vector database binding

---

## 📖 Usage Guide

### Getting Started

1. **Visit the application**
   - Go to https://bsse23094.github.io/studyBuddy/
   - Explore the landing page features

2. **Start with AI Chat**
   - Click "Chat" in navigation
   - Ask questions about any topic
   - Use markdown for formatting

3. **Generate a Quiz**
   - Navigate to "Quiz" section
   - Enter topic and select difficulty
   - Take the quiz and review results

4. **Create Flashcards**
   - Go to "Flashcards" page
   - Create a new deck
   - Add cards manually or generate with AI
   - Start studying with spaced repetition

5. **Set Up Study Routine**
   - Visit "Routine" page
   - Enter study and work hours
   - View generated schedule
   - Adjust times as needed

6. **Upload Documents**
   - Navigate to "Documents"
   - Drag and drop PDF files
   - View PDFs in-browser with zoom
   - Use documents for AI-enhanced studying

7. **Use Focus Timer**
   - Go to "Focus" page
   - Enter study topic and duration
   - Choose clock style and color
   - Start timer and stay focused
   - Mark completed subtopics

8. **Track Progress**
   - Check "Progress" dashboard
   - View quiz scores and flashcard stats
   - See focus session history
   - Monitor study streaks

### Advanced Features

**AI Chat Tips:**
- Use `/help` for command list
- Upload documents for context-aware answers
- Export conversations for later reference
- Create new conversations for different topics

**Quiz Strategies:**
- Start with easy difficulty
- Review explanations for wrong answers
- Use timed mode for exam prep
- Generate quizzes from uploaded materials

**Flashcard Best Practices:**
- Keep cards atomic (one concept per card)
- Use images and formatting
- Study consistently for best retention
- Trust the SM-2 algorithm timing

**Focus Session Optimization:**
- Use 25-minute Pomodoro sessions
- Take 5-minute breaks between sessions
- Track subtopics for granular progress
- Experiment with different clock styles

---

## 🛠️ Technologies Used

### Frontend
- **Angular 17.3+** - Modern web framework
  - Standalone components
  - Signals for reactivity
  - Lazy loading routes
  - Service workers for PWA

- **TypeScript 5.4+** - Type-safe development
  - Strict mode enabled
  - ES2022 target
  - Path aliases for clean imports

- **RxJS 7.8+** - Reactive programming
  - Observable streams
  - Operators for data transformation
  - Subject for state management

- **Marked.js** - Markdown parsing
- **Prism.js** - Syntax highlighting
- **KaTeX** - Math equation rendering
- **Chart.js** - Data visualization

### Backend
- **Cloudflare Workers** - Serverless edge computing
  - V8 isolate execution
  - Sub-millisecond cold starts
  - Global distribution

- **Cloudflare KV** - Key-value storage
  - Eventually consistent
  - Low-latency reads
  - Global replication

- **Cloudflare R2** - Object storage
  - S3-compatible API
  - Zero egress fees
  - Automatic multi-region

- **Google Gemini API** - AI model
  - 1.5 Flash for fast responses
  - 1M context window
  - Multi-modal support

### DevOps & Tools
- **Git & GitHub** - Version control
- **GitHub Pages** - Static hosting
- **GitHub Actions** - CI/CD pipeline
- **Wrangler** - Cloudflare CLI
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## 🏛️ Project Structure Details

### Service Layer Architecture

**ChatService** (`chat.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class ChatService {
  private apiUrl = 'https://studybuddy-worker.bsse23094.workers.dev';
  private conversations = new Map<string, Conversation>();
  
  // Send message with streaming response
  async sendMessage(message: string, conversationId: string): Promise<void>
  
  // Manage conversations
  createConversation(title: string): string
  getConversation(id: string): Conversation
  deleteConversation(id: string): void
  
  // Export/import
  exportConversation(id: string): string
  importConversation(data: string): void
}
```

**QuizService** (`quiz.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class QuizService {
  // Generate quiz from AI
  async generateQuiz(params: QuizParams): Promise<Quiz>
  
  // Quiz management
  saveQuiz(quiz: Quiz): void
  getQuiz(id: string): Quiz
  getAllQuizzes(): Quiz[]
  
  // Scoring and analytics
  scoreQuiz(quiz: Quiz, answers: Map<string, any>): QuizResult
  getAnalytics(): QuizAnalytics
  
  // History
  getQuizHistory(): QuizAttempt[]
  deleteQuizAttempt(id: string): void
}
```

**FlashcardService** (`flashcard.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class FlashcardService {
  // Deck management
  createDeck(name: string): string
  getDeck(id: string): Deck
  updateDeck(id: string, deck: Partial<Deck>): void
  deleteDeck(id: string): void
  
  // Card management
  addCard(deckId: string, card: Card): string
  updateCard(cardId: string, card: Partial<Card>): void
  deleteCard(cardId: string): void
  
  // Study session
  startStudySession(deckId: string, mode: StudyMode): StudySession
  reviewCard(cardId: string, quality: number): void
  
  // SM-2 algorithm
  private calculateNextReview(card: Card, quality: number): Date
  private updateEaseFactor(card: Card, quality: number): void
  
  // Analytics
  getDeckStats(deckId: string): DeckStats
  getGlobalStats(): GlobalFlashcardStats
}
```

**RoutineService** (`routine.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class RoutineService {
  // Routine generation
  generateRoutine(params: RoutineParams): Schedule
  
  // Schedule management
  saveRoutine(routine: Schedule): string
  getRoutine(id: string): Schedule
  updateRoutine(id: string, routine: Partial<Schedule>): void
  
  // Activity helpers
  private generateActivities(params: RoutineParams): Activity[]
  private optimizeSchedule(activities: Activity[]): Activity[]
  
  // Time utilities
  formatTime(date: Date): string
  getTimeRange(start: Date, end: Date): string
  calculateDuration(start: Date, end: Date): number
}
```

**DocumentService** (`document.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class DocumentService {
  // Upload and storage
  async uploadDocument(file: File, metadata: DocumentMetadata): Promise<Document>
  
  // Document management
  getDocument(id: string): Document
  getAllDocuments(): Document[]
  deleteDocument(id: string): void
  
  // Folder management
  createFolder(name: string, parentId?: string): string
  moveDocument(docId: string, folderId: string): void
  
  // Search and filter
  searchDocuments(query: string): Document[]
  filterByType(type: string): Document[]
  filterByDate(start: Date, end: Date): Document[]
  
  // Text extraction
  async extractText(documentId: string): Promise<string>
}
```

**ProgressService** (`progress.service.ts`)
```typescript
@Injectable({ providedIn: 'root' })
export class ProgressService {
  // Data aggregation
  getOverallStats(): OverallStats
  getQuizStats(): QuizStats
  getFlashcardStats(): FlashcardStats
  getFocusStats(): FocusStats
  
  // Streak calculation
  calculateStreak(): StreakData
  
  // Topic analysis
  getTopicBreakdown(): Map<string, TopicStats>
  identifyWeakAreas(): string[]
  
  // Time analysis
  getStudyTimeByDay(): Map<string, number>
  getStudyTimeByWeek(): Map<string, number>
  
  // Export
  exportProgressReport(format: 'pdf' | 'csv'): Blob
}
```

### Model Interfaces

**Core Models:**
```typescript
// Chat Models
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

// Quiz Models
interface Quiz {
  id: string;
  title: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questions: Question[];
  createdAt: Date;
}

interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer';
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  difficulty: number;
  points: number;
}

interface QuizResult {
  quizId: string;
  score: number;
  maxScore: number;
  accuracy: number;
  timeSpent: number;
  answers: Map<string, any>;
  completedAt: Date;
}

// Flashcard Models
interface Card {
  id: string;
  front: string;
  back: string;
  deckId: string;
  interval: number;
  repetition: number;
  easeFactor: number;
  nextReview: Date;
  lastReviewed?: Date;
  createdAt: Date;
}

interface Deck {
  id: string;
  name: string;
  description?: string;
  cards: Card[];
  createdAt: Date;
  updatedAt: Date;
}

interface StudySession {
  deckId: string;
  mode: 'learn' | 'review' | 'rapid';
  cardsStudied: number;
  correctAnswers: number;
  startTime: Date;
  endTime?: Date;
}

// Focus Models
interface FocusSession {
  id: string;
  topic: string;
  duration: number;
  subtopics: string[];
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

interface ClockStyle {
  id: 'digital' | 'circular' | 'minimal' | 'flip';
  name: string;
  preview: string;
}

// Document Models
interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  folderId?: string;
  tags: string[];
  uploadDate: Date;
  lastAccessed?: Date;
  extractedText?: string;
}

interface Folder {
  id: string;
  name: string;
  parentId?: string;
  documents: string[];
  subfolders: string[];
}

// Progress Models
interface OverallStats {
  totalQuizzes: number;
  averageScore: number;
  masteredCards: number;
  totalFocusTime: number;
  currentStreak: number;
  longestStreak: number;
}

interface TopicStats {
  topic: string;
  quizAttempts: number;
  averageScore: number;
  timeSpent: number;
  improvement: number;
}
```

---

## 🎨 Custom Styling & Theming

### CSS Architecture

**Global Styles** (`styles.css`):
```css
/* CSS Reset and Base Styles */
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* CSS Variables for Theming */
:root {
  /* Colors */
  --gold-primary: #D4AF37;
  --gold-light: #F4D03F;
  --bg-primary: #0A0A0A;
  --bg-secondary: #1A1A1A;
  --text-primary: #FFFFFF;
  --text-secondary: rgba(255, 255, 255, 0.8);
  
  /* Typography */
  --font-heading: 'Lexend', sans-serif;
  --font-body: 'Instrument Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Spacing Scale */
  --space-xs: 0.25rem;
  --space-sm: 0.5rem;
  --space-md: 1rem;
  --space-lg: 1.5rem;
  --space-xl: 2rem;
  --space-2xl: 3rem;
  
  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 20px;
  
  /* Transitions */
  --transition-fast: 0.15s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-base: 0.28s cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow: 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  
  /* Shadows */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 16px rgba(0, 0, 0, 0.2);
  --shadow-lg: 0 8px 32px rgba(0, 0, 0, 0.3);
  --shadow-gold: 0 4px 20px rgba(212, 175, 55, 0.3);
}

/* Typography */
body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  color: var(--text-primary);
  background: var(--bg-primary);
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-heading);
  font-weight: 700;
  line-height: 1.2;
  letter-spacing: -0.02em;
}

/* Utility Classes */
.text-bold { font-weight: 900; }
.text-center { text-align: center; }
.flex-center { display: flex; align-items: center; justify-content: center; }
.container { max-width: 1400px; margin: 0 auto; padding: 0 2rem; }
```

### Component-Specific Styling Patterns

**Card Component Pattern:**
```css
.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.2);
  border-radius: var(--radius-lg);
  padding: var(--space-xl);
  backdrop-filter: blur(10px);
  transition: all var(--transition-base);
}

.card:hover {
  border-color: rgba(212, 175, 55, 0.4);
  box-shadow: var(--shadow-gold);
  transform: translateY(-2px);
}
```

**Button Component Pattern:**
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  padding: 0.875rem 2rem;
  font-weight: 600;
  border-radius: var(--radius-sm);
  transition: all var(--transition-base);
  cursor: pointer;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--gold-primary), var(--gold-light));
  color: var(--bg-primary);
  box-shadow: var(--shadow-gold);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(212, 175, 55, 0.4);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
  border: 1px solid rgba(212, 175, 55, 0.3);
}
```

**Input Component Pattern:**
```css
.input {
  width: 100%;
  padding: 0.875rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(212, 175, 55, 0.3);
  border-radius: var(--radius-sm);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: 1rem;
  transition: all var(--transition-base);
}

.input:focus {
  outline: none;
  border-color: var(--gold-primary);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.input::placeholder {
  color: var(--text-tertiary);
}
```

### Responsive Design Breakpoints
```css
/* Mobile First Approach */
@media (min-width: 640px) {
  /* Small tablets */
}

@media (min-width: 768px) {
  /* Tablets */
}

@media (min-width: 1024px) {
  /* Small desktops */
}

@media (min-width: 1280px) {
  /* Large desktops */
}

@media (min-width: 1536px) {
  /* Extra large screens */
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

### Reporting Issues
1. Check if issue already exists
2. Use issue template
3. Provide reproduction steps
4. Include screenshots if applicable

### Pull Requests
1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript strict mode
- Use Angular style guide
- Write meaningful commit messages
- Add tests for new features
- Update documentation
- Ensure responsive design

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Ahmed Ayyan**
- GitHub: [@bsse23094](https://github.com/bsse23094)
- Email: ahmedayyan555@gmail.com

---

## 🙏 Acknowledgments

- Angular Team for the amazing framework
- Google for Gemini AI API
- Cloudflare for serverless infrastructure
- All contributors and supporters

---

## 📞 Support

- **Email**: ahmedayyan555@gmail.com
- **GitHub Issues**: [Create an issue](https://github.com/bsse23094/studyBuddy/issues)
- **Documentation**: [GitHub Wiki](https://github.com/bsse23094/studyBuddy/wiki)

---

<div align="center">

**Made with ❤️ for students worldwide**

⭐ Star this repo if you find it helpful!

[View Demo](https://bsse23094.github.io/studyBuddy/) • [Report Bug](https://github.com/bsse23094/studyBuddy/issues) • [Request Feature](https://github.com/bsse23094/studyBuddy/issues)

</div>
