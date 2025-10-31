import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Conversation, Message, ChatRequest, ChatOptions, SourceReference } from '../models';
import { StorageService } from './storage.service';
import { ApiService } from './api.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private currentConversationSubject = new BehaviorSubject<Conversation | null>(null);
  public currentConversation$ = this.currentConversationSubject.asObservable();

  private conversationsSubject = new BehaviorSubject<Conversation[]>([]);
  public conversations$ = this.conversationsSubject.asObservable();

  constructor(
    private storage: StorageService,
    private api: ApiService,
    private userService: UserService
  ) {
    this.loadConversations();
  }

  private async loadConversations(): Promise<void> {
    await this.storage.init();
    const conversations = await this.storage.getAllConversations();
    this.conversationsSubject.next(conversations);
  }

  async createConversation(title?: string): Promise<Conversation> {
    const conversation: Conversation = {
      id: this.generateId(),
      title: title || 'New Conversation',
      messages: [],
      topics: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: this.userService.getCurrentUser()?.id
    };

    await this.storage.saveConversation(conversation);
    this.currentConversationSubject.next(conversation);
    await this.loadConversations();
    
    return conversation;
  }

  async loadConversation(id: string): Promise<void> {
    const conversation = await this.storage.getConversation(id);
    if (conversation) {
      this.currentConversationSubject.next(conversation);
    }
  }

  async sendMessage(
    content: string, 
    options: ChatOptions
  ): Promise<Message> {
    let conversation = this.currentConversationSubject.value;
    
    if (!conversation) {
      conversation = await this.createConversation();
    }

    // Add user message
    const userMessage: Message = {
      id: this.generateId(),
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
      meta: {
        mode: options.mode,
        level: options.level
      }
    };

    conversation.messages.push(userMessage);
    conversation.updatedAt = new Date().toISOString();

    // Save conversation state
    await this.storage.saveConversation(conversation);
    this.currentConversationSubject.next({ ...conversation });

    // Build chat request
    const request: ChatRequest = {
      conversationId: conversation.id,
      messages: conversation.messages,
      options
    };

    try {
      // Call API (will use mock for now)
      const response = await this.api.chat(request).toPromise();
      
      if (response && response.success && response.data) {
        const assistantMessage = response.data.message;
        
        // Add sources to metadata if available
        if (response.data.sources) {
          assistantMessage.meta = {
            ...assistantMessage.meta,
            sourceRefs: response.data.sources
          };
        }

        conversation.messages.push(assistantMessage);
        conversation.updatedAt = new Date().toISOString();

        // Auto-generate title from first exchange
        if (conversation.messages.length === 2 && conversation.title === 'New Conversation') {
          conversation.title = this.generateTitle(content);
        }

        await this.storage.saveConversation(conversation);
        this.currentConversationSubject.next({ ...conversation });
        await this.loadConversations();

        return assistantMessage;
      } else if (response && !response.success) {
        // Handle API error response
        const errorMessage = typeof response.error === 'string' 
          ? response.error 
          : 'An error occurred';
        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      
      // Determine error message based on error type
      let errorContent = 'Sorry, I encountered an error processing your request. Please try again.';
      
      if (error.status === 429) {
        errorContent = 'Too many requests. Please wait a moment before trying again.';
      } else if (error.status === 504 || error.status === 408) {
        errorContent = 'The request timed out. Please try again with a shorter message.';
      } else if (error.status === 503) {
        errorContent = 'The AI service is temporarily unavailable. Please try again in a moment.';
      } else if (error.status === 400) {
        errorContent = error.error?.error || 'Invalid request. Please check your input and try again.';
      } else if (error.message) {
        errorContent = error.message;
      } else if (!navigator.onLine) {
        errorContent = 'No internet connection. Please check your network and try again.';
      }
      
      // Add error message
      const errorMessage: Message = {
        id: this.generateId(),
        role: 'assistant',
        content: errorContent,
        timestamp: new Date().toISOString(),
        meta: { 
          mode: options.mode, 
          level: options.level,
          error: true 
        }
      };
      
      conversation.messages.push(errorMessage);
      await this.storage.saveConversation(conversation);
      this.currentConversationSubject.next({ ...conversation });
      
      return errorMessage;
    }

    throw new Error('Failed to send message');
  }

  async deleteConversation(id: string): Promise<void> {
    await this.storage.deleteConversation(id);
    
    if (this.currentConversationSubject.value?.id === id) {
      this.currentConversationSubject.next(null);
    }
    
    await this.loadConversations();
  }

  async clearCurrentConversation(): Promise<void> {
    this.currentConversationSubject.next(null);
  }

  private generateTitle(firstMessage: string): string {
    const maxLength = 50;
    const title = firstMessage.length > maxLength 
      ? firstMessage.substring(0, maxLength) + '...' 
      : firstMessage;
    return title;
  }

  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getCurrentConversation(): Conversation | null {
    return this.currentConversationSubject.value;
  }
}
