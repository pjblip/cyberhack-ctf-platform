# 🔐 CTF Challenge Solutions - Complete Guide

**⚠️ IMPORTANT: Keep this file private! Do not share with participants during the event.**

---

## Easy Challenges (10 points each)

### 1. Web Recon
**Challenge:** Analyze the HTTP headers of the target server.

**Step-by-Step Solution:**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Refresh the page
4. Click on any request
5. Look at Response Headers
6. Find the custom header `X-Flag` or similar
7. Flag is in the header value

**Flag:** `flag{w3b_r3c0n_succ3ss}`

---

### 2. Base64 Decoder
**Challenge:** Decode this hidden message: `ZmxhZ3tiYXNlNjRfaXNfZWFzeX0=`

**Step-by-Step Solution:**
1. Copy the Base64 string: `ZmxhZ3tiYXNlNjRfaXNfZWFzeX0=`
2. Use online decoder (base64decode.org) OR
3. Use command line:
   ```bash
   echo "ZmxhZ3tiYXNlNjRfaXNfZWFzeX0=" | base64 -d
   ```
4. Result: `flag{base64_is_easy}`

**Flag:** `flag{base64_is_easy}`

---

### 3. Hidden Comments
**Challenge:** Inspect the page source to find the developer's secret comment.

**Step-by-Step Solution:**
1. Right-click on the page
2. Select "View Page Source" (Ctrl+U)
3. Search for `<!--` (HTML comments)
4. Look through comments for the flag
5. Find: `<!-- flag{h1dd3n_c0mm3nts_s33n} -->`

**Flag:** `flag{h1dd3n_c0mm3nts_s33n}`

---

### 4. Robots Protocol
**Challenge:** Check where bots are not allowed to go.

**Step-by-Step Solution:**
1. Navigate to `/robots.txt` in your browser
2. Look at the Disallow entries
3. Find a suspicious path like `/secret/` or `/flag.txt`
4. Navigate to that path
5. Flag is displayed on the page

**Alternative:** Flag might be directly in robots.txt as a comment

**Flag:** `flag{r0b0ts_txt_r34d}`

---

### 5. Hidden Credentials (Cookie Tampering)
**Challenge:** Change your role from user to admin in the cookie.

**Step-by-Step Solution:**
1. Open Developer Tools (F12)
2. Go to Application/Storage tab
3. Click on Cookies
4. Find cookie named `role` or `user_type`
5. Current value: `user`
6. Double-click and change to: `admin`
7. Refresh the page
8. Flag appears on the page

**Flag:** `flag{c00k13_m0nst3r}`

---

## Medium Challenges (50 points each)

### 6. SQL Injection 101
**Challenge:** Bypass the login prompt using classic SQL injection.

**Step-by-Step Solution:**
1. Open the login page
2. In the username field, enter: `admin' OR '1'='1' --`
3. In the password field, enter anything (e.g., `password`)
4. Click Login
5. The SQL query becomes: `SELECT * FROM users WHERE username='admin' OR '1'='1' --' AND password='...'`
6. The `--` comments out the password check
7. `'1'='1'` is always true, so login succeeds
8. Flag is displayed after successful login

**Other Working Payloads:**
- `' OR 1=1 --`
- `admin' #`
- `' OR 'a'='a`

**Flag:** `flag{sql1_byp4ss_m4st3r}`

---

### 7. Command Injection
**Challenge:** Execute system commands through vulnerable input.

**Step-by-Step Solution:**
1. Find the input field (usually a "ping" or "lookup" tool)
2. Try basic command injection:
   - Input: `127.0.0.1; ls`
   - Or: `127.0.0.1 | cat flag.txt`
   - Or: `127.0.0.1 && whoami`
3. The server executes: `ping 127.0.0.1; ls`
4. Look for flag.txt in the output
5. Read the flag: `127.0.0.1; cat flag.txt`
6. Flag is displayed in the output

**Common Injection Patterns:**
- `;` - Command separator
- `|` - Pipe output
- `&&` - AND operator
- `||` - OR operator

**Flag:** `flag{c0mm4nd_1nj3ct10n_pr0}`

---

### 8. SOC Analyst - Log Analysis
**Challenge:** Analyze security logs to find suspicious activity.

**Step-by-Step Solution:**
1. Download the log file
2. Open in text editor
3. Look for patterns:
   - Failed login attempts
   - Suspicious IP addresses
   - SQL injection attempts
   - Unusual user agents
4. Search for keywords: "flag", "success", "admin"
5. Find the line with successful breach
6. Flag is in the log entry

**Example log entry:**
```
2026-03-15 03:42:17 - IP: 192.168.1.100 - User: admin - Action: LOGIN_SUCCESS - flag{l0g_4n4lys1s_3xp3rt}
```

**Flag:** `flag{l0g_4n4lys1s_3xp3rt}`

---

### 9. Image Steganography
**Challenge:** Extract hidden data from an image.

**Step-by-Step Solution:**
1. Download the image file
2. Use steganography tool:
   
   **Option A - Online Tool:**
   - Go to stylesuxx.github.io/steganography
   - Upload the image
   - Click "Decode"
   
   **Option B - Command Line (zsteg):**
   ```bash
   zsteg image.png
   ```
   
   **Option C - Command Line (steghide):**
   ```bash
   steghide extract -sf image.png
   ```
   
3. Hidden message is revealed
4. Flag is in the extracted text

**Flag:** `flag{h1dd3n_1n_p1x3ls}`

---

## Hard Challenge (250 points)

### 10. Ransomware Reversal
**Challenge:** DarkNet ransomware encrypted our database. Analyze the encryption script and decrypt the flag.

**Step-by-Step Solution:**

**Step 1: Download Files**
- Download `ransomware-encrypt.py`
- Download `encrypted_flag.txt`

**Step 2: Analyze the Encryption**
Open `ransomware-encrypt.py` and understand the algorithm:

```python
# Layer 1: XOR with rotating key
for i, byte in enumerate(plaintext):
    xor_key = key[i % len(key)]
    encrypted.append(byte ^ xor_key)

# Layer 2: Shift by position
for i, byte in enumerate(encrypted):
    shifted.append((byte + i) % 256)

# Layer 3: XOR with reversed key
reversed_key = key[::-1]
for i, byte in enumerate(shifted):
    xor_key = reversed_key[i % len(reversed_key)]
    final.append(byte ^ xor_key)
```

**Key Information:**
- Encryption Key: `D4RKN3T` (found in script)
- Encrypted Hex: `766a7b646b72296d3c6709da4c306c513d7ddd277ede4302676e15061817701e`
- 3 layers: XOR → Shift → XOR

**Step 3: Write Decryption Script**

Create `decrypt.py`:

```python
#!/usr/bin/env python3

def decrypt_data(encrypted_hex, key):
    # Convert hex to bytes
    encrypted = bytes.fromhex(encrypted_hex)
    
    # REVERSE LAYER 3: XOR with reversed key
    reversed_key = key[::-1]
    layer3_reversed = bytearray()
    for i, byte in enumerate(encrypted):
        xor_key = reversed_key[i % len(reversed_key)]
        layer3_reversed.append(byte ^ xor_key)
    
    # REVERSE LAYER 2: Subtract position
    layer2_reversed = bytearray()
    for i, byte in enumerate(layer3_reversed):
        layer2_reversed.append((byte - i) % 256)
    
    # REVERSE LAYER 1: XOR with rotating key
    decrypted = bytearray()
    for i, byte in enumerate(layer2_reversed):
        xor_key = key[i % len(key)]
        decrypted.append(byte ^ xor_key)
    
    return bytes(decrypted)

# The encrypted data from the challenge
encrypted_hex = "766a7b646b72296d3c6709da4c306c513d7ddd277ede4302676e15061817701e"

# The key from the encryption script
key = b"D4RKN3T"

# Decrypt
flag = decrypt_data(encrypted_hex, key)
print(flag.decode())
```

**Step 4: Run the Script**
```bash
python decrypt.py
```

**Output:**
```
flag{r3v3rs3_3ng1n33r1ng_m4st3r}
```

**Key Concepts:**
- XOR is its own inverse: `A XOR B XOR B = A`
- Reverse addition with subtraction: `(X + Y) mod 256` reversed by `(Z - Y) mod 256`
- Layers must be reversed in opposite order: 3 → 2 → 1

**Flag:** `flag{r3v3rs3_3ng1n33r1ng_m4st3r}`

---

## Quick Reference - All Flags

| # | Challenge | Difficulty | Points | Flag |
|---|-----------|------------|--------|------|
| 1 | Web Recon | Easy | 10 | `flag{w3b_r3c0n_succ3ss}` |
| 2 | Base64 Decoder | Easy | 10 | `flag{base64_is_easy}` |
| 3 | Hidden Comments | Easy | 10 | `flag{h1dd3n_c0mm3nts_s33n}` |
| 4 | Robots Protocol | Easy | 10 | `flag{r0b0ts_txt_r34d}` |
| 5 | Hidden Credentials | Easy | 10 | `flag{c00k13_m0nst3r}` |
| 6 | SQL Injection 101 | Medium | 50 | `flag{sql1_byp4ss_m4st3r}` |
| 7 | Command Injection | Medium | 50 | `flag{c0mm4nd_1nj3ct10n_pr0}` |
| 8 | SOC Analyst | Medium | 50 | `flag{l0g_4n4lys1s_3xp3rt}` |
| 9 | Image Steganography | Medium | 50 | `flag{h1dd3n_1n_p1x3ls}` |
| 10 | Ransomware Reversal | Hard | 250 | `flag{r3v3rs3_3ng1n33r1ng_m4st3r}` |

**Total Points:** 500 points

---

## Hints System

Each challenge has 3 progressive hints available:
- **Hint 1:** 5 points (General direction)
- **Hint 2:** 10 points (Specific technique)
- **Hint 3:** 15 points (Almost the solution)

Hints must be unlocked sequentially (1 → 2 → 3).

---

## Tools Participants Might Use

### Web Tools:
- **CyberChef** - Data analysis and decoding
- **Base64 Decode** - base64decode.org
- **JWT Decoder** - jwt.io
- **Hash Identifier** - hashes.com
- **Steganography Decoder** - stylesuxx.github.io/steganography

### Command Line:
- `curl` - Make HTTP requests
- `base64` - Encode/decode Base64
- `strings` - Extract strings from files
- `steghide` - Steganography extraction
- `zsteg` - PNG/BMP steganography
- `exiftool` - View image metadata

### Browser Tools:
- Developer Console (F12)
- Network tab (monitor requests)
- View Page Source (Ctrl+U)
- Inspect Element
- Edit and Resend requests

### Python Libraries:
- `requests` - HTTP requests
- `base64` - Encoding/decoding
- `hashlib` - Hashing
- `PIL` - Image manipulation

---

## Scoring

| Difficulty | Points | Time Estimate |
|------------|--------|---------------|
| Easy | 10 | 2-5 minutes |
| Medium | 50 | 10-15 minutes |
| Hard | 250 | 20-30 minutes |

**Maximum Score:** 500 points (without using hints)
**With Hints:** Varies based on hint usage

---

## Tips for Event Organizers

### During Event:
1. Monitor which challenges are being solved
2. If everyone is stuck on a challenge, give general hints via announcements
3. Watch for participants trying to attack the platform itself
4. Be ready to help with technical issues (timer bugs, submission errors)

### Common Issues:
- **Timer shows NaN:** Refresh the page
- **Can't submit flag:** Check format `flag{...}` (case-sensitive)
- **Hints not working:** Ensure sequential unlocking
- **Challenge not loading:** Check backend logs
- **Downloads not working:** Use the embedded download buttons

### After Event:
1. Export results using `export-results.bat` or `export-results.sh`
2. Announce winners on leaderboard
3. Share this solutions file with participants
4. Collect feedback for future events
5. Review activity logs for any issues

---

## Security Notes

### What to Allow:
- ✅ Using any tools (online or offline)
- ✅ Google searches and documentation
- ✅ Taking notes and screenshots
- ✅ Using hints (costs points)
- ✅ Collaboration (if team mode)

### What NOT to Allow:
- ❌ Sharing flags with other participants
- ❌ Attacking the platform infrastructure
- ❌ Brute forcing flag submissions
- ❌ Creating multiple accounts
- ❌ DDoS or DoS attacks on the server
- ❌ Attempting to access other users' data

---

## Post-Event Learning Resources

Share these with participants after the event:

### Web Security:
- OWASP Top 10
- PortSwigger Web Security Academy
- HackTheBox
- TryHackMe

### Cryptography:
- CryptoHack
- Cryptopals Challenges

### Forensics:
- Digital Forensics tutorials
- Steganography guides

### General CTF:
- PicoCTF
- CTFtime.org
- OverTheWire Wargames

---

**Remember:** Keep this file private during the event! 🔒

**After the event:** Share with participants to help them learn! 📚
