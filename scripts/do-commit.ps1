$ErrorActionPreference = "Stop"
Set-Location "E:\My project\singapore\singapore_food_site-master"

# Stage all changes
git add -A
Write-Host "Staged all files"

# Create tree
$tree = git write-tree
Write-Host "Tree: $tree"

# Get current HEAD
$parent = git rev-parse HEAD
Write-Host "Parent: $parent"

# Create commit object directly
$env:GIT_AUTHOR_NAME = "admin"
$env:GIT_AUTHOR_EMAIL = "admin@example.com"
$env:GIT_COMMITTER_NAME = "admin"
$env:GIT_COMMITTER_EMAIL = "admin@example.com"

$commitMsg = "Premium card enhancements + QR Manager upgrade with preview and quick-select"
$commitHash = ($commitMsg | git commit-tree $tree -p $parent)
Write-Host "Commit: $commitHash"

# Manually update ref
Set-Content -Path ".git\refs\heads\main" -Value "$commitHash`n" -NoNewline -Encoding ascii
Write-Host "Updated refs/heads/main to $commitHash"

# Verify
$newHead = git rev-parse HEAD
Write-Host "HEAD now: $newHead"

# Push
git push origin main 2>&1
Write-Host "Push complete"
