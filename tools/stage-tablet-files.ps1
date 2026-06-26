[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string[]]$Path
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$stageDir = Join-Path $repoRoot "tablet-test-files"

if (-not (Test-Path -LiteralPath $stageDir)) {
    New-Item -ItemType Directory -Path $stageDir | Out-Null
}

$stagedFiles = @()

foreach ($item in $Path) {
    $resolved = Resolve-Path -LiteralPath $item
    $sourcePath = $resolved.ProviderPath
    $target = Join-Path $stageDir ([System.IO.Path]::GetFileName($sourcePath))
    Copy-Item -LiteralPath $sourcePath -Destination $target -Force
    $stagedFiles += Get-Item -LiteralPath $target
}

Write-Host "Staged tablet test file(s) in:"
Write-Host "  $stageDir"
Write-Host ""
Write-Host "Push to the tablet over ADB (preferred - keeps quote PII off the LAN):"
foreach ($file in $stagedFiles) {
    Write-Host ("  .\tools\tablet-adb.ps1 -Push `"{0}`"" -f $file.FullName)
}
Write-Host ""
Write-Host "These files are local-only and ignored by Git. The preview server only"
Write-Host "serves the app folder, so quotes are never exposed on the LAN."
