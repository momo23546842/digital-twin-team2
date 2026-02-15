# Set Prisma to use project-local temp directory
$projectTemp = Join-Path $PSScriptRoot ".prisma-temp"
New-Item -ItemType Directory -Force -Path $projectTemp | Out-Null

$env:TMPDIR = $projectTemp
$env:TEMP = $projectTemp
$env:TMP = $projectTemp

Write-Host "Temp directory set to: $projectTemp"

# Generate Prisma client
npx prisma generate
