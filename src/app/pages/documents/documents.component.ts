import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: Date;
  content: string;
  thumbnail?: string;
}

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="header">
        <h1><i class="fa-solid fa-book"></i> Document Library</h1>
        <p>Upload and manage your study materials</p>
      </div>

      <div class="content">
        @if (!selectedDocument) {
          <div class="library-container">
            <!-- Upload Section -->
            <div class="upload-section">
              <div class="upload-card" 
                   [class.drag-over]="isDragging"
                   (drop)="onDrop($event)"
                   (dragover)="onDragOver($event)"
                   (dragleave)="onDragLeave($event)"
                   (click)="fileInput.click()">
                <input #fileInput 
                       type="file" 
                       hidden 
                       accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png"
                       (change)="onFileSelect($event)"
                       multiple />
                
                <div class="upload-icon">
                  <i class="fa-solid fa-cloud-arrow-up"></i>
                </div>
                <h3>Upload Documents</h3>
                <p>Drag and drop files or click to browse</p>
                <div class="supported-formats">
                  <span class="format-badge">PDF</span>
                  <span class="format-badge">TXT</span>
                  <span class="format-badge">DOC</span>
                  <span class="format-badge">Images</span>
                </div>
              </div>

              @if (isUploading) {
                <div class="upload-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" [style.width.%]="uploadProgress"></div>
                  </div>
                  <p>Uploading... {{ uploadProgress }}%</p>
                </div>
              }

              @if (uploadError) {
                <div class="error-message">
                  <i class="fa-solid fa-circle-exclamation"></i>
                  {{ uploadError }}
                </div>
              }
            </div>

            <!-- Documents Grid -->
            <div class="documents-section">
              <div class="section-header">
                <h2>Your Documents ({{ documents.length }})</h2>
                @if (documents.length > 0) {
                  <button class="clear-all-btn" (click)="clearAllDocuments()">
                    <i class="fa-solid fa-trash"></i>
                    Clear All
                  </button>
                }
              </div>

              @if (documents.length === 0) {
                <div class="empty-state">
                  <div class="empty-icon">
                    <i class="fa-solid fa-folder-open"></i>
                  </div>
                  <h3>No Documents Yet</h3>
                  <p>Upload your first document to get started with AI-powered studying</p>
                </div>
              } @else {
                <div class="documents-grid">
                  @for (doc of documents; track doc.id) {
                    <div class="document-card" (click)="selectDocument(doc)">
                      <div class="doc-preview">
                        @if (doc.type.startsWith('image/')) {
                          <img [src]="doc.thumbnail" [alt]="doc.name" />
                        } @else if (doc.type === 'application/pdf') {
                          <div class="doc-icon pdf">
                            <i class="fa-solid fa-file-pdf"></i>
                          </div>
                        } @else if (doc.type.includes('text')) {
                          <div class="doc-icon text">
                            <i class="fa-solid fa-file-lines"></i>
                          </div>
                        } @else {
                          <div class="doc-icon generic">
                            <i class="fa-solid fa-file"></i>
                          </div>
                        }
                      </div>
                      <div class="doc-info">
                        <h4>{{ doc.name }}</h4>
                        <div class="doc-meta">
                          <span class="doc-size">{{ formatFileSize(doc.size) }}</span>
                          <span class="doc-date">{{ formatDate(doc.uploadDate) }}</span>
                        </div>
                      </div>
                      <button class="delete-doc-btn" (click)="deleteDocument(doc.id, $event)">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Document Viewer -->
        @if (selectedDocument) {
          <div class="viewer-container">
            <div class="viewer-header">
              <button class="back-btn" (click)="closeViewer()">
                <i class="fa-solid fa-arrow-left"></i>
                Back to Library
              </button>
              <h2>{{ selectedDocument.name }}</h2>
              <button class="download-btn" (click)="downloadDocument()">
                <i class="fa-solid fa-download"></i>
                Download
              </button>
            </div>

            <div class="viewer-content">
              @if (selectedDocument.type.startsWith('image/')) {
                <div class="image-viewer">
                  <img [src]="selectedDocument.thumbnail" [alt]="selectedDocument.name" />
                </div>
              } @else if (selectedDocument.type.includes('text')) {
                <div class="text-viewer">
                  <pre>{{ selectedDocument.content }}</pre>
                </div>
              } @else if (selectedDocument.type === 'application/pdf') {
                <div class="pdf-viewer">
                  <div class="pdf-controls">
                    <div class="zoom-controls">
                      <button class="control-btn" (click)="zoomOut()" title="Zoom Out">
                        <i class="fa-solid fa-minus"></i>
                      </button>
                      <span class="zoom-level">{{ zoomLevel }}%</span>
                      <button class="control-btn" (click)="zoomIn()" title="Zoom In">
                        <i class="fa-solid fa-plus"></i>
                      </button>
                      <button class="control-btn" (click)="resetZoom()" title="Reset Zoom">
                        <i class="fa-solid fa-expand"></i>
                      </button>
                    </div>
                    <div class="page-controls" *ngIf="totalPages > 1">
                      <button class="control-btn" (click)="previousPage()" [disabled]="currentPage === 1">
                        <i class="fa-solid fa-chevron-left"></i>
                      </button>
                      <span class="page-info">Page {{ currentPage }} / {{ totalPages }}</span>
                      <button class="control-btn" (click)="nextPage()" [disabled]="currentPage === totalPages">
                        <i class="fa-solid fa-chevron-right"></i>
                      </button>
                    </div>
                    <button class="control-btn" (click)="toggleFullscreen()" title="Fullscreen">
                      <i class="fa-solid" [class.fa-expand]="!isFullscreen" [class.fa-compress]="isFullscreen"></i>
                    </button>
                  </div>
                  <div class="pdf-content" #pdfContainer [class.fullscreen]="isFullscreen">
                    <iframe 
                      [src]="getPdfUrl()" 
                      [style.transform]="'scale(' + (zoomLevel / 100) + ')'"
                      [style.width]="(100 / (zoomLevel / 100)) + '%'"
                      [style.height]="(100 / (zoomLevel / 100)) + '%'"
                      frameborder="0">
                    </iframe>
                  </div>
                </div>
              } @else {
                <div class="generic-viewer">
                  <i class="fa-solid fa-file"></i>
                  <p>Preview not available for this file type</p>
                  <button class="action-btn primary" (click)="downloadDocument()">
                    <i class="fa-solid fa-download"></i>
                    Download File
                  </button>
                </div>
              }
            </div>

            <div class="viewer-actions">
              <button class="action-btn secondary" (click)="deleteDocument(selectedDocument.id)">
                <i class="fa-solid fa-trash"></i>
                Delete Document
              </button>
            </div>
          </div>
        }
      </div>
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
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.25rem;
      letter-spacing: -0.011em;
    }

    .content {
      width: 100%;
    }

    /* Library Container */
    .library-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Upload Section */
    .upload-section {
      margin-bottom: 3rem;
    }

    .upload-card {
      background: #0A0A0A;
      border: 2px dashed rgba(212, 175, 55, 0.3);
      border-radius: 24px;
      padding: 4rem 3rem;
      text-align: center;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .upload-card:hover {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.05);
      transform: translateY(-4px);
    }

    .upload-card.drag-over {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.1);
      transform: scale(1.02);
    }

    .upload-icon {
      font-size: 4rem;
      color: #D4AF37;
      margin-bottom: 1.5rem;
    }

    .upload-card h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.02em;
    }

    .upload-card p {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.125rem;
      margin-bottom: 2rem;
      letter-spacing: -0.011em;
    }

    .supported-formats {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .format-badge {
      padding: 0.5rem 1rem;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      color: #D4AF37;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: -0.011em;
    }

    .upload-progress {
      margin-top: 1.5rem;
      text-align: center;
    }

    .progress-bar {
      width: 100%;
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

    .upload-progress p {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9375rem;
      margin: 0;
      letter-spacing: -0.011em;
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

    /* Documents Section */
    .documents-section {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .section-header h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.03em;
    }

    .clear-all-btn {
      padding: 0.75rem 1.25rem;
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 12px;
      color: #EF4444;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.011em;
    }

    .clear-all-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: translateY(-2px);
    }

    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 4rem 2rem;
    }

    .empty-icon {
      font-size: 4rem;
      color: #D4AF37;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.75rem;
      letter-spacing: -0.02em;
    }

    .empty-state p {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.125rem;
      margin: 0;
      letter-spacing: -0.011em;
    }

    /* Documents Grid */
    .documents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 1.5rem;
    }

    .document-card {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 1.25rem;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .document-card:hover {
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    }

    .doc-preview {
      width: 100%;
      height: 180px;
      background: #1A1A1A;
      border-radius: 12px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .doc-preview img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .doc-icon {
      font-size: 4rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .doc-icon.pdf {
      color: #EF4444;
    }

    .doc-icon.text {
      color: #3B82F6;
    }

    .doc-icon.generic {
      color: rgba(255, 255, 255, 0.5);
    }

    .doc-info h4 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.125rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0 0 0.5rem 0;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .doc-meta {
      display: flex;
      gap: 1rem;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: -0.011em;
    }

    .delete-doc-btn {
      position: absolute;
      top: 1.5rem;
      right: 1.5rem;
      width: 36px;
      height: 36px;
      background: rgba(0, 0, 0, 0.8);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 8px;
      color: #EF4444;
      font-size: 1rem;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
    }

    .document-card:hover .delete-doc-btn {
      opacity: 1;
    }

    .delete-doc-btn:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: scale(1.1);
    }

    /* Document Viewer */
    .viewer-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .viewer-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .viewer-header h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      flex: 1;
      text-align: center;
      letter-spacing: -0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .back-btn,
    .download-btn {
      padding: 0.875rem 1.5rem;
      border: none;
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.011em;
    }

    .back-btn {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
    }

    .back-btn:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
    }

    .download-btn {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
    }

    .download-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    .viewer-content {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 2rem;
      min-height: 600px;
      margin-bottom: 2rem;
    }

    .image-viewer {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .image-viewer img {
      max-width: 100%;
      max-height: 800px;
      border-radius: 12px;
    }

    .text-viewer {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 2rem;
      max-height: 800px;
      overflow-y: auto;
    }

    .text-viewer pre {
      font-family: 'Instrument Sans', monospace;
      color: #FFFFFF;
      font-size: 1rem;
      line-height: 1.6;
      margin: 0;
      white-space: pre-wrap;
      word-wrap: break-word;
      letter-spacing: -0.011em;
    }

    .pdf-viewer {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      width: 100%;
      height: 100%;
    }

    .pdf-controls {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.5rem;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .zoom-controls,
    .page-controls {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .control-btn {
      width: 40px;
      height: 40px;
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      color: #D4AF37;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 1rem;
    }

    .control-btn:hover:not(:disabled) {
      background: rgba(212, 175, 55, 0.2);
      border-color: rgba(212, 175, 55, 0.5);
      transform: scale(1.05);
    }

    .control-btn:active:not(:disabled) {
      transform: scale(0.95);
    }

    .control-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .zoom-level,
    .page-info {
      color: #FFFFFF;
      font-weight: 600;
      font-size: 0.9375rem;
      min-width: 60px;
      text-align: center;
      font-family: 'JetBrains Mono', monospace;
    }

    .pdf-content {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      overflow: hidden;
      position: relative;
      width: 100%;
      height: 800px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .pdf-content.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      z-index: 9999;
      border-radius: 0;
    }

    .pdf-content iframe {
      width: 100%;
      height: 100%;
      border: none;
      background: #FFFFFF;
      transform-origin: center center;
      transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .pdf-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    .pdf-placeholder i {
      font-size: 5rem;
      color: rgba(212, 175, 55, 0.3);
    }

    .pdf-placeholder p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.125rem;
      margin: 0;
    }

    .pdf-placeholder .note {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9375rem;
      font-style: italic;
    }

    .generic-viewer {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-height: 600px;
      text-align: center;
      gap: 1rem;
    }

    .generic-viewer i {
      font-size: 5rem;
      color: rgba(212, 175, 55, 0.3);
    }

    .generic-viewer p {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.25rem;
      margin: 0;
    }
      letter-spacing: -0.011em;
    }

    .pdf-placeholder .note {
      color: rgba(255, 255, 255, 0.5);
      font-size: 1rem;
      max-width: 500px;
      word-wrap: break-word;
    }

    .viewer-actions {
      display: flex;
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
      background: rgba(239, 68, 68, 0.12);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #EF4444;
    }

    .action-btn.secondary:hover {
      background: rgba(239, 68, 68, 0.2);
      transform: translateY(-2px);
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

      .upload-card {
        padding: 3rem 2rem;
      }

      .documents-grid {
        grid-template-columns: 1fr;
      }

      .viewer-header {
        flex-direction: column;
        align-items: stretch;
      }

      .viewer-header h2 {
        order: -1;
        margin-bottom: 1rem;
        text-align: left;
      }

      .back-btn,
      .download-btn {
        width: 100%;
        justify-content: center;
      }

      .viewer-content {
        min-height: 400px;
      }
    }
  `]
})
export class DocumentsComponent implements OnInit {
  documents: Document[] = [];
  selectedDocument: Document | null = null;
  isDragging = false;
  isUploading = false;
  uploadProgress = 0;
  uploadError = '';
  
  // PDF viewer properties
  zoomLevel = 100;
  currentPage = 1;
  totalPages = 1;
  isFullscreen = false;

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit(): void {
    this.loadDocuments();
  }

  loadDocuments(): void {
    const saved = localStorage.getItem('studybuddy_documents');
    if (saved) {
      this.documents = JSON.parse(saved).map((d: any) => ({
        ...d,
        uploadDate: new Date(d.uploadDate)
      }));
    }
  }

  saveDocuments(): void {
    localStorage.setItem('studybuddy_documents', JSON.stringify(this.documents));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files) {
      this.processFiles(files);
    }
  }

  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.processFiles(input.files);
    }
  }

  processFiles(files: FileList): void {
    this.uploadError = '';
    
    if (files.length === 0) return;

    // Check file size (max 10MB per file)
    for (let i = 0; i < files.length; i++) {
      if (files[i].size > 10 * 1024 * 1024) {
        this.uploadError = `File "${files[i].name}" is too large. Maximum size is 10MB.`;
        return;
      }
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    let processed = 0;
    const total = files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = (e) => {
        const content = e.target?.result as string;
        
        const document: Document = {
          id: `doc_${Date.now()}_${i}`,
          name: file.name,
          type: file.type,
          size: file.size,
          uploadDate: new Date(),
          content: content,
          thumbnail: file.type.startsWith('image/') ? content : undefined
        };

        this.documents.unshift(document);
        processed++;
        this.uploadProgress = Math.round((processed / total) * 100);

        if (processed === total) {
          this.saveDocuments();
          setTimeout(() => {
            this.isUploading = false;
            this.uploadProgress = 0;
          }, 500);
        }
      };

      reader.onerror = () => {
        this.uploadError = `Failed to read file "${file.name}"`;
        this.isUploading = false;
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type.includes('text')) {
        reader.readAsText(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  }

  selectDocument(doc: Document): void {
    this.selectedDocument = doc;
    this.zoomLevel = 100;
    this.currentPage = 1;
    this.isFullscreen = false;
  }

  closeViewer(): void {
    this.selectedDocument = null;
    this.zoomLevel = 100;
    this.currentPage = 1;
    this.isFullscreen = false;
  }

  deleteDocument(docId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (confirm('Delete this document?')) {
      this.documents = this.documents.filter(d => d.id !== docId);
      this.saveDocuments();
      
      if (this.selectedDocument?.id === docId) {
        this.selectedDocument = null;
      }
    }
  }

  clearAllDocuments(): void {
    if (confirm('Delete all documents? This cannot be undone.')) {
      this.documents = [];
      this.saveDocuments();
      this.selectedDocument = null;
    }
  }

  downloadDocument(): void {
    if (!this.selectedDocument) return;

    const link = document.createElement('a');
    link.href = this.selectedDocument.content;
    link.download = this.selectedDocument.name;
    link.click();
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    
    return date.toLocaleDateString();
  }

  // PDF Viewer Methods
  getPdfUrl(): SafeResourceUrl {
    if (!this.selectedDocument || this.selectedDocument.type !== 'application/pdf') {
      return '';
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(this.selectedDocument.content);
  }

  zoomIn(): void {
    if (this.zoomLevel < 200) {
      this.zoomLevel += 10;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 50) {
      this.zoomLevel -= 10;
    }
  }

  resetZoom(): void {
    this.zoomLevel = 100;
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  toggleFullscreen(): void {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  }
}
