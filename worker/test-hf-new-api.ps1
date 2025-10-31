# Test new Hugging Face Inference Providers API format
$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
}

# According to docs, new format uses messages like OpenAI
$body = @{
    model = "mistralai/Mistral-7B-Instruct-v0.2"
    messages = @(
        @{
            role = "user"
            content = "Explain photosynthesis in one sentence."
        }
    )
    max_tokens = 100
    temperature = 0.7
} | ConvertTo-Json -Depth 10

Write-Host "=== Testing NEW Inference Providers API Format ==="
Write-Host "Endpoint: https://api-inference.huggingface.co/v1/chat/completions"
Write-Host "Body: $body"
try {
    $response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/v1/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody"
    }
}

Write-Host "`n=== Try with simpler model ==="
$body2 = @{
    model = "meta-llama/Meta-Llama-3-8B-Instruct"
    messages = @(
        @{
            role = "user"
            content = "What is 2+2?"
        }
    )
    max_tokens = 50
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/v1/chat/completions" -Method Post -Headers $headers -Body $body2
    Write-Host "✅ SUCCESS with Llama!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Error Body: $errorBody"
    }
}
