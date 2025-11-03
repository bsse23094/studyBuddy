import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then(m => m.ChatComponent)
  },
  {
    path: 'quiz',
    loadComponent: () => import('./pages/quiz/quiz.component').then(m => m.QuizComponent)
  },
  {
    path: 'flashcards',
    loadComponent: () => import('./pages/flashcards/flashcards.component').then(m => m.FlashcardsComponent)
  },
  {
    path: 'documents',
    loadComponent: () => import('./pages/documents/documents.component').then(m => m.DocumentsComponent)
  },
  {
    path: 'progress',
    loadComponent: () => import('./pages/progress/progress.component').then(m => m.ProgressComponent)
  },
  {
    path: 'routine',
    loadComponent: () => import('./pages/routine/routine.component').then(m => m.RoutineComponent)
  },
  {
    path: 'focus',
    loadComponent: () => import('./pages/focus/focus.component').then(m => m.FocusComponent)
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent)
  },
  {
    path: 'privacy',
    loadComponent: () => import('./pages/privacy/privacy.component').then(m => m.PrivacyComponent)
  },
  {
    path: 'terms',
    loadComponent: () => import('./pages/terms/terms.component').then(m => m.TermsComponent)
  },
  {
    path: 'faq',
    loadComponent: () => import('./pages/faq/faq.component').then(m => m.FaqComponent)
  },
  {
    path: '**',
    redirectTo: '/home'
  }
];
