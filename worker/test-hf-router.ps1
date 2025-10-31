# Based on the email: https://router.huggingface.co/hf-inference/
$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
}

$body = @{
    model = "mistralai/Mistral-7B-Instruct-v0.2"
    messages = @(
        @{
            role = "user"
            content = "What is 2+2?"
        }
    )
    max_tokens = 50
} | ConvertTo-Json -Depth 10

Write-Host "=== Test router.huggingface.co endpoint ==="
Write-Host "URL: https://router.huggingface.co/hf-inference/v1/chat/completions"
try {
    $response = Invoke-RestMethod -Uri "https://router.huggingface.co/hf-inference/v1/chat/completions" -Method Post -Headers $headers -Body $body -Verbose
    Write-Host "✅ SUCCESS!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    Write-Host "Status: $($_.Exception.Response.StatusCode.value__)"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Body: $($reader.ReadToEnd())"
    }
}

Write-Host "`n=== Check if PRO required ==="
Write-Host "Token permissions: inference.serverless.write"
Write-Host "Account type: Free (isPro: false)"
Write-Host "This might require HF PRO subscription ($9/month)"
