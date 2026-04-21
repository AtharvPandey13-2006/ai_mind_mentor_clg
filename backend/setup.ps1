# Create .env file from example
Copy-Item .env.example .env

Write-Host "✅ .env file created from .env.example" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Please update the .env file with your actual configuration:" -ForegroundColor Yellow
Write-Host "   - MONGODB_URI (your MongoDB connection string)" -ForegroundColor Cyan
Write-Host "   - JWT_SECRET (generate a secure random string)" -ForegroundColor Cyan
Write-Host "   - GEMINI_API_KEY (your Google Gemini API key)" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Opening .env file for editing..." -ForegroundColor Green

# Open .env file in default editor
notepad .env
