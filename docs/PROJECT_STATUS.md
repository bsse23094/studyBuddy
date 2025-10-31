# StudyBuddy Documentation

## Table of Contents
- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [RAG Prompts](#rag-prompts)
- [Testing Strategy](#testing-strategy)
- [Deployment Guide](#deployment-guide)

## Architecture Overview

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Angular 19 SPA (GitHub Pages)              │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐  │   │
│  │  │   Pages  │  │ Services │  │  IndexedDB (idb) │  │   │
│  │  └──────────┘  └──────────┘  └──────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Cloudflare Worker (Serverless)                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  ┌──────────────┐   ┌──────────────┐               │   │
│  │  │ RAG Pipeline │   │  Rate Limit  │               │   │
│  │  └──────────────┘   └──────────────┘               │   │
│  │  ┌──────────────┐   ┌──────────────┐               │   │
│  │  │Provider      │   │   KV Cache   │               │   │
│  │  │Adapters      │   │              │               │   │
│  │  └──────────────┘   └──────────────┘               │   │
│  └─────────────────────────────────────────────────────┘   │
└────────────┬─────────────────────────┬──────────────────────┘
             │                         │
             ▼                         ▼
    ┌─────────────────┐      ┌──────────────────┐
    │  LLM Providers  │      │   Pinecone/      │
    │  (OpenRouter,   │      │   Vector DB      │
    │  HuggingFace)   │      │                  │
    └─────────────────┘      └──────────────────┘
```

### Data Flow

1. **User uploads document** → IndexedDB (local) + Worker (processing)
2. **Worker extracts text** → Chunks → Embeddings → Vector DB
3. **User asks question** → Worker searches Vector DB (RAG)
4. **Worker builds prompt** → Calls LLM provider → Returns answer + sources
5. **Quiz/Flashcard generation** → Worker generates → Stored locally

### Key Design Decisions

- **Frontend-first**: Maximizes free tier usage, zero hosting costs
- **IndexedDB storage**: Offline-capable, privacy-preserving
- **Serverless backend**: Scales automatically, minimal costs
- **Provider adapters with fallback**: Resilience and cost optimization
- **RAG always-on**: Ensures factual accuracy and source attribution

---

## Sprint Plan Details

### Week 1: Foundation (Days 1-7)
**Current Status**: ✅ Complete

**Completed**:
- ✅ TypeScript models for all entities
- ✅ Services: User, Chat, Quiz, Flashcard, Document, Analytics, Storage, API
- ✅ SM-2 algorithm implementation
- ✅ IndexedDB wrapper with idb library
- ✅ HTTP client configuration

**Next Steps**:
- Unit tests for services
- Integration tests for SM-2 algorithm
- Documentation of service APIs

### Week 2: UI Components (Days 8-14)
**Current Status**: 🚧 In Progress

**Completed**:
- ✅ Home page with dashboard
- ✅ Routing structure
- ✅ Composer component (message input with mode/level selectors)
- ✅ Page stubs for Chat, Quiz, Flashcards, Documents, Progress, Settings

**To Do**:
- [ ] Message list component with streaming support
- [ ] Hint button with 3-tier graduated hints
- [ ] Solution toggle component
- [ ] Sources panel for RAG citations
- [ ] Mobile responsive design
- [ ] Accessibility testing (ARIA, keyboard navigation)

### Week 3: Assessment Features (Days 15-21)
**To Do**:
- [ ] Quiz generation UI
- [ ] Question display (MCQ, short answer, true/false)
- [ ] Auto-grading system with explanation feedback
- [ ] Quiz history and performance tracking
- [ ] Flashcard review interface
- [ ] SM-2 scheduling integration
- [ ] Deck management UI
- [ ] Review statistics dashboard

### Week 4: Polish & Deploy (Days 22-28)
**To Do**:
- [ ] Document upload UI with drag-and-drop
- [ ] Processing status indicators
- [ ] Progress analytics dashboard
- [ ] Topic mastery visualization
- [ ] Settings page (export data, privacy controls)
- [ ] Serverless worker implementation (complete)
- [ ] GitHub Actions CI/CD
- [ ] Production deployment
- [ ] End-to-end testing
- [ ] Performance optimization

---

## Quick Start Commands

### Frontend Development
```powershell
# Install dependencies
npm install

# Run development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### Worker Development
```powershell
cd worker

# Install dependencies
npm install

# Run locally with Wrangler
npm run dev

# Deploy to Cloudflare
npm run deploy

# Set secrets
wrangler secret put OPENROUTER_API_KEY
wrangler secret put HF_API_KEY
wrangler secret put PINECONE_API_KEY
```

---

## Environment Setup

### Required Secrets (GitHub Actions)
```
CLOUDFLARE_API_TOKEN=<your_cloudflare_token>
CLOUDFLARE_ACCOUNT_ID=<your_account_id>
OPENROUTER_API_KEY=<your_openrouter_key>
HF_API_KEY=<your_huggingface_key>
PINECONE_API_KEY=<your_pinecone_key>
```

### Local Development (.env)
Create `worker/.dev.vars`:
```
OPENROUTER_API_KEY=sk-or-...
HF_API_KEY=hf_...
PINECONE_API_KEY=...
PINECONE_ENVIRONMENT=us-east-1
PINECONE_INDEX=studybuddy
```

---

## Testing Checklist

### Unit Tests
- [ ] User service (profile management, progress tracking)
- [ ] SM-2 algorithm (card scheduling correctness)
- [ ] Quiz service (grading logic, similarity scoring)
- [ ] Flashcard service (deck operations, review queue)
- [ ] Storage service (CRUD operations, search)

### Integration Tests
- [ ] Chat flow: send → retrieve context → generate response
- [ ] Quiz flow: generate → display → answer → grade → record
- [ ] Flashcard flow: generate → review → schedule next

### E2E Tests
- [ ] Upload document → chat with RAG → verify sources
- [ ] Generate quiz → complete quiz → view results
- [ ] Create flashcard deck → review cards → check scheduling
- [ ] Progress dashboard displays accurate metrics

### Accessibility Tests
- [ ] Screen reader compatibility
- [ ] Keyboard navigation (Tab, Enter, Arrow keys)
- [ ] Color contrast (WCAG AA)
- [ ] Focus indicators visible
- [ ] ARIA live regions for dynamic content

---

## Performance Targets

- **Time to Interactive**: < 3s
- **First Contentful Paint**: < 1.5s
- **Chat response latency**: < 2s (non-streaming)
- **Quiz generation**: < 5s for 10 questions
- **Document chunking**: < 30s for 100-page PDF
- **IndexedDB queries**: < 100ms for typical operations

---

**Project Status**: MVP in development (Week 2/4)
**Last Updated**: 2025-10-31
