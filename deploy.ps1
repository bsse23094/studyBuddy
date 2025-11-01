Write-Host 'StudyBuddy Deployment Script' -ForegroundColor Cyan
Write-Host '=============================' -ForegroundColor Cyan
Write-Host ''

Write-Host 'Deploying Backend...' -ForegroundColor Yellow
Set-Location worker
npm run deploy
Write-Host 'Backend: https://studybuddy-worker.bsse23094.workers.dev' -ForegroundColor Green
Set-Location ..

Write-Host ''
Write-Host 'Deploying Frontend...' -ForegroundColor Yellow
ng build --base-href=/studyBuddy/
npx angular-cli-ghpages --dir=dist/study-buddy/browser --no-silent
Write-Host 'Frontend: https://bsse23094.github.io/studyBuddy/' -ForegroundColor Green

Write-Host ''
Write-Host 'Deployment complete!' -ForegroundColor Green
