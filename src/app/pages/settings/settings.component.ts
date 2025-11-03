import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface SettingsData {
  userName: string;
  theme: string;
  notificationsEnabled: boolean;
  soundEnabled: boolean;
  autoSave: boolean;
  studyGoal: number;
  difficulty: string;
}

interface StorageStats {
  quizzes: number;
  flashcards: number;
  documents: number;
  totalSize: string;
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="settings-container">
        <!-- Header -->
        <header class="settings-header">
          <div class="header-content">
            <i class="fa-solid fa-gear header-icon"></i>
            <div>
              <h1 class="page-title">Settings</h1>
              <p class="page-subtitle">Manage your preferences and data</p>
            </div>
          </div>
        </header>

        <!-- Profile Section -->
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-user"></i>
              Profile
            </h2>
          </div>
          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label" for="userName">Display Name</label>
                <p class="setting-desc">Your name shown in the app</p>
              </div>
              <div class="setting-control">
                <input
                  id="userName"
                  type="text"
                  class="text-input"
                  [(ngModel)]="settings.userName"
                  placeholder="Enter your name"
                  (blur)="saveSettings()"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- Study Preferences -->
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-book-open"></i>
              Study Preferences
            </h2>
          </div>
          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label" for="studyGoal">Daily Study Goal</label>
                <p class="setting-desc">Target minutes per day</p>
              </div>
              <div class="setting-control">
                <div class="number-input-group">
                  <button class="number-btn" (click)="adjustStudyGoal(-5)">
                    <i class="fa-solid fa-minus"></i>
                  </button>
                  <input
                    id="studyGoal"
                    type="number"
                    class="number-input"
                    [(ngModel)]="settings.studyGoal"
                    min="5"
                    max="300"
                    step="5"
                    (change)="saveSettings()"
                  />
                  <button class="number-btn" (click)="adjustStudyGoal(5)">
                    <i class="fa-solid fa-plus"></i>
                  </button>
                </div>
                <span class="input-suffix">minutes</span>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label" for="difficulty">Default Difficulty</label>
                <p class="setting-desc">Preferred quiz difficulty level</p>
              </div>
              <div class="setting-control">
                <select
                  id="difficulty"
                  class="select-input"
                  [(ngModel)]="settings.difficulty"
                  (change)="saveSettings()"
                >
                  <option value="Easy">Easy</option>
                  <option value="Medium">Medium</option>
                  <option value="Hard">Hard</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <!-- App Settings -->
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-sliders"></i>
              App Settings
            </h2>
          </div>
          <div class="settings-card">
            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label">Theme</label>
                <p class="setting-desc">Choose your preferred theme</p>
              </div>
              <div class="setting-control">
                <div class="theme-selector">
                  <button
                    class="theme-option"
                    [class.active]="settings.theme === 'dark'"
                    (click)="selectTheme('dark')"
                  >
                    <i class="fa-solid fa-moon"></i>
                    <span>Dark</span>
                  </button>
                  <button
                    class="theme-option"
                    [class.active]="settings.theme === 'light'"
                    (click)="selectTheme('light')"
                    disabled
                  >
                    <i class="fa-solid fa-sun"></i>
                    <span>Light</span>
                    <span class="coming-soon-badge">Soon</span>
                  </button>
                </div>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label">Notifications</label>
                <p class="setting-desc">Study reminders and achievements</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.notificationsEnabled"
                    (change)="saveSettings()"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label">Sound Effects</label>
                <p class="setting-desc">Enable audio feedback</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.soundEnabled"
                    (change)="saveSettings()"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div class="setting-row">
              <div class="setting-info">
                <label class="setting-label">Auto-Save</label>
                <p class="setting-desc">Automatically save your progress</p>
              </div>
              <div class="setting-control">
                <label class="toggle-switch">
                  <input
                    type="checkbox"
                    [(ngModel)]="settings.autoSave"
                    (change)="saveSettings()"
                  />
                  <span class="toggle-slider"></span>
                </label>
              </div>
            </div>
          </div>
        </section>

        <!-- Data Management -->
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-database"></i>
              Data Management
            </h2>
          </div>
          <div class="settings-card">
            <div class="storage-overview">
              <div class="storage-stat">
                <div class="stat-icon quiz-stat">
                  <i class="fa-solid fa-graduation-cap"></i>
                </div>
                <div>
                  <p class="stat-count">{{ storageStats.quizzes }}</p>
                  <p class="stat-label">Quizzes</p>
                </div>
              </div>
              <div class="storage-stat">
                <div class="stat-icon flashcard-stat">
                  <i class="fa-solid fa-layer-group"></i>
                </div>
                <div>
                  <p class="stat-count">{{ storageStats.flashcards }}</p>
                  <p class="stat-label">Flashcards</p>
                </div>
              </div>
              <div class="storage-stat">
                <div class="stat-icon document-stat">
                  <i class="fa-solid fa-file-lines"></i>
                </div>
                <div>
                  <p class="stat-count">{{ storageStats.documents }}</p>
                  <p class="stat-label">Documents</p>
                </div>
              </div>
              <div class="storage-stat">
                <div class="stat-icon size-stat">
                  <i class="fa-solid fa-hard-drive"></i>
                </div>
                <div>
                  <p class="stat-count">{{ storageStats.totalSize }}</p>
                  <p class="stat-label">Storage Used</p>
                </div>
              </div>
            </div>

            <div class="data-actions">
              <button class="data-action-btn export" (click)="exportData()">
                <i class="fa-solid fa-download"></i>
                <div>
                  <span class="btn-title">Export Data</span>
                  <span class="btn-desc">Download all your data</span>
                </div>
              </button>
              <button class="data-action-btn clear" (click)="showClearConfirm = true">
                <i class="fa-solid fa-trash"></i>
                <div>
                  <span class="btn-title">Clear All Data</span>
                  <span class="btn-desc">Reset to factory settings</span>
                </div>
              </button>
            </div>
          </div>
        </section>

        <!-- About Section -->
        <section class="settings-section">
          <div class="section-header">
            <h2 class="section-title">
              <i class="fa-solid fa-circle-info"></i>
              About
            </h2>
          </div>
          <div class="settings-card about-card">
            <div class="about-content">
              <div class="app-logo">
                <i class="fa-solid fa-graduation-cap"></i>
              </div>
              <h3 class="app-name">StudyBuddy</h3>
              <p class="app-version">Version 1.1.0</p>
              <p class="app-desc">Your AI-powered study companion for smarter learning</p>
              <div class="app-features">
                <span class="feature-badge">AI Tutor</span>
                <span class="feature-badge">Quiz Generation</span>
                <span class="feature-badge">Flashcards</span>
                <span class="feature-badge">Progress Tracking</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Clear Data Confirmation Modal -->
    @if (showClearConfirm) {
      <div class="modal-overlay" (click)="showClearConfirm = false">
        <div class="modal-content" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <i class="fa-solid fa-triangle-exclamation warning-icon"></i>
            <h3>Clear All Data?</h3>
          </div>
          <div class="modal-body">
            <p>This will permanently delete:</p>
            <ul>
              <li>All quiz history ({{ storageStats.quizzes }} quizzes)</li>
              <li>All flashcard decks ({{ storageStats.flashcards }} cards)</li>
              <li>All uploaded documents ({{ storageStats.documents }} files)</li>
              <li>All chat conversations</li>
              <li>Your settings and preferences</li>
            </ul>
            <p class="warning-text"><strong>This action cannot be undone.</strong></p>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" (click)="showClearConfirm = false">
              <i class="fa-solid fa-xmark"></i>
              Cancel
            </button>
            <button class="modal-btn confirm" (click)="clearAllData()">
              <i class="fa-solid fa-trash"></i>
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Success Toast -->
    @if (showSuccessToast) {
      <div class="toast success-toast">
        <i class="fa-solid fa-circle-check"></i>
        <span>{{ toastMessage }}</span>
      </div>
    }
  `,
  styles: [`
    .settings-page {
      min-height: 100vh;
      background: #000000;
      padding: 2rem;
    }

    .settings-container {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Header */
    .settings-header {
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    }

    .header-content {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }

    .header-icon {
      width: 60px;
      height: 60px;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.75rem;
      color: #000000;
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.25);
    }

    .page-title {
      font-family: 'Lexend', sans-serif;
      font-size: 2.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0;
    }

    .page-subtitle {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.125rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.6);
      margin: 0.25rem 0 0 0;
    }

    /* Section */
    .settings-section {
      margin-bottom: 2.5rem;
    }

    .section-header {
      margin-bottom: 1rem;
    }

    .section-title {
      font-family: 'Lexend', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .section-title i {
      color: #D4AF37;
      font-size: 1.125rem;
    }

    .settings-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 0;
      overflow: hidden;
    }

    /* Setting Row */
    .setting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1.75rem 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
      transition: background 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .setting-row:last-child {
      border-bottom: none;
    }

    .setting-row:hover {
      background: rgba(255, 255, 255, 0.02);
    }

    .setting-info {
      flex: 1;
      min-width: 0;
    }

    .setting-label {
      font-family: 'Lexend', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: #ffffff;
      margin: 0 0 0.375rem 0;
      display: block;
    }

    .setting-desc {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    .setting-control {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    /* Text Input */
    .text-input {
      width: 280px;
      padding: 0.875rem 1.25rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: #ffffff;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .text-input:focus {
      outline: none;
      border-color: rgba(212, 175, 55, 0.5);
      box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
    }

    .text-input::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    /* Number Input */
    .number-input-group {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 0.5rem;
    }

    .number-btn {
      width: 36px;
      height: 36px;
      background: rgba(255, 255, 255, 0.04);
      border: none;
      border-radius: 8px;
      color: #D4AF37;
      font-size: 0.875rem;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .number-btn:hover {
      background: rgba(212, 175, 55, 0.12);
      transform: scale(1.05);
    }

    .number-input {
      width: 80px;
      padding: 0.5rem;
      background: transparent;
      border: none;
      color: #ffffff;
      font-family: 'Lexend', sans-serif;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.02em;
      text-align: center;
      -moz-appearance: textfield;
    }

    .number-input::-webkit-outer-spin-button,
    .number-input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .number-input:focus {
      outline: none;
    }

    .input-suffix {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
    }

    /* Select Input */
    .select-input {
      width: 200px;
      padding: 0.875rem 1.25rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: #ffffff;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      letter-spacing: -0.011em;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .select-input:focus {
      outline: none;
      border-color: rgba(212, 175, 55, 0.5);
    }

    .select-input option {
      background: #0A0A0A;
      color: #ffffff;
    }

    /* Theme Selector */
    .theme-selector {
      display: flex;
      gap: 0.75rem;
    }

    .theme-option {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
      padding: 1rem 1.5rem;
      background: #121212;
      border: 2px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: rgba(255, 255, 255, 0.6);
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 500;
      letter-spacing: -0.011em;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
    }

    .theme-option:not(:disabled):hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateY(-2px);
    }

    .theme-option.active {
      background: rgba(212, 175, 55, 0.12);
      border-color: #D4AF37;
      color: #D4AF37;
    }

    .theme-option:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .theme-option i {
      font-size: 1.5rem;
    }

    .coming-soon-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      padding: 0.25rem 0.5rem;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border-radius: 6px;
      color: #000000;
      font-size: 0.625rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    /* Toggle Switch */
    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 56px;
      height: 32px;
      cursor: pointer;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .toggle-slider {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 32px;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toggle-slider::before {
      content: '';
      position: absolute;
      width: 24px;
      height: 24px;
      left: 3px;
      top: 3px;
      background: #ffffff;
      border-radius: 50%;
      transition: transform 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .toggle-switch input:checked + .toggle-slider {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border-color: transparent;
    }

    .toggle-switch input:checked + .toggle-slider::before {
      transform: translateX(24px);
      background: #000000;
    }

    /* Storage Overview */
    .storage-overview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
      gap: 1.5rem;
      padding: 2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }

    .storage-stat {
      display: flex;
      align-items: center;
      gap: 0.875rem;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .quiz-stat {
      background: rgba(212, 175, 55, 0.12);
      color: #D4AF37;
    }

    .flashcard-stat {
      background: rgba(168, 85, 247, 0.12);
      color: #A855F7;
    }

    .document-stat {
      background: rgba(251, 146, 60, 0.12);
      color: #FB923C;
    }

    .size-stat {
      background: rgba(96, 165, 250, 0.12);
      color: #60A5FA;
    }

    .stat-count {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0;
    }

    .stat-label {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0;
    }

    /* Data Actions */
    .data-actions {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;
      padding: 1.5rem 2rem 2rem;
    }

    .data-action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      color: #ffffff;
      font-family: 'Instrument Sans', sans-serif;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .data-action-btn:hover {
      background: #161616;
      transform: translateY(-2px);
    }

    .data-action-btn.export:hover {
      border-color: rgba(34, 197, 94, 0.5);
    }

    .data-action-btn.clear:hover {
      border-color: rgba(239, 68, 68, 0.5);
    }

    .data-action-btn i {
      font-size: 1.5rem;
    }

    .data-action-btn.export i {
      color: #22C55E;
    }

    .data-action-btn.clear i {
      color: #EF4444;
    }

    .btn-title {
      display: block;
      font-size: 1rem;
      font-weight: 600;
      letter-spacing: -0.011em;
      color: #ffffff;
      margin-bottom: 0.25rem;
    }

    .btn-desc {
      display: block;
      font-size: 0.8125rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
    }

    /* About Card */
    .about-card {
      padding: 2.5rem;
    }

    .about-content {
      text-align: center;
    }

    .app-logo {
      width: 80px;
      height: 80px;
      margin: 0 auto 1.5rem;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2.5rem;
      color: #000000;
      box-shadow: 0 12px 32px rgba(212, 175, 55, 0.3);
    }

    .app-name {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0 0 0.5rem 0;
    }

    .app-version {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.5);
      margin: 0 0 1rem 0;
    }

    .app-desc {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 1.5rem 0;
      max-width: 400px;
      margin-left: auto;
      margin-right: auto;
    }

    .app-features {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }

    .feature-badge {
      padding: 0.5rem 1rem;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 8px;
      color: #D4AF37;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.8125rem;
      font-weight: 600;
      letter-spacing: -0.011em;
    }

    /* Modal */
    .modal-overlay {
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
      z-index: 1000;
      padding: 2rem;
      animation: fadeIn 280ms ease-out;
    }

    .modal-content {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      max-width: 500px;
      width: 100%;
      overflow: hidden;
      animation: slideUp 280ms ease-out;
    }

    .modal-header {
      padding: 2rem 2rem 1.5rem;
      text-align: center;
    }

    .warning-icon {
      font-size: 3rem;
      color: #EF4444;
      margin-bottom: 1rem;
    }

    .modal-header h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      letter-spacing: -0.03em;
      color: #ffffff;
      margin: 0;
    }

    .modal-body {
      padding: 0 2rem 2rem;
    }

    .modal-body p {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.7);
      margin: 0 0 1rem 0;
    }

    .modal-body ul {
      list-style: none;
      padding: 0;
      margin: 0 0 1rem 0;
    }

    .modal-body li {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 400;
      letter-spacing: -0.011em;
      color: rgba(255, 255, 255, 0.6);
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }

    .modal-body li::before {
      content: '•';
      position: absolute;
      left: 0;
      color: #EF4444;
      font-size: 1.25rem;
      line-height: 1;
    }

    .warning-text {
      color: #EF4444 !important;
      font-weight: 600 !important;
    }

    .modal-actions {
      display: flex;
      gap: 1rem;
      padding: 1.5rem 2rem 2rem;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
    }

    .modal-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.625rem;
      padding: 1rem;
      border: none;
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 600;
      letter-spacing: -0.011em;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .modal-btn.cancel {
      background: rgba(255, 255, 255, 0.08);
      color: #ffffff;
    }

    .modal-btn.cancel:hover {
      background: rgba(255, 255, 255, 0.12);
    }

    .modal-btn.confirm {
      background: #EF4444;
      color: #ffffff;
    }

    .modal-btn.confirm:hover {
      background: #DC2626;
      transform: translateY(-2px);
    }

    /* Toast */
    .toast {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      border-radius: 12px;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      font-weight: 500;
      letter-spacing: -0.011em;
      z-index: 1001;
      animation: slideInRight 280ms ease-out, fadeOut 280ms ease-in 2720ms forwards;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4);
    }

    .success-toast {
      background: #22C55E;
      color: #000000;
    }

    .toast i {
      font-size: 1.25rem;
    }

    /* Animations */
    @keyframes fadeIn {
      from {
        opacity: 0;
      }
      to {
        opacity: 1;
      }
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

    @keyframes slideInRight {
      from {
        opacity: 0;
        transform: translateX(100px);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    }

    @keyframes fadeOut {
      from {
        opacity: 1;
      }
      to {
        opacity: 0;
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .settings-page {
        padding: 1rem;
      }

      .page-title {
        font-size: 2rem;
      }

      .setting-row {
        flex-direction: column;
        align-items: flex-start;
        gap: 1.25rem;
        padding: 1.5rem;
      }

      .setting-control {
        width: 100%;
        justify-content: flex-end;
      }

      .text-input {
        width: 100%;
      }

      .theme-selector {
        width: 100%;
        justify-content: flex-end;
      }

      .storage-overview {
        grid-template-columns: repeat(2, 1fr);
      }

      .data-actions {
        grid-template-columns: 1fr;
      }

      .toast {
        left: 1rem;
        right: 1rem;
        bottom: 1rem;
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  settings: SettingsData = {
    userName: '',
    theme: 'dark',
    notificationsEnabled: true,
    soundEnabled: false,
    autoSave: true,
    studyGoal: 30,
    difficulty: 'Medium'
  };

  storageStats: StorageStats = {
    quizzes: 0,
    flashcards: 0,
    documents: 0,
    totalSize: '0 KB'
  };

  showClearConfirm = false;
  showSuccessToast = false;
  toastMessage = '';

  ngOnInit() {
    this.loadSettings();
    this.calculateStorageStats();
  }

  private loadSettings(): void {
    const savedSettings = localStorage.getItem('studybuddy_settings');
    if (savedSettings) {
      this.settings = { ...this.settings, ...JSON.parse(savedSettings) };
    }

    // Load user name separately for backwards compatibility
    const savedName = localStorage.getItem('studybuddy_user_name');
    if (savedName && !this.settings.userName) {
      this.settings.userName = savedName;
    }
  }

  saveSettings(): void {
    localStorage.setItem('studybuddy_settings', JSON.stringify(this.settings));
    
    // Save user name separately for backwards compatibility
    if (this.settings.userName) {
      localStorage.setItem('studybuddy_user_name', this.settings.userName);
    }

    this.showToast('Settings saved successfully');
  }

  selectTheme(theme: string): void {
    this.settings.theme = theme;
    this.saveSettings();
  }

  adjustStudyGoal(change: number): void {
    const newGoal = this.settings.studyGoal + change;
    if (newGoal >= 5 && newGoal <= 300) {
      this.settings.studyGoal = newGoal;
      this.saveSettings();
    }
  }

  private calculateStorageStats(): void {
    // Count quizzes
    const quizHistory = localStorage.getItem('studybuddy_quiz_history');
    if (quizHistory) {
      this.storageStats.quizzes = JSON.parse(quizHistory).length;
    }

    // Count flashcards
    const decks = localStorage.getItem('studybuddy_flashcard_decks');
    if (decks) {
      const deckData = JSON.parse(decks);
      let totalCards = 0;
      deckData.forEach((deck: any) => {
        totalCards += deck.cards?.length || 0;
      });
      this.storageStats.flashcards = totalCards;
    }

    // Count documents
    const documents = localStorage.getItem('studybuddy_documents');
    if (documents) {
      this.storageStats.documents = JSON.parse(documents).length;
    }

    // Calculate total size
    let totalSize = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('studybuddy_')) {
        const value = localStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
    }

    // Convert to readable format
    if (totalSize < 1024) {
      this.storageStats.totalSize = totalSize + ' B';
    } else if (totalSize < 1024 * 1024) {
      this.storageStats.totalSize = (totalSize / 1024).toFixed(2) + ' KB';
    } else {
      this.storageStats.totalSize = (totalSize / (1024 * 1024)).toFixed(2) + ' MB';
    }
  }

  exportData(): void {
    const data = {
      version: '1.1.0',
      exportDate: new Date().toISOString(),
      userName: this.settings.userName,
      settings: this.settings,
      quizHistory: JSON.parse(localStorage.getItem('studybuddy_quiz_history') || '[]'),
      flashcardDecks: JSON.parse(localStorage.getItem('studybuddy_flashcard_decks') || '[]'),
      documents: JSON.parse(localStorage.getItem('studybuddy_documents') || '[]')
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studybuddy-backup-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    this.showToast('Data exported successfully');
  }

  clearAllData(): void {
    // Clear all StudyBuddy data from localStorage
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('studybuddy_')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));

    // Reset to defaults
    this.settings = {
      userName: '',
      theme: 'dark',
      notificationsEnabled: true,
      soundEnabled: false,
      autoSave: true,
      studyGoal: 30,
      difficulty: 'Medium'
    };

    this.storageStats = {
      quizzes: 0,
      flashcards: 0,
      documents: 0,
      totalSize: '0 KB'
    };

    this.showClearConfirm = false;
    this.showToast('All data cleared successfully');

    // Reload page after a short delay
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  }

  private showToast(message: string): void {
    this.toastMessage = message;
    this.showSuccessToast = true;
    setTimeout(() => {
      this.showSuccessToast = false;
    }, 3000);
  }
}
