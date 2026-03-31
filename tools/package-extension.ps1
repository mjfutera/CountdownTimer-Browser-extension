$ErrorActionPreference = "Stop"

$root = Resolve-Path (Join-Path $PSScriptRoot "..")
$manifestPath = Join-Path $root "manifest.json"
$manifest = Get-Content $manifestPath -Raw | ConvertFrom-Json
$version = $manifest.version

$outDir = Join-Path $root "dist"
if (-not (Test-Path $outDir)) {
    New-Item -ItemType Directory -Path $outDir | Out-Null
}

$outFile = Join-Path $outDir ("countdowns-v" + $version + ".zip")
if (Test-Path $outFile) {
    Remove-Item $outFile -Force
}

$items = Get-ChildItem -Path $root | Where-Object {
    $_.Name -notin @(".git", "node_modules", "dist")
}

Compress-Archive -Path $items.FullName -DestinationPath $outFile -CompressionLevel Optimal
Write-Output ("Package created: " + $outFile)
