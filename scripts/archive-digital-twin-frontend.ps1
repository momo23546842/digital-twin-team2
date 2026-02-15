<#
Safe archive-and-remove script for .\digital-twin-frontend
Run from repository root (C:\Users\mtk53\digital-twin-team2)
Safety: never touch .\digital-twin\, .\app\, .\prisma\, or root package.json.
This script performs objective verification, archives the target, and requires two confirmations.
Requires PowerShell. Stops on any error.
#>
$ErrorActionPreference = 'Stop'

# --- Configuration / protected paths ---
$repoRoot = (Resolve-Path ".").ProviderPath
$protectedPaths = @()
foreach ($p in @('.\digital-twin', '.\app', '.\prisma')) {
  if (Test-Path -LiteralPath $p) {
    $protectedPaths += (Resolve-Path -LiteralPath $p).ProviderPath
  }
}
$rootPackageJson = Join-Path $repoRoot 'package.json'
$targetExact = Join-Path $repoRoot 'digital-twin-frontend'

Write-Host "Repository root: $repoRoot"
Write-Host "Target to archive/remove (must match exactly): $targetExact"

# --- Explicit guard: only proceed if target path exactly equals expected path ---
if (-not (Test-Path -LiteralPath $targetExact -PathType Container)) {
  Write-Error "ABORT: Expected target folder does not exist at exactly $targetExact. Nothing will be changed."
  exit 1
}

$resolvedTarget = (Resolve-Path -LiteralPath $targetExact).ProviderPath
if (-not [string]::Equals($resolvedTarget, $targetExact, [System.StringComparison]::OrdinalIgnoreCase)) {
  Write-Error "ABORT: Resolved target path ($resolvedTarget) does not match expected path ($targetExact)."
  exit 1
}

foreach ($p in $protectedPaths) {
  if ([string]::Equals($p, $resolvedTarget, [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Error "ABORT: Target matches protected path $p. Exiting without changes."
    exit 1
  }
}

Write-Host "`n1) package.json files (repo-wide):"
$pkgFiles = Get-ChildItem -LiteralPath $repoRoot -Filter package.json -Recurse -File -ErrorAction Stop |
  Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' }
if ($pkgFiles.Count -eq 0) {
  Write-Host '  No package.json files found.'
} else {
  $pkgFiles | ForEach-Object { Write-Host "  $($_.FullName)" }
}

Write-Host "`n2) package.json details (folder, name, scripts.dev, dependencies.next):"
foreach ($f in $pkgFiles) {
  try {
    $raw = Get-Content -LiteralPath $f.FullName -Raw -ErrorAction Stop
    $json = $raw | ConvertFrom-Json -ErrorAction Stop
  } catch {
    Write-Warning "  Failed to parse JSON at $($f.FullName): $($_.Exception.Message)"
    continue
  }
  $folder = $f.DirectoryName
  $name = if ($json.name) { $json.name } else { '<none>' }
  $scriptsDev = if ($json.scripts -and $json.scripts.dev) { $json.scripts.dev } else { '<none>' }
  $nextVersion = '<none>'
  if ($json.dependencies -and $json.dependencies.next) { $nextVersion = $json.dependencies.next }
  elseif ($json.devDependencies -and $json.devDependencies.next) { $nextVersion = $json.devDependencies.next }
  Write-Host "Path: $folder"
  Write-Host "  name: $name"
  Write-Host "  scripts.dev: $scriptsDev"
  Write-Host "  next: $nextVersion"
  Write-Host '----'
}

Write-Host "`n3) Dry-run checks: recent build/artifact folders and env files"

$projectDirs = $pkgFiles | ForEach-Object { $_.DirectoryName } | Sort-Object -Unique
$projectInfo = @()
foreach ($proj in $projectDirs) {
  $nodeModulesPath = Join-Path $proj 'node_modules'
  $dotNextPath = Join-Path $proj '.next'
  $envLocalPath = Join-Path $proj '.env.local'

  $nodeModulesTime = $null
  if (Test-Path -LiteralPath $nodeModulesPath) {
    $nodeModulesTime = (Get-ChildItem -LiteralPath $nodeModulesPath -Recurse -Force -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
  }
  $dotNextTime = $null
  if (Test-Path -LiteralPath $dotNextPath) {
    $dotNextTime = (Get-ChildItem -LiteralPath $dotNextPath -Recurse -Force -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
  }
  $envLocalTime = $null
  if (Test-Path -LiteralPath $envLocalPath) {
    $envLocalTime = (Get-Item -LiteralPath $envLocalPath).LastWriteTime
  }

  $projectInfo += [PSCustomObject]@{
    ProjectFolder     = $proj
    NodeModulesExists = (Test-Path -LiteralPath $nodeModulesPath)
    NodeModulesRecent = $nodeModulesTime
    DotNextExists     = (Test-Path -LiteralPath $dotNextPath)
    DotNextRecent     = $dotNextTime
    EnvLocalExists    = (Test-Path -LiteralPath $envLocalPath)
    EnvLocalRecent    = $envLocalTime
  }
}

if ($projectInfo.Count -eq 0) {
  Write-Host '  No project directories detected from package.json parents.'
} else {
  $projectInfo | ForEach-Object {
    Write-Host "`nProject: $($_.ProjectFolder)"
    Write-Host "  node_modules exists: $($_.NodeModulesExists)  most-recent write: $($_.NodeModulesRecent)"
    Write-Host "  .next exists:         $($_.DotNextExists)      most-recent write: $($_.DotNextRecent)"
    Write-Host "  .env.local exists:    $($_.EnvLocalExists)     last-write: $($_.EnvLocalRecent)"
  }

  $artifactTimes = $projectInfo | ForEach-Object {
    [PSCustomObject]@{
      Project = $_.ProjectFolder
      ArtifactTime = (@($_.NodeModulesRecent, $_.DotNextRecent) | Where-Object { $_ -ne $null } | Sort-Object -Descending | Select-Object -First 1)
    }
  }
  $mostRecentArtifact = $artifactTimes | Where-Object { $_.ArtifactTime -ne $null } | Sort-Object ArtifactTime -Descending | Select-Object -First 1
  if ($mostRecentArtifact) {
    Write-Host "`nMost-recent build artifact found in: $($mostRecentArtifact.Project)  time: $($mostRecentArtifact.ArtifactTime)"
  } else {
    Write-Host '`nNo node_modules or .next artifacts found in any project directories.'
  }

  $envs = $projectInfo | Where-Object { $_.EnvLocalExists -eq $true } | Sort-Object EnvLocalRecent -Descending
  if ($envs.Count -gt 0) {
    Write-Host "`nMost-recent .env.local file found in: $($envs[0].Project)   last-write: $($envs[0].EnvLocalRecent)"
  } else {
    Write-Host '`nNo .env.local files found in project directories.'
  }
}

Write-Host "`nActive Node processes (CommandLine) - may indicate running dev server(s):"
try {
  $nodeProcs = Get-CimInstance Win32_Process -ErrorAction Stop | Where-Object { $_.Name -match '^node(|.exe)$' }
  if ($nodeProcs.Count -eq 0) {
    Write-Host '  No running node processes detected.'
  } else {
    $nodeProcs | ForEach-Object {
      $cmd = $_.CommandLine
      $pid = $_.ProcessId
      $created = $_.CreationDate
      Write-Host "  PID:$pid  Created:$created"
      Write-Host "    $cmd"
      if ($cmd -match 'digital-twin-frontend') { Write-Host "    -> CommandLine references 'digital-twin-frontend'." }
      if ($cmd -match 'digital-twin') { Write-Host "    -> CommandLine references 'digital-twin'." }
    }
  }
} catch {
  Write-Warning "  Could not enumerate processes: $($_.Exception.Message)"
}

Write-Host "`n4) Searching for references to: 'digital-twin-frontend', 'digital-twin-frontend/', 'digital-twin_frontend'"
$searchTokens = @('digital-twin-frontend', 'digital-twin-frontend/', 'digital-twin_frontend')
$globs = @(
  'README*',
  'docs/**',
  '.github/**',
  '*.yml',
  '*.yaml',
  'vercel*',
  'docker-compose*',
  'scripts/**',
  '**/package.json'
)
$matchesFound = @()
foreach ($g in $globs) {
  $files = Get-ChildItem -LiteralPath $repoRoot -Recurse -File -ErrorAction SilentlyContinue | Where-Object { $_.FullName -notmatch '\\node_modules\\' -and $_.FullName -notmatch '\\.git\\' }
  foreach ($file in $files) {
    foreach ($token in $searchTokens) {
      $found = Select-String -LiteralPath $file.FullName -Pattern $token -SimpleMatch -ErrorAction SilentlyContinue
      if ($found) {
        $found | ForEach-Object {
          $matchesFound += [PSCustomObject]@{
            File = $file.FullName
            LineNumber = $_.LineNumber
            LineText = $_.Line.Trim()
            Token = $token
          }
        }
      }
    }
  }
}
if ($matchesFound.Count -gt 0) {
  Write-Host 'References found:'
  $matchesFound | ForEach-Object { Write-Host "  $($_.File) : line $($_.LineNumber) => $($_.LineText)" }
} else {
  Write-Host "No references found in targeted configs/docs for tokens: $($searchTokens -join ', ')"
}

Write-Host "`nSUMMARY (objective checks):"
Write-Host "  Target folder (exact): $resolvedTarget"
if ($mostRecentArtifact) { Write-Host "  Most-recent build artifact folder: $($mostRecentArtifact.Project)  time: $($mostRecentArtifact.ArtifactTime)" } else { Write-Host '  No build artifacts detected.' }
if ($envs -and $envs.Count -gt 0) { Write-Host "  Most-recent .env.local: $($envs[0].Project)  time: $($envs[0].EnvLocalRecent)" } else { Write-Host '  No .env.local detected.' }
if ($matchesFound.Count -gt 0) { Write-Host '  Repo references to digital-twin-frontend exist; manual review required before removal.' } else { Write-Host '  No repo references to digital-twin-frontend found in targeted files.' }

Write-Host "`n5) Archive + Delete procedure (requires two explicit confirmations)"
Write-Host "  - First you must type: ARCHIVE   (will create zip archive of $targetExact)"
Write-Host "  - After archive is created and verified (size > 0), you must type: DELETE  to remove the folder"

$archiveConfirm = Read-Host "Type 'ARCHIVE' to proceed with creating zip archive of $targetExact (or press Enter to abort)"
if ($archiveConfirm -ne 'ARCHIVE') {
  Write-Host 'Archive step aborted by user. Exiting without changes.'
  exit 0
}

$timestamp = (Get-Date).ToString('yyyyMMdd_HHmmss')
$archiveRoot = Join-Path $repoRoot '_archived_projects'
if (-not (Test-Path -LiteralPath $archiveRoot)) { New-Item -Path $archiveRoot -ItemType Directory -ErrorAction Stop | Out-Null }
$zipPath = Join-Path $archiveRoot "digital-twin-frontend-$timestamp.zip"

Write-Host "Creating archive -> $zipPath"
Compress-Archive -LiteralPath $targetExact -DestinationPath $zipPath -Force -ErrorAction Stop

if (-not (Test-Path -LiteralPath $zipPath -PathType Leaf)) {
  Write-Error "Archive creation failed: $zipPath not found. Aborting."
  exit 1
}
$zipSize = (Get-Item -LiteralPath $zipPath -ErrorAction Stop).Length
Write-Host "Archive created: $zipPath   size(bytes): $zipSize"
if ($zipSize -le 0) {
  Write-Error 'Archive size is zero. Aborting and leaving original folder intact.'
  exit 1
}

$deleteConfirm = Read-Host "Archive verified. Type 'DELETE' to permanently remove the folder $targetExact (or press Enter to abort)"
if ($deleteConfirm -ne 'DELETE') {
  Write-Host "Delete step aborted by user. Original folder preserved. Archive at: $zipPath"
  exit 0
}

foreach ($p in $protectedPaths) {
  if ([string]::Equals($p, $resolvedTarget, [System.StringComparison]::OrdinalIgnoreCase)) {
    Write-Error "ABORT: Target matches protected path $p. Exiting without changes."
    exit 1
  }
}

Write-Host "Removing folder: $resolvedTarget"
Remove-Item -LiteralPath $resolvedTarget -Recurse -Force -ErrorAction Stop

Write-Host "Removal complete. Archive retained at: $zipPath"
