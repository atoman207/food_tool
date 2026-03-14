# Workaround for "fatal: unable to write new index file"
# Run: .\git-commit-push.ps1 "Your commit message"
# Or: .\git-commit-push.ps1

param([string]$Message = "Update")

$env:GIT_INDEX_FILE = "$env:TEMP\git-index-$PID"
git add .
$err = $LASTEXITCODE
if ($err -ne 0) { exit $err }

git commit -m $Message
$err = $LASTEXITCODE
if ($err -ne 0) { Write-Host "Commit failed or nothing to commit."; exit $err }

git push
Remove-Item -Path $env:GIT_INDEX_FILE -ErrorAction SilentlyContinue
