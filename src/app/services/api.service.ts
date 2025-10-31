import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, of, BehaviorSubject } from 'rxjs';
import { catchError, retry, tap, switchMap } from 'rxjs/operators';
import { 
  ChatRequest, 
  ChatResponse, 
  StreamChunk,
  ApiResponse 
} from '../models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiBaseUrl = environment.apiUrl + '/api'; // Use environment config
  private streamingSubject = new BehaviorSubject<StreamChunk | null>(null);
  public streaming$ = this.streamingSubject.asObservable();

  constructor(private http: HttpClient) {}

  setApiBaseUrl(url: string): void {
    this.apiBaseUrl = url;
  }

  /**
   * Send chat request with RAG context
   */
  chat(request: ChatRequest): Observable<ApiResponse<ChatResponse>> {
    if (request.options.stream) {
      return this.chatStream(request);
    }

    return this.http.post<ApiResponse<ChatResponse>>(
      `${this.apiBaseUrl}/chat`,
      request
    ).pipe(
      retry(2),
      catchError(this.handleError)
    );
  }

  /**
   * Stream chat responses
   */
  private chatStream(request: ChatRequest): Observable<ApiResponse<ChatResponse>> {
    // For now, return a simulated stream response
    // In production, use Server-Sent Events or WebSocket
    return new Observable(observer => {
      const mockResponse: ApiResponse<ChatResponse> = {
        success: true,
        data: {
          conversationId: request.conversationId || this.generateId(),
          message: {
            id: this.generateId(),
            role: 'assistant',
            content: 'Streaming response simulation...',
            timestamp: new Date().toISOString(),
            meta: {
              mode: request.options.mode,
              level: request.options.level
            }
          },
          sources: []
        },
        meta: {
          timestamp: new Date().toISOString(),
          provider: 'mock'
        }
      };
      
      observer.next(mockResponse);
      observer.complete();
    });
  }

  /**
   * Generate quiz from documents
   */
  generateQuiz(request: {
    sourceDocIds?: string[];
    topics?: string[];
    questionCount: number;
    difficulty?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiBaseUrl}/quiz/generate`,
      request
    ).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Generate flashcards from documents
   */
  generateFlashcards(request: {
    sourceDocIds?: string[];
    topics?: string[];
    count: number;
    difficulty?: string;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiBaseUrl}/flashcards/generate`,
      request
    ).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  /**
   * Upload and ingest document
   */
  uploadDocument(file: File, metadata?: any): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    if (metadata) {
      formData.append('metadata', JSON.stringify(metadata));
    }

    return this.http.post<ApiResponse<any>>(
      `${this.apiBaseUrl}/documents/upload`,
      formData
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check document processing status
   */
  getDocumentStatus(documentId: string): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiBaseUrl}/documents/${documentId}/status`
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Search documents with RAG
   */
  searchDocuments(query: string, options?: {
    topK?: number;
    filters?: any;
  }): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(
      `${this.apiBaseUrl}/documents/search`,
      { query, ...options }
    ).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Check worker health
   */
  getHealth(): Observable<ApiResponse<any>> {
    return this.http.get<ApiResponse<any>>(
      `${this.apiBaseUrl}/health`
    ).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    let errorMessage = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
