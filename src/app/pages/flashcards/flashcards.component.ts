import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Flashcard {
  id: string;
  front: string;
  back: string;
  deckId: string;
  nextReview: Date;
  interval: number;
  ease: number;
  reviews: number;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  cards: Flashcard[];
  createdAt: Date;
}

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="header">
        <h1><i class="fa-solid fa-layer-group"></i> Flashcards</h1>
        <p>Master concepts with spaced repetition</p>
      </div>

      <div class="content">
        <!-- Deck Selection View -->
        @if (!selectedDeck && !isCreatingDeck && !isStudying) {
          <div class="decks-container">
            <div class="decks-header">
              <h2>Your Decks</h2>
              <button class="create-deck-btn" (click)="startCreatingDeck()">
                <i class="fa-solid fa-plus"></i>
                New Deck
              </button>
            </div>

            @if (decks.length === 0) {
              <div class="empty-state">
                <div class="empty-icon">
                  <i class="fa-solid fa-layer-group"></i>
                </div>
                <h3>No Decks Yet</h3>
                <p>Create your first flashcard deck to start learning</p>
                <button class="action-btn primary" (click)="startCreatingDeck()">
                  <i class="fa-solid fa-plus"></i>
                  Create First Deck
                </button>
              </div>
            } @else {
              <div class="decks-grid">
                @for (deck of decks; track deck.id) {
                  <div class="deck-card" (click)="selectDeck(deck)">
                    <div class="deck-header">
                      <h3>{{ deck.name }}</h3>
                      <button class="delete-deck-btn" (click)="deleteDeck(deck.id, $event)">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                    <p class="deck-description">{{ deck.description }}</p>
                    <div class="deck-stats">
                      <div class="stat">
                        <i class="fa-solid fa-layer-group"></i>
                        <span>{{ deck.cards.length }} cards</span>
                      </div>
                      <div class="stat">
                        <i class="fa-solid fa-clock"></i>
                        <span>{{ getDueCards(deck) }} due</span>
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        }

        <!-- Create Deck Form -->
        @if (isCreatingDeck) {
          <div class="create-deck-container">
            <div class="form-card">
              <h2>Create New Deck</h2>
              <p class="form-subtitle">Build a collection of flashcards</p>

              <div class="form-group">
                <label><i class="fa-solid fa-heading"></i> Deck Name</label>
                <input 
                  type="text" 
                  class="input-field"
                  [(ngModel)]="newDeck.name"
                  placeholder="e.g., Spanish Vocabulary"
                  maxlength="50"
                />
              </div>

              <div class="form-group">
                <label><i class="fa-solid fa-align-left"></i> Description</label>
                <textarea 
                  class="input-field textarea"
                  [(ngModel)]="newDeck.description"
                  placeholder="What will you learn with this deck?"
                  maxlength="200"
                  rows="3"
                ></textarea>
              </div>

              <div class="form-actions">
                <button class="action-btn secondary" (click)="cancelDeckCreation()">
                  <i class="fa-solid fa-xmark"></i>
                  Cancel
                </button>
                <button class="action-btn primary" (click)="createDeck()" [disabled]="!newDeck.name.trim()">
                  <i class="fa-solid fa-check"></i>
                  Create Deck
                </button>
              </div>
            </div>
          </div>
        }

        <!-- Deck Management View -->
        @if (selectedDeck && !isStudying) {
          <div class="deck-management">
            <div class="management-header">
              <button class="back-btn" (click)="deselectDeck()">
                <i class="fa-solid fa-arrow-left"></i>
                Back to Decks
              </button>
              <h2>{{ selectedDeck.name }}</h2>
              <button class="study-btn" (click)="startStudying()" [disabled]="selectedDeck.cards.length === 0">
                <i class="fa-solid fa-brain"></i>
                Study Now
              </button>
            </div>

            <div class="cards-section">
              <div class="section-header">
                <h3>Cards ({{ selectedDeck.cards.length }})</h3>
                <button class="add-card-btn" (click)="toggleCardForm()">
                  <i class="fa-solid fa-plus"></i>
                  Add Card
                </button>
              </div>

              @if (showCardForm) {
                <div class="card-form">
                  <div class="form-group">
                    <label><i class="fa-solid fa-question"></i> Front (Question)</label>
                    <textarea 
                      class="input-field textarea"
                      [(ngModel)]="newCard.front"
                      placeholder="What's on the front of the card?"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label><i class="fa-solid fa-lightbulb"></i> Back (Answer)</label>
                    <textarea 
                      class="input-field textarea"
                      [(ngModel)]="newCard.back"
                      placeholder="What's on the back of the card?"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="form-actions">
                    <button class="action-btn secondary" (click)="cancelCardCreation()">
                      <i class="fa-solid fa-xmark"></i>
                      Cancel
                    </button>
                    <button class="action-btn primary" (click)="addCard()" [disabled]="!newCard.front.trim() || !newCard.back.trim()">
                      <i class="fa-solid fa-check"></i>
                      Add Card
                    </button>
                  </div>
                </div>
              }

              @if (selectedDeck.cards.length === 0) {
                <div class="empty-cards">
                  <i class="fa-solid fa-layer-group"></i>
                  <p>No cards yet. Add your first card to start learning!</p>
                </div>
              } @else {
                <div class="cards-list">
                  @for (card of selectedDeck.cards; track card.id) {
                    <div class="card-item">
                      <div class="card-content">
                        <div class="card-side">
                          <span class="side-label">Front</span>
                          <p>{{ card.front }}</p>
                        </div>
                        <div class="card-divider"></div>
                        <div class="card-side">
                          <span class="side-label">Back</span>
                          <p>{{ card.back }}</p>
                        </div>
                      </div>
                      <button class="delete-card-btn" (click)="deleteCard(card.id)">
                        <i class="fa-solid fa-trash"></i>
                      </button>
                    </div>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- Study View -->
        @if (isStudying && currentCard && !studyComplete) {
          <div class="study-container">
            <div class="study-header">
              <button class="exit-study-btn" (click)="exitStudy()">
                <i class="fa-solid fa-xmark"></i>
                Exit Study
              </button>
              <div class="study-progress">
                <span>{{ studyIndex + 1 }} / {{ studyCards.length }}</span>
              </div>
            </div>

            <div class="flashcard-wrapper">
              <div class="flashcard" [class.flipped]="isCardFlipped" (click)="flipCard()">
                <div class="flashcard-inner">
                  <div class="flashcard-front">
                    <div class="card-label">Question</div>
                    <div class="card-text">{{ currentCard.front }}</div>
                    <div class="flip-hint">
                      <i class="fa-solid fa-rotate"></i>
                      Click to reveal answer
                    </div>
                  </div>
                  <div class="flashcard-back">
                    <div class="card-label">Answer</div>
                    <div class="card-text">{{ currentCard.back }}</div>
                  </div>
                </div>
              </div>
            </div>

            @if (isCardFlipped) {
              <div class="rating-buttons">
                <button class="rating-btn hard" (click)="rateCard('hard')">
                  <i class="fa-solid fa-face-frown"></i>
                  <span>Hard</span>
                  <small>Review in 1 day</small>
                </button>
                <button class="rating-btn good" (click)="rateCard('good')">
                  <i class="fa-solid fa-face-meh"></i>
                  <span>Good</span>
                  <small>Review in 3 days</small>
                </button>
                <button class="rating-btn easy" (click)="rateCard('easy')">
                  <i class="fa-solid fa-face-smile"></i>
                  <span>Easy</span>
                  <small>Review in 7 days</small>
                </button>
              </div>
            }
          </div>
        }

        <!-- Study Complete -->
        @if (studyComplete) {
          <div class="study-complete">
            <div class="complete-card">
              <div class="complete-icon">
                <i class="fa-solid fa-trophy"></i>
              </div>
              <h2>Study Session Complete!</h2>
              <p>You've reviewed all {{ studyCards.length }} cards</p>
              <div class="complete-actions">
                <button class="action-btn secondary" (click)="exitStudy()">
                  <i class="fa-solid fa-arrow-left"></i>
                  Back to Deck
                </button>
                <button class="action-btn primary" (click)="restartStudy()">
                  <i class="fa-solid fa-rotate"></i>
                  Study Again
                </button>
              </div>
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

    /* Decks Container */
    .decks-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    .decks-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    .decks-header h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.03em;
    }

    .create-deck-btn {
      padding: 0.875rem 1.5rem;
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
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

    .create-deck-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    /* Empty State */
    .empty-state {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 4rem 3rem;
      text-align: center;
    }

    .empty-icon {
      font-size: 4rem;
      color: #D4AF37;
      margin-bottom: 1.5rem;
    }

    .empty-state h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.75rem;
      letter-spacing: -0.03em;
    }

    .empty-state p {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.125rem;
      margin-bottom: 2rem;
      letter-spacing: -0.011em;
    }

    /* Decks Grid */
    .decks-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;
    }

    .deck-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 16px;
      padding: 1.5rem;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .deck-card:hover {
      border-color: rgba(212, 175, 55, 0.3);
      transform: translateY(-4px);
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
    }

    .deck-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.75rem;
    }

    .deck-card h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0;
      flex: 1;
      letter-spacing: -0.02em;
    }

    .delete-deck-btn {
      background: none;
      border: none;
      color: rgba(239, 68, 68, 0.7);
      font-size: 1rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .delete-deck-btn:hover {
      color: #EF4444;
      transform: scale(1.1);
    }

    .deck-description {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.9375rem;
      margin-bottom: 1.25rem;
      letter-spacing: -0.011em;
      line-height: 1.5;
    }

    .deck-stats {
      display: flex;
      gap: 1.5rem;
    }

    .stat {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: -0.011em;
    }

    .stat i {
      color: #D4AF37;
    }

    /* Form Styles */
    .create-deck-container,
    .deck-management {
      max-width: 800px;
      margin: 0 auto;
    }

    .form-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 3rem;
    }

    .form-card h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.5rem;
      letter-spacing: -0.03em;
    }

    .form-subtitle {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      margin-bottom: 2.5rem;
      font-size: 1.0625rem;
      letter-spacing: -0.011em;
    }

    .form-group {
      margin-bottom: 2rem;
    }

    .form-group label {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: 'Instrument Sans', sans-serif;
      font-weight: 600;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.8);
      margin-bottom: 0.75rem;
      letter-spacing: -0.011em;
    }

    .form-group label i {
      color: #D4AF37;
    }

    .input-field {
      width: 100%;
      padding: 1rem 1.25rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.0625rem;
      color: #FFFFFF;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      letter-spacing: -0.011em;
    }

    .input-field:focus {
      outline: none;
      border-color: #D4AF37;
      background: #161616;
      box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.12);
    }

    .input-field::placeholder {
      color: rgba(255, 255, 255, 0.3);
    }

    .textarea {
      resize: vertical;
      min-height: 80px;
    }

    .form-actions {
      display: flex;
      gap: 1rem;
      justify-content: flex-end;
      margin-top: 2rem;
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

    .action-btn.primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    .action-btn.primary:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .action-btn.secondary {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #FFFFFF;
    }

    .action-btn.secondary:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
    }

    /* Deck Management */
    .management-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
    }

    .management-header h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 2rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      flex: 1;
      text-align: center;
      letter-spacing: -0.03em;
    }

    .back-btn,
    .study-btn {
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

    .study-btn {
      background: linear-gradient(135deg, #D4AF37 0%, #FFD700 100%);
      color: #000000;
    }

    .study-btn:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(212, 175, 55, 0.4);
    }

    .study-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* Cards Section */
    .cards-section {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 2rem;
    }

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .section-header h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.5rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.02em;
    }

    .add-card-btn {
      padding: 0.75rem 1.25rem;
      background: rgba(212, 175, 55, 0.12);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 12px;
      color: #D4AF37;
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

    .add-card-btn:hover {
      background: rgba(212, 175, 55, 0.2);
      transform: translateY(-2px);
    }

    .card-form {
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      padding: 2rem;
      margin-bottom: 2rem;
    }

    .empty-cards {
      text-align: center;
      padding: 3rem 2rem;
      color: rgba(255, 255, 255, 0.5);
    }

    .empty-cards i {
      font-size: 3rem;
      color: #D4AF37;
      margin-bottom: 1rem;
      display: block;
    }

    .empty-cards p {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 1.0625rem;
      margin: 0;
      letter-spacing: -0.011em;
    }

    .cards-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .card-item {
      display: flex;
      gap: 1rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 12px;
      padding: 1.25rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
    }

    .card-item:hover {
      border-color: rgba(212, 175, 55, 0.2);
    }

    .card-content {
      flex: 1;
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      gap: 1.5rem;
      align-items: center;
    }

    .card-side {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .side-label {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.75rem;
      font-weight: 600;
      color: #D4AF37;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .card-side p {
      font-family: 'Instrument Sans', sans-serif;
      color: #FFFFFF;
      font-size: 1rem;
      margin: 0;
      letter-spacing: -0.011em;
      line-height: 1.5;
    }

    .card-divider {
      width: 1px;
      height: 40px;
      background: rgba(255, 255, 255, 0.12);
    }

    .delete-card-btn {
      background: none;
      border: none;
      color: rgba(239, 68, 68, 0.6);
      font-size: 1.125rem;
      cursor: pointer;
      padding: 0.5rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      align-self: flex-start;
    }

    .delete-card-btn:hover {
      color: #EF4444;
      transform: scale(1.1);
    }

    /* Study Mode */
    .study-container {
      max-width: 900px;
      margin: 0 auto;
    }

    .study-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
    }

    .exit-study-btn {
      padding: 0.875rem 1.5rem;
      background: #121212;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 12px;
      color: #FFFFFF;
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

    .exit-study-btn:hover {
      background: #161616;
      border-color: rgba(212, 175, 55, 0.3);
    }

    .study-progress {
      font-family: 'Lexend', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #D4AF37;
      letter-spacing: -0.02em;
    }

    .flashcard-wrapper {
      perspective: 1000px;
      margin-bottom: 3rem;
    }

    .flashcard {
      width: 100%;
      height: 400px;
      position: relative;
      transition: transform 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      transform-style: preserve-3d;
      cursor: pointer;
    }

    .flashcard.flipped {
      transform: rotateY(180deg);
    }

    .flashcard-inner {
      position: relative;
      width: 100%;
      height: 100%;
      transform-style: preserve-3d;
    }

    .flashcard-front,
    .flashcard-back {
      position: absolute;
      width: 100%;
      height: 100%;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 3rem;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
    }

    .flashcard-back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, #0A0A0A 0%, #121212 100%);
      border-color: rgba(212, 175, 55, 0.2);
    }

    .card-label {
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.875rem;
      font-weight: 600;
      color: #D4AF37;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      margin-bottom: 2rem;
    }

    .card-text {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #FFFFFF;
      line-height: 1.4;
      letter-spacing: -0.02em;
      max-width: 600px;
    }

    .flip-hint {
      margin-top: auto;
      font-family: 'Instrument Sans', sans-serif;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.4);
      display: flex;
      align-items: center;
      gap: 0.5rem;
      letter-spacing: -0.011em;
    }

    .flip-hint i {
      color: #D4AF37;
    }

    .rating-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .rating-btn {
      padding: 1.5rem 1rem;
      background: #0A0A0A;
      border: 2px solid rgba(255, 255, 255, 0.08);
      border-radius: 16px;
      color: #FFFFFF;
      font-family: 'Instrument Sans', sans-serif;
      cursor: pointer;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .rating-btn i {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .rating-btn span {
      font-size: 1.125rem;
      font-weight: 600;
      letter-spacing: -0.011em;
    }

    .rating-btn small {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.5);
      letter-spacing: -0.011em;
    }

    .rating-btn.hard {
      border-color: rgba(239, 68, 68, 0.3);
    }

    .rating-btn.hard:hover {
      background: rgba(239, 68, 68, 0.1);
      border-color: #EF4444;
      transform: translateY(-4px);
    }

    .rating-btn.hard i {
      color: #EF4444;
    }

    .rating-btn.good {
      border-color: rgba(245, 158, 11, 0.3);
    }

    .rating-btn.good:hover {
      background: rgba(245, 158, 11, 0.1);
      border-color: #F59E0B;
      transform: translateY(-4px);
    }

    .rating-btn.good i {
      color: #F59E0B;
    }

    .rating-btn.easy {
      border-color: rgba(16, 185, 129, 0.3);
    }

    .rating-btn.easy:hover {
      background: rgba(16, 185, 129, 0.1);
      border-color: #10B981;
      transform: translateY(-4px);
    }

    .rating-btn.easy i {
      color: #10B981;
    }

    /* Study Complete */
    .study-complete {
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .complete-card {
      background: #0A0A0A;
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 24px;
      padding: 4rem 3rem;
      text-align: center;
      max-width: 600px;
    }

    .complete-icon {
      font-size: 5rem;
      color: #D4AF37;
      margin-bottom: 2rem;
      animation: bounce 1s ease-in-out;
    }

    @keyframes bounce {
      0%, 100% {
        transform: translateY(0);
      }
      50% {
        transform: translateY(-20px);
      }
    }

    .complete-card h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 2.25rem;
      font-weight: 700;
      color: #FFFFFF;
      margin-bottom: 0.75rem;
      letter-spacing: -0.03em;
    }

    .complete-card p {
      font-family: 'Instrument Sans', sans-serif;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.125rem;
      margin-bottom: 2.5rem;
      letter-spacing: -0.011em;
    }

    .complete-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
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

      .decks-grid {
        grid-template-columns: 1fr;
      }

      .management-header {
        flex-direction: column;
        align-items: stretch;
      }

      .management-header h2 {
        order: -1;
        margin-bottom: 1rem;
      }

      .card-content {
        grid-template-columns: 1fr;
        gap: 1rem;
      }

      .card-divider {
        display: none;
      }

      .flashcard {
        height: 350px;
      }

      .rating-buttons {
        grid-template-columns: 1fr;
      }

      .complete-actions {
        flex-direction: column;
      }

      .action-btn {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class FlashcardsComponent implements OnInit {
  decks: Deck[] = [];
  selectedDeck: Deck | null = null;
  isCreatingDeck = false;
  showCardForm = false;
  isStudying = false;
  studyComplete = false;
  
  newDeck = { name: '', description: '' };
  newCard = { front: '', back: '' };
  
  studyCards: Flashcard[] = [];
  studyIndex = 0;
  currentCard: Flashcard | null = null;
  isCardFlipped = false;

  ngOnInit(): void {
    this.loadDecks();
  }

  loadDecks(): void {
    const saved = localStorage.getItem('studybuddy_flashcard_decks');
    if (saved) {
      this.decks = JSON.parse(saved).map((d: any) => ({
        ...d,
        createdAt: new Date(d.createdAt),
        cards: d.cards.map((c: any) => ({
          ...c,
          nextReview: new Date(c.nextReview)
        }))
      }));
    }
  }

  saveDecks(): void {
    localStorage.setItem('studybuddy_flashcard_decks', JSON.stringify(this.decks));
  }

  startCreatingDeck(): void {
    this.isCreatingDeck = true;
    this.newDeck = { name: '', description: '' };
  }

  cancelDeckCreation(): void {
    this.isCreatingDeck = false;
    this.newDeck = { name: '', description: '' };
  }

  createDeck(): void {
    if (!this.newDeck.name.trim()) return;

    const deck: Deck = {
      id: `deck_${Date.now()}`,
      name: this.newDeck.name,
      description: this.newDeck.description,
      cards: [],
      createdAt: new Date()
    };

    this.decks.push(deck);
    this.saveDecks();
    this.isCreatingDeck = false;
    this.selectDeck(deck);
  }

  selectDeck(deck: Deck): void {
    this.selectedDeck = deck;
    this.showCardForm = false;
  }

  deselectDeck(): void {
    this.selectedDeck = null;
    this.showCardForm = false;
  }

  deleteDeck(deckId: string, event: Event): void {
    event.stopPropagation();
    if (confirm('Delete this deck and all its cards?')) {
      this.decks = this.decks.filter(d => d.id !== deckId);
      this.saveDecks();
      if (this.selectedDeck?.id === deckId) {
        this.selectedDeck = null;
      }
    }
  }

  toggleCardForm(): void {
    this.showCardForm = !this.showCardForm;
    this.newCard = { front: '', back: '' };
  }

  addCard(): void {
    if (!this.selectedDeck || !this.newCard.front.trim() || !this.newCard.back.trim()) return;

    const card: Flashcard = {
      id: `card_${Date.now()}`,
      front: this.newCard.front,
      back: this.newCard.back,
      deckId: this.selectedDeck.id,
      nextReview: new Date(),
      interval: 0,
      ease: 2.5,
      reviews: 0
    };

    this.selectedDeck.cards.push(card);
    this.saveDecks();
    this.showCardForm = false;
    this.newCard = { front: '', back: '' };
  }

  cancelCardCreation(): void {
    this.showCardForm = false;
    this.newCard = { front: '', back: '' };
  }

  deleteCard(cardId: string): void {
    if (!this.selectedDeck) return;
    if (confirm('Delete this card?')) {
      this.selectedDeck.cards = this.selectedDeck.cards.filter(c => c.id !== cardId);
      this.saveDecks();
    }
  }

  getDueCards(deck: Deck): number {
    const now = new Date();
    return deck.cards.filter(c => new Date(c.nextReview) <= now).length;
  }

  startStudying(): void {
    if (!this.selectedDeck || this.selectedDeck.cards.length === 0) return;
    
    this.studyCards = [...this.selectedDeck.cards];
    this.studyIndex = 0;
    this.currentCard = this.studyCards[0];
    this.isCardFlipped = false;
    this.isStudying = true;
    this.studyComplete = false;
  }

  flipCard(): void {
    this.isCardFlipped = !this.isCardFlipped;
  }

  rateCard(difficulty: 'hard' | 'good' | 'easy'): void {
    if (!this.currentCard || !this.selectedDeck) return;

    // Spaced repetition algorithm (simplified SM-2)
    const intervals = { hard: 1, good: 3, easy: 7 };
    const card = this.selectedDeck.cards.find(c => c.id === this.currentCard!.id);
    
    if (card) {
      card.reviews++;
      const dayInterval = intervals[difficulty];
      const nextReview = new Date();
      nextReview.setDate(nextReview.getDate() + dayInterval);
      card.nextReview = nextReview;
      card.interval = dayInterval;
      this.saveDecks();
    }

    // Move to next card
    if (this.studyIndex < this.studyCards.length - 1) {
      this.studyIndex++;
      this.currentCard = this.studyCards[this.studyIndex];
      this.isCardFlipped = false;
    } else {
      this.studyComplete = true;
      this.isStudying = false;
    }
  }

  exitStudy(): void {
    this.isStudying = false;
    this.studyComplete = false;
    this.currentCard = null;
    this.studyCards = [];
    this.studyIndex = 0;
    this.isCardFlipped = false;
  }

  restartStudy(): void {
    this.studyComplete = false;
    this.startStudying();
  }
}
