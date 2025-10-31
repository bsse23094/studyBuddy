import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-welcome-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="dialog-overlay" (click)="onOverlayClick($event)">
      <div class="dialog-content" (click)="$event.stopPropagation()">
        <div class="dialog-icon">
          <i class="fa-solid fa-user-circle"></i>
        </div>
        <h1>Welcome to StudyBuddy</h1>
        <p class="dialog-subtitle">Let's personalize your experience</p>
        
        <div class="form-group">
          <label for="userName">What's your name?</label>
          <input
            id="userName"
            type="text"
            [(ngModel)]="userName"
            (keyup.enter)="onSubmit()"
            placeholder="Enter your name"
            autofocus
            class="name-input"
          />
        </div>
        
        <button 
          class="submit-btn" 
          (click)="onSubmit()"
          [disabled]="!userName.trim()"
        >
          <span>Get Started</span>
          <i class="fa-solid fa-arrow-right"></i>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .dialog-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
    }

    .dialog-content {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 24px;
      padding: 3rem;
      max-width: 500px;
      width: 90%;
      text-align: center;
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .dialog-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 2rem;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: #000000;
    }

    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      letter-spacing: -0.03em;
      color: #FFFFFF;
    }

    .dialog-subtitle {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 2.5rem;
      letter-spacing: -0.011em;
    }

    .form-group {
      margin-bottom: 2rem;
      text-align: left;
    }

    label {
      display: block;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 600;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.75rem;
      letter-spacing: -0.011em;
    }

    .name-input {
      width: 100%;
      padding: 1rem 1.25rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.125rem;
      color: #FFFFFF;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.011em;
    }

    .name-input:focus {
      outline: none;
      border-color: #D4AF37;
      background: #161616;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
    }

    .name-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .submit-btn {
      width: 100%;
      padding: 1rem 2rem;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
      border: none;
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.0625rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.011em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
    }

    .submit-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    .submit-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    .submit-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    @media (max-width: 768px) {
      .dialog-content {
        padding: 2rem 1.5rem;
      }

      h1 {
        font-size: 2rem;
      }

      .dialog-icon {
        width: 64px;
        height: 64px;
        font-size: 2rem;
      }
    }
  `]
})
export class WelcomeDialogComponent {
  @Output() nameSubmitted = new EventEmitter<string>();
  userName = '';

  onSubmit(): void {
    if (this.userName.trim()) {
      this.nameSubmitted.emit(this.userName.trim());
    }
  }

  onOverlayClick(event: MouseEvent): void {
    // Optional: Allow closing by clicking overlay
    // this.nameSubmitted.emit('');
  }
}
