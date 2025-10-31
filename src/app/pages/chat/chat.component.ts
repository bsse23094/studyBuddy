import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { Conversation, Message } from '../../models';
import { Subscription } from 'rxjs';
import { marked } from 'marked';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import katex from 'katex';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chat-page">
      <div class="chat-header">
        <div class="header-content">
          <h1><i class="fas fa-comment-dots"></i> AI Tutor</h1>
          <p>Ask questions, get step-by-step solutions, and learn with AI-powered assistance</p>
        </div>
      </div>
      
      <div class="chat-container">
        <div class="message-area" #messageArea>
          @if (messages.length === 0) {
            <div class="placeholder">
              <div class="placeholder-icon">
                <i class="fas fa-sparkles"></i>
              </div>
              <h3>Start your learning journey</h3>
              <p>Select a mode below and ask your first question</p>
            </div>
          } @else {
            @for (message of messages; track message.id) {
              <div class="message" [class.user]="message.role === 'user'" [class.assistant]="message.role === 'assistant'">
                <div class="message-avatar">
                  @if (message.role === 'user') {
                    <i class="fas fa-user"></i>
                  } @else {
                    <i class="fas fa-robot"></i>
                  }
                </div>
                <div class="message-content">
                  <div class="message-text" [innerHTML]="renderMarkdown(message.content)"></div>
                  <div class="message-time">{{ formatTime(message.timestamp) }}</div>
                </div>
              </div>
            }
            @if (isLoading) {
              <div class="message assistant loading-message">
                <div class="message-avatar">
                  <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                  <div class="loading-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            }
          }
        </div>
        
        <div class="composer-area">
          <div class="mode-selector">
            <button 
              *ngFor="let mode of modes" 
              class="mode-btn"
              [class.active]="selectedMode === mode.value"
              (click)="selectedMode = mode.value"
              [disabled]="isLoading">
              <i [class]="mode.icon"></i> {{ mode.label }}
            </button>
          </div>
          
          <div class="input-container">
            <textarea 
              [(ngModel)]="userInput"
              (keydown.enter)="onEnterPress($any($event))"
              [disabled]="isLoading"
              placeholder="Type your question here..."
              rows="3"
              class="chat-input"></textarea>
            <button 
              class="send-btn"
              (click)="sendMessage()"
              [disabled]="!userInput.trim() || isLoading">
              @if (isLoading) {
                <span class="spinner"></span>
              } @else {
                <i class="fas fa-paper-plane"></i>
              }
            </button>
          </div>
          
          <div class="hint">
            <i class="fas fa-lightbulb"></i> <strong>{{ selectedModeLabel }}</strong>: {{ selectedModeHint }}
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .chat-page {
      min-height: calc(100vh - 72px);
      display: flex;
      flex-direction: column;
      background: #000000;
      font-family: 'Instrument Sans', sans-serif;
    }

    .chat-header {
      padding: 3rem 4rem 2rem;
      background: linear-gradient(180deg, #0A0A0A 0%, #000000 100%);
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .header-content h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.03em;
      display: flex;
      align-items: center;
      gap: 1rem;
      color: #FFFFFF;
    }

    .header-content h1 i {
      font-size: 2rem;
      color: #D4AF37;
    }

    .header-content p {
      margin: 0;
      font-size: 1.0625rem;
      color: rgba(255, 255, 255, 0.65);
      font-weight: 400;
      letter-spacing: -0.011em;
    }

    .chat-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      max-width: 1400px;
      width: 100%;
      margin: 0 auto;
      padding: 2rem 4rem 3rem;
    }

    .message-area {
      flex: 1;
      overflow-y: auto;
      padding: 2rem;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.04);
      border-radius: 14px;
      margin-bottom: 1.5rem;
      min-height: 500px;
    }

    .message-area::-webkit-scrollbar {
      width: 8px;
    }

    .message-area::-webkit-scrollbar-track {
      background: rgba(255, 255, 255, 0.02);
      border-radius: 4px;
    }

    .message-area::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 4px;
      border: 2px solid #0A0A0A;
    }

    .message-area::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.15);
    }

    .placeholder {
      text-align: center;
      color: rgba(255, 255, 255, 0.5);
      padding: 6rem 2rem;
    }

    .placeholder-icon {
      font-size: 3rem;
      margin-bottom: 1.5rem;
      color: #D4AF37;
      opacity: 0.6;
    }

    .placeholder-icon i {
      font-size: 3rem;
    }

    .placeholder h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 0.75rem;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }
    }

    .placeholder p {
      font-size: 1rem;
      opacity: 0.6;
      color: rgba(255, 255, 255, 0.5);
    }

    .message {
      display: flex;
      gap: 1.25rem;
      margin-bottom: 2rem;
      animation: slideIn 0.25s ease-out;
    }

    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .message.user {
      flex-direction: row-reverse;
    }

    .message-avatar {
      flex-shrink: 0;
      width: 36px;
      height: 36px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1rem;
      background: rgba(255, 255, 255, 0.06);
      border: 1px solid rgba(255, 255, 255, 0.08);
      color: rgba(255, 255, 255, 0.7);
    }

    .message.user .message-avatar {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border: none;
      color: #000000;
    }

    .message-content {
      flex: 1;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
      padding: 1rem;
      max-width: 70%;
    }

    .message.user .message-content {
      background: rgba(212, 175, 55, 0.08);
      border-color: rgba(212, 175, 55, 0.2);
    }

    .message-text {
      color: var(--text-primary);
      line-height: 1.6;
      word-wrap: break-word;
    }

    /* Markdown styling */
    .message-text ::ng-deep h1,
    .message-text ::ng-deep h2,
    .message-text ::ng-deep h3 {
      margin: 1rem 0 0.5rem 0;
      color: var(--text-primary);
      font-weight: 600;
    }

    .message-text ::ng-deep h1 {
      font-size: 1.5rem;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    .message-text ::ng-deep h2 {
      font-size: 1.25rem;
    }

    .message-text ::ng-deep h3 {
      font-size: 1.1rem;
    }

    .message-text ::ng-deep p {
      margin: 0.5rem 0;
    }

    .message-text ::ng-deep ul,
    .message-text ::ng-deep ol {
      margin: 0.5rem 0;
      padding-left: 1.5rem;
    }

    .message-text ::ng-deep li {
      margin: 0.25rem 0;
    }

    .message-text ::ng-deep code {
      background: rgba(212, 175, 55, 0.08);
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      font-size: 0.9em;
      color: #D4AF37;
    }

    .message-text ::ng-deep pre {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      margin: 0.5rem 0;
    }

    .message-text ::ng-deep pre code {
      background: none;
      padding: 0;
      color: var(--text-primary);
    }

    .message-text ::ng-deep blockquote {
      border-left: 4px solid #D4AF37;
      padding-left: 1rem;
      margin: 0.5rem 0;
      color: rgba(255, 255, 255, 0.6);
      font-style: italic;
    }

    .message-text ::ng-deep strong {
      font-weight: 600;
      color: #FFFFFF;
    }

    .message-text ::ng-deep em {
      font-style: italic;
    }

    .message-text ::ng-deep a {
      color: #D4AF37;
      text-decoration: none;
      border-bottom: 1px solid #D4AF37;
      transition: opacity 0.2s ease;
    }

    .message-text ::ng-deep a:hover {
      opacity: 0.8;
    }

    .message-text ::ng-deep hr {
      border: none;
      border-top: 1px solid var(--border-color);
      margin: 1rem 0;
    }

    .message-text ::ng-deep table {
      border-collapse: collapse;
      width: 100%;
      margin: 0.5rem 0;
    }

    .message-text ::ng-deep th,
    .message-text ::ng-deep td {
      border: 1px solid var(--border-color);
      padding: 0.5rem;
      text-align: left;
    }

    .message-text ::ng-deep th {
      background: rgba(212, 175, 55, 0.08);
      font-weight: 600;
    }

    .message-time {
      font-size: 0.75rem;
      color: var(--text-secondary);
      margin-top: 0.5rem;
      opacity: 0.7;
    }

    .loading-message .message-content {
      background: rgba(212, 175, 55, 0.04);
    }

    .loading-dots {
      display: flex;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }

    .loading-dots span {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--accent-primary);
      animation: bounce 1.4s infinite ease-in-out both;
    }

    .loading-dots span:nth-child(1) {
      animation-delay: -0.32s;
    }

    .loading-dots span:nth-child(2) {
      animation-delay: -0.16s;
    }

    @keyframes bounce {
      0%, 80%, 100% {
        transform: scale(0);
      }
      40% {
        transform: scale(1);
      }
    }

    .composer-area {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      background: #0A0A0A;
      border-radius: 14px;
      padding: 1.75rem;
    }

    .mode-selector {
      display: flex;
      gap: 0.625rem;
      margin-bottom: 1.25rem;
      flex-wrap: wrap;
    }

    .mode-btn {
      padding: 0.625rem 1.125rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.65);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Instrument Sans', sans-serif;
      letter-spacing: -0.011em;
    }

    .mode-btn i {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .mode-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.08);
      border-color: rgba(255, 255, 255, 0.12);
      color: rgba(255, 255, 255, 0.9);
    }

    .mode-btn.active {
      background: rgba(212, 175, 55, 0.12);
      border-color: rgba(212, 175, 55, 0.3);
      color: #D4AF37;
    }

    .mode-btn.active i {
      opacity: 1;
    }

    .mode-btn:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .input-container {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
    }

    .chat-input {
      flex: 1;
      background: #000000;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.875rem 1.125rem;
      color: #FFFFFF;
      font-size: 0.9375rem;
      font-family: 'Instrument Sans', sans-serif;
      resize: vertical;
      min-height: 60px;
      max-height: 200px;
      transition: all 0.2s ease;
      letter-spacing: -0.011em;
    }

    .chat-input:focus {
      outline: none;
      border-color: rgba(212, 175, 55, 0.4);
      background: #000000;
    }

    .chat-input:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }

    .send-btn {
      padding: 0 1.5rem;
      background: #FFFFFF;
      border: none;
      border-radius: 10px;
      color: #000000;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      min-width: 100px;
      height: 48px;
      font-family: 'Instrument Sans', sans-serif;
      letter-spacing: -0.011em;
    }

    .send-btn:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.9);
      transform: scale(1.02);
    }

    .send-btn:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }

    .send-btn i {
      font-size: 1rem;
    }

    .spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .hint {
      padding: 0.875rem 1.25rem;
      font-size: 0.875rem;
      font-family: 'Instrument Sans', system-ui, -apple-system, sans-serif;
      color: rgba(255, 255, 255, 0.5);
      text-align: center;
      background: rgba(212, 175, 55, 0.04);
      border: 1px solid rgba(212, 175, 55, 0.08);
      border-radius: 12px;
      margin-top: 0.5rem;
      letter-spacing: -0.011em;
    }

    @media (max-width: 768px) {
      .chat-container {
        padding: 1.5rem;
      }

      .chat-header {
        padding: 2rem 1.5rem;
      }

      .chat-header h1 {
        font-size: 2rem;
      }
    }
  `]
})
export class ChatComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  userInput = '';
  isLoading = false;
  selectedMode: 'explain' | 'solve' | 'hint' | 'quiz' = 'explain';
  private lastRequestTime = 0;
  
  modes = [
    { value: 'explain' as const, label: 'Explain', icon: 'fas fa-lightbulb', hint: 'Get detailed explanations of concepts' },
    { value: 'solve' as const, label: 'Solve', icon: 'fas fa-calculator', hint: 'Step-by-step problem solutions' },
    { value: 'hint' as const, label: 'Hint', icon: 'fas fa-compass', hint: 'Gentle hints without full solutions' },
    { value: 'quiz' as const, label: 'Quiz', icon: 'fas fa-question-circle', hint: 'Test your understanding with questions' }
  ];

  private subscription?: Subscription;

  constructor(
    private chatService: ChatService,
    private sanitizer: DomSanitizer
  ) {
    // Configure marked options
    marked.setOptions({
      breaks: true,
      gfm: true
    });
  }

  ngOnInit(): void {
    this.subscription = this.chatService.currentConversation$.subscribe(conversation => {
      if (conversation) {
        this.messages = conversation.messages;
        setTimeout(() => this.scrollToBottom(), 100);
      }
    });
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  async sendMessage(): Promise<void> {
    if (!this.userInput.trim() || this.isLoading) return;

    // Simple rate limiting: prevent rapid requests
    const now = Date.now();
    const timeSinceLastRequest = now - (this.lastRequestTime || 0);
    if (timeSinceLastRequest < 2000) { // 2 second minimum between requests
      return;
    }
    this.lastRequestTime = now;

    const content = this.userInput;
    this.userInput = '';
    this.isLoading = true;

    try {
      await this.chatService.sendMessage(content, {
        mode: this.selectedMode,
        level: 'college',
        stream: false
      });
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      this.isLoading = false;
      setTimeout(() => this.scrollToBottom(), 100);
    }
  }

  onEnterPress(event: KeyboardEvent): void {
    if (event.shiftKey) {
      return; // Allow shift+enter for new line
    }
    event.preventDefault();
    this.sendMessage();
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  renderMarkdown(content: string): SafeHtml {
    // First, handle inline and block math formulas
    let processed = content;
    
    // Handle display math: \[ ... \] or $$ ... $$
    processed = processed.replace(/\\\[([\s\S]*?)\\\]|\$\$([\s\S]*?)\$\$/g, (match, p1, p2) => {
      const formula = p1 || p2;
      try {
        return katex.renderToString(formula, { displayMode: true, throwOnError: false });
      } catch (e) {
        return match;
      }
    });
    
    // Handle inline math: \( ... \) or $ ... $
    processed = processed.replace(/\\\((.*?)\\\)|\$([^\$\n]+?)\$/g, (match, p1, p2) => {
      const formula = p1 || p2;
      try {
        return katex.renderToString(formula, { displayMode: false, throwOnError: false });
      } catch (e) {
        return match;
      }
    });
    
    // Then render markdown
    const html = marked.parse(processed) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  get selectedModeLabel(): string {
    return this.modes.find(m => m.value === this.selectedMode)?.label || 'Explain';
  }

  get selectedModeHint(): string {
    return this.modes.find(m => m.value === this.selectedMode)?.hint || '';
  }

  private scrollToBottom(): void {
    const messageArea = document.querySelector('.message-area');
    if (messageArea) {
      messageArea.scrollTop = messageArea.scrollHeight;
    }
  }
}
