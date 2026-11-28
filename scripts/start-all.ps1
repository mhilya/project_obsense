# Menjalankan semua service OBSENSE (tanpa Docker), masing-masing di jendela PowerShell sendiri.
# Pemakaian: .\scripts\start-all.ps1
$root = Split-Path -Parent $PSScriptRoot

$services = @(
  @{ name = 'auth-service';       dir = "$root\services\auth-service";       type = 'node' },
  @{ name = 'user-service';       dir = "$root\services\user-service";       type = 'node' },
  @{ name = 'assessment-service'; dir = "$root\services\assessment-service"; type = 'node' },
  @{ name = 'admin-service';      dir = "$root\services\admin-service";      type = 'node' },
  @{ name = 'audit-service';      dir = "$root\services\audit-service";      type = 'node' },
  @{ name = 'prediction-service'; dir = "$root\obsense_ml";                  type = 'python' },
  @{ name = 'gateway';            dir = "$root\services\gateway";            type = 'node' }
)

foreach ($s in $services) {
  if ($s.type -eq 'python') {
    Start-Process powershell -ArgumentList '-NoExit', '-Command', "`$host.UI.RawUI.WindowTitle='$($s.name)'; cd '$($s.dir)'; python app.py"
    continue
  }
  if (-not (Test-Path "$($s.dir)\node_modules")) {
    Write-Host "npm install: $($s.name)"
    Push-Location $s.dir; npm install; Pop-Location
  }
  if (-not (Test-Path "$($s.dir)\.env") -and (Test-Path "$($s.dir)\.env.example")) {
    Copy-Item "$($s.dir)\.env.example" "$($s.dir)\.env"
    Write-Host "Membuat .env untuk $($s.name) dari .env.example"
  }
  Start-Process powershell -ArgumentList '-NoExit', '-Command', "`$host.UI.RawUI.WindowTitle='$($s.name)'; cd '$($s.dir)'; npm start"
}
