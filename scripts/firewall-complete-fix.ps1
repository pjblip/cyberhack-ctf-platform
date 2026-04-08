
# firewall-complete-fix.ps1
# Run as Administrator — nuclear firewall reset for CTF platform
# ============================================================

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "ERROR: Run as Administrator!" -ForegroundColor Red
    pause; exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CTF Platform — Firewall Nuclear Fix" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Remove ALL old CTF/Vite/NestJS rules
Write-Host ""
Write-Host "[1/4] Removing old firewall rules..." -ForegroundColor Yellow
Get-NetFirewallRule | Where-Object {
    $_.DisplayName -like "*CTF*" -or
    $_.DisplayName -like "*Vite*" -or
    $_.DisplayName -like "*NestJS*" -or
    $_.DisplayName -like "*3001*" -or
    $_.DisplayName -like "*3002*"
} | ForEach-Object {
    Write-Host "    Removing: $($_.DisplayName)" -ForegroundColor Gray
    $_ | Remove-NetFirewallRule -ErrorAction SilentlyContinue
}

# Step 2: Create fresh rules — ALL profiles (Domain, Private, Public)
Write-Host ""
Write-Host "[2/4] Creating new inbound + outbound rules for ALL profiles..." -ForegroundColor Yellow

$rules = @(
    @{ Name="CTF-Vite-In-3002";    Dir="Inbound";  Port=3002 },
    @{ Name="CTF-Vite-Out-3002";   Dir="Outbound"; Port=3002 },
    @{ Name="CTF-Backend-In-3001"; Dir="Inbound";  Port=3001 },
    @{ Name="CTF-Backend-Out-3001";Dir="Outbound"; Port=3001 }
)

foreach ($r in $rules) {
    New-NetFirewallRule `
        -DisplayName $r.Name `
        -Direction   $r.Dir `
        -LocalPort   $r.Port `
        -Protocol    TCP `
        -Action      Allow `
        -Profile     Any `
        -Enabled     True | Out-Null
    Write-Host "    [OK] $($r.Name)" -ForegroundColor Green
}

# Step 3: Also do netsh for legacy compat
Write-Host ""
Write-Host "[3/4] Adding netsh rules as backup..." -ForegroundColor Yellow
netsh advfirewall firewall add rule name="CTF-Vite-3002-netsh"    dir=in  action=allow protocol=TCP localport=3002 2>$null
netsh advfirewall firewall add rule name="CTF-Backend-3001-netsh" dir=in  action=allow protocol=TCP localport=3001 2>$null
Write-Host "    [OK] netsh rules added" -ForegroundColor Green

# Step 4: Verify
Write-Host ""
Write-Host "[4/4] Verification — current CTF firewall rules:" -ForegroundColor Yellow
Get-NetFirewallRule | Where-Object { $_.DisplayName -like "*CTF*" } |
    Select-Object DisplayName, Enabled, Direction, Action |
    Format-Table -AutoSize

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DONE! Now:" -ForegroundColor Green
Write-Host "  1. Double-click START-EVENT.bat" -ForegroundColor White
Write-Host "  2. Wait for both servers to start" -ForegroundColor White
Write-Host "  3. Run test-network.bat to verify" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
pause
