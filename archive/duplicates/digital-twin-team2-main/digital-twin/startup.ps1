# Windows PowerShell Startup Script
# Save as: startup.ps1
# Run with: PowerShell -ExecutionPolicy Bypass -File startup.ps1

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "Digital Twin Career Agent - Startup Script" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
$nodeCheck = node --version
if (-not $nodeCheck) {
    Write-Host "❌ Node.js is not installed. Please install it from https://nodejs.org" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Node.js $nodeCheck found" -ForegroundColor Green

# Check if npm is installed
$npmCheck = npm --version
if (-not $npmCheck) {
    Write-Host "❌ npm is not installed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ npm $npmCheck found" -ForegroundColor Green
Write-Host ""

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Are you in the digital-twin directory?" -ForegroundColor Red
    exit 1
}

Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Cyan
Write-Host ""

# Check if .env.local exists
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  .env.local not found!" -ForegroundColor Yellow
    Write-Host "Creating .env.local from .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Created .env.local" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Please edit .env.local and add your API keys:" -ForegroundColor Yellow
    Write-Host "   • GROQ_API_KEY: Get it from https://console.groq.com" -ForegroundColor Yellow
    Write-Host "   • DATABASE_URL: Get it from https://neon.tech" -ForegroundColor Yellow
    Write-Host ""
    Start-Process notepad ".env.local"
    Write-Host "Opening .env.local in Notepad... Please edit it." -ForegroundColor Cyan
    Write-Host ""
    Read-Host "Press Enter when you've finished editing .env.local"
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ npm install failed" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Kill any existing node processes on port 3000
Write-Host "🔄 Cleaning up existing processes..." -ForegroundColor Cyan
$existingProcess = Get-Process node -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*3000*" }
if ($existingProcess) {
    Stop-Process -InputObject $existingProcess -Force
    Write-Host "✅ Cleaned up existing Node processes" -ForegroundColor Green
}

# Remove .next folder
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "✅ Cleared .next build cache" -ForegroundColor Green
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "🚀 Starting development server..." -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📖 Access your app at:" -ForegroundColor Green
Write-Host "   🏠 Landing:  http://localhost:3000" -ForegroundColor Green
Write-Host "   💬 Chat:     http://localhost:3000/chat" -ForegroundColor Green
Write-Host "   🔐 Admin:    http://localhost:3000/admin/login" -ForegroundColor Green
Write-Host ""
Write-Host "👤 Default admin credentials:" -ForegroundColor Yellow
Write-Host "   Email: admin@example.com" -ForegroundColor Yellow
Write-Host "   Password: (set via API or environment)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Cyan
Write-Host ""

# Start the dev server
npm run dev
