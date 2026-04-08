# ============================================================
# fix-network-routing.ps1
# Run as Administrator ONCE before your event.
# Adds Windows Firewall rules so other devices can reach the
# CTF platform on ports 3001 (backend) and 3002 (frontend).
# ============================================================

param(
    [switch]$DisableVirtualAdapters  # Pass -DisableVirtualAdapters to also disable VMware/Docker adapters
)

# Check for Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "❌ ERROR: This script must be run as Administrator!" -ForegroundColor Red
    Write-Host "   Right-click fix-network-routing.ps1 → 'Run as administrator'" -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  CyberHack CTF — Network Fix Script" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""

# ------------------------------------------------------------------
# Step 1: Add Firewall Inbound Rules for ports 3001 and 3002
# ------------------------------------------------------------------
Write-Host "[1/3] Adding Windows Firewall inbound rules..." -ForegroundColor Yellow

$rules = @(
    @{ Name="CTF-Frontend-3002"; Port=3002; Desc="CyberHack CTF Frontend (Vite)" },
    @{ Name="CTF-Backend-3001";  Port=3001; Desc="CyberHack CTF Backend (NestJS)" }
)

foreach ($rule in $rules) {
    # Remove old rule if it exists, then re-add fresh
    $existing = Get-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
    if ($existing) {
        Remove-NetFirewallRule -DisplayName $rule.Name -ErrorAction SilentlyContinue
        Write-Host "    [~] Replaced existing rule: $($rule.Name)" -ForegroundColor Gray
    }

    New-NetFirewallRule `
        -DisplayName $rule.Name `
        -Description $rule.Desc `
        -Direction Inbound `
        -Protocol TCP `
        -LocalPort $rule.Port `
        -Action Allow `
        -Profile Any `
        -Enabled True `
        | Out-Null

    Write-Host "    [✓] Firewall rule added: port $($rule.Port) ($($rule.Desc))" -ForegroundColor Green
}

# ------------------------------------------------------------------
# Step 2: Optionally disable virtual adapters
# ------------------------------------------------------------------
if ($DisableVirtualAdapters) {
    Write-Host ""
    Write-Host "[2/3] Disabling VMware / Docker / Hyper-V virtual adapters..." -ForegroundColor Yellow
    Write-Host "      (This is OPTIONAL. Re-enable via Device Manager if needed.)" -ForegroundColor Gray

    $keywords = @("VMware", "WSL", "vEthernet", "Hyper-V", "VirtualBox")
    $disabled = 0

    foreach ($kw in $keywords) {
        $adapters = Get-NetAdapter | Where-Object { $_.InterfaceDescription -like "*$kw*" -and $_.Status -eq "Up" }
        foreach ($adapter in $adapters) {
            Disable-NetAdapter -Name $adapter.Name -Confirm:$false -ErrorAction SilentlyContinue
            Write-Host "    [✓] Disabled: $($adapter.Name) ($($adapter.InterfaceDescription))" -ForegroundColor Green
            $disabled++
        }
    }

    if ($disabled -eq 0) {
        Write-Host "    [i] No active virtual adapters found." -ForegroundColor Gray
    }
} else {
    Write-Host ""
    Write-Host "[2/3] Skipping virtual adapter disable (add -DisableVirtualAdapters flag to enable)." -ForegroundColor Gray
}

# ------------------------------------------------------------------
# Step 3: Show current network adapters for verification
# ------------------------------------------------------------------
Write-Host ""
Write-Host "[3/3] Current active network adapters:" -ForegroundColor Yellow
Get-NetAdapter | Where-Object { $_.Status -eq "Up" } | ForEach-Object {
    $ip = (Get-NetIPAddress -InterfaceIndex $_.ifIndex -AddressFamily IPv4 -ErrorAction SilentlyContinue | Select-Object -First 1).IPAddress
    Write-Host "    → $($_.Name) : $ip  ($($_.InterfaceDescription))" -ForegroundColor White
}

# ------------------------------------------------------------------
# Summary
# ------------------------------------------------------------------
Write-Host ""
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  ✅ Done! Firewall rules are now active." -ForegroundColor Green
Write-Host ""
Write-Host "  Next steps:" -ForegroundColor White
Write-Host "    1. Double-click START-EVENT.bat to launch the platform" -ForegroundColor White
Write-Host "    2. Run: node auto-detect-ip.js       to get the LAN URL" -ForegroundColor White
Write-Host "    3. Share the URL with students!" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
pause
