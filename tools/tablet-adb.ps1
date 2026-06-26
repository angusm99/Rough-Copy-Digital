[CmdletBinding()]
param(
    [string]$Url,

    [string[]]$Push,

    [string]$Device,

    [string]$TabletDir = "/sdcard/Download/Rough-Copy-Digital",

    [switch]$OpenUrl,

    [switch]$List
)

$ErrorActionPreference = "Stop"

$adb = Get-Command adb -ErrorAction SilentlyContinue
if (-not $adb) {
    throw "adb was not found. Install Android Platform Tools first."
}

function Get-AdbDeviceRows {
    $raw = & $adb.Source devices -l
    if ($LASTEXITCODE -ne 0) {
        throw "adb devices failed."
    }

    return @(
        $raw |
            Select-Object -Skip 1 |
            Where-Object { -not [string]::IsNullOrWhiteSpace($_) } |
            ForEach-Object {
                $parts = $_ -split "\s+", 3
                [pscustomobject]@{
                    Serial = $parts[0]
                    State = $parts[1]
                    Detail = if ($parts.Count -gt 2) { $parts[2] } else { "" }
                }
            }
    )
}

function Show-AdbHelp {
    Write-Host "No authorised ADB tablet is available yet."
    Write-Host ""
    Write-Host "USB route:"
    Write-Host "  1. On the HTC tablet, enable Developer options."
    Write-Host "  2. Turn on USB debugging."
    Write-Host "  3. Plug the tablet in by USB and accept the 'Allow USB debugging' prompt."
    Write-Host "  4. Rerun: adb devices -l"
    Write-Host ""
    Write-Host "Wireless route on Android 13:"
    Write-Host "  1. Developer options > Wireless debugging > Pair device with pairing code."
    Write-Host "  2. Run: adb pair <tablet-ip>:<pairing-port>"
    Write-Host "  3. Run: adb connect <tablet-ip>:<debug-port>"
    Write-Host "  4. Rerun this script."
}

$devices = Get-AdbDeviceRows

if ($List) {
    if ($devices.Count -eq 0) {
        Show-AdbHelp
    }
    else {
        $devices | Format-Table -AutoSize
    }
    exit 0
}

if ($Device) {
    $selected = $devices | Where-Object { $_.Serial -eq $Device } | Select-Object -First 1
}
else {
    $selected = $devices | Where-Object { $_.State -eq "device" } | Select-Object -First 1
}

if (-not $selected -or $selected.State -ne "device") {
    if ($devices.Count -gt 0) {
        Write-Host "ADB can see device(s), but none are authorised and ready:"
        $devices | Format-Table -AutoSize
        Write-Host ""
    }
    Show-AdbHelp
    exit 1
}

$serialArgs = @("-s", $selected.Serial)
Write-Host "Using ADB device: $($selected.Serial)"

if ($Push -and $Push.Count -gt 0) {
    & $adb.Source @serialArgs shell mkdir -p $TabletDir
    if ($LASTEXITCODE -ne 0) {
        throw "Could not create $TabletDir on tablet."
    }

    foreach ($item in $Push) {
        $resolved = Resolve-Path -LiteralPath $item
        $sourcePath = $resolved.ProviderPath
        Write-Host "Pushing $sourcePath -> $TabletDir"
        & $adb.Source @serialArgs push $sourcePath $TabletDir
        if ($LASTEXITCODE -ne 0) {
            throw "adb push failed for $sourcePath."
        }
    }
}

if ($OpenUrl) {
    if ([string]::IsNullOrWhiteSpace($Url)) {
        throw "Pass -Url with the tablet test URL, for example http://192.168.0.106:5179/workspace.html"
    }

    Write-Host "Opening $Url on tablet"
    & $adb.Source @serialArgs shell am start -a android.intent.action.VIEW -d $Url
    if ($LASTEXITCODE -ne 0) {
        throw "Could not open URL on tablet."
    }
}

if (-not $Push -and -not $OpenUrl) {
    Write-Host "No action requested. Use -Push <file>, -OpenUrl -Url <url>, or -List."
}
