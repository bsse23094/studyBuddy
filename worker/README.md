# StudyBuddy Worker - Lightweight AI Tutor Backend

Complete serverless backend for StudyBuddy educational platform. Deployed on Cloudflare Workers (free tier: 100K requests/day).

## Features

✅ **RAG-Enabled Chat** - Contextual tutoring with document retrieval  
✅ **Adaptive Quiz Generation** - AI-generated quizzes from topics or documents  
✅ **Flashcard Creation** - Auto-generate flashcards for spaced repetition  
✅ **Document Processing** - Upload, chunk, embed, and search course materials  
✅ **Google Gemini AI** - Powered by Gemini 2.0 Flash for fast, accurate responses  
✅ **Provider Fallback** - Gemini → Hugging Face automatic failover  
✅ **Rate Limiting** - 100 requests/minute per IP  
✅ **Response Caching** - 1-hour cache for identical queries  
✅ **CORS Support** - GitHub Pages frontend integration  

## Architecture

```
┌─────────────────┐
│  GitHub Pages   │ ← Frontend (Angular SPA)
│   (Static UI)   │
└────────┬────────┘
         │ HTTPS
         ↓
┌─────────────────┐
│ Cloudflare      │ ← Backend (This worker)
│ Worker (Edge)   │
└────────┬────────┘
         │
         ├→ Google Gemini API (Primary)
         ├→ Hugging Face (Fallback)
         └→ KV Storage (Cache + Rate Limit)
```

## API Endpoints

### Chat `/api/chat`
```http
POST /api/chat
Content-Type: application/json

{
  "message": "Explain photosynthesis",
  "mode": "explain",
  "context": {
    "topic": "Biology",
    "difficulty": "intermediate",
    "documents": ["doc_123"]
  }
}
```

**Modes:**
- `explain` - Conceptual explanations with analogies
- `solve` - Step-by-step problem solving
- `hint` - Progressive hints (hintLevel: 1-3)
- `quiz` - Quiz help and answer evaluation

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Photosynthesis is...",
    "mode": "explain",
    "sources": [
      { "index": 1, "source": "Biology Textbook Ch.5" }
    ],
    "conversationId": "conv_abc123"
  },
  "cached": false
}
```

### Quiz Generation `/api/quiz/generate`
```http
POST /api/quiz/generate
Content-Type: application/json

{
  "topic": "Calculus Derivatives",
  "numQuestions": 5,
  "difficulty": "intermediate",
  "questionTypes": ["mcq", "shortAnswer"],
  "documentIds": ["doc_456"]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "quizId": "quiz_789",
    "topic": "Calculus Derivatives",
    "difficulty": "intermediate",
    "questions": [
      {
        "id": "q1",
        "type": "mcq",
        "question": "What is the derivative of x²?",
        "options": ["2x", "x", "2", "x²"],
        "correctAnswer": "2x",
        "explanation": "Using the power rule...",
        "points": 1
      }
    ],
    "totalPoints": 5
  }
}
```

### Flashcard Generation `/api/flashcards/generate`
```http
POST /api/flashcards/generate
Content-Type: application/json

{
  "topic": "Spanish Vocabulary",
  "numCards": 10,
  "documentIds": ["doc_789"]
}
```

### Document Upload `/api/documents/upload`
```http
POST /api/documents/upload
Content-Type: application/json

{
  "name": "Chapter 5 Notes",
  "content": "Full text content here...",
  "type": "text"
}
```

### Document Search `/api/documents/search`
```http
POST /api/documents/search
Content-Type: application/json

{
  "query": "What causes climate change?",
  "documentIds": ["doc_123", "doc_456"],
  "topK": 5
}
```

### Embeddings `/api/embed`
```http
POST /api/embed
Content-Type: application/json

{
  "text": "Text to embed"
}
```

### Health Check `/api/health`
```http
GET /api/health
```

## Deployment

### Prerequisites
- [Cloudflare account](https://dash.cloudflare.com/sign-up) (free)
- [Node.js](https://nodejs.org/) v18+
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/install-and-update/)

### 1. Install Dependencies
```bash
cd worker
npm install
```

### 2. Login to Cloudflare
```bash
npx wrangler login
```

### 3. Create KV Namespaces
```bash
# Create CACHE namespace
npx wrangler kv:namespace create "CACHE"
npx wrangler kv:namespace create "CACHE" --preview

# Create RATE_LIMIT namespace
npx wrangler kv:namespace create "RATE_LIMIT"
npx wrangler kv:namespace create "RATE_LIMIT" --preview
```

Copy the IDs from the output and update `wrangler.toml`:
```toml
[[kv_namespaces]]
binding = "CACHE"
id = "your_cache_namespace_id"
preview_id = "your_cache_preview_id"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "your_rate_limit_namespace_id"
preview_id = "your_rate_limit_preview_id"
```

### 4. Set Secrets
```bash
# Required: Google Gemini API Key
npx wrangler secret put GEMINI_API_KEY
# Get your key at: https://aistudio.google.com/apikey

# Optional: Hugging Face API Key (fallback)
npx wrangler secret put HF_API_KEY
# Get your key at: https://huggingface.co/settings/tokens

# Optional: Pinecone (for production RAG)
npx wrangler secret put PINECONE_API_KEY
npx wrangler secret put PINECONE_HOST
```

### 5. Update CORS Origin
Edit `wrangler.toml`:
```toml
[vars]
ALLOWED_ORIGINS = "https://yourusername.github.io,http://localhost:4200"
```

### 6. Deploy
```bash
# Development
npx wrangler dev

# Production
npx wrangler deploy
```

Your worker will be deployed to: `https://studybuddy-worker.<your-subdomain>.workers.dev`

### 7. Update Frontend API URL
Update `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://studybuddy-worker.<your-subdomain>.workers.dev'
};
```

## Free Tier Limits

| Service | Free Tier Limit | Notes |
|---------|----------------|--------|
| Cloudflare Workers | 100K req/day | More than enough for learning |
| Google Gemini API | Free tier available | 15 requests/min, 1M tokens/min |
| Hugging Face Inference | 30K chars/month | Fallback only |
| Cloudflare KV | 100K reads/day | Sufficient for caching |

## Configuration

### Environment Variables (wrangler.toml)
```toml
[vars]
ENVIRONMENT = "production"              # or "development"
MAX_TOKENS = 2048                       # Max tokens per AI response
DEFAULT_TEMPERATURE = 0.7               # AI creativity (0-1)
ALLOWED_ORIGINS = "https://your-domain" # CORS whitelist
```

### Secrets (via wrangler secret put)
- `GEMINI_API_KEY` - **Required** for AI chat/quiz/flashcards (Google Gemini)
- `HF_API_KEY` - Optional fallback provider
- `PINECONE_API_KEY` - Optional for production RAG
- `PINECONE_HOST` - Pinecone index host URL

## Local Development

```bash
cd worker
npm install
npx wrangler dev
```

Worker will run at: `http://localhost:8787`

Test the health endpoint:
```bash
curl http://localhost:8787/api/health
```

## Monitoring

### View Logs
```bash
npx wrangler tail
```

### Check Analytics
Visit: https://dash.cloudflare.com/workers

### Rate Limit Status
```bash
npx wrangler kv:key list --binding=RATE_LIMIT
```

## Troubleshooting

### "AI provider not available"
- Check `GEMINI_API_KEY` is set: `npx wrangler secret list`
- Verify key at: https://aistudio.google.com/apikey

### CORS errors
- Add your frontend domain to `ALLOWED_ORIGINS` in `wrangler.toml`
- Redeploy: `npx wrangler deploy`

### Rate limit too strict
- Increase limit in `src/index.ts` line 54
- Or implement user-based rate limiting

### Embedding errors
- Gemini embeddings require a valid API key
- Worker falls back to simple TF-IDF embeddings
- For production, add Pinecone API key

## Cost Estimate

For a typical student using the app daily:
- **Frontend**: $0 (GitHub Pages is free)
- **Backend**: $0 (within Cloudflare Workers free tier)
- **AI API**: $0 (Google Gemini free tier)
- **Total**: **$0/month** 🎉

## Security

✅ API keys stored as Cloudflare secrets (encrypted)  
✅ Rate limiting prevents abuse (100 req/min)  
✅ CORS restricts frontend origins  
✅ No user data stored permanently  
✅ All communication over HTTPS  

## Architecture Decisions

**Why Cloudflare Workers?**
- Runs at the edge (low latency globally)
- Free tier is generous
- No cold starts (unlike Lambda)
- Built-in KV storage

**Why Google Gemini?**
- State-of-the-art AI model (Gemini 2.0 Flash)
- Generous free tier (15 RPM, 1M tokens/min)
- Fast response times
- Excellent for educational content
- No credit card required for free tier

**Why client-side embeddings fallback?**
- Keeps worker lightweight
- Gemini embeddings are efficient
- Simple TF-IDF works for small docs
- Upgrade to Pinecone for production

## Next Steps

1. ✅ Deploy worker to Cloudflare
2. ✅ Configure API keys
3. ✅ Update frontend API URL
4. ⬜ Add user authentication (Cloudflare Access)
5. ⬜ Implement streaming responses for chat
6. ⬜ Add quiz result persistence
7. ⬜ Upgrade to Pinecone for production RAG

## License

MIT - See LICENSE file

## Support

- Issues: https://github.com/yourusername/studybuddy/issues
- Docs: See `/docs` folder in repo
- Cloudflare Workers: https://developers.cloudflare.com/workers/
