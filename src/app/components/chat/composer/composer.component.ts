import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TutorMode, ComprehensionLevel } from '../../../models';

@Component({
  selector: 'app-composer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="composer">
      <div class="controls">
        <label for="mode-select" class="sr-only">Study Mode</label>
        <select 
          id="mode-select"
          [(ngModel)]="selectedMode" 
          (change)="onModeChange()"
          class="control-select"
          aria-label="Select study mode">
          <option value="explain">Explain</option>
          <option value="solve">Solve Problem</option>
          <option value="hint">Get Hint</option>
          <option value="quiz">Generate Quiz</option>
        </select>

        <label for="level-select" class="sr-only">Comprehension Level</label>
        <select 
          id="level-select"
          [(ngModel)]="selectedLevel" 
          (change)="onLevelChange()"
          class="control-select"
          aria-label="Select comprehension level">
          <option value="child">Child (Age 12)</option>
          <option value="highschool">High School</option>
          <option value="college">College</option>
          <option value="expert">Expert</option>
        </select>
      </div>

      <div class="input-area">
        <label for="message-input" class="sr-only">Type your message</label>
        <textarea
          id="message-input"
          [(ngModel)]="message"
          (keydown)="onEnter($event)"
          [disabled]="disabled"
          placeholder="Ask a question, request an explanation, or solve a problem..."
          class="message-input"
          rows="3"
          aria-label="Message input"
          [attr.aria-disabled]="disabled">
        </textarea>
        
        <div class="actions">
          <button
            type="button"
            (click)="onAttach()"
            [disabled]="disabled"
            class="btn-icon"
            aria-label="Attach file"
            title="Attach file">
            <i class="fa-solid fa-paperclip"></i>
          </button>

          <button
            type="button"
            (click)="onSend()"
            [disabled]="disabled || !message.trim()"
            class="btn-primary"
            aria-label="Send message">
            Send
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .composer {
      background: white;
      border-top: 1px solid #e2e8f0;
      padding: 1rem;
    }

    .controls {
      display: flex;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
    }

    .control-select {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      font-size: 0.875rem;
      background: white;
      cursor: pointer;
      transition: border-color 0.2s;
    }

    .control-select:hover {
      border-color: #667eea;
    }

    .control-select:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .input-area {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .message-input {
      width: 100%;
      padding: 0.75rem;
      border: 1px solid #cbd5e0;
      border-radius: 8px;
      font-family: inherit;
      font-size: 1rem;
      resize: vertical;
      transition: border-color 0.2s;
    }

    .message-input:focus {
      outline: none;
      border-color: #667eea;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
    }

    .message-input:disabled {
      background: #f7fafc;
      cursor: not-allowed;
    }

    .actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .btn-icon {
      background: none;
      border: none;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.5rem;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .btn-icon:hover:not(:disabled) {
      background: #f7fafc;
    }

    .btn-icon:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn-primary {
      padding: 0.625rem 1.5rem;
      background: #667eea;
      color: white;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: background 0.2s;
    }

    .btn-primary:hover:not(:disabled) {
      background: #5568d3;
    }

    .btn-primary:disabled {
      background: #cbd5e0;
      cursor: not-allowed;
    }

    .btn-primary:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.3);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border-width: 0;
    }

    @media (max-width: 768px) {
      .composer {
        padding: 0.75rem;
      }

      .controls {
        flex-direction: column;
      }

      .control-select {
        width: 100%;
      }
    }
  `]
})
export class ComposerComponent {
  @Input() disabled = false;
  @Input() mode: TutorMode = 'explain';
  @Input() level: ComprehensionLevel = 'highschool';

  @Output() sendMessage = new EventEmitter<{ message: string; mode: TutorMode; level: ComprehensionLevel }>();
  @Output() attachFile = new EventEmitter<void>();
  @Output() modeChange = new EventEmitter<TutorMode>();
  @Output() levelChange = new EventEmitter<ComprehensionLevel>();

  message = '';
  selectedMode: TutorMode = this.mode;
  selectedLevel: ComprehensionLevel = this.level;

  ngOnInit() {
    this.selectedMode = this.mode;
    this.selectedLevel = this.level;
  }

  onSend() {
    if (this.message.trim() && !this.disabled) {
      this.sendMessage.emit({
        message: this.message,
        mode: this.selectedMode,
        level: this.selectedLevel
      });
      this.message = '';
    }
  }

  onEnter(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.onSend();
    }
  }

  onAttach() {
    this.attachFile.emit();
  }

  onModeChange() {
    this.modeChange.emit(this.selectedMode);
  }

  onLevelChange() {
    this.levelChange.emit(this.selectedLevel);
  }
}
