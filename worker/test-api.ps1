# Test OpenRouter API directly
$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
    "HTTP-Referer" = "https://studybuddy.app"
    "X-Title" = "StudyBuddy"
}

$body = @{
    model = "openai/gpt-3.5-turbo"
    messages = @(
        @{
            role = "system"
            content = "You are a helpful tutor."
        },
        @{
            role = "user"
            content = "What is photosynthesis?"
        }
    )
    max_tokens = 100
} | ConvertTo-Json -Depth 10

Write-Host "Testing OpenRouter API..."
try {
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "Success!"
    Write-Host $response | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $_"
    Write-Host $_.Exception.Response
}
