# 🎮 Ransomware Reversal - Player Walkthrough

This document shows what a player experiences when solving this challenge.

## Step 1: Challenge Discovery

Player sees in the challenges list:
```
🔒 Ransomware Reversal
Difficulty: Hard | Points: 250 | Time: 15 minutes

DarkNet ransomware encrypted our database. We recovered the 
encryption script from memory. Analyze the multi-layer encryption 
algorithm and write a decryption script to recover the flag.
```

## Step 2: Starting the Challenge

Player clicks "Start Challenge" and sees:
- Timer starts (15 minutes)
- Challenge page loads with ransomware theme
- Skull animation and red/black color scheme
- Professional incident report format

## Step 3: Reading the Scenario

```
⚠️ INCIDENT REPORT:
On March 15, 2026 at 03:42:17 UTC, our production database was 
compromised by the DarkNet ransomware group. They encrypted our 
critical flag database using a custom multi-layer encryption 
algorithm. Fortunately, our incident response team recovered 
the encryption script from memory before the attackers wiped it.
```

Player understands:
- This is a realistic scenario
- They have the encryption script
- They need to reverse engineer it

## Step 4: Downloading Files

Player downloads:
1. `ransomware-encrypt.py` - The encryption algorithm
2. `encrypted_flag.txt` - The encrypted data

## Step 5: Analyzing the Encryption Script

Player opens `ransomware-encrypt.py` and sees:

```python
def encrypt_data(plaintext, key):
    encrypted = bytearray()
    
    # Layer 1: XOR with rotating key
    for i, byte in enumerate(plaintext):
        xor_key = key[i % len(key)]
        encrypted.append(byte ^ xor_key)
    
    # Layer 2: Shift each byte by its position
    shifted = bytearray()
    for i, byte in enumerate(encrypted):
        shifted.append((byte + i) % 256)
    
    # Layer 3: XOR with reversed key
    final = bytearray()
    reversed_key = key[::-1]
    for i, byte in enumerate(shifted):
        xor_key = reversed_key[i % len(reversed_key)]
        final.append(byte ^ xor_key)
    
    return final

# The key is hardcoded!
ENCRYPTION_KEY = b"D4RKN3T"
```

Player realizes:
- ✅ The key is visible: `D4RKN3T`
- ✅ There are 3 layers of encryption
- ✅ Each layer must be reversed

## Step 6: First Attempt (Common Mistakes)

### Mistake 1: Wrong Order
Player tries to reverse layers 1→2→3 (encryption order)
```python
# This won't work!
# Undo layer 1 first (wrong!)
```
Result: Gibberish output ❌

### Mistake 2: Forgetting Modulo
Player tries:
```python
layer2_reversed.append(byte - i)  # Can be negative!
```
Result: ValueError or wrong output ❌

### Mistake 3: Wrong Key Direction
Player uses normal key for layer 3 instead of reversed
Result: Wrong decryption ❌

## Step 7: Using Hints (Optional)

### If Stuck After 5 Minutes...

**Player uses Hint 1 (costs 5 points):**
```
The encryption uses 3 layers. You must reverse them in 
opposite order: Layer 3 → Layer 2 → Layer 1
```

Player: "Ah! I need to reverse the order!"

### Still Stuck After 10 Minutes...

**Player uses Hint 2 (costs 10 points):**
```
XOR is its own inverse. The key "D4RKN3T" is visible in 
the encryption script. Use it to undo both XOR operations.
```

Player: "So I XOR again with the same key to undo it!"

### Really Stuck...

**Player uses Hint 3 (costs 15 points):**
```
Layer 2 uses addition (byte + position) mod 256. Reverse 
it with subtraction: (byte - position) mod 256. 
In Python: (byte - i) % 256
```

Player: "Now I know exactly how to reverse the shift!"

## Step 8: Writing the Solution

Player creates `decrypt.py`:

```python
#!/usr/bin/env python3

def decrypt_data(encrypted_hex, key):
    # Convert hex to bytes
    encrypted = bytes.fromhex(encrypted_hex)
    
    # Reverse Layer 3: XOR with reversed key
    reversed_key = key[::-1]
    layer3_reversed = bytearray()
    for i, byte in enumerate(encrypted):
        xor_key = reversed_key[i % len(reversed_key)]
        layer3_reversed.append(byte ^ xor_key)
    
    # Reverse Layer 2: Subtract position
    layer2_reversed = bytearray()
    for i, byte in enumerate(layer3_reversed):
        layer2_reversed.append((byte - i) % 256)
    
    # Reverse Layer 1: XOR with rotating key
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

## Step 9: Running the Script

```bash
$ python decrypt.py
flag{r3v3rs3_3ng1n33r1ng_m4st3r}
```

Player: "YES! I got it! 🎉"

## Step 10: Submitting the Flag

Player copies: `flag{r3v3rs3_3ng1n33r1ng_m4st3r}`

Pastes into submission box and clicks "Submit"

```
✅ Correct! You earned 250 points!
🏆 Challenge completed in 18:42
```

## Step 11: Leaderboard Update

Player sees:
- Their name moves up on the leaderboard
- Activity feed shows: "PlayerName solved Ransomware Reversal!"
- Personal stats update: +250 points
- Badge earned: "Reverse Engineer"

## Player Reactions by Skill Level

### Beginner (30+ minutes, uses all hints)
"This was really hard but I learned so much about encryption! 
The hints helped me understand each step. Now I know how XOR 
works and why order matters in cryptography."

### Intermediate (20-25 minutes, uses 1-2 hints)
"Great challenge! I got stuck on the modulo arithmetic but 
figured it out. The encryption script was really helpful to 
see exactly what was happening."

### Advanced (15-18 minutes, no hints)
"Nice! Recognized it was a reversible cipher immediately. 
The three layers made it interesting. Good practice for 
real ransomware analysis."

### Expert (10-15 minutes, no hints)
"Clean challenge. Wrote the decryption script in one go. 
Would be cool to see a version with AES or RSA for more 
realism, but this is perfect for teaching the concepts."

## What Players Learn

### Technical Skills
✅ Reverse engineering algorithms
✅ XOR cipher properties
✅ Byte manipulation in Python
✅ Modular arithmetic
✅ Reading malicious code
✅ Writing security tools

### Soft Skills
✅ Problem decomposition
✅ Debugging complex code
✅ Persistence through difficulty
✅ Reading documentation
✅ Testing and verification

### Security Concepts
✅ How ransomware works
✅ Encryption vs encoding
✅ Symmetric cryptography
✅ Algorithm weaknesses
✅ Incident response
✅ Malware analysis

## Time Breakdown

### Fast Solve (15 minutes)
- 2 min: Read challenge and download files
- 3 min: Analyze encryption script
- 5 min: Write decryption script
- 3 min: Test and debug
- 2 min: Submit flag

### Average Solve (25 minutes)
- 3 min: Read challenge
- 5 min: Analyze encryption
- 8 min: Write decryption (with mistakes)
- 6 min: Debug and fix issues
- 3 min: Test and submit

### Slow Solve (35+ minutes, with hints)
- 5 min: Read challenge
- 8 min: Analyze encryption
- 5 min: Get stuck, use hint 1
- 8 min: Write partial solution
- 5 min: Get stuck, use hint 2
- 4 min: Complete solution
- 3 min: Submit

## Common Player Questions

**Q: "Can I use online tools?"**
A: Yes! CyberChef, XOR calculators, etc. are all allowed.

**Q: "Do I need to write Python?"**
A: Python is recommended, but any language works (JavaScript, C++, etc.)

**Q: "Is the key really in the script?"**
A: Yes! Real ransomware hides keys, but this is educational.

**Q: "Can I brute force it?"**
A: Technically yes, but you'd need to try 256^7 keys. Writing the decryption script is faster!

**Q: "What if I can't solve it?"**
A: Use the hints! They're designed to guide you step by step.

## Success Indicators

Player successfully learned if they can:
- ✅ Explain why layers must be reversed in opposite order
- ✅ Describe how XOR is its own inverse
- ✅ Handle modulo arithmetic with negative numbers
- ✅ Write a working decryption script
- ✅ Apply these concepts to other challenges

## Post-Challenge

After solving, player can:
- View the official solution
- Read the detailed guide
- Compare their approach with others
- Move on to next challenge
- Help teammates who are stuck

---

**This walkthrough shows the complete player journey from discovery to success!**
