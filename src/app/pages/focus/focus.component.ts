import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface ClockStyle {
  id: string;
  name: string;
  preview: string;
}

interface FocusSession {
  topic: string;
  duration: number; // in minutes
  subtopics: string[];
  startTime: Date;
  endTime?: Date;
  completed: boolean;
}

@Component({
  selector: 'app-focus',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="focus-container">
      <!-- Setup Phase -->
      <div class="setup-phase" *ngIf="phase === 'setup'">
        <div class="setup-card">
          <div class="icon-header">
            <i class="fa-solid fa-bullseye"></i>
            <h1>Focus Session</h1>
            <p>Set up your study session for maximum productivity</p>
          </div>

          <div class="form-section">
            <div class="form-group">
              <label for="topic">
                <i class="fa-solid fa-book"></i>
                What will you study?
              </label>
              <input 
                type="text" 
                id="topic" 
                [(ngModel)]="currentSession.topic"
                placeholder="e.g., Calculus - Integration"
                class="input-field">
            </div>

            <div class="form-group">
              <label for="duration">
                <i class="fa-solid fa-clock"></i>
                Study Duration (minutes)
              </label>
              <div class="duration-selector">
                <button 
                  *ngFor="let preset of durationPresets" 
                  (click)="setDuration(preset)"
                  [class.active]="currentSession.duration === preset"
                  class="duration-btn">
                  {{ preset }}m
                </button>
              </div>
              <input 
                type="number" 
                id="duration" 
                [(ngModel)]="currentSession.duration"
                min="1" 
                max="240"
                placeholder="Custom duration"
                class="input-field custom-duration">
            </div>

            <div class="form-group">
              <label>
                <i class="fa-solid fa-palette"></i>
                Clock Style
              </label>
              <div class="clock-styles">
                <button 
                  *ngFor="let style of clockStyles" 
                  (click)="selectedClockStyle = style.id"
                  [class.active]="selectedClockStyle === style.id"
                  class="clock-style-btn">
                  <div class="style-preview" [innerHTML]="style.preview"></div>
                  <span>{{ style.name }}</span>
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>
                <i class="fa-solid fa-droplet"></i>
                Clock Color
              </label>
              <div class="color-picker">
                <button 
                  *ngFor="let color of colorOptions" 
                  (click)="selectedColor = color.value"
                  [class.active]="selectedColor === color.value"
                  [style.background]="color.value"
                  class="color-btn"
                  [title]="color.name">
                </button>
                <input 
                  type="color" 
                  [(ngModel)]="selectedColor"
                  class="custom-color-picker">
              </div>
            </div>

            <button 
              (click)="startSession()"
              [disabled]="!currentSession.topic || !currentSession.duration"
              class="btn-start">
              <i class="fa-solid fa-play"></i>
              Start Focus Session
            </button>
          </div>
        </div>
      </div>

      <!-- Timer Phase -->
      <div class="timer-phase" *ngIf="phase === 'timer'">
        <div class="timer-header">
          <div class="session-info">
            <h2>{{ currentSession.topic }}</h2>
            <p>Stay focused and keep learning!</p>
          </div>
          <button (click)="pauseSession()" class="btn-icon" *ngIf="!isPaused">
            <i class="fa-solid fa-pause"></i>
          </button>
          <button (click)="resumeSession()" class="btn-icon" *ngIf="isPaused">
            <i class="fa-solid fa-play"></i>
          </button>
          <button (click)="stopSession()" class="btn-icon btn-danger">
            <i class="fa-solid fa-stop"></i>
          </button>
        </div>

        <div class="timer-display" [attr.data-style]="selectedClockStyle">
          <!-- Digital Clock -->
          <div class="clock digital" *ngIf="selectedClockStyle === 'digital'" [style.color]="selectedColor">
            <div class="time-segments">
              <div class="segment">
                <span class="digit">{{ formatDigit(Math.floor(timeRemaining / 60)) }}</span>
                <span class="label">minutes</span>
              </div>
              <span class="separator">:</span>
              <div class="segment">
                <span class="digit">{{ formatDigit(timeRemaining % 60) }}</span>
                <span class="label">seconds</span>
              </div>
            </div>
          </div>

          <!-- Circular Clock -->
          <div class="clock circular" *ngIf="selectedClockStyle === 'circular'">
            <svg viewBox="0 0 200 200" class="circular-svg">
              <circle cx="100" cy="100" r="90" class="circle-bg"/>
              <circle 
                cx="100" 
                cy="100" 
                r="90" 
                class="circle-progress"
                [style.stroke]="selectedColor"
                [style.stroke-dasharray]="565.48"
                [style.stroke-dashoffset]="565.48 * (1 - progress)"/>
            </svg>
            <div class="circular-time" [style.color]="selectedColor">
              <span class="time-text">{{ formatTime(timeRemaining) }}</span>
              <span class="time-label">remaining</span>
            </div>
          </div>

          <!-- Minimal Clock -->
          <div class="clock minimal" *ngIf="selectedClockStyle === 'minimal'" [style.color]="selectedColor">
            <div class="minimal-time">{{ formatTime(timeRemaining) }}</div>
            <div class="minimal-bar">
              <div class="minimal-progress" [style.width.%]="progress * 100" [style.background]="selectedColor"></div>
            </div>
          </div>

          <!-- Flip Clock -->
          <div class="clock flip" *ngIf="selectedClockStyle === 'flip'">
            <div class="flip-container">
              <div class="flip-card" [style.border-color]="selectedColor">
                <span [style.color]="selectedColor">{{ formatDigit(Math.floor(timeRemaining / 60)) }}</span>
              </div>
              <span class="flip-separator" [style.color]="selectedColor">:</span>
              <div class="flip-card" [style.border-color]="selectedColor">
                <span [style.color]="selectedColor">{{ formatDigit(timeRemaining % 60) }}</span>
              </div>
            </div>
            <div class="flip-label" [style.color]="selectedColor">Time Remaining</div>
          </div>
        </div>

        <div class="timer-stats">
          <div class="stat-card">
            <i class="fa-solid fa-fire"></i>
            <span class="stat-value">{{ Math.floor((totalDuration - timeRemaining) / 60) }}m</span>
            <span class="stat-label">Time Focused</span>
          </div>
          <div class="stat-card">
            <i class="fa-solid fa-percent"></i>
            <span class="stat-value">{{ Math.round(progress * 100) }}%</span>
            <span class="stat-label">Progress</span>
          </div>
          <div class="stat-card">
            <i class="fa-solid fa-target"></i>
            <span class="stat-value">{{ currentSession.duration }}m</span>
            <span class="stat-label">Goal</span>
          </div>
        </div>

        <div class="pause-overlay" *ngIf="isPaused">
          <div class="pause-card">
            <i class="fa-solid fa-pause-circle"></i>
            <h3>Session Paused</h3>
            <p>Take a breather, come back when you're ready</p>
            <button (click)="resumeSession()" class="btn-resume">
              <i class="fa-solid fa-play"></i>
              Resume Session
            </button>
          </div>
        </div>
      </div>

      <!-- Completion Phase -->
      <div class="completion-phase" *ngIf="phase === 'completion'">
        <div class="completion-card">
          <div class="celebration">
            <i class="fa-solid fa-trophy"></i>
            <h1>Great Work!</h1>
            <p>You completed {{ currentSession.duration }} minutes of focused study</p>
          </div>

          <div class="subtopics-section">
            <h3>
              <i class="fa-solid fa-list-check"></i>
              What did you cover in "{{ currentSession.topic }}"?
            </h3>
            <p class="instruction">Check all the subtopics you studied during this session</p>

            <div class="subtopic-input">
              <input 
                type="text" 
                [(ngModel)]="newSubtopic"
                (keyup.enter)="addSubtopic()"
                placeholder="Add a subtopic (e.g., Chain Rule)"
                class="input-field">
              <button (click)="addSubtopic()" class="btn-add">
                <i class="fa-solid fa-plus"></i>
              </button>
            </div>

            <div class="subtopics-list" *ngIf="availableSubtopics.length > 0">
              <label 
                *ngFor="let subtopic of availableSubtopics" 
                class="subtopic-item"
                [class.checked]="currentSession.subtopics.includes(subtopic)">
                <input 
                  type="checkbox" 
                  [checked]="currentSession.subtopics.includes(subtopic)"
                  (change)="toggleSubtopic(subtopic)">
                <span>{{ subtopic }}</span>
                <button (click)="removeSubtopicOption(subtopic)" class="btn-remove">
                  <i class="fa-solid fa-xmark"></i>
                </button>
              </label>
            </div>

            <div class="empty-state" *ngIf="availableSubtopics.length === 0">
              <i class="fa-solid fa-clipboard-list"></i>
              <p>Add subtopics to track what you studied</p>
            </div>
          </div>

          <div class="session-summary">
            <h4>Session Summary</h4>
            <div class="summary-grid">
              <div class="summary-item">
                <i class="fa-solid fa-book"></i>
                <div>
                  <strong>Topic</strong>
                  <span>{{ currentSession.topic }}</span>
                </div>
              </div>
              <div class="summary-item">
                <i class="fa-solid fa-clock"></i>
                <div>
                  <strong>Duration</strong>
                  <span>{{ currentSession.duration }} minutes</span>
                </div>
              </div>
              <div class="summary-item">
                <i class="fa-solid fa-list-check"></i>
                <div>
                  <strong>Subtopics Covered</strong>
                  <span>{{ currentSession.subtopics.length }} items</span>
                </div>
              </div>
            </div>
          </div>

          <div class="action-buttons">
            <button (click)="saveAndStartNew()" class="btn-primary">
              <i class="fa-solid fa-rotate-right"></i>
              Start New Session
            </button>
            <button (click)="saveAndExit()" class="btn-secondary">
              <i class="fa-solid fa-check"></i>
              Save & Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .focus-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%);
      padding: 2rem;
      font-family: 'Instrument Sans', sans-serif;
    }

    /* Setup Phase */
    .setup-phase {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      padding: 2rem;
    }

    .setup-card {
      max-width: 600px;
      width: 100%;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 20px;
      padding: 3rem;
      backdrop-filter: blur(10px);
    }

    .icon-header {
      text-align: center;
      margin-bottom: 3rem;
    }

    .icon-header i {
      font-size: 4rem;
      color: #D4AF37;
      margin-bottom: 1rem;
    }

    .icon-header h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 0.5rem 0;
    }

    .icon-header p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1rem;
      margin: 0;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 2rem;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-weight: 600;
      color: #FFFFFF;
      margin-bottom: 1rem;
      font-size: 1.0625rem;
    }

    .form-group label i {
      color: #D4AF37;
    }

    .input-field {
      width: 100%;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 10px;
      color: #FFFFFF;
      font-size: 1rem;
      font-family: 'Instrument Sans', sans-serif;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .input-field:focus {
      outline: none;
      border-color: #D4AF37;
      background: rgba(255, 255, 255, 0.08);
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
    }

    .input-field::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }

    .duration-selector {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .duration-btn {
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 10px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .duration-btn:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: #D4AF37;
      color: #D4AF37;
      transform: translateY(-2px);
    }

    .duration-btn.active {
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      border-color: #D4AF37;
      color: #0A0A0A;
    }

    .custom-duration {
      margin-top: 0.5rem;
    }

    .clock-styles {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
    }

    .clock-style-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.25rem;
      background: rgba(255, 255, 255, 0.05);
      border: 2px solid rgba(212, 175, 55, 0.3);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .clock-style-btn:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: #D4AF37;
      transform: translateY(-2px);
    }

    .clock-style-btn.active {
      border-color: #D4AF37;
      background: rgba(212, 175, 55, 0.15);
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
    }

    .style-preview {
      font-size: 2rem;
      color: #D4AF37;
    }

    .clock-style-btn span {
      color: rgba(255, 255, 255, 0.8);
      font-size: 0.875rem;
      font-weight: 500;
    }

    .color-picker {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      align-items: center;
    }

    .color-btn {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      border: 3px solid transparent;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .color-btn:hover {
      transform: scale(1.1);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .color-btn.active {
      border-color: #FFFFFF;
      box-shadow: 0 0 0 2px rgba(212, 175, 55, 0.5);
    }

    .custom-color-picker {
      width: 50px;
      height: 50px;
      border: 2px solid rgba(212, 175, 55, 0.3);
      border-radius: 10px;
      cursor: pointer;
      background: none;
    }

    .btn-start {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.25rem;
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      border: none;
      border-radius: 12px;
      color: #0A0A0A;
      font-size: 1.125rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.3);
    }

    .btn-start:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(212, 175, 55, 0.4);
    }

    .btn-start:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Timer Phase */
    .timer-phase {
      max-width: 800px;
      margin: 0 auto;
      padding: 2rem;
    }

    .timer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 3rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 16px;
    }

    .session-info h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 0.5rem 0;
    }

    .session-info p {
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }

    .btn-icon {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 12px;
      color: #D4AF37;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-icon:hover {
      background: rgba(212, 175, 55, 0.2);
      border-color: #D4AF37;
      transform: scale(1.05);
    }

    .btn-icon.btn-danger {
      color: #EF4444;
      border-color: rgba(239, 68, 68, 0.3);
    }

    .btn-icon.btn-danger:hover {
      background: rgba(239, 68, 68, 0.2);
      border-color: #EF4444;
    }

    .timer-display {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 400px;
      margin-bottom: 3rem;
    }

    /* Digital Clock - BIG BOLD MINIMAL */
    .clock.digital {
      text-align: center;
      padding: 4rem 2rem;
      width: 100%;
      max-width: 900px;
    }

    .time-segments {
      display: flex;
      align-items: center;
      gap: 2.5rem;
      justify-content: center;
    }

    .segment {
      display: flex;
      flex-direction: column;
      align-items: center;
    }

    .digit {
      font-family: 'Lexend', sans-serif;
      font-size: 14rem;
      font-weight: 900;
      line-height: 0.9;
      letter-spacing: -0.03em;
    }

    .separator {
      font-family: 'Lexend', sans-serif;
      font-size: 10rem;
      font-weight: 900;
      opacity: 0.6;
      animation: blink 2s ease-in-out infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 0.8; }
      50% { opacity: 0.2; }
    }

    .label {
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.4);
      margin-top: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      font-weight: 600;
    }

    /* Circular Clock - BIG BOLD MINIMAL */
    .clock.circular {
      position: relative;
      width: 550px;
      height: 550px;
    }

    .circular-svg {
      transform: rotate(-90deg);
      width: 100%;
      height: 100%;
    }

    .circle-bg {
      fill: none;
      stroke: rgba(255, 255, 255, 0.05);
      stroke-width: 24;
    }

    .circle-progress {
      fill: none;
      stroke-width: 24;
      stroke-linecap: round;
      transition: stroke-dashoffset 0.5s ease;
    }

    .circular-time {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      width: 100%;
    }

    .time-text {
      display: block;
      font-family: 'Lexend', sans-serif;
      font-size: 8rem;
      font-weight: 900;
      letter-spacing: -0.03em;
      line-height: 1;
    }

    .time-label {
      display: block;
      font-size: 1.125rem;
      color: rgba(255, 255, 255, 0.4);
      text-transform: uppercase;
      letter-spacing: 0.3em;
      margin-top: 1.25rem;
      font-weight: 600;
    }

    /* Minimal Clock - BIG BOLD MINIMAL */
    .clock.minimal {
      text-align: center;
      width: 100%;
      max-width: 900px;
      padding: 4rem 2rem;
    }

    .minimal-time {
      font-family: 'Lexend', sans-serif;
      font-size: 18rem;
      font-weight: 900;
      margin-bottom: 3rem;
      letter-spacing: -0.04em;
      line-height: 0.85;
    }

    .minimal-bar {
      width: 100%;
      height: 10px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 100px;
      overflow: hidden;
      position: relative;
    }

    .minimal-progress {
      height: 100%;
      transition: width 0.5s ease;
      border-radius: 100px;
    }

    /* Flip Clock - BIG BOLD MINIMAL */
    .clock.flip {
      text-align: center;
    }

    .flip-container {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 2rem;
      margin-bottom: 2rem;
    }

    .flip-card {
      width: 260px;
      height: 320px;
      background: rgba(255, 255, 255, 0.03);
      border: 2px solid;
      border-radius: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      overflow: hidden;
    }

    .flip-card::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 0;
      right: 0;
      height: 2px;
      background: rgba(0, 0, 0, 0.15);
    }

    .flip-card span {
      font-family: 'Lexend', sans-serif;
      font-size: 11rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      line-height: 1;
    }

    .flip-separator {
      font-family: 'Lexend', sans-serif;
      font-size: 7rem;
      font-weight: 900;
      opacity: 0.5;
    }

    .flip-label {
      font-size: 1rem;
      text-transform: uppercase;
      letter-spacing: 0.3em;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.4);
    }

    /* Timer Stats */
    .timer-stats {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1.5rem;
    }

    .stat-card {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 16px;
      text-align: center;
    }

    .stat-card i {
      font-size: 2rem;
      color: #D4AF37;
    }

    .stat-value {
      font-family: 'Lexend', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Pause Overlay */
    .pause-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(10, 10, 10, 0.97);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(20px);
      animation: fadeIn 0.3s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    .pause-card {
      text-align: center;
      padding: 3.5rem 3rem;
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03));
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 24px;
      max-width: 420px;
      backdrop-filter: blur(20px);
      box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.5),
        inset 0 1px 0 rgba(255, 255, 255, 0.1);
      animation: slideUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(30px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .pause-card i {
      font-size: 4rem;
      color: #D4AF37;
      margin-bottom: 1.5rem;
      animation: breathe 2s ease-in-out infinite;
    }

    @keyframes breathe {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.1); opacity: 0.8; }
    }

    .pause-card h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0 0 0.75rem 0;
      letter-spacing: -0.01em;
    }

    .pause-card p {
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 2rem 0;
      font-size: 0.9375rem;
      line-height: 1.6;
    }

    .btn-resume {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      border: none;
      border-radius: 12px;
      color: #0A0A0A;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.4);
      position: relative;
      overflow: hidden;
    }

    .btn-resume::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
      transition: left 0.5s ease;
    }

    .btn-resume:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 25px rgba(212, 175, 55, 0.5);
    }

    .btn-resume:hover::before {
      left: 100%;
    }

    .btn-resume:active {
      transform: translateY(0);
    }

    /* Completion Phase */
    .completion-phase {
      max-width: 700px;
      margin: 0 auto;
      padding: 2rem;
    }

    .completion-card {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 20px;
      padding: 3rem;
    }

    .celebration {
      text-align: center;
      margin-bottom: 3rem;
    }

    .celebration i {
      font-size: 5rem;
      color: #D4AF37;
      margin-bottom: 1.5rem;
      animation: bounce 1s infinite;
    }

    @keyframes bounce {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-20px); }
    }

    .celebration h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 1rem 0;
    }

    .celebration p {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.125rem;
      margin: 0;
    }

    .subtopics-section {
      margin-bottom: 2rem;
    }

    .subtopics-section h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0 0 0.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .subtopics-section h3 i {
      color: #D4AF37;
    }

    .instruction {
      color: rgba(255, 255, 255, 0.6);
      margin: 0 0 1.5rem 0;
    }

    .subtopic-input {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 1.5rem;
    }

    .subtopic-input .input-field {
      flex: 1;
    }

    .btn-add {
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      border: none;
      border-radius: 10px;
      color: #0A0A0A;
      font-size: 1.25rem;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
    }

    .btn-add:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }

    .subtopics-list {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .subtopic-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 10px;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .subtopic-item:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: #D4AF37;
    }

    .subtopic-item.checked {
      background: rgba(212, 175, 55, 0.15);
      border-color: #D4AF37;
    }

    .subtopic-item input[type="checkbox"] {
      width: 20px;
      height: 20px;
      accent-color: #D4AF37;
      cursor: pointer;
    }

    .subtopic-item span {
      flex: 1;
      color: rgba(255, 255, 255, 0.9);
    }

    .btn-remove {
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: rgba(239, 68, 68, 0.2);
      border: 1px solid rgba(239, 68, 68, 0.3);
      border-radius: 6px;
      color: #EF4444;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-remove:hover {
      background: rgba(239, 68, 68, 0.3);
      border-color: #EF4444;
    }

    .empty-state {
      text-align: center;
      padding: 3rem;
      color: rgba(255, 255, 255, 0.4);
    }

    .empty-state i {
      font-size: 3rem;
      margin-bottom: 1rem;
    }

    .session-summary {
      margin-bottom: 2rem;
      padding: 1.5rem;
      background: rgba(212, 175, 55, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 12px;
    }

    .session-summary h4 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #D4AF37;
      margin: 0 0 1rem 0;
    }

    .summary-grid {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .summary-item {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .summary-item i {
      font-size: 1.5rem;
      color: #D4AF37;
    }

    .summary-item div {
      flex: 1;
    }

    .summary-item strong {
      display: block;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.875rem;
      margin-bottom: 0.25rem;
    }

    .summary-item span {
      display: block;
      color: #FFFFFF;
      font-size: 1.0625rem;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.75rem;
      padding: 1.125rem;
      border: none;
      border-radius: 12px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .btn-primary {
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      color: #0A0A0A;
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
      color: #FFFFFF;
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: #D4AF37;
      transform: translateY(-2px);
    }

    @media (max-width: 768px) {
      .setup-card, .completion-card {
        padding: 2rem 1.5rem;
      }

      .duration-selector {
        grid-template-columns: repeat(2, 1fr);
      }

      .clock-styles {
        grid-template-columns: 1fr;
      }

      .clock.digital {
        max-width: 100%;
        padding: 2rem 1rem;
      }

      .digit {
        font-size: 6rem;
      }

      .separator {
        font-size: 4rem;
      }

      .time-segments {
        gap: 1rem;
      }

      .clock.circular {
        width: 300px;
        height: 300px;
      }

      .time-text {
        font-size: 3.5rem;
      }

      .clock.minimal {
        padding: 2rem 1rem;
      }

      .minimal-time {
        font-size: 8rem;
      }

      .flip-card {
        width: 140px;
        height: 180px;
      }

      .flip-card span {
        font-size: 5rem;
      }

      .flip-separator {
        font-size: 3rem;
      }

      .timer-stats {
        grid-template-columns: 1fr;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class FocusComponent implements OnInit, OnDestroy {
  Math = Math;
  
  phase: 'setup' | 'timer' | 'completion' = 'setup';
  
  currentSession: FocusSession = {
    topic: '',
    duration: 25,
    subtopics: [],
    startTime: new Date(),
    completed: false
  };

  durationPresets = [15, 25, 45, 60];
  
  clockStyles: ClockStyle[] = [
    { 
      id: 'digital', 
      name: 'Digital', 
      preview: '<i class="fa-solid fa-display" style="font-size: 2rem;"></i>' 
    },
    { 
      id: 'circular', 
      name: 'Circular', 
      preview: '<i class="fa-solid fa-circle-notch" style="font-size: 2rem;"></i>' 
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      preview: '<i class="fa-solid fa-minus" style="font-size: 2rem;"></i>' 
    },
    { 
      id: 'flip', 
      name: 'Flip', 
      preview: '<i class="fa-solid fa-clock" style="font-size: 2rem;"></i>' 
    }
  ];

  colorOptions = [
    { name: 'Gold', value: '#D4AF37' },
    { name: 'Blue', value: '#3B82F6' },
    { name: 'Green', value: '#10B981' },
    { name: 'Purple', value: '#8B5CF6' },
    { name: 'Pink', value: '#EC4899' },
    { name: 'Orange', value: '#F97316' },
    { name: 'Red', value: '#EF4444' },
    { name: 'Cyan', value: '#06B6D4' }
  ];

  selectedClockStyle = 'digital';
  selectedColor = '#D4AF37';
  
  timeRemaining = 0; // in seconds
  totalDuration = 0; // in seconds
  timerInterval: any;
  isPaused = false;
  
  availableSubtopics: string[] = [];
  newSubtopic = '';

  get progress(): number {
    if (this.totalDuration === 0) return 0;
    return 1 - (this.timeRemaining / this.totalDuration);
  }

  ngOnInit() {
    this.loadSettings();
  }

  ngOnDestroy() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  loadSettings() {
    const settings = localStorage.getItem('focusSettings');
    if (settings) {
      const parsed = JSON.parse(settings);
      this.selectedClockStyle = parsed.clockStyle || 'digital';
      this.selectedColor = parsed.color || '#D4AF37';
    }
  }

  saveSettings() {
    localStorage.setItem('focusSettings', JSON.stringify({
      clockStyle: this.selectedClockStyle,
      color: this.selectedColor
    }));
  }

  setDuration(minutes: number) {
    this.currentSession.duration = minutes;
  }

  startSession() {
    if (!this.currentSession.topic || !this.currentSession.duration) return;

    this.saveSettings();
    this.currentSession.startTime = new Date();
    this.totalDuration = this.currentSession.duration * 60;
    this.timeRemaining = this.totalDuration;
    this.phase = 'timer';
    
    this.timerInterval = setInterval(() => {
      if (!this.isPaused && this.timeRemaining > 0) {
        this.timeRemaining--;
        
        if (this.timeRemaining === 0) {
          this.completeSession();
        }
      }
    }, 1000);
  }

  pauseSession() {
    this.isPaused = true;
  }

  resumeSession() {
    this.isPaused = false;
  }

  stopSession() {
    if (confirm('Are you sure you want to stop this session? Your progress will not be saved.')) {
      this.resetSession();
    }
  }

  completeSession() {
    clearInterval(this.timerInterval);
    this.currentSession.endTime = new Date();
    this.currentSession.completed = true;
    this.phase = 'completion';
    
    // Play completion sound (optional)
    this.playCompletionSound();
  }

  playCompletionSound() {
    // Simple beep using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      console.log('Audio not supported');
    }
  }

  addSubtopic() {
    if (this.newSubtopic.trim()) {
      this.availableSubtopics.push(this.newSubtopic.trim());
      this.currentSession.subtopics.push(this.newSubtopic.trim());
      this.newSubtopic = '';
    }
  }

  toggleSubtopic(subtopic: string) {
    const index = this.currentSession.subtopics.indexOf(subtopic);
    if (index > -1) {
      this.currentSession.subtopics.splice(index, 1);
    } else {
      this.currentSession.subtopics.push(subtopic);
    }
  }

  removeSubtopicOption(subtopic: string) {
    const index = this.availableSubtopics.indexOf(subtopic);
    if (index > -1) {
      this.availableSubtopics.splice(index, 1);
    }
    
    const checkedIndex = this.currentSession.subtopics.indexOf(subtopic);
    if (checkedIndex > -1) {
      this.currentSession.subtopics.splice(checkedIndex, 1);
    }
  }

  saveAndStartNew() {
    this.saveFocusSession();
    this.resetSession();
  }

  saveAndExit() {
    this.saveFocusSession();
    // Navigate to home or progress page
    window.location.href = '/progress';
  }

  saveFocusSession() {
    const sessions = JSON.parse(localStorage.getItem('focusSessions') || '[]');
    sessions.push({
      ...this.currentSession,
      startTime: this.currentSession.startTime.toISOString(),
      endTime: this.currentSession.endTime?.toISOString()
    });
    localStorage.setItem('focusSessions', JSON.stringify(sessions));
  }

  resetSession() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
    
    this.currentSession = {
      topic: '',
      duration: 25,
      subtopics: [],
      startTime: new Date(),
      completed: false
    };
    
    this.timeRemaining = 0;
    this.totalDuration = 0;
    this.isPaused = false;
    this.availableSubtopics = [];
    this.newSubtopic = '';
    this.phase = 'setup';
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${this.formatDigit(mins)}:${this.formatDigit(secs)}`;
  }

  formatDigit(num: number): string {
    return num.toString().padStart(2, '0');
  }
}
