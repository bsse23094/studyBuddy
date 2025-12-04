# 🔧 Worker Setup - Step by Step

## API Key Setup (Gemini)

**⚠️ IMPORTANT**: Your API key should NEVER be committed to git or exposed in code!

1. Get a Gemini API key from: https://aistudio.google.com/apikey
2. Store it securely as a Cloudflare secret (see Step 8)

---

## Setup Steps

### Step 1: Login to Cloudflare

Open your browser and go to:
👉 https://dash.cloudflare.com/sign-up

If you already have an account, login at:
👉 https://dash.cloudflare.com/login

### Step 2: Create KV Namespaces (via Dashboard)

1. In Cloudflare Dashboard, click **Workers & Pages**
2. Click **KV** in the left sidebar
3. Click **Create namespace**

Create two namespaces:
- Name: `studybuddy-cache` → Click Create
- Name: `studybuddy-rate-limit` → Click Create

**Copy the IDs** - you'll see them in the list. They look like: `abc123def456...`

### Step 3: Update wrangler.toml

Open `worker/wrangler.toml` and uncomment the KV sections, then add your IDs:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "YOUR_CACHE_NAMESPACE_ID_HERE"
preview_id = "YOUR_CACHE_NAMESPACE_ID_HERE"

[[kv_namespaces]]
binding = "RATE_LIMIT"
id = "YOUR_RATE_LIMIT_NAMESPACE_ID_HERE"
preview_id = "YOUR_RATE_LIMIT_NAMESPACE_ID_HERE"
```

Also update the ALLOWED_ORIGINS:
```toml
ALLOWED_ORIGINS = "https://YOUR_GITHUB_USERNAME.github.io,http://localhost:4200"
```

### Step 4: Get Your Account ID

1. In Cloudflare Dashboard, go to any Workers page
2. Look for **Account ID** in the right sidebar
3. Copy it - looks like: `abc123def456...`

### Step 5: Create API Token

1. Go to: https://dash.cloudflare.com/profile/api-tokens
2. Click **Create Token**
3. Use template: **Edit Cloudflare Workers**
4. Click **Continue to summary**
5. Click **Create Token**
6. **Copy the token** - you'll only see it once!

### Step 6: Set GitHub Secrets (for CI/CD)

1. Go to your GitHub repo: `https://github.com/YOUR_USERNAME/studybuddy`
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

Add these two secrets:

**Secret 1:**
- Name: `CLOUDFLARE_API_TOKEN`
- Value: [paste the token from Step 5]

**Secret 2:**
- Name: `CLOUDFLARE_ACCOUNT_ID`
- Value: [paste the account ID from Step 4]

### Step 7: Deploy Worker

Now you can deploy! In your terminal:

```powershell
cd c:\Users\BK\studyBuddy\worker

# Deploy the worker
npx wrangler deploy
```

After deployment, you'll see:
```
Published studybuddy-worker (X.XX sec)
  https://studybuddy-worker.YOUR_SUBDOMAIN.workers.dev
```

**Copy this URL!** You'll need it for the frontend.

### Step 8: Set API Key Secret

```powershell
# Set the Gemini API key as a secret
npx wrangler secret put GEMINI_API_KEY
```

When prompted, paste your Gemini API key (get one from https://aistudio.google.com/apikey)

### Step 9: Test Your Worker

```powershell
# Test health endpoint
curl https://studybuddy-worker.YOUR_SUBDOMAIN.workers.dev/api/health
```

You should see:
```json
{
  "success": true,
  "status": "healthy",
  "services": {
    "gemini": "configured",
    "cache": "available",
    "rateLimit": "available"
  }
}
```

### Step 10: Update Frontend

Edit `c:\Users\BK\studyBuddy\src\environments\environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://studybuddy-worker.YOUR_SUBDOMAIN.workers.dev'
};
```

Replace `YOUR_SUBDOMAIN` with your actual worker URL from Step 7.

---

## Alternative: Deploy via GitHub Actions

If manual deployment doesn't work, you can use GitHub Actions:

1. Complete Steps 1-6 above (create KV namespaces, set GitHub secrets)
2. Update `wrangler.toml` with your KV namespace IDs
3. Commit and push to GitHub:
   ```powershell
   cd c:\Users\BK\studyBuddy
   git add .
   git commit -m "Configure worker for deployment"
   git push origin main
   ```
4. GitHub Actions will automatically deploy your worker!
5. Check the Actions tab to see the deployment progress

---

## Troubleshooting

### Can't login with wrangler
→ Use the Cloudflare Dashboard method above (Steps 1-2)

### "KV namespace not found"
→ Make sure you copied the IDs correctly in wrangler.toml

### "Unauthorized"
→ Check your API token has "Edit Cloudflare Workers" permissions

### Worker deploys but health check fails
→ Make sure you ran `npx wrangler secret put GEMINI_API_KEY`

---

## What's Next?

After worker is deployed:

1. ✅ Test the health endpoint
2. ✅ Update frontend environment.prod.ts with worker URL
3. ✅ Build and deploy frontend: `npm run deploy:ui`
4. ✅ Visit your app: `https://YOUR_USERNAME.github.io/studybuddy/`
5. ✅ Try the chat feature!

---

## API Key Security Best Practices

**Where your key should be stored:**
- ✅ Encrypted in Cloudflare (via `wrangler secret put GEMINI_API_KEY`)
- ❌ NOT in your code
- ❌ NOT in git
- ❌ NOT in wrangler.toml

**Get your key:**
Visit https://aistudio.google.com/apikey to create or manage your Gemini API key

---

Need help? See `DEPLOYMENT.md` for more details!
