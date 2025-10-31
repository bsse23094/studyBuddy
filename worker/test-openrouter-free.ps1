# Test OpenRouter free models
$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
    "HTTP-Referer" = "https://studybuddy.app"
    "X-Title" = "StudyBuddy"
}

$models = @(
    "google/gemma-2-9b-it:free",
    "meta-llama/llama-3.1-8b-instruct:free",
    "microsoft/phi-3-mini-128k-instruct:free",
    "qwen/qwen-2-7b-instruct:free",
    "mistralai/mistral-7b-instruct:free"
)

foreach ($model in $models) {
    Write-Host "`n=== Testing: $model ==="
    
    $body = @{
        model = $model
        messages = @(
            @{
                role = "user"
                content = "What is 2+2? Answer briefly."
            }
        )
        max_tokens = 50
    } | ConvertTo-Json -Depth 10

    try {
        $response = Invoke-RestMethod -Uri "https://openrouter.ai/api/v1/chat/completions" -Method Post -Headers $headers -Body $body
        Write-Host "✅ SUCCESS! Model works!"
        Write-Host "Response: $($response.choices[0].message.content)"
    } catch {
        Write-Host "❌ Failed: $_"
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            Write-Host "Error: $errorBody"
        }
    }
}
