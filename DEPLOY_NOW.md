# 🚀 Quick Deploy Instructions

## Your Setup Status
✅ KV Namespaces Created (check wrangler.toml for IDs)

✅ Using Google Gemini 2.0 Flash API

✅ wrangler.toml Updated with KV IDs

**Note:** API keys should be set as secrets, never in code!

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

### Step 4: Set Gemini API Key

```powershell
npx wrangler secret put GEMINI_API_KEY
```

When prompted, paste your Gemini API key.
Get one at: https://aistudio.google.com/apikey

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
✅ Using Gemini API  
⬜ Deploy worker  
⬜ Set API key as secret  
⬜ Update frontend with worker URL  
⬜ Deploy frontend  

**You're almost there!** Just need to get the API token and deploy.
