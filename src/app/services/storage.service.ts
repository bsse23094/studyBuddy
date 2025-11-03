import { Injectable } from '@angular/core';
import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { 
  Document, 
  DocChunk, 
  Conversation, 
  Quiz, 
  QuizAttempt, 
  Flashcard, 
  FlashcardDeck,
  StudySession 
} from '../models';

interface StudyBuddyDB extends DBSchema {
  documents: {
    key: string;
    value: Document;
    indexes: { 'by-status': string; 'by-uploadedAt': string };
  };
  chunks: {
    key: string;
    value: DocChunk;
    indexes: { 'by-docId': string };
  };
  conversations: {
    key: string;
    value: Conversation;
    indexes: { 'by-updatedAt': string };
  };
  quizzes: {
    key: string;
    value: Quiz;
    indexes: { 'by-createdAt': string };
  };
  quizAttempts: {
    key: string;
    value: QuizAttempt;
    indexes: { 'by-quizId': string; 'by-completedAt': string };
  };
  flashcards: {
    key: string;
    value: Flashcard;
    indexes: { 'by-deckId': string; 'by-nextReview': string };
  };
  decks: {
    key: string;
    value: FlashcardDeck;
    indexes: { 'by-updatedAt': string };
  };
  sessions: {
    key: string;
    value: StudySession;
    indexes: { 'by-startTime': string };
  };
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private db: IDBPDatabase<StudyBuddyDB> | null = null;
  private readonly DB_NAME = 'StudyBuddyDB';
  private readonly DB_VERSION = 1;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<StudyBuddyDB>(this.DB_NAME, this.DB_VERSION, {
      upgrade(db) {
        // Documents store
        if (!db.objectStoreNames.contains('documents')) {
          const docStore = db.createObjectStore('documents', { keyPath: 'id' });
          docStore.createIndex('by-status', 'status');
          docStore.createIndex('by-uploadedAt', 'uploadedAt');
        }

        // Chunks store
        if (!db.objectStoreNames.contains('chunks')) {
          const chunkStore = db.createObjectStore('chunks', { keyPath: 'id' });
          chunkStore.createIndex('by-docId', 'docId');
        }

        // Conversations store
        if (!db.objectStoreNames.contains('conversations')) {
          const convStore = db.createObjectStore('conversations', { keyPath: 'id' });
          convStore.createIndex('by-updatedAt', 'updatedAt');
        }

        // Quizzes store
        if (!db.objectStoreNames.contains('quizzes')) {
          const quizStore = db.createObjectStore('quizzes', { keyPath: 'id' });
          quizStore.createIndex('by-createdAt', 'createdAt');
        }

        // Quiz attempts store
        if (!db.objectStoreNames.contains('quizAttempts')) {
          const attemptStore = db.createObjectStore('quizAttempts', { keyPath: 'id' });
          attemptStore.createIndex('by-quizId', 'quizId');
          attemptStore.createIndex('by-completedAt', 'completedAt');
        }

        // Flashcards store
        if (!db.objectStoreNames.contains('flashcards')) {
          const cardStore = db.createObjectStore('flashcards', { keyPath: 'id' });
          cardStore.createIndex('by-deckId', 'deckId');
          cardStore.createIndex('by-nextReview', 'nextReview');
        }

        // Decks store
        if (!db.objectStoreNames.contains('decks')) {
          const deckStore = db.createObjectStore('decks', { keyPath: 'id' });
          deckStore.createIndex('by-updatedAt', 'updatedAt');
        }

        // Sessions store
        if (!db.objectStoreNames.contains('sessions')) {
          const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' });
          sessionStore.createIndex('by-startTime', 'startTime');
        }
      }
    });
  }

  private async ensureDB(): Promise<IDBPDatabase<StudyBuddyDB>> {
    if (!this.db) {
      await this.init();
    }
    return this.db!;
  }

  // Documents
  async saveDocument(doc: Document): Promise<void> {
    const db = await this.ensureDB();
    await db.put('documents', doc);
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const db = await this.ensureDB();
    return db.get('documents', id);
  }

  async getAllDocuments(): Promise<Document[]> {
    const db = await this.ensureDB();
    return db.getAll('documents');
  }

  async deleteDocument(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('documents', id);
    // Also delete associated chunks
    const chunks = await db.getAllFromIndex('chunks', 'by-docId', id);
    for (const chunk of chunks) {
      await db.delete('chunks', chunk.id);
    }
  }

  // Chunks
  async saveChunk(chunk: DocChunk): Promise<void> {
    const db = await this.ensureDB();
    await db.put('chunks', chunk);
  }

  async getChunksByDocId(docId: string): Promise<DocChunk[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('chunks', 'by-docId', docId);
  }

  async searchChunks(query: string, topK: number = 5): Promise<DocChunk[]> {
    const db = await this.ensureDB();
    const allChunks = await db.getAll('chunks');
    
    // Simple text-based search (in production, use vector similarity)
    const scored = allChunks.map(chunk => ({
      chunk,
      score: this.calculateTextSimilarity(query.toLowerCase(), chunk.text.toLowerCase())
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(item => item.chunk);
  }

  private calculateTextSimilarity(query: string, text: string): number {
    const queryWords = query.split(/\s+/);
    let score = 0;
    for (const word of queryWords) {
      if (text.includes(word)) {
        score += 1;
      }
    }
    return score / queryWords.length;
  }

  // Conversations
  async saveConversation(conv: Conversation): Promise<void> {
    const db = await this.ensureDB();
    await db.put('conversations', conv);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    const db = await this.ensureDB();
    return db.get('conversations', id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    const db = await this.ensureDB();
    const all = await db.getAll('conversations');
    return all.sort((a, b) => 
      new Date(b.updatedAt || b.createdAt).getTime() - 
      new Date(a.updatedAt || a.createdAt).getTime()
    );
  }

  async deleteConversation(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('conversations', id);
  }

  // Quizzes
  async saveQuiz(quiz: Quiz): Promise<void> {
    const db = await this.ensureDB();
    await db.put('quizzes', quiz);
  }

  async getQuiz(id: string): Promise<Quiz | undefined> {
    const db = await this.ensureDB();
    return db.get('quizzes', id);
  }

  async getAllQuizzes(): Promise<Quiz[]> {
    const db = await this.ensureDB();
    return db.getAll('quizzes');
  }

  // Quiz Attempts
  async saveQuizAttempt(attempt: QuizAttempt): Promise<void> {
    const db = await this.ensureDB();
    await db.put('quizAttempts', attempt);
  }

  async getQuizAttempts(quizId: string): Promise<QuizAttempt[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('quizAttempts', 'by-quizId', quizId);
  }

  // Flashcards
  async saveFlashcard(card: Flashcard): Promise<void> {
    const db = await this.ensureDB();
    await db.put('flashcards', card);
  }

  async getFlashcard(id: string): Promise<Flashcard | undefined> {
    const db = await this.ensureDB();
    return db.get('flashcards', id);
  }

  async getFlashcardsByDeck(deckId: string): Promise<Flashcard[]> {
    const db = await this.ensureDB();
    return db.getAllFromIndex('flashcards', 'by-deckId', deckId);
  }

  async getDueFlashcards(): Promise<Flashcard[]> {
    const db = await this.ensureDB();
    const all = await db.getAll('flashcards');
    const now = new Date().toISOString();
    return all.filter(card => card.nextReview <= now);
  }

  async deleteFlashcard(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('flashcards', id);
  }

  // Decks
  async saveDeck(deck: FlashcardDeck): Promise<void> {
    const db = await this.ensureDB();
    await db.put('decks', deck);
  }

  async getDeck(id: string): Promise<FlashcardDeck | undefined> {
    const db = await this.ensureDB();
    return db.get('decks', id);
  }

  async getAllDecks(): Promise<FlashcardDeck[]> {
    const db = await this.ensureDB();
    return db.getAll('decks');
  }

  async deleteDeck(id: string): Promise<void> {
    const db = await this.ensureDB();
    await db.delete('decks', id);
    // Delete associated cards
    const cards = await this.getFlashcardsByDeck(id);
    for (const card of cards) {
      await db.delete('flashcards', card.id);
    }
  }

  // Study Sessions
  async saveSession(session: StudySession): Promise<void> {
    const db = await this.ensureDB();
    await db.put('sessions', session);
  }

  async getRecentSessions(limit: number = 10): Promise<StudySession[]> {
    const db = await this.ensureDB();
    const all = await db.getAll('sessions');
    return all
      .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
      .slice(0, limit);
  }

  // Utility
  async clearAllData(): Promise<void> {
    const db = await this.ensureDB();
    const storeNames: (keyof StudyBuddyDB)[] = [
      'documents', 'chunks', 'conversations', 'quizzes', 
      'quizAttempts', 'flashcards', 'decks', 'sessions'
    ];
    
    for (const storeName of storeNames) {
      const tx = db.transaction(storeName as any, 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  }

  async exportAllData(): Promise<any> {
    const db = await this.ensureDB();
    return {
      documents: await db.getAll('documents'),
      chunks: await db.getAll('chunks'),
      conversations: await db.getAll('conversations'),
      quizzes: await db.getAll('quizzes'),
      quizAttempts: await db.getAll('quizAttempts'),
      flashcards: await db.getAll('flashcards'),
      decks: await db.getAll('decks'),
      sessions: await db.getAll('sessions'),
      exportedAt: new Date().toISOString()
    };
  }

  // Generic key-value storage methods for miscellaneous data
  async get<T>(key: string): Promise<T | null> {
    try {
      const value = localStorage.getItem(`studybuddy_${key}`);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      localStorage.setItem(`studybuddy_${key}`, JSON.stringify(value));
    } catch (error) {
      console.error('Storage set error:', error);
    }
  }

  async remove(key: string): Promise<void> {
    try {
      localStorage.removeItem(`studybuddy_${key}`);
    } catch (error) {
      console.error('Storage remove error:', error);
    }
  }
}
