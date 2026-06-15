[CmdletBinding()]
param(
    [Parameter(Mandatory = $true)]
    [string[]]$Path,

    [int]$Port = 5179
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

$ips = Get-NetIPAddress -AddressFamily IPv4 |
    Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -ne "WellKnown"
    } |
    Sort-Object InterfaceAlias, IPAddress

Write-Host "Staged tablet test file(s) in:"
Write-Host "  $stageDir"
Write-Host ""
Write-Host "Make sure the LAN preview server is running:"
Write-Host "  .\tools\start-preview.ps1 -Port $Port -Bind 0.0.0.0"
Write-Host ""
Write-Host "Open these URL(s) on the tablet to download the file(s):"

foreach ($file in $stagedFiles) {
    $encodedName = [uri]::EscapeDataString($file.Name)
    foreach ($ip in $ips) {
        Write-Host ("  http://{0}:{1}/tablet-test-files/{2}" -f $ip.IPAddress, $Port, $encodedName)
    }
}

Write-Host ""
Write-Host "These files are local-only and ignored by Git."
