# PostgreSQL Setup Script for Digital Twin
# Run this script to set up the database

$PG_BIN = "C:\Program Files\PostgreSQL\18\bin"
$env:PATH = "$PG_BIN;$env:PATH"

Write-Host "=== Digital Twin PostgreSQL Setup ===" -ForegroundColor Cyan
Write-Host ""

# Get PostgreSQL password
$pgPassword = Read-Host "Enter PostgreSQL postgres user password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($pgPassword)
$plainPassword = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
$env:PGPASSWORD = $plainPassword

Write-Host ""
Write-Host "Step 1: Creating database 'digital_twin'..." -ForegroundColor Yellow

# Create database
$createDbResult = & "$PG_BIN\psql.exe" -U postgres -c "CREATE DATABASE digital_twin;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] Database created successfully!" -ForegroundColor Green
} elseif ($createDbResult -match "already exists") {
    Write-Host "[OK] Database already exists!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error creating database: $createDbResult" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 2: Creating user 'digital_twin_user'..." -ForegroundColor Yellow

# Create user
$createUserResult = & "$PG_BIN\psql.exe" -U postgres -c "CREATE USER digital_twin_user WITH PASSWORD 'digital_twin_pass';" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] User created successfully!" -ForegroundColor Green
} elseif ($createUserResult -match "already exists") {
    Write-Host "[OK] User already exists!" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Error creating user: $createUserResult" -ForegroundColor Red
}

Write-Host ""
Write-Host "Step 3: Granting privileges..." -ForegroundColor Yellow

# Grant privileges
& "$PG_BIN\psql.exe" -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE digital_twin TO digital_twin_user;" | Out-Null
& "$PG_BIN\psql.exe" -U postgres -d digital_twin -c "GRANT ALL ON SCHEMA public TO digital_twin_user;" | Out-Null
& "$PG_BIN\psql.exe" -U postgres -d digital_twin -c "ALTER SCHEMA public OWNER TO digital_twin_user;" | Out-Null
Write-Host "[OK] Privileges granted!" -ForegroundColor Green

Write-Host ""
Write-Host "Step 4: Enabling pgvector extension..." -ForegroundColor Yellow

# Enable pgvector
$pgvectorResult = & "$PG_BIN\psql.exe" -U postgres -d digital_twin -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "[OK] pgvector extension enabled!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Could not enable pgvector extension" -ForegroundColor Yellow
    Write-Host "  You may need to install it separately" -ForegroundColor Yellow
    Write-Host "  Error: $pgvectorResult" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Step 5: Updating .env.local..." -ForegroundColor Yellow

# Update .env.local
$envPath = "digital-twin\.env.local"
$databaseUrl = "DATABASE_URL=postgresql://digital_twin_user:digital_twin_pass@localhost:5432/digital_twin"

if (Test-Path $envPath) {
    $content = Get-Content $envPath -Raw
    if ($content -match "DATABASE_URL=") {
        # Replace existing DATABASE_URL
        $content = $content -replace "DATABASE_URL=.*", $databaseUrl
    } else {
        # Add DATABASE_URL
        $content += "`n`n# PostgreSQL Connection`n$databaseUrl`n"
    }
    Set-Content -Path $envPath -Value $content -NoNewline
    Write-Host "[OK] .env.local updated!" -ForegroundColor Green
} else {
    Write-Host "[WARNING] .env.local not found, creating..." -ForegroundColor Yellow
    Set-Content -Path $envPath -Value "$databaseUrl`n"
    Write-Host "[OK] .env.local created!" -ForegroundColor Green
}

# Clear password from environment
$env:PGPASSWORD = $null

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Database URL: postgresql://digital_twin_user:digital_twin_pass@localhost:5432/digital_twin" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. cd digital-twin"
Write-Host "2. npm install"
Write-Host "3. npx ts-node src/lib/init-db.ts"
Write-Host "4. npm run dev"
Write-Host ""
