import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-privacy',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="privacy-container">
      <div class="header-section">
        <div class="icon-wrapper">
          <i class="fa-solid fa-shield-halved"></i>
        </div>
        <h1>Privacy Policy</h1>
        <p class="last-updated">Last Updated: November 3, 2025</p>
      </div>

      <div class="content-section">
        <div class="intro">
          <p>
            At StudyBuddy, we take your privacy seriously. This Privacy Policy explains how we collect, 
            use, disclose, and safeguard your information when you use our AI-powered study platform.
          </p>
        </div>

        <section class="policy-section">
          <h2><i class="fa-solid fa-database"></i> Information We Collect</h2>
          <div class="policy-content">
            <h3>Personal Information</h3>
            <ul>
              <li>Email address and account credentials</li>
              <li>Name and profile information</li>
              <li>Usage data and preferences</li>
              <li>Study materials and documents you upload</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>Browser type and version</li>
              <li>Device information and operating system</li>
              <li>IP address and location data</li>
              <li>Session duration and interaction patterns</li>
            </ul>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-gears"></i> How We Use Your Information</h2>
          <div class="policy-content">
            <p>We use the collected information for the following purposes:</p>
            <ul>
              <li><strong>Service Delivery:</strong> To provide and maintain our AI-powered study tools</li>
              <li><strong>Personalization:</strong> To customize your learning experience and recommendations</li>
              <li><strong>Communication:</strong> To send you updates, notifications, and support messages</li>
              <li><strong>Analytics:</strong> To understand usage patterns and improve our platform</li>
              <li><strong>Security:</strong> To protect against fraud and unauthorized access</li>
              <li><strong>AI Training:</strong> To improve our AI models (anonymized data only)</li>
            </ul>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-share-nodes"></i> Data Sharing and Disclosure</h2>
          <div class="policy-content">
            <p>We do not sell your personal information. We may share your data with:</p>
            <ul>
              <li><strong>AI Service Providers:</strong> Third-party AI services (OpenAI, Google) to power our features</li>
              <li><strong>Cloud Services:</strong> Secure cloud storage providers for data hosting</li>
              <li><strong>Analytics Partners:</strong> To understand platform usage (anonymized data)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>
            <div class="info-box">
              <i class="fa-solid fa-circle-info"></i>
              <p>All third-party services are carefully vetted and comply with strict data protection standards.</p>
            </div>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-lock"></i> Data Security</h2>
          <div class="policy-content">
            <p>We implement industry-standard security measures to protect your data:</p>
            <ul>
              <li>End-to-end encryption for data transmission</li>
              <li>Secure encrypted storage for all user data</li>
              <li>Regular security audits and vulnerability assessments</li>
              <li>Access controls and authentication protocols</li>
              <li>Automatic backups and disaster recovery systems</li>
            </ul>
            <div class="warning-box">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <p>While we strive to protect your data, no method of transmission over the internet is 100% secure.</p>
            </div>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-user-shield"></i> Your Rights and Choices</h2>
          <div class="policy-content">
            <p>You have the following rights regarding your personal information:</p>
            <ul>
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and data</li>
              <li><strong>Export:</strong> Download your data in a portable format</li>
              <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
              <li><strong>Restriction:</strong> Limit how we process your data</li>
            </ul>
            <p class="contact-note">
              To exercise these rights, please contact us at 
              <a href="mailto:ahmedayyan555@gmail.com">ahmedayyan555&#64;gmail.com</a>
            </p>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-cookie-bite"></i> Cookies and Tracking</h2>
          <div class="policy-content">
            <p>We use cookies and similar tracking technologies to:</p>
            <ul>
              <li>Maintain your session and remember your preferences</li>
              <li>Analyze platform usage and performance</li>
              <li>Personalize content and recommendations</li>
              <li>Provide social media features</li>
            </ul>
            <p>You can control cookie preferences through your browser settings.</p>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-child"></i> Children's Privacy</h2>
          <div class="policy-content">
            <p>
              StudyBuddy is designed for users aged 13 and above. We do not knowingly collect 
              information from children under 13. If you believe we have collected data from a 
              child under 13, please contact us immediately.
            </p>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-rotate"></i> Changes to This Policy</h2>
          <div class="policy-content">
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any 
              changes by posting the new policy on this page and updating the "Last Updated" date. 
              Continued use of StudyBuddy after changes constitutes acceptance of the updated policy.
            </p>
          </div>
        </section>

        <section class="policy-section">
          <h2><i class="fa-solid fa-envelope"></i> Contact Us</h2>
          <div class="policy-content">
            <p>If you have questions or concerns about this Privacy Policy, please contact us:</p>
            <div class="contact-info">
              <div class="contact-item">
                <i class="fa-solid fa-envelope"></i>
                <div>
                  <strong>Email</strong>
                  <a href="mailto:ahmedayyan555@gmail.com">ahmedayyan555&#64;gmail.com</a>
                </div>
              </div>
              <div class="contact-item">
                <i class="fa-brands fa-github"></i>
                <div>
                  <strong>GitHub</strong>
                  <a href="https://github.com/bsse23094/studyBuddy" target="_blank">github.com/bsse23094/studyBuddy</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="back-to-top">
          <a routerLink="/home" class="btn-primary">
            <i class="fa-solid fa-home"></i> Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .privacy-container {
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

    .last-updated {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9375rem;
      margin: 0;
    }

    .content-section {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 16px;
      padding: 3rem;
      backdrop-filter: blur(10px);
    }

    .intro {
      margin-bottom: 3rem;
      padding: 1.5rem;
      background: rgba(212, 175, 55, 0.1);
      border-left: 4px solid #D4AF37;
      border-radius: 8px;
    }

    .intro p {
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.7;
      margin: 0;
      font-size: 1.0625rem;
    }

    .policy-section {
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }

    .policy-section:last-of-type {
      border-bottom: none;
      margin-bottom: 2rem;
    }

    .policy-section h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #D4AF37;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .policy-section h2 i {
      font-size: 1.5rem;
    }

    .policy-content h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 1.5rem 0 1rem 0;
    }

    .policy-content p {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.7;
      margin: 0 0 1rem 0;
      font-size: 1rem;
    }

    .policy-content ul {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }

    .policy-content ul li {
      color: rgba(255, 255, 255, 0.8);
      padding: 0.5rem 0;
      padding-left: 2rem;
      position: relative;
      line-height: 1.6;
    }

    .policy-content ul li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #D4AF37;
      font-weight: bold;
    }

    .policy-content ul li strong {
      color: #D4AF37;
    }

    .info-box, .warning-box {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .info-box {
      background: rgba(59, 130, 246, 0.1);
      border: 1px solid rgba(59, 130, 246, 0.3);
    }

    .info-box i {
      color: #3B82F6;
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .warning-box {
      background: rgba(251, 146, 60, 0.1);
      border: 1px solid rgba(251, 146, 60, 0.3);
    }

    .warning-box i {
      color: #FB923C;
      font-size: 1.25rem;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .info-box p, .warning-box p {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
    }

    .contact-note {
      margin-top: 1rem;
      padding: 1rem;
      background: rgba(212, 175, 55, 0.05);
      border-radius: 8px;
    }

    .contact-note a {
      color: #D4AF37;
      text-decoration: none;
      font-weight: 600;
      transition: color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .contact-note a:hover {
      color: #F4D03F;
    }

    .contact-info {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .contact-item {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1.25rem;
      background: rgba(212, 175, 55, 0.05);
      border: 1px solid rgba(212, 175, 55, 0.2);
      border-radius: 8px;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .contact-item:hover {
      background: rgba(212, 175, 55, 0.1);
      transform: translateX(5px);
    }

    .contact-item i {
      color: #D4AF37;
      font-size: 1.5rem;
      margin-top: 0.25rem;
    }

    .contact-item div {
      flex: 1;
    }

    .contact-item strong {
      display: block;
      color: #FFFFFF;
      margin-bottom: 0.25rem;
      font-size: 0.9375rem;
    }

    .contact-item a {
      color: rgba(255, 255, 255, 0.7);
      text-decoration: none;
      font-size: 0.9375rem;
      transition: color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .contact-item a:hover {
      color: #D4AF37;
    }

    .back-to-top {
      text-align: center;
      padding-top: 2rem;
      margin-top: 2rem;
      border-top: 1px solid rgba(212, 175, 55, 0.1);
    }

    .btn-primary {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      padding: 0.875rem 2rem;
      background: linear-gradient(135deg, #D4AF37 0%, #F4D03F 100%);
      color: #0A0A0A;
      font-weight: 600;
      font-size: 1rem;
      border-radius: 8px;
      text-decoration: none;
      transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
    }

    .btn-primary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
    }

    @media (max-width: 768px) {
      .privacy-container {
        padding: 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      .content-section {
        padding: 2rem 1.5rem;
      }

      .policy-section h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class PrivacyComponent {
  constructor() {}
}
