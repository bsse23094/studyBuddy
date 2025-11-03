import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-terms',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="terms-container">
      <div class="header-section">
        <div class="icon-wrapper">
          <i class="fa-solid fa-file-contract"></i>
        </div>
        <h1>Terms of Service</h1>
        <p class="last-updated">Last Updated: November 3, 2025</p>
      </div>

      <div class="content-section">
        <div class="intro">
          <p>
            Welcome to StudyBuddy! By accessing or using our platform, you agree to be bound by these 
            Terms of Service. Please read them carefully before using our AI-powered study tools.
          </p>
        </div>

        <section class="terms-section">
          <h2><i class="fa-solid fa-handshake"></i> Acceptance of Terms</h2>
          <div class="terms-content">
            <p>
              By creating an account or using StudyBuddy, you acknowledge that you have read, understood, 
              and agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree 
              to these terms, please do not use our platform.
            </p>
            <div class="highlight-box">
              <i class="fa-solid fa-scale-balanced"></i>
              <p>These terms constitute a legally binding agreement between you and StudyBuddy.</p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-user-check"></i> Eligibility</h2>
          <div class="terms-content">
            <p>To use StudyBuddy, you must:</p>
            <ul>
              <li>Be at least 13 years of age</li>
              <li>Have the legal capacity to enter into a binding agreement</li>
              <li>Provide accurate and complete registration information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Not be prohibited from using our services under applicable laws</li>
            </ul>
            <p class="note">Users under 18 should obtain parental or guardian consent before using StudyBuddy.</p>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-key"></i> User Accounts</h2>
          <div class="terms-content">
            <h3>Account Creation</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account and password. 
              You agree to accept responsibility for all activities that occur under your account.
            </p>

            <h3>Account Responsibilities</h3>
            <ul>
              <li>Provide accurate and current information during registration</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized account access</li>
              <li>Not share your account with others</li>
              <li>Not create multiple accounts to circumvent restrictions</li>
            </ul>

            <h3>Account Termination</h3>
            <p>
              We reserve the right to suspend or terminate your account if you violate these terms 
              or engage in fraudulent, abusive, or illegal activities.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-circle-check"></i> Acceptable Use</h2>
          <div class="terms-content">
            <p>You agree to use StudyBuddy only for lawful purposes. You must NOT:</p>
            <ul>
              <li><strong>Violate Laws:</strong> Use the platform for illegal activities or to violate any laws</li>
              <li><strong>Cheat or Plagiarize:</strong> Use AI-generated content to cheat on exams or plagiarize</li>
              <li><strong>Abuse the System:</strong> Attempt to bypass, disable, or manipulate our security features</li>
              <li><strong>Spam or Harass:</strong> Send spam, phishing attempts, or harass other users</li>
              <li><strong>Scrape Data:</strong> Use automated tools to extract data without permission</li>
              <li><strong>Distribute Malware:</strong> Upload viruses, malware, or harmful code</li>
              <li><strong>Infringe Rights:</strong> Violate intellectual property rights of others</li>
              <li><strong>Impersonate Others:</strong> Pretend to be another person or entity</li>
            </ul>
            <div class="warning-box">
              <i class="fa-solid fa-triangle-exclamation"></i>
              <p><strong>Academic Integrity:</strong> StudyBuddy is designed to help you learn, not to enable cheating. 
              Use our AI tools responsibly and in accordance with your institution's academic policies.</p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-book"></i> Content and Intellectual Property</h2>
          <div class="terms-content">
            <h3>Your Content</h3>
            <p>
              You retain ownership of content you upload to StudyBuddy (documents, notes, etc.). 
              By uploading content, you grant us a license to process, store, and use it to provide 
              our services and improve our AI models (in anonymized form).
            </p>

            <h3>Our Content</h3>
            <p>
              All content, features, and functionality on StudyBuddy (including text, graphics, logos, 
              icons, images, and software) are owned by us or our licensors and protected by copyright, 
              trademark, and other intellectual property laws.
            </p>

            <h3>AI-Generated Content</h3>
            <p>
              Content generated by our AI tools is provided to you for educational purposes. While you 
              can use this content for personal study, you should:
            </p>
            <ul>
              <li>Verify the accuracy of AI-generated information</li>
              <li>Not present AI-generated work as your own original work</li>
              <li>Follow your institution's guidelines on AI assistance</li>
              <li>Use AI outputs as learning aids, not substitutes for learning</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-shield-halved"></i> Disclaimer of Warranties</h2>
          <div class="terms-content">
            <p>
              StudyBuddy is provided "AS IS" and "AS AVAILABLE" without warranties of any kind, 
              either express or implied, including but not limited to:
            </p>
            <ul>
              <li>Accuracy, completeness, or reliability of AI-generated content</li>
              <li>Uninterrupted or error-free operation of the platform</li>
              <li>Security of data transmission or storage</li>
              <li>Fitness for a particular purpose or merchantability</li>
            </ul>
            <div class="warning-box">
              <i class="fa-solid fa-exclamation-circle"></i>
              <p><strong>Educational Disclaimer:</strong> Our AI tools are designed to assist learning but may 
              contain errors or inaccuracies. Always verify important information with authoritative sources.</p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-scale-unbalanced"></i> Limitation of Liability</h2>
          <div class="terms-content">
            <p>
              To the fullest extent permitted by law, StudyBuddy and its affiliates shall not be liable for:
            </p>
            <ul>
              <li>Indirect, incidental, special, consequential, or punitive damages</li>
              <li>Loss of profits, data, use, or other intangible losses</li>
              <li>Academic consequences resulting from use of our platform</li>
              <li>Unauthorized access to or alteration of your content</li>
              <li>Third-party conduct or content on the platform</li>
            </ul>
            <p class="note">
              Some jurisdictions do not allow the exclusion of certain warranties or limitation of liability, 
              so these limitations may not apply to you.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-gavel"></i> Indemnification</h2>
          <div class="terms-content">
            <p>
              You agree to indemnify, defend, and hold harmless StudyBuddy and its affiliates from any 
              claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your use or misuse of the platform</li>
              <li>Your violation of these Terms of Service</li>
              <li>Your violation of any rights of third parties</li>
              <li>Your content or conduct on the platform</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-dollar-sign"></i> Fees and Payment</h2>
          <div class="terms-content">
            <p>
              StudyBuddy currently offers free access to its features. If we introduce paid features 
              or subscriptions in the future:
            </p>
            <ul>
              <li>We will clearly communicate pricing and billing terms</li>
              <li>You will have the option to opt-in to paid features</li>
              <li>Fees will be charged as agreed upon at the time of purchase</li>
              <li>Refunds may be available subject to our refund policy</li>
            </ul>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-rotate"></i> Changes to Terms</h2>
          <div class="terms-content">
            <p>
              We reserve the right to modify these Terms of Service at any time. We will notify users 
              of significant changes via email or through the platform. Your continued use of StudyBuddy 
              after changes are posted constitutes acceptance of the modified terms.
            </p>
            <div class="highlight-box">
              <i class="fa-solid fa-bell"></i>
              <p>We encourage you to review these terms periodically to stay informed of any updates.</p>
            </div>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-ban"></i> Termination</h2>
          <div class="terms-content">
            <p>
              We may terminate or suspend your access to StudyBuddy immediately, without prior notice, 
              for any breach of these Terms of Service. Upon termination:
            </p>
            <ul>
              <li>Your right to use the platform will cease immediately</li>
              <li>We may delete your account and associated data</li>
              <li>You must stop all use of our platform and content</li>
              <li>Provisions that should survive termination will remain in effect</li>
            </ul>
            <p>You may also terminate your account at any time through the settings page.</p>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-earth-americas"></i> Governing Law</h2>
          <div class="terms-content">
            <p>
              These Terms of Service shall be governed by and construed in accordance with applicable 
              laws, without regard to conflict of law provisions. Any disputes arising from these terms 
              will be resolved through binding arbitration or in the appropriate courts.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-puzzle-piece"></i> Severability</h2>
          <div class="terms-content">
            <p>
              If any provision of these Terms of Service is found to be invalid or unenforceable, 
              the remaining provisions will continue to be valid and enforceable to the fullest 
              extent permitted by law.
            </p>
          </div>
        </section>

        <section class="terms-section">
          <h2><i class="fa-solid fa-envelope"></i> Contact Information</h2>
          <div class="terms-content">
            <p>If you have questions about these Terms of Service, please contact us:</p>
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

        <div class="agreement-notice">
          <i class="fa-solid fa-circle-check"></i>
          <p>
            By using StudyBuddy, you acknowledge that you have read and understood these Terms of Service 
            and agree to be bound by them.
          </p>
        </div>

        <div class="back-to-top">
          <a routerLink="/home" class="btn-primary">
            <i class="fa-solid fa-home"></i> Back to Home
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .terms-container {
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

    .terms-section {
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 1px solid rgba(212, 175, 55, 0.1);
    }

    .terms-section:last-of-type {
      border-bottom: none;
      margin-bottom: 2rem;
    }

    .terms-section h2 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.75rem;
      font-weight: 600;
      color: #D4AF37;
      margin: 0 0 1.5rem 0;
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .terms-section h2 i {
      font-size: 1.5rem;
    }

    .terms-content h3 {
      font-family: 'Lexend', sans-serif;
      font-size: 1.25rem;
      font-weight: 600;
      color: #FFFFFF;
      margin: 1.5rem 0 1rem 0;
    }

    .terms-content p {
      color: rgba(255, 255, 255, 0.8);
      line-height: 1.7;
      margin: 0 0 1rem 0;
      font-size: 1rem;
    }

    .terms-content ul {
      list-style: none;
      padding: 0;
      margin: 1rem 0;
    }

    .terms-content ul li {
      color: rgba(255, 255, 255, 0.8);
      padding: 0.5rem 0;
      padding-left: 2rem;
      position: relative;
      line-height: 1.6;
    }

    .terms-content ul li::before {
      content: '→';
      position: absolute;
      left: 0;
      color: #D4AF37;
      font-weight: bold;
    }

    .terms-content ul li strong {
      color: #D4AF37;
    }

    .note {
      padding: 1rem;
      background: rgba(212, 175, 55, 0.05);
      border-radius: 8px;
      font-size: 0.9375rem;
      color: rgba(255, 255, 255, 0.7);
      font-style: italic;
      margin-top: 1rem;
    }

    .highlight-box, .warning-box {
      display: flex;
      gap: 1rem;
      padding: 1.25rem;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .highlight-box {
      background: rgba(212, 175, 55, 0.1);
      border: 1px solid rgba(212, 175, 55, 0.3);
    }

    .highlight-box i {
      color: #D4AF37;
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

    .highlight-box p, .warning-box p {
      margin: 0;
      color: rgba(255, 255, 255, 0.9);
      line-height: 1.6;
    }

    .warning-box strong {
      color: #FB923C;
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

    .agreement-notice {
      display: flex;
      gap: 1rem;
      padding: 1.5rem;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 12px;
      margin: 2rem 0;
    }

    .agreement-notice i {
      color: #22C55E;
      font-size: 1.5rem;
      flex-shrink: 0;
      margin-top: 0.125rem;
    }

    .agreement-notice p {
      color: rgba(255, 255, 255, 0.9);
      margin: 0;
      line-height: 1.6;
      font-size: 1rem;
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
      .terms-container {
        padding: 1rem;
      }

      h1 {
        font-size: 2rem;
      }

      .content-section {
        padding: 2rem 1.5rem;
      }

      .terms-section h2 {
        font-size: 1.5rem;
      }
    }
  `]
})
export class TermsComponent {
  constructor() {}
}
