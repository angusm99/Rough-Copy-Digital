[CmdletBinding()]
param(
    [int]$Port = 5178,
    [string]$Bind = "127.0.0.1"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$appDir = Join-Path $repoRoot "open-design-components"
$entryPath = "workspace.html"

# --- Safety guard ---------------------------------------------------------
# Serve ONLY the app folder, and only if it really is the app folder. This
# guards against the failure that once served the whole home folder over the
# LAN: if index.html is missing under $appDir, abort loudly instead of
# silently exposing the wrong directory. Serving $appDir (not the repo root)
# also keeps local-only files such as ../tablet-test-files off the LAN.
$sentinel = Join-Path $appDir "index.html"
if (-not (Test-Path -LiteralPath $sentinel)) {
    throw "Refusing to start: expected app file not found at `"$sentinel`". The server root is wrong - run this script from the repo's tools/ folder."
}

$python = Get-Command python -ErrorAction SilentlyContinue

if (-not $python) {
    $python = Get-Command py -ErrorAction SilentlyContinue
}

if (-not $python) {
    throw "Python was not found. Install Python or run an equivalent static file server from $appDir."
}

Write-Host "Serving Rough Copy Digital from $appDir"
Write-Host "Entry: $entryPath"

if ($Bind -eq "0.0.0.0") {
    Write-Host ""
    Write-Host "SECURITY: binding 0.0.0.0 shares the app folder on your LAN while this runs." -ForegroundColor Yellow
    Write-Host "          Shared: $appDir (app code/assets only - no quotes, no repo PII)." -ForegroundColor Yellow
    Write-Host "          Stop it (Ctrl+C) when tablet testing is done." -ForegroundColor Yellow
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

# --directory pins the served root to the app folder so http.server can never
# fall back to the current working directory or expose anything above $appDir.
if ($python.Name -eq "py.exe") {
    & $python.Source -3 -m http.server $Port --bind $Bind --directory $appDir
}
else {
    & $python.Source -m http.server $Port --bind $Bind --directory $appDir
}
