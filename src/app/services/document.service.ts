import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Document, DocChunk, IngestionResponse } from '../models';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private documentsSubject = new BehaviorSubject<Document[]>([]);
  public documents$ = this.documentsSubject.asObservable();

  private offlineMode = false;

  constructor(
    private storage: StorageService,
    private api: ApiService
  ) {
    this.loadDocuments();
  }

  private async loadDocuments(): Promise<void> {
    await this.storage.init();
    const documents = await this.storage.getAllDocuments();
    this.documentsSubject.next(documents);
  }

  async uploadDocument(file: File, metadata?: {
    topics?: string[];
    course?: string;
    tags?: string[];
  }): Promise<Document> {
    // Create document record
    const document: Document = {
      id: this.generateId(),
      title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
      filename: file.name,
      fileType: this.getFileType(file.name),
      size: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'pending',
      topics: metadata?.topics,
      metadata: {
        course: metadata?.course,
        tags: metadata?.tags
      }
    };

    await this.storage.saveDocument(document);
    await this.loadDocuments();

    // Process document
    if (this.offlineMode) {
      await this.processDocumentLocally(document, file);
    } else {
      await this.processDocumentRemotely(document, file);
    }

    return document;
  }

  private async processDocumentLocally(document: Document, file: File): Promise<void> {
    document.status = 'processing';
    await this.storage.saveDocument(document);
    await this.loadDocuments();

    try {
      const text = await this.extractText(file);
      const chunks = this.chunkText(text, document.id);

      for (const chunk of chunks) {
        await this.storage.saveChunk(chunk);
      }

      document.status = 'ready';
      document.processedAt = new Date().toISOString();
      document.chunkCount = chunks.length;
    } catch (error) {
      console.error('Document processing error:', error);
      document.status = 'error';
      document.error = 'Failed to process document locally';
    }

    await this.storage.saveDocument(document);
    await this.loadDocuments();
  }

  private async processDocumentRemotely(document: Document, file: File): Promise<void> {
    document.status = 'processing';
    await this.storage.saveDocument(document);
    await this.loadDocuments();

    try {
      const response = await this.api.uploadDocument(file, document.metadata).toPromise();
      
      if (response && response.success) {
        // Poll for status (simplified - in production use WebSocket or SSE)
        await this.pollDocumentStatus(document.id);
      }
    } catch (error) {
      console.error('Document upload error:', error);
      document.status = 'error';
      document.error = 'Failed to upload document';
      await this.storage.saveDocument(document);
      await this.loadDocuments();
    }
  }

  private async pollDocumentStatus(documentId: string, maxAttempts: number = 30): Promise<void> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

      try {
        const response = await this.api.getDocumentStatus(documentId).toPromise();
        
        if (response && response.success && response.data) {
          const document = await this.storage.getDocument(documentId);
          if (document) {
            document.status = response.data.status;
            document.processedAt = response.data.processedAt;
            document.chunkCount = response.data.chunkCount;
            document.error = response.data.error;

            await this.storage.saveDocument(document);
            await this.loadDocuments();

            if (document.status === 'ready' || document.status === 'error') {
              break;
            }
          }
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }
  }

  private async extractText(file: File): Promise<string> {
    const fileType = this.getFileType(file.name);

    if (fileType === 'txt' || fileType === 'md') {
      return await file.text();
    } else if (fileType === 'pdf') {
      // PDF extraction would require a library like pdf.js
      // For now, return placeholder
      return `[PDF content from ${file.name}]\nPDF extraction requires additional library.`;
    }

    return '';
  }

  private chunkText(text: string, docId: string): DocChunk[] {
    const chunks: DocChunk[] = [];
    const chunkSize = 500; // characters
    const overlap = 50; // characters

    let start = 0;
    let chunkIndex = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunkText = text.substring(start, end);

      chunks.push({
        id: `${docId}_chunk_${chunkIndex}`,
        docId,
        text: chunkText,
        source: docId,
        chunkIndex
      });

      start += chunkSize - overlap;
      chunkIndex++;
    }

    return chunks;
  }

  private getFileType(filename: string): 'pdf' | 'txt' | 'md' | 'url' {
    const ext = filename.split('.').pop()?.toLowerCase();
    
    if (ext === 'pdf') return 'pdf';
    if (ext === 'md' || ext === 'markdown') return 'md';
    if (ext === 'txt') return 'txt';
    
    return 'txt';
  }

  async deleteDocument(id: string): Promise<void> {
    await this.storage.deleteDocument(id);
    await this.loadDocuments();
  }

  async searchDocuments(query: string, options?: {
    topK?: number;
    filters?: { docIds?: string[]; topics?: string[] };
  }): Promise<DocChunk[]> {
    if (this.offlineMode) {
      return this.storage.searchChunks(query, options?.topK || 5);
    }

    try {
      const response = await this.api.searchDocuments(query, options).toPromise();
      
      if (response && response.success && response.data) {
        return response.data.chunks;
      }
    } catch (error) {
      console.error('Search error:', error);
    }

    // Fallback to local search
    return this.storage.searchChunks(query, options?.topK || 5);
  }

  setOfflineMode(enabled: boolean): void {
    this.offlineMode = enabled;
  }

  async getDocument(id: string): Promise<Document | undefined> {
    return this.storage.getDocument(id);
  }

  async reindexDocument(id: string): Promise<void> {
    const document = await this.storage.getDocument(id);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = 'pending';
    await this.storage.saveDocument(document);
    await this.loadDocuments();

    // Re-trigger processing (would need original file)
    // This is a placeholder - in production, store file or trigger server reindex
  }

  private generateId(): string {
    return `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getDocuments(): Document[] {
    return this.documentsSubject.value;
  }
}
