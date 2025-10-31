# 🚀 Complete Deployment Guide - StudyBuddy

Deploy the full StudyBuddy application: Angular frontend on GitHub Pages + Cloudflare Worker backend.

## Overview

```
┌─────────────────────────────────────────────────────────┐
│                    Architecture                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  GitHub Pages                 Cloudflare Workers         │
│  ┌──────────────┐            ┌──────────────┐          │
│  │  Angular SPA │  <──HTTPS──>  Worker API │          │
│  │  (Static)    │            │  (Edge)      │          │
│  └──────────────┘            └──────────────┘          │
│         │                            │                  │
│         │                            ├─> OpenRouter     │
│         │                            ├─> Hugging Face   │
│         │                            └─> KV Storage     │
│         │                                               │
│    IndexedDB (Local)                                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Part 1: Deploy Backend (Cloudflare Worker)

### Step 1: Prerequisites

1. **Create Cloudflare account** (free)
   - Go to: https://dash.cloudflare.com/sign-up
   - Verify email

2. **Install Wrangler CLI**
   ```bash
   npm install -g wrangler
   ```

3. **Login to Cloudflare**
   ```bash
   wrangler login
   ```

### Step 2: Create KV Namespaces

```bash
cd worker

# Create production KV namespaces
wrangler kv:namespace create "CACHE"
wrangler kv:namespace create "RATE_LIMIT"

# Create preview KV namespaces (for development)
wrangler kv:namespace create "CACHE" --preview
wrangler kv:namespace create "RATE_LIMIT" --preview
```

**Copy the IDs** from the output and update `worker/wrangler.toml`:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "<YOUR_CACHE_ID_HERE>"
preview_id = "<YOUR_CACHE_PREVIEW_ID_HERE>"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "<YOUR_RATE_LIMIT_ID_HERE>"
preview_id = "<YOUR_RATE_LIMIT_PREVIEW_ID_HERE>"
```

### Step 3: Get API Keys

#### OpenRouter (Required - Free Tier)
1. Go to: https://openrouter.ai/keys
2. Sign up with Google/GitHub
3. Create new API key
4. Copy the key

#### Hugging Face (Optional - Fallback)
1. Go to: https://huggingface.co/settings/tokens
2. Create new token (read access)
3. Copy the token

### Step 4: Set Secrets

```bash
cd worker

# Required: OpenRouter API Key
wrangler secret put OPENROUTER_API_KEY
# Paste your OpenRouter key when prompted

# Optional: Hugging Face (for fallback)
wrangler secret put HF_API_KEY
# Paste your HF token when prompted
```

### Step 5: Update CORS Origins

Edit `worker/wrangler.toml`:

```toml
[vars]
ALLOWED_ORIGINS = "https://YOUR_GITHUB_USERNAME.github.io,http://localhost:4200"
```

Replace `YOUR_GITHUB_USERNAME` with your actual GitHub username.

### Step 6: Deploy Worker

```bash
cd worker
wrangler deploy
```

**Copy your worker URL** from the output:
```
Published studybuddy-worker (X.XX sec)
  https://studybuddy-worker.<your-subdomain>.workers.dev
```

### Step 7: Test Worker

```bash
# Test health endpoint
curl https://studybuddy-worker.<your-subdomain>.workers.dev/api/health

# Should return:
# {"success":true,"status":"healthy",...}
```

## Part 2: Deploy Frontend (GitHub Pages)

### Step 1: Update API URL

Edit `src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://studybuddy-worker.<your-subdomain>.workers.dev'
};
```

Replace with your actual worker URL from Part 1, Step 6.

### Step 2: Build Production App

```bash
# Return to project root
cd ..

# Build for production
npm run build -- --configuration production
```

This creates `dist/study-buddy/` with your compiled app.

### Step 3: Setup GitHub Repository

If you haven't already:

```bash
# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - StudyBuddy app"

# Create GitHub repo at: https://github.com/new
# Name it: studybuddy

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/studybuddy.git

# Push
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

#### Option A: Manual Deployment

1. Go to your repo: `https://github.com/YOUR_USERNAME/studybuddy`
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: Select `gh-pages` (we'll create this)
5. Click Save

```bash
# Install gh-pages package
npm install --save-dev angular-cli-ghpages

# Deploy
npx angular-cli-ghpages --dir=dist/study-buddy
```

#### Option B: GitHub Actions (Automatic)

The workflow is already set up in `.github/workflows/deploy-ui.yml`. Just:

1. Go to repo Settings → Actions → General
2. Enable "Read and write permissions"
3. Save

```bash
# Push to main branch to trigger deploy
git push origin main
```

### Step 5: Access Your App

Your app will be live at:
```
https://YOUR_USERNAME.github.io/studybuddy/
```

⏰ **Note**: First deployment takes 2-5 minutes

### Step 6: Update Base Href (if needed)

If you see routing issues, add base href to `src/index.html`:

```html
<base href="/studybuddy/">
```

Then rebuild and redeploy.

## Part 3: Configure CI/CD

### GitHub Actions Secrets

1. Go to repo Settings → Secrets and variables → Actions
2. Click "New repository secret"

Add these secrets:

#### For Worker Deployment:
- **CLOUDFLARE_API_TOKEN**
  1. Go to: https://dash.cloudflare.com/profile/api-tokens
  2. Create Token → Use "Edit Cloudflare Workers" template
  3. Copy token
  
- **CLOUDFLARE_ACCOUNT_ID**
  1. Go to: https://dash.cloudflare.com
  2. Click any site
  3. Copy "Account ID" from right sidebar

### Automatic Deployments

Now when you push to `main`:
- Frontend automatically deploys to GitHub Pages
- Backend automatically deploys to Cloudflare Workers

```bash
git add .
git commit -m "Update feature"
git push origin main
```

## Part 4: Verify Everything Works

### 1. Test Backend Health
```bash
curl https://studybuddy-worker.<your-subdomain>.workers.dev/api/health
```

Expected:
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "openRouter": "configured",
    "cache": "available",
    "rateLimit": "available"
  }
}
```

### 2. Test Frontend
1. Visit: `https://YOUR_USERNAME.github.io/studybuddy/`
2. Click "Chat" in navigation
3. Try asking a question
4. Should get AI response

### 3. Test Document Upload
1. Go to "Documents" page
2. Upload a text file
3. Check browser DevTools → Application → IndexedDB → StudyBuddyDB
4. Should see document stored

### 4. Test Quiz Generation
1. Go to "Quiz" page
2. Enter topic: "Calculus"
3. Click "Generate Quiz"
4. Should get 5 questions

## Troubleshooting

### ❌ "Failed to fetch" errors

**Problem**: CORS blocking requests

**Solution**:
1. Check `worker/wrangler.toml` has correct `ALLOWED_ORIGINS`
2. Include both `https://` and `http://localhost:4200`
3. Redeploy worker: `cd worker && wrangler deploy`

### ❌ "AI provider not available"

**Problem**: Missing or invalid API key

**Solution**:
```bash
cd worker

# Check if secret exists
wrangler secret list

# If missing, add it
wrangler secret put OPENROUTER_API_KEY

# Get new key at: https://openrouter.ai/keys
```

### ❌ GitHub Pages 404

**Problem**: Base href mismatch

**Solution**:
1. Check `src/index.html` has: `<base href="/studybuddy/">`
2. Or deploy to custom domain to avoid subpath

### ❌ "Rate limit exceeded"

**Problem**: Too many requests (100/min limit)

**Solution**:
1. Wait 1 minute
2. Or increase limit in `worker/src/index.ts` line 54
3. Redeploy: `wrangler deploy`

### ❌ Worker deployment fails

**Problem**: Invalid wrangler.toml or missing secrets

**Solution**:
```bash
# Validate config
cd worker
wrangler deploy --dry-run

# Check secrets
wrangler secret list

# View logs
wrangler tail
```

## Monitoring & Maintenance

### View Worker Logs
```bash
cd worker
wrangler tail
```

### Check Usage (Free Tier Limits)
1. Go to: https://dash.cloudflare.com/workers
2. Click your worker
3. View "Metrics" tab

You get:
- ✅ 100,000 requests/day
- ✅ 100,000 KV reads/day
- ✅ 1,000 KV writes/day

### Update Worker
```bash
cd worker

# Make changes to code
# Then deploy
wrangler deploy
```

### Update Frontend
```bash
# Make changes to Angular code

# Build
npm run build -- --configuration production

# Deploy
npx angular-cli-ghpages --dir=dist/study-buddy

# Or just push to main (if using GitHub Actions)
git push origin main
```

## Custom Domain (Optional)

### For GitHub Pages:
1. Buy domain (Namecheap, Google Domains, etc.)
2. Add CNAME record: `www` → `YOUR_USERNAME.github.io`
3. GitHub Settings → Pages → Custom domain
4. Enter: `www.yourdomain.com`
5. Enable "Enforce HTTPS"

### For Cloudflare Worker:
1. Go to: https://dash.cloudflare.com/workers
2. Click your worker → Triggers
3. Add Custom Domain
4. Enter: `api.yourdomain.com`
5. Update `src/environments/environment.prod.ts`

## Security Checklist

- [x] API keys stored as secrets (never in code)
- [x] CORS restricted to your domain
- [x] Rate limiting enabled (100 req/min)
- [x] HTTPS enforced everywhere
- [x] No sensitive data in localStorage (only IndexedDB)
- [ ] Add authentication (future: Cloudflare Access)
- [ ] Add input validation (future: sanitize uploads)

## Cost Summary

| Service | Free Tier | Your Usage | Cost |
|---------|-----------|------------|------|
| GitHub Pages | Unlimited public repos | 1 repo | $0 |
| Cloudflare Workers | 100K req/day | ~1K req/day | $0 |
| OpenRouter (Llama 3.1) | Free tier | ~500 req/day | $0 |
| Cloudflare KV | 100K reads/day | ~2K reads/day | $0 |
| **Total** | | | **$0/month** 🎉 |

## Next Steps

1. ✅ Deploy worker
2. ✅ Deploy frontend
3. ✅ Configure CI/CD
4. ⬜ Add custom domain
5. ⬜ Implement remaining UI pages
6. ⬜ Add user authentication
7. ⬜ Set up monitoring/alerts
8. ⬜ Run accessibility audit
9. ⬜ Add PWA features (offline mode)
10. ⬜ Create Figma wireframes

## Support

- **Worker Issues**: See `worker/README.md`
- **Frontend Issues**: See `docs/PROJECT_STATUS.md`
- **GitHub Issues**: https://github.com/YOUR_USERNAME/studybuddy/issues

## Resources

- Cloudflare Workers Docs: https://developers.cloudflare.com/workers/
- OpenRouter Docs: https://openrouter.ai/docs
- Angular Deployment: https://angular.dev/cli/deployment
- GitHub Pages: https://pages.github.com/

---

**Congratulations!** 🎉 Your AI tutor app is now live and free to use!
