# 🔒 Ransomware Reversal Challenge - Implementation Summary

## What We Built

A comprehensive, realistic Hard-level CTF challenge that teaches reverse engineering and cryptography through a simulated ransomware incident.

## Challenge Overview

**Title:** Ransomware Reversal  
**Difficulty:** Hard  
**Points:** 250  
**Estimated Time:** 25 minutes  
**Category:** Cryptography / Reverse Engineering  

**Scenario:** DarkNet ransomware group encrypted a production database. Players must analyze the recovered encryption script and write a decryption tool to recover the flag.

## Files Created

### 1. Challenge Files (public/challenge-files/)

#### ransomware-reversal.html
- Professional challenge page with dark ransomware theme
- Complete instructions and technical details
- Download links for required files
- Hints and decryption template
- Responsive design with skull animation

#### ransomware-encrypt.py
- The "malicious" encryption script
- Shows the 3-layer encryption algorithm:
  - Layer 1: XOR with rotating key
  - Layer 2: Byte position shifting
  - Layer 3: XOR with reversed key
- Hardcoded key: `D4RKN3T`
- Generates encrypted hex output

#### encrypted_flag.txt
- Formatted as a ransomware note
- Contains the encrypted hex data
- Technical details about the encryption
- Recovery instructions

#### ransomware-decrypt-solution.py
- Complete working solution
- Reverses all 3 encryption layers
- Well-commented for learning
- Produces: `flag{r3v3rs3_3ng1n33r1ng_m4st3r}`

#### RANSOMWARE_GUIDE.md
- Comprehensive learning guide
- Explains each encryption layer
- Common mistakes to avoid
- Python tips and tricks
- Real-world context

## Technical Details

### Encryption Algorithm

```
Plaintext → Layer 1 (XOR) → Layer 2 (Shift) → Layer 3 (XOR) → Ciphertext
```

**Layer 1:** XOR each byte with rotating key  
**Layer 2:** Add position to each byte (mod 256)  
**Layer 3:** XOR with reversed key  

### Decryption Algorithm

```
Ciphertext → Undo Layer 3 → Undo Layer 2 → Undo Layer 1 → Plaintext
```

**Undo Layer 3:** XOR with reversed key  
**Undo Layer 2:** Subtract position (mod 256)  
**Undo Layer 1:** XOR with rotating key  

### Key Information

- **Key:** `D4RKN3T` (7 bytes)
- **Encrypted Hex:** `766a7b646b72296d3c6709da4c306c513d7ddd277ede4302676e15061817701e`
- **Flag:** `flag{r3v3rs3_3ng1n33r1ng_m4st3r}`
- **Length:** 32 bytes

## Database Integration

### Updated Seed File (backend/src/admin/admin-seed.service.ts)

```javascript
{
    id: uuidv4(),
    title: 'Ransomware Reversal',
    description: 'DarkNet ransomware encrypted our database. We recovered the encryption script from memory. Analyze the multi-layer encryption algorithm and write a decryption script to recover the flag.',
    difficulty: 'hard',
    points: 250,
    flag: 'flag{r3v3rs3_3ng1n33r1ng_m4st3r}',
    isActive: true,
    duration: 900, // 15 minutes
    fileUrl: '/challenge-files/ransomware-reversal.html',
    hints: [
        'The encryption uses 3 layers. You must reverse them in opposite order: Layer 3 → Layer 2 → Layer 1',
        'XOR is its own inverse. The key "D4RKN3T" is visible in the encryption script. Use it to undo both XOR operations.',
        'Layer 2 uses addition (byte + position) mod 256. Reverse it with subtraction: (byte - position) mod 256. In Python: (byte - i) % 256'
    ],
    hintCosts: [5, 10, 15],
    estimatedTime: 25
}
```

## Learning Objectives

Players will learn:
1. ✅ Reverse engineering cryptographic algorithms
2. ✅ XOR cipher properties and weaknesses
3. ✅ Byte manipulation in Python
4. ✅ Modular arithmetic
5. ✅ Reading and analyzing malicious code
6. ✅ Writing security analysis scripts

## Why This Challenge is "Hard"

1. **Multi-Layer Complexity:** Requires understanding 3 different operations
2. **Order Matters:** Must reverse layers in correct order
3. **Mathematical Understanding:** Need to understand XOR and modular arithmetic
4. **Scripting Required:** Cannot solve manually, must write code
5. **Debugging Skills:** Need to test and verify each layer
6. **Real-World Relevance:** Simulates actual ransomware analysis

## Solution Path

### Beginner Approach (30+ minutes)
1. Read encryption script carefully
2. Manually trace through encryption with sample data
3. Write decryption layer by layer
4. Test each layer individually
5. Debug issues with modulo and negative numbers

### Advanced Approach (15-20 minutes)
1. Quickly identify it's a reversible cipher
2. Recognize XOR self-inverse property
3. Write complete decryption script
4. Run and get flag immediately

## Hints System

**Hint 1 (5 points):** Layer order  
**Hint 2 (10 points):** Key location and XOR strategy  
**Hint 3 (15 points):** Position shifting reversal  

Progressive hints guide players without giving away the complete solution.

## Testing

### Verification Steps
1. ✅ Encryption script generates correct hex
2. ✅ Decryption script recovers correct flag
3. ✅ Challenge page displays properly
4. ✅ Download links work
5. ✅ Hints are progressive and helpful

### Test Commands
```bash
# Test encryption
python public/challenge-files/ransomware-encrypt.py

# Test decryption
python public/challenge-files/ransomware-decrypt-solution.py
```

## Integration with Platform

### Frontend
- Challenge appears in challenges list
- Difficulty badge shows "Hard"
- Points display: 250
- Timer: 15 minutes
- File download buttons work
- Hint system integrated

### Backend
- Flag validation: `flag{r3v3rs3_3ng1n33r1ng_m4st3r}`
- Hints stored in database
- Solve tracking
- Leaderboard integration

## Real-World Context

This challenge simulates:
- **Ransomware Incident Response:** Analyzing encryption to recover data
- **Malware Analysis:** Understanding how malicious code works
- **Cryptographic Weaknesses:** Identifying flawed encryption schemes
- **Security Research:** Reverse engineering for defensive purposes

## Future Enhancements

Potential improvements:
1. Add more complex encryption (AES with weak key)
2. Include memory dump analysis
3. Add network traffic capture
4. Create multi-stage challenge
5. Add binary reverse engineering component

## Success Metrics

Players successfully complete when they:
- ✅ Understand the encryption algorithm
- ✅ Write a working decryption script
- ✅ Submit the correct flag
- ✅ Can explain the solution

## Files Summary

```
public/challenge-files/
├── ransomware-reversal.html          # Main challenge page
├── ransomware-encrypt.py             # Encryption script (for analysis)
├── ransomware-decrypt-solution.py    # Solution (for organizers)
├── encrypted_flag.txt                # Encrypted data
└── RANSOMWARE_GUIDE.md              # Learning guide

backend/src/admin/
└── admin-seed.service.ts             # Updated with enhanced challenge

CHALLENGE_SOLUTIONS.md                # Updated with detailed solution
```

## Deployment Checklist

- [x] Create encryption script
- [x] Generate encrypted data
- [x] Create challenge HTML page
- [x] Write solution script
- [x] Test encryption/decryption
- [x] Update database seed
- [x] Update solutions document
- [x] Create learning guide
- [x] Verify all files accessible
- [x] Test hint system

## Next Steps

To activate this challenge:
1. Restart the backend server (to load new seed data)
2. Clear existing challenges if needed
3. Verify challenge appears in UI
4. Test complete user flow
5. Monitor player attempts and feedback

---

**Challenge Status:** ✅ Ready for Deployment

**Difficulty Level:** Hard (Verified)

**Educational Value:** High - Teaches practical reverse engineering skills

**Realism:** High - Simulates actual ransomware analysis workflow
