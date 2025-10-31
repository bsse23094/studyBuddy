$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
    "HTTP-Referer" = "https://studybuddy.app"
    "X-Title" = "StudyBuddy"
}

$body = @{
    model = "mistralai/mistral-7b-instruct:free"
    messages = @(
        @{
            role = "user"
            content = "Explain photosynthesis in simple terms."
        }
    )
    max_tokens = 200
    temperature = 0.7
} | ConvertTo-Json -Depth 10

Write-Host "Testing Mistral 7B Instruct (FREE)..."
try {
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "✅ SUCCESS!"
    Write-Host "`nResponse:"
    Write-Host $response.choices[0].message.content
    Write-Host "`nModel: $($response.model)"
    Write-Host "Tokens used: $($response.usage.total_tokens)"
    Write-Host "Cost: FREE!"
} catch {
    Write-Host "❌ Error: $_"
}
