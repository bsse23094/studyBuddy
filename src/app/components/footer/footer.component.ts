import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <footer class="universal-footer">
      <div class="footer-container">
        <!-- Brand Section -->
        <div class="footer-section brand-section">
          <div class="footer-logo">
            <i class="fa-solid fa-book"></i>
            <span>StudyBuddy</span>
          </div>
          <p class="footer-tagline">Your AI-powered study companion for smarter learning</p>
          <div class="social-links">
            <a href="https://github.com/bsse23094/studyBuddy" target="_blank" class="social-link" title="GitHub">
              <i class="fa-brands fa-github"></i>
            </a>
            <a href="https://www.linkedin.com/in/ahmed-ayyan-8b25b72b0/" class="social-link" title="LinkedIn">
              <i class="fa-brands fa-linkedin"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div class="footer-section">
          <h3 class="footer-title">Features</h3>
          <ul class="footer-links">
            <li><a routerLink="/chat"><i class="fa-solid fa-comment"></i> AI Chat</a></li>
            <li><a routerLink="/quiz"><i class="fa-solid fa-brain"></i> Quiz Generator</a></li>
            <li><a routerLink="/flashcards"><i class="fa-solid fa-layer-group"></i> Flashcards</a></li>
            <li><a routerLink="/routine"><i class="fa-solid fa-calendar"></i> Study Routine</a></li>
            <li><a routerLink="/focus"><i class="fa-solid fa-bullseye"></i> Focus Timer</a></li>
            <li><a routerLink="/documents"><i class="fa-solid fa-file"></i> Documents</a></li>
          </ul>
        </div>

        <!-- Resources -->
        <div class="footer-section">
          <h3 class="footer-title">Resources</h3>
          <ul class="footer-links">
            <li><a routerLink="/progress"><i class="fa-solid fa-chart-line"></i> Track Progress</a></li>
            <li><a routerLink="/settings"><i class="fa-solid fa-gear"></i> Settings</a></li>
            <li><a href="https://github.com/bsse23094/studyBuddy" target="_blank"><i class="fa-solid fa-code"></i> Documentation</a></li>
            <li><a href="https://github.com/bsse23094/studyBuddy/issues" target="_blank"><i class="fa-solid fa-bug"></i> Report Issue</a></li>
          </ul>
        </div>

        <!-- Contact & Info -->
        <div class="footer-section">
          <h3 class="footer-title">About</h3>
          <ul class="footer-links">
            <li><a routerLink="/privacy"><i class="fa-solid fa-shield"></i> Privacy Policy</a></li>
            <li><a routerLink="/terms"><i class="fa-solid fa-file-contract"></i> Terms of Service</a></li>
            <li><a href="mailto:ahmedayyan555@gmail.com"><i class="fa-solid fa-envelope"></i> Contact Us</a></li>
            <li><a routerLink="/faq"><i class="fa-solid fa-circle-question"></i> FAQ</a></li>
          </ul>
        </div>
      </div>

      <!-- Bottom Bar -->
      <div class="footer-bottom">
        <div class="footer-container">
          <div class="footer-bottom-content">
            <p class="copyright">
              <i class="fa-regular fa-copyright"></i>
              {{ currentYear }} StudyBuddy. All rights reserved.
            </p>
            <p class="made-with">
              Made for students worldwide
            </p>
            <div class="tech-stack">
              <span class="tech-badge" title="Angular">
                <i class="fa-brands fa-angular"></i>
              </span>
              <span class="tech-badge" title="TypeScript">
                <i class="fa-solid fa-code"></i>
              </span>
              <span class="tech-badge" title="AI Powered">
                <i class="fa-solid fa-brain"></i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .universal-footer {
      background: #000000;
      border-top: 1px solid rgba(212, 175, 55, 0.2);
      margin-top: auto;
      position: relative;
      overflow: hidden;
    }

    .universal-footer::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 1px;
      background: linear-gradient(90deg, transparent, #D4AF37, transparent);
    }

    .footer-container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 4rem 4rem 2rem 4rem;
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 3rem;
    }

    /* Brand Section */
    .brand-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .footer-logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 1.75rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }

    .footer-logo i {
      color: #D4AF37;
      font-size: 2rem;
    }

    .footer-tagline {
      color: rgba(255, 255, 255, 0.6);
      line-height: 1.6;
      margin: 0;
      font-size: 0.9375rem;
      max-width: 280px;
    }

    .social-links {
      display: flex;
      gap: 1rem;
      margin-top: 0.5rem;
    }

    .social-link {
      width: 40px;
      height: 40px;
      border-radius: 10px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 1.125rem;
    }

    .social-link:hover {
      background: rgba(212, 175, 55, 0.1);
      border-color: rgba(212, 175, 55, 0.4);
      color: #D4AF37;
      transform: translateY(-3px);
    }

    /* Footer Sections */
    .footer-section {
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .footer-title {
      font-size: 1rem;
      font-family: 'Lexend', sans-serif;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .footer-title::before {
      content: '';
      width: 3px;
      height: 16px;
      background: #D4AF37;
      border-radius: 2px;
    }

    .footer-links {
      list-style: none;
      padding: 0;
      margin: 0;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-links li a {
      color: rgba(255, 255, 255, 0.6);
      text-decoration: none;
      font-size: 0.9375rem;
      display: flex;
      align-items: center;
      gap: 0.75rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      padding: 0.25rem 0;
      font-weight: 500;
    }

    .footer-links li a i {
      color: #D4AF37;
      font-size: 0.875rem;
      width: 16px;
      text-align: center;
    }

    .footer-links li a:hover {
      color: #D4AF37;
      padding-left: 0.5rem;
    }

    /* Bottom Bar */
    .footer-bottom {
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding: 1.5rem 0;
      background: rgba(0, 0, 0, 0.5);
    }

    .footer-bottom .footer-container {
      padding: 0 4rem;
      display: block;
    }

    .footer-bottom-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 1.5rem;
    }

    .copyright,
    .made-with {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.875rem;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .made-with i {
      color: #EF4444;
      animation: heartbeat 1.5s ease-in-out infinite;
    }

    @keyframes heartbeat {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.1); }
    }

    .tech-stack {
      display: flex;
      gap: 0.75rem;
    }

    .tech-badge {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      background: rgba(212, 175, 55, 0.08);
      border: 1px solid rgba(212, 175, 55, 0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: #D4AF37;
      font-size: 0.875rem;
      transition: all 280ms cubic-bezier(0.4, 0, 0.2, 1);
      cursor: pointer;
    }

    .tech-badge:hover {
      background: rgba(212, 175, 55, 0.15);
      border-color: rgba(212, 175, 55, 0.4);
      transform: translateY(-2px);
    }

    /* Responsive Design */
    @media (max-width: 1024px) {
      .footer-container {
        grid-template-columns: 1fr 1fr;
        padding: 3rem 2rem 2rem 2rem;
        gap: 2rem;
      }

      .brand-section {
        grid-column: 1 / -1;
      }
    }

    @media (max-width: 640px) {
      .footer-container {
        grid-template-columns: 1fr;
        padding: 2rem 1.5rem 1.5rem 1.5rem;
        gap: 2rem;
      }

      .footer-bottom .footer-container {
        padding: 0 1.5rem;
      }

      .footer-bottom-content {
        flex-direction: column;
        align-items: center;
        text-align: center;
        gap: 1rem;
      }

      .footer-logo {
        font-size: 1.5rem;
      }

      .footer-logo i {
        font-size: 1.75rem;
      }

      .social-links {
        justify-content: center;
      }
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
