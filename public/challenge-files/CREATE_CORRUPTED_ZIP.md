# Creating the Corrupted ZIP File for Hard Challenge

## Steps to Create riya_phone_backup.zip

### Step 1: Create Normal ZIP
1. Right-click on `CASE_NOTES.txt`
2. Select "Send to" → "Compressed (zipped) folder"
3. Name it: `riya_phone_backup.zip`

### Step 2: Corrupt the ZIP File
1. Download HxD Hex Editor: https://mh-nexus.de/en/hxd/
2. Open `riya_phone_backup.zip` in HxD
3. The first 2 bytes should be: `50 4B` (ZIP magic bytes)
4. Change them to: `00 00` (this corrupts the file)
5. Save the file

### Step 3: Verify Corruption
- Try to open the ZIP file
- It should show an error: "Cannot open file" or "File is corrupted"

## Solution for Students

Students need to:
1. Download HxD Hex Editor
2. Open the corrupted ZIP in HxD
3. Change the first 2 bytes from `00 00` back to `50 4B`
4. Save the file
5. Extract the ZIP
6. Read CASE_NOTES.txt
7. Decode the ROT13 message: `synt{t00q_s0er3af1p5_w0o}`
8. Result: `flag{g00d_f0re3ns1c5_j0b}`

## Alternative: Use PowerShell to Create Corrupted ZIP

```powershell
# Create normal ZIP first
Compress-Archive -Path "CASE_NOTES.txt" -DestinationPath "riya_phone_backup.zip"

# Corrupt it by changing first 2 bytes
$bytes = [System.IO.File]::ReadAllBytes("riya_phone_backup.zip")
$bytes[0] = 0x00
$bytes[1] = 0x00
[System.IO.File]::WriteAllBytes("riya_phone_backup.zip", $bytes)
```

## Quick Test

```powershell
# This should fail (file is corrupted)
Expand-Archive -Path "riya_phone_backup.zip" -DestinationPath "test"
```
