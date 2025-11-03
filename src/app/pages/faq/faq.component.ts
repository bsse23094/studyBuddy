import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface FAQItem {
  question: string;
  answer: string;
  category: string;
  icon: string;
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="faq-container">
      <div class="header-section">
        <div class="icon-wrapper">
          <i class="fa-solid fa-circle-question"></i>
        </div>
        <h1>Frequently Asked Questions</h1>
        <p class="subtitle">Find answers to common questions about StudyBuddy</p>
      </div>

      <div class="content-section">
        <!-- Category Filter -->
        <div class="category-filter">
          <button 
            *ngFor="let category of categories" 
            [class.active]="selectedCategory === category"
            (click)="selectCategory(category)"
            class="category-btn">
            <i [class]="getCategoryIcon(category)"></i>
            {{ category }}
          </button>
        </div>

        <!-- FAQ Items -->
        <div class="faq-list">
          <div 
            *ngFor="let faq of filteredFAQs; let i = index" 
            class="faq-item"
            [class.active]="expandedIndex === i">
            <div class="faq-question" (click)="toggleFAQ(i)">
              <div class="question-content">
                <i [class]="faq.icon" class="question-icon"></i>
                <span>{{ faq.question }}</span>
              </div>
              <i class="fa-solid" [class.fa-chevron-down]="expandedIndex !== i" 
                 [class.fa-chevron-up]="expandedIndex === i"></i>
            </div>
            <div class="faq-answer" [class.expanded]="expandedIndex === i">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>

        <!-- Contact Section -->
        <div class="contact-section">
          <div class="contact-card">
            <i class="fa-solid fa-headset"></i>
            <h3>Still have questions?</h3>
            <p>Can't find the answer you're looking for? Our support team is here to help!</p>
            <div class="contact-actions">
              <a href="mailto:ahmedayyan555@gmail.com" class="btn-primary">
                <i class="fa-solid fa-envelope"></i>
                Contact Support
              </a>
              <a href="https://github.com/bsse23094/studyBuddy/issues" target="_blank" class="btn-secondary">
                <i class="fa-solid fa-bug"></i>
                Report Issue
              </a>
            </div>
          </div>
        </div>

        <div class="back-to-top">
          <a routerLink="/home" class="btn-outline">
            <i class="fa-solid fa-home"></i> Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .faq-container {
      min-height: 100vh;
      background: linear-gradient(135deg, #0A0A0A 0%, #1a1a1a 100%);
      padding: 2rem;
      font-family: 'Instrument Sans', sans-serif;
    }

    .header-section {
      text-align: center;
      padding: 3rem 0;
      max-width: 800px;
      margin: 0 auto;
    }

    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 80px;
      height: 80px;
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      border-radius: 20px;
      margin-bottom: 1.5rem;
      box-shadow: 0 10px 30px rgba(212, 175, 55, 0.3);
    }

    .icon-wrapper i {
      font-size: 2.5rem;
      color: #0A0A0A;
    }

    h1 {
      font-family: 'Lexend', sans-serif;
      font-size: 3rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 1rem 0;
      letter-spacing: -0.02em;
    }

    .subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 1.125rem;
      margin: 0;
    }

    .content-section {
      max-width: 900px;
      margin: 0 auto;
    }

    /* Category Filter */
    .category-filter {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
      justify-content: center;
      margin-bottom: 3rem;
      padding: 1.5rem;
      background: rgba(255, 255, 255, 0.03);
      border-radius: 12px;
      border: 1px solid rgba(212, 175, 55, 0.1);
    }

    .category-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.75rem 1.5rem;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9375rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .category-btn:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: rgba(212, 175, 55, 0.4);
      color: #D4AF37;
      transform: translateY(-2px);
    }

    .category-btn.active {
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      border-color: #D4AF37;
      color: #0A0A0A;
      font-weight: 600;
    }

    .category-btn i {
      font-size: 1rem;
    }

    /* FAQ List */
    .faq-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 3rem;
    }

    .faq-item {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 12px;
      overflow: hidden;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .faq-item:hover {
      border-color: rgba(212, 175, 55, 0.4);
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.1);
    }

    .faq-item.active {
      border-color: #D4AF37;
      box-shadow: 0 4px 20px rgba(212, 175, 55, 0.2);
    }

    .faq-question {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.5rem;
      cursor: pointer;
      user-select: none;
    }

    .question-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      flex: 1;
    }

    .question-icon {
      color: #D4AF37;
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .question-content span {
      font-family: 'Lexend', sans-serif;
      font-size: 1.0625rem;
      font-weight: 600;
      color: #FFFFFF;
      line-height: 1.5;
    }

    .faq-question > i {
      color: #D4AF37;
      font-size: 1rem;
      transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      flex-shrink: 0;
    }

    .faq-answer {
      max-height: 0;
      overflow: hidden;
      transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .faq-answer.expanded {
      max-height: 500px;
    }

    .faq-answer p {
      padding: 0 1.5rem 1.5rem 1.5rem;
      margin: 0;
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.7;
      font-size: 1rem;
      padding-left: 4rem;
    }

    /* Contact Section */
    .contact-section {
      margin-bottom: 2rem;
    }

    .contact-card {
      background: linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%);
      border: 1px solid rgba(212, 175, 55, 0.3);
      border-radius: 16px;
      padding: 3rem;
      text-align: center;
    }

    .contact-card > i {
      font-size: 3rem;
      color: #D4AF37;
      margin-bottom: 1.5rem;
    }

    .contact-card h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0 0 1rem 0;
    }

    .contact-card > p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 1.0625rem;
      line-height: 1.6;
      margin: 0 0 2rem 0;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .contact-actions {
      display: flex;
      gap: 1rem;
      justify-content: center;
      flex-wrap: wrap;
    }

    .btn-primary, .btn-secondary, .btn-outline {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.875rem 2rem;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      border: none;
      cursor: pointer;
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
      color: #FFFFFF;
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.15);
      border-color: #D4AF37;
      transform: translateY(-2px);
    }

    .btn-outline {
      background: transparent;
      color: #D4AF37;
      border: 2px solid #D4AF37;
    }

    .btn-outline:hover {
      background: rgba(212, 175, 55, 0.1);
      transform: translateY(-2px);
    }

    .back-to-top {
      text-align: center;
      padding-top: 2rem;
    }

    @media (max-width: 768px) {
      .faq-container {
        padding: 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      .category-filter {
        gap: 0.5rem;
      }

      .category-btn {
        padding: 0.625rem 1rem;
        font-size: 0.875rem;
      }

      .faq-answer p {
        padding-left: 1.5rem;
      }

      .contact-card {
        padding: 2rem 1.5rem;
      }

      .contact-actions {
        flex-direction: column;
        align-items: stretch;
      }

      .btn-primary, .btn-secondary, .btn-outline {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class FaqComponent {
  categories = ['All', 'Getting Started', 'Features', 'Account', 'Technical', 'Pricing'];
  selectedCategory = 'All';
  expandedIndex: number | null = null;

  faqs: FAQItem[] = [
    {
      question: 'What is StudyBuddy?',
      answer: 'StudyBuddy is an AI-powered study companion that helps students learn more effectively through interactive features like AI chat, quiz generation, flashcards, study routines, and document management. Our platform uses advanced AI to personalize your learning experience.',
      category: 'Getting Started',
      icon: 'fa-solid fa-rocket'
    },
    {
      question: 'How do I get started with StudyBuddy?',
      answer: 'Getting started is easy! Simply create an account, explore the different features like AI Chat, Quiz Generator, and Flashcards. Upload your study materials in the Documents section and let our AI help you create personalized study plans.',
      category: 'Getting Started',
      icon: 'fa-solid fa-play'
    },
    {
      question: 'Is StudyBuddy free to use?',
      answer: 'Yes! StudyBuddy is currently free to use with access to all core features. We may introduce premium features in the future, but the essential tools will always remain accessible to all students.',
      category: 'Pricing',
      icon: 'fa-solid fa-dollar-sign'
    },
    {
      question: 'How does the AI Chat feature work?',
      answer: 'The AI Chat feature uses advanced language models to answer your questions, explain concepts, and help with homework. Simply type your question and receive instant, detailed explanations. The AI can help with various subjects including math, science, history, and more.',
      category: 'Features',
      icon: 'fa-solid fa-comments'
    },
    {
      question: 'Can I generate quizzes from my own study materials?',
      answer: 'Yes! You can upload your study materials as documents, and our AI will generate custom quizzes based on your content. This helps you test your knowledge on exactly what you need to learn.',
      category: 'Features',
      icon: 'fa-solid fa-file-arrow-up'
    },
    {
      question: 'How do flashcards work in StudyBuddy?',
      answer: 'Our flashcard feature allows you to create, organize, and study flashcards for any subject. You can create cards manually or let our AI generate them from your study materials. Use spaced repetition to optimize your learning.',
      category: 'Features',
      icon: 'fa-solid fa-layer-group'
    },
    {
      question: 'What file formats can I upload?',
      answer: 'StudyBuddy supports various document formats including PDF, DOCX, TXT, and more. You can upload lecture notes, textbooks, research papers, and other study materials for AI analysis and quiz generation.',
      category: 'Technical',
      icon: 'fa-solid fa-file'
    },
    {
      question: 'Is my data secure?',
      answer: 'Absolutely! We take data security seriously. All your documents and personal information are encrypted and stored securely. We never share your data with third parties without your consent. Check our Privacy Policy for more details.',
      category: 'Account',
      icon: 'fa-solid fa-shield-halved'
    },
    {
      question: 'How does the Study Routine feature help me?',
      answer: 'The Study Routine feature helps you create and maintain a structured study schedule. Set your study hours, work hours, and break times. Our AI can suggest optimal study times based on your goals and track your progress over time.',
      category: 'Features',
      icon: 'fa-solid fa-calendar-days'
    },
    {
      question: 'Can I use StudyBuddy on mobile devices?',
      answer: 'Yes! StudyBuddy is fully responsive and works on all devices including smartphones, tablets, and computers. Access your study materials and AI tools anywhere, anytime.',
      category: 'Technical',
      icon: 'fa-solid fa-mobile-screen'
    },
    {
      question: 'How do I track my progress?',
      answer: 'The Progress feature provides detailed analytics on your study habits, quiz scores, and learning achievements. View charts and statistics to understand your strengths and areas for improvement.',
      category: 'Features',
      icon: 'fa-solid fa-chart-line'
    },
    {
      question: 'Can I delete my account?',
      answer: 'Yes, you can delete your account at any time through the Settings page. This will permanently remove all your data from our servers. If you need help, contact our support team.',
      category: 'Account',
      icon: 'fa-solid fa-user-xmark'
    },
    {
      question: 'What should I do if I encounter an error?',
      answer: 'If you experience any issues, try refreshing the page first. If the problem persists, please report it through our GitHub Issues page or contact support at ahmedayyan555@gmail.com with details about the error.',
      category: 'Technical',
      icon: 'fa-solid fa-bug'
    },
    {
      question: 'Does StudyBuddy work for all subjects?',
      answer: 'Yes! StudyBuddy is designed to help with all subjects including STEM fields, humanities, languages, and more. Our AI is trained on a wide range of topics and can assist with various academic levels.',
      category: 'Getting Started',
      icon: 'fa-solid fa-book'
    },
    {
      question: 'How accurate is the AI?',
      answer: 'Our AI is highly accurate but not perfect. We use advanced models, but always verify important information with authoritative sources. The AI is designed to be a study aid, not a replacement for proper learning and research.',
      category: 'Technical',
      icon: 'fa-solid fa-brain'
    },
    {
      question: 'Can I collaborate with other students?',
      answer: 'Collaboration features are coming soon! In the future, you\'ll be able to share flashcards, study routines, and form study groups with classmates. Stay tuned for updates!',
      category: 'Features',
      icon: 'fa-solid fa-users'
    }
  ];

  get filteredFAQs(): FAQItem[] {
    if (this.selectedCategory === 'All') {
      return this.faqs;
    }
    return this.faqs.filter(faq => faq.category === this.selectedCategory);
  }

  selectCategory(category: string): void {
    this.selectedCategory = category;
    this.expandedIndex = null; // Collapse all when switching categories
  }

  toggleFAQ(index: number): void {
    this.expandedIndex = this.expandedIndex === index ? null : index;
  }

  getCategoryIcon(category: string): string {
    const icons: { [key: string]: string } = {
      'All': 'fa-solid fa-grip',
      'Getting Started': 'fa-solid fa-flag-checkered',
      'Features': 'fa-solid fa-star',
      'Account': 'fa-solid fa-user',
      'Technical': 'fa-solid fa-wrench',
      'Pricing': 'fa-solid fa-tag'
    };
    return icons[category] || 'fa-solid fa-circle';
  }

  constructor() {}
}
