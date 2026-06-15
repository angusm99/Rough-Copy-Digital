[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$activeDir = Join-Path $repoRoot "open-design-components"
$failures = New-Object System.Collections.Generic.List[string]

function Add-Failure {
    param([string]$Message)
    $script:failures.Add($Message) | Out-Null
    Write-Host "FAIL $Message" -ForegroundColor Red
}

function Add-Pass {
    param([string]$Message)
    Write-Host "PASS $Message" -ForegroundColor Green
}

Write-Host "Verifying Rough Copy Digital at $repoRoot"
Write-Host ""

$requiredFiles = @(
    "workspace.html",
    "quote-parser.js",
    "window-picker.html",
    "door-picker.html",
    "window-builder.html",
    "vendor/pdf.min.js",
    "vendor/pdf.worker.min.js",
    "vendor/anglo-logo.b64"
)

foreach ($relativePath in $requiredFiles) {
    $path = Join-Path $activeDir $relativePath
    if (Test-Path -LiteralPath $path) {
        Add-Pass "found open-design-components/$relativePath"
    }
    else {
        Add-Failure "missing open-design-components/$relativePath"
    }
}

$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Add-Failure "node was not found; JavaScript syntax checks were skipped"
}
else {
    $parserPath = Join-Path $activeDir "quote-parser.js"
    if (Test-Path -LiteralPath $parserPath) {
        & $node.Source --check $parserPath
        if ($LASTEXITCODE -eq 0) {
            Add-Pass "quote-parser.js syntax"
        }
        else {
            Add-Failure "quote-parser.js syntax"
        }
    }

    $htmlFiles = @(
        "workspace.html",
        "window-picker.html",
        "window-builder.html",
        "door-picker.html"
    )

    $tempDir = Join-Path $env:TEMP "rough-copy-digital-verify"
    if (Test-Path -LiteralPath $tempDir) {
        Remove-Item -LiteralPath $tempDir -Recurse -Force
    }
    New-Item -ItemType Directory -Path $tempDir | Out-Null

    try {
        foreach ($htmlFile in $htmlFiles) {
            $htmlPath = Join-Path $activeDir $htmlFile
            if (-not (Test-Path -LiteralPath $htmlPath)) {
                continue
            }

            $content = Get-Content -Raw -LiteralPath $htmlPath
            $matches = [regex]::Matches($content, "(?is)<script(?![^>]*\bsrc\s*=)[^>]*>(.*?)</script>")
            $checkedCount = 0

            for ($index = 0; $index -lt $matches.Count; $index++) {
                $scriptText = $matches[$index].Groups[1].Value
                if ([string]::IsNullOrWhiteSpace($scriptText)) {
                    continue
                }

                $baseName = [System.IO.Path]::GetFileNameWithoutExtension($htmlFile)
                $scriptNumber = $index + 1
                $tempFile = Join-Path $tempDir ("{0}-{1}.js" -f $baseName, $scriptNumber)
                Set-Content -LiteralPath $tempFile -Value $scriptText -Encoding UTF8

                & $node.Source --check $tempFile
                if ($LASTEXITCODE -eq 0) {
                    $checkedCount++
                }
                else {
                    Add-Failure "$htmlFile inline script $scriptNumber syntax"
                }
            }

            Add-Pass "$htmlFile inline scripts checked ($checkedCount)"
        }
    }
    finally {
        if (Test-Path -LiteralPath $tempDir) {
            Remove-Item -LiteralPath $tempDir -Recurse -Force
        }
    }
}

Write-Host ""
if ($failures.Count -gt 0) {
    Write-Host "Project verification failed with $($failures.Count) issue(s)." -ForegroundColor Red
    exit 1
}

Write-Host "Project verification passed." -ForegroundColor Green
