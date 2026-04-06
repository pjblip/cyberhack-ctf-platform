# disable-firewall-temp.ps1
# ONLY FOR TESTING — re-enable firewall immediately after test!
# Run as Administrator

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) { Write-Host "Run as Administrator!" -ForegroundColor Red; pause; exit 1 }

Write-Host ""
Write-Host "⚠️  WARNING: Temporarily DISABLING Windows Firewall for testing!" -ForegroundColor Red
Write-Host "    This is to verify if the firewall is the root cause." -ForegroundColor Yellow
Write-Host "    Re-enable immediately after testing!" -ForegroundColor Yellow
Write-Host ""

Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled False
Write-Host "Firewall is now DISABLED." -ForegroundColor Red
Write-Host ""
Write-Host "Test http://192.168.0.101:3002 from another device NOW." -ForegroundColor Cyan
Write-Host "Then press ENTER to re-enable the firewall." -ForegroundColor Cyan
Read-Host

Set-NetFirewallProfile -Profile Domain,Public,Private -Enabled True
Write-Host ""
Write-Host "✅ Firewall re-ENABLED." -ForegroundColor Green
Write-Host ""
Write-Host "If the site worked while firewall was off → run firewall-complete-fix.ps1" -ForegroundColor Yellow
Write-Host "If it STILL didn't work → router AP isolation or wrong IP" -ForegroundColor Yellow
Write-Host ""
pause
