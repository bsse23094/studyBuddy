# Test Hugging Face new Inference Providers API
$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
}

# Test 1: Try text-generation endpoint
$body1 = @{
    inputs = "Explain photosynthesis in one sentence."
    parameters = @{
        max_new_tokens = 100
        temperature = 0.7
    }
} | ConvertTo-Json -Depth 10

Write-Host "=== Test 1: Text Generation Endpoint ==="
Write-Host "URL: https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2"
try {
    $response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2" -Method Post -Headers $headers -Body $body1
    Write-Host "✅ Success!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody"
    }
}

Write-Host "`n=== Test 2: New Router Endpoint ==="
Write-Host "URL: https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2"
try {
    $response = Invoke-RestMethod -Uri "https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.2" -Method Post -Headers $headers -Body $body1
    Write-Host "✅ Success!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody"
    }
}

Write-Host "`n=== Test 3: Try a smaller/simpler model ==="
Write-Host "URL: https://api-inference.huggingface.co/models/google/flan-t5-base"
try {
    $response = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/models/google/flan-t5-base" -Method Post -Headers $headers -Body $body1
    Write-Host "✅ Success!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "❌ Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        $errorBody = $reader.ReadToEnd()
        Write-Host "Response Body: $errorBody"
    }
}

Write-Host "`n=== Test 4: Check API status ==="
try {
    $status = Invoke-RestMethod -Uri "https://api-inference.huggingface.co/status/mistralai/Mistral-7B-Instruct-v0.2" -Method Get -Headers @{"Authorization" = "Bearer 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"}
    Write-Host "Model status:"
    Write-Host ($status | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Could not get model status"
}
