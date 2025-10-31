# Test if the token itself works by checking user info
$headers = @{
    "Authorization" = "Bearer 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"
}

Write-Host "=== Testing Token Validity ==="
try {
    $user = Invoke-RestMethod -Uri "https://huggingface.co/api/whoami-v2" -Method Get -Headers $headers
    Write-Host "✅ Token is valid!"
    Write-Host "User: $($user.name)"
    Write-Host "Auth: $($user.auth.type)"
    Write-Host ($user | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Token invalid: $_"
}

Write-Host "`n=== Try Serverless Inference API (new) ==="
$body = @{
    inputs = "Hello world"
} | ConvertTo-Json

try {
    # Try a simple text generation model
    $response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/models/gpt2" -Method Post -Headers @{
        "Authorization" = "Bearer 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"
        "Content-Type" = "application/json"
    } -Body $body
    Write-Host "✅ API works with GPT-2!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
}
