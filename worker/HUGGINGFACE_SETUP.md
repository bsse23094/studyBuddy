# 🤗 Hugging Face Setup (100% FREE!)

## Why Hugging Face?
- ✅ **Completely FREE** - No credit card required!
- ✅ **No usage limits** for Inference API
- ✅ **Good quality** - Mistral-7B-Instruct is excellent for tutoring
- ✅ **Fast** - Hosted on Hugging Face infrastructure

## Step 1: Get Your Free API Token

1. Go to https://huggingface.co/
2. Click **Sign Up** (top right)
3. Create a free account (use email or Google/GitHub)
4. Once logged in, go to https://huggingface.co/settings/tokens
5. Click **New token**
6. Name it: `studybuddy-api`
7. Type: Select **Read**
8. Click **Generate token**
9. **COPY THE TOKEN** - it looks like: `hf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

## Step 2: Add Token to Cloudflare Worker

Run this command (replace YOUR_TOKEN with your actual token):

```powershell
cd c:\Users\BK\studyBuddy\worker
$env:CLOUDFLARE_API_TOKEN="NzX2WjifAvyeeLyJz4WmgIUl4xBBgQYeUBZGhYha"
npx wrangler secret put HF_API_KEY
# When prompted, paste your Hugging Face token
```

## Step 3: Deploy

```powershell
npx wrangler deploy
```

## Models Being Used (All FREE!):

- **mistralai/Mistral-7B-Instruct-v0.2**
  - 7 billion parameters
  - Great for explanations, Q&A, tutoring
  - Fast inference
  - No rate limits on Inference API

## Alternative Free Models:

If Mistral is slow or unavailable, you can try:

1. **meta-llama/Llama-2-7b-chat-hf** - Facebook's Llama 2
2. **google/flan-t5-xxl** - Google's T5 (11B parameters)
3. **bigscience/bloom-7b1** - Multilingual model

Just replace the model name in `worker/src/index.ts`!

## Testing:

```powershell
# Test chat endpoint
$body = @{message="What is gravity?"; mode="explain"} | ConvertTo-Json
Invoke-RestMethod -Uri "https://studybuddy-worker.bsse23094.workers.dev/api/chat" -Method Post -Body $body -ContentType "application/json"
```

## Cost:
- **$0.00** - Completely free! 🎉
- No credit card needed
- No hidden fees
- No usage limits (reasonable use)

## Notes:
- First request might be slow (~10-20s) - model is loading
- Subsequent requests are fast (~2-3s)
- If you hit rate limits (rare), just wait 1 minute
