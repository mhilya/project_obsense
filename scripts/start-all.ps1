# Menjalankan semua service OBSENSE (tanpa Docker), masing-masing di jendela PowerShell sendiri.
# Pemakaian: .\scripts\start-all.ps1
$root = Split-Path -Parent $PSScriptRoot

$services = @(
  @{ name = 'auth-service'; dir = "$root\services\auth-service" },
  @{ name = 'user-service'; dir = "$root\services\user-service" },
  @{ name = 'assessment-service'; dir = "$root\services\assessment-service" },
  @{ name = 'gateway';      dir = "$root\services\gateway" }
  # Tambahkan service lain di sini setelah dibuat
)

foreach ($s in $services) {
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
