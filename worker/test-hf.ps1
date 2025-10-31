# Test Hugging Face API directly
$headers = @{
    "Authorization" = "Bearer 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"
    "Content-Type" = "application/json"
}

$body = @{
    inputs = "Explain photosynthesis in one sentence."
    parameters = @{
        max_new_tokens = 100
        temperature = 0.7
        return_full_text = $false
    }
} | ConvertTo-Json -Depth 10

Write-Host "Testing Hugging Face model..."
try {
    $response = Invoke-RestMethod -Uri "https://router.huggingface.co/hf-inference/models/google/flan-t5-base" -Method Post -Headers $headers -Body $body
    Write-Host "Success!"
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Error: $_"
    if ($_.Exception.Response) {
        $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
        Write-Host "Response: $($reader.ReadToEnd())"
    }
}
