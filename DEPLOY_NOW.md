# 🚀 Quick Deploy Instructions

## Your Setup Status
✅ KV Namespaces Created:
- CACHE: `69a623e78bcb4b9e8f244b0724cfb629`
- RATE_LIMIT: `395cadf8d23d46d68fed1e33304904ab`

✅ OpenRouter API Key Ready:
- `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`

✅ wrangler.toml Updated with KV IDs

## Next: Get API Token for Deployment

### Step 1: Create API Token

1. Go to: **https://dash.cloudflare.com/profile/api-tokens**
2. Click **"Create Token"**
3. Use template: **"Edit Cloudflare Workers"**
4. Click **"Continue to summary"**
5. Click **"Create Token"**
6. **COPY THE TOKEN** (you'll only see it once!)

### Step 2: Set Environment Variable

In PowerShell:

```powershell
$env:CLOUDFLARE_API_TOKEN="YOUR_TOKEN_HERE"
```

Replace `YOUR_TOKEN_HERE` with the token you just copied.

### Step 3: Deploy Worker

```powershell
cd c:\Users\BK\studyBuddy\worker
npx wrangler deploy
```

This should now work! You'll see:
```
✨ Successfully published to https://studybuddy-worker.YOUR_SUBDOMAIN.workers.dev
```

### Step 4: Set OpenRouter API Key

```powershell
npx wrangler secret put OPENROUTER_API_KEY
```

When prompted, paste:
```
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
```

### Step 5: Test Your Worker

```powershell
curl https://studybuddy-worker.YOUR_SUBDOMAIN.workers.dev/api/health
```

---

## Alternative: Use GitHub Actions

If you prefer automated deployment:

### 1. Get Account ID
- Go to Cloudflare Dashboard
- Look in the right sidebar for **"Account ID"**
- Copy it

### 2. Add GitHub Secrets
Go to: `https://github.com/YOUR_USERNAME/studybuddy/settings/secrets/actions`

Add two secrets:
- `CLOUDFLARE_API_TOKEN` = (token from Step 1 above)
- `CLOUDFLARE_ACCOUNT_ID` = (account ID)

### 3. Push to GitHub
```powershell
cd c:\Users\BK\studyBuddy
git add .
git commit -m "Configure worker with KV namespaces"
git push origin main
```

GitHub Actions will automatically deploy your worker!

---

## What You Have So Far

✅ Worker code complete  
✅ KV namespaces created and configured  
✅ OpenRouter API key ready  
⬜ Deploy worker  
⬜ Set API key as secret  
⬜ Update frontend with worker URL  
⬜ Deploy frontend  

**You're almost there!** Just need to get the API token and deploy.
