# 🚀 StudyBuddy - Quick Reference Card

## Local Development

```bash
# Install dependencies
npm install
cd worker && npm install && cd ..

# Run locally (both UI + Worker)
npm run dev

# Or run separately:
npm run dev:ui      # Frontend → http://localhost:4200
npm run dev:worker  # Backend → http://localhost:8787
```

## Deployment

### Backend (Cloudflare Worker)

```bash
# 1. Login
cd worker
wrangler login

# 2. Create KV namespaces
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "RATE_LIMIT"
# Copy IDs to wrangler.toml

# 3. Set secrets
wrangler secret put GEMINI_API_KEY
# Get key: https://aistudio.google.com/apikey

# 4. Update CORS in wrangler.toml
# ALLOWED_ORIGINS = "https://YOUR_USERNAME.github.io"

# 5. Deploy
wrangler deploy

# Your worker URL: https://studybuddy-worker.XXX.workers.dev
```

### Frontend (GitHub Pages)

```bash
# 1. Update API URL in src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://studybuddy-worker.XXX.workers.dev'
};

# 2. Build production
npm run build:prod

# 3. Deploy to GitHub Pages
npm run deploy:ui
# Or use GitHub Actions (push to main)

# Your app URL: https://YOUR_USERNAME.github.io/studybuddy/
```

## Key Files

| File | Purpose |
|------|---------|
| `src/environments/environment.ts` | Dev API URL (localhost:8787) |
| `src/environments/environment.prod.ts` | Prod API URL (worker URL) |
| `worker/wrangler.toml` | Worker config (CORS, KV IDs) |
| `worker/src/index.ts` | Main router |
| `worker/src/utils/api.ts` | AI provider calls |
| `DEPLOYMENT.md` | Full deployment guide |

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/chat` | POST | AI tutor (explain/solve/hint/quiz) |
| `/api/quiz/generate` | POST | Generate adaptive quizzes |
| `/api/flashcards/generate` | POST | Generate flashcards |
| `/api/documents/upload` | POST | Upload & process documents |
| `/api/documents/search` | POST | Search documents |
| `/api/embed` | POST | Generate embeddings |
| `/api/health` | GET | Health check |

## Useful Commands

```bash
# View worker logs
npm run worker:logs

# List worker secrets
npm run worker:secrets

# Deploy everything
npm run deploy

# Build only
npm run build:prod

# Test locally
curl http://localhost:8787/api/health
```

## Free Tier Limits

- Cloudflare Workers: **100K requests/day** ✅
- Google Gemini 2.0 Flash: **Free tier available** ✅
- Cloudflare KV: **100K reads/day** ✅
- GitHub Pages: **Unlimited** ✅

**Total cost: $0/month** 🎉

## Troubleshooting

### CORS errors
→ Check `ALLOWED_ORIGINS` in `worker/wrangler.toml`

### "AI provider not available"
→ Check: `wrangler secret list`  
→ Verify key at: https://aistudio.google.com/apikey

### Rate limit exceeded
→ Wait 1 minute or increase in `worker/src/index.ts`

### Worker deploy fails
→ Run: `wrangler deploy --dry-run`

## Documentation

- **Deployment Guide**: `DEPLOYMENT.md`
- **Backend Docs**: `worker/README.md`
- **Architecture**: `docs/PROJECT_STATUS.md`
- **RAG Prompts**: `docs/RAG_PROMPTS.md`
- **Backend Summary**: `BACKEND_COMPLETE.md`

## Support

- GitHub Issues: [Create Issue](https://github.com/YOUR_USERNAME/studybuddy/issues)
- Cloudflare Docs: https://developers.cloudflare.com/workers/
- Gemini API Docs: https://ai.google.dev/docs

---

**Ready to deploy?** → See `DEPLOYMENT.md` for step-by-step guide!
