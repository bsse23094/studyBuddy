$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
    "HTTP-Referer" = "https://studybuddy.app"
    "X-Title" = "StudyBuddy"
}

$body = @{
    model = "google/gemini-flash-1.5"
    messages = @(
        @{
            role = "user"
            content = "What is gravity? Explain in one sentence."
        }
    )
    max_tokens = 50
} | ConvertTo-Json -Depth 10

Write-Host "Testing Gemini Flash 1.5..."
try {
    $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers $headers -Body $body
    Write-Host "Success!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}
