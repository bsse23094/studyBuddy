# Test Serverless Inference with correct format
$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
}

# According to new docs, format should be:
# POST https://api-inference.huggingface.co/models/{model_id}/v1/chat/completions

$body = @{
    model = "mistralai/Mistral-7B-Instruct-v0.2"  
    messages = @(
        @{
            role = "user"
            content = "Explain photosynthesis in one sentence."
        }
    )
    max_tokens = 100
    stream = $false
} | ConvertTo-Json -Depth 10

Write-Host "=== Test 1: Model-specific endpoint ==="
Write-Host "URL: https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions"
try {
    $response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2/v1/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Error: $($reader.ReadToEnd())"
    }
}

Write-Host "`n=== Test 2: Try with Meta Llama ==="
$body2 = @{
    model = "meta-llama/Llama-3.2-3B-Instruct"
    messages = @(
        @{
            role = "user"
            content = "What is 2+2?"
        }
    )
    max_tokens = 50
    stream = $false
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/models/meta-llama/Llama-3.2-3B-Instruct/v1/chat/completions" -Method Post -Headers $headers -Body $body2
    Write-Host "✅ SUCCESS with Llama!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Error: $($reader.ReadToEnd())"
    }
}
