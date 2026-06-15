[CmdletBinding()]
param(
    [int]$Port = 5178,
    [string]$Bind = "127.0.0.1"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$entryPath = "open-design-components/workspace.html"
$python = Get-Command python -ErrorAction SilentlyContinue

if (-not $python) {
    $python = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $python) {
    throw "Python was not found. Install Python or run an equivalent static file server from $repoRoot."
}

Write-Host "Serving Rough Copy Digital from $repoRoot"
Write-Host "Entry: $entryPath"

if ($Bind -eq "0.0.0.0") {
    Write-Host ""
    Write-Host "Tablet/LAN URLs to try:"
    Get-NetIPAddress -AddressFamily IPv4 |
        Where-Object {
            $_.IPAddress -notlike "127.*" -and
            $_.IPAddress -notlike "169.254.*" -and
            $_.PrefixOrigin -ne "WellKnown"
        } |
        Sort-Object InterfaceAlias, IPAddress |
        ForEach-Object {
            Write-Host ("  http://{0}:{1}/{2}  ({3})" -f $_.IPAddress, $Port, $entryPath, $_.InterfaceAlias)
        }
}
else {
    Write-Host ("Open: http://{0}:{1}/{2}" -f $Bind, $Port, $entryPath)
}

Write-Host ""
Write-Host "Press Ctrl+C to stop the preview server."

Push-Location $repoRoot
try {
    if ($python.Name -eq "py.exe") {
        & $python.Source -3 -m http.server $Port --bind $Bind
    }
    else {
        & $python.Source -m http.server $Port --bind $Bind
    }
}
finally {
    Pop-Location
}
