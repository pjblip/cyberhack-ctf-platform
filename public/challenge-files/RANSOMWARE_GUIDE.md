# 🔒 Ransomware Reversal Challenge Guide

## Overview
This challenge simulates a real-world ransomware incident where you must reverse-engineer the encryption algorithm to recover encrypted data.

## What You'll Learn
- Reverse engineering cryptographic algorithms
- Understanding XOR cipher properties
- Byte manipulation and modular arithmetic
- Python scripting for security analysis
- Reading and analyzing malicious code

## Files Provided
1. **ransomware-encrypt.py** - The encryption script used by attackers
2. **encrypted_flag.txt** - The encrypted database containing the flag
3. **ransomware-reversal.html** - Challenge instructions and hints

## The Encryption Algorithm

### Layer 1: XOR with Rotating Key
```python
for i, byte in enumerate(plaintext):
    xor_key = key[i % len(key)]
    encrypted.append(byte ^ xor_key)
```
- Each byte is XORed with a key byte
- Key rotates: key[0], key[1], ..., key[6], key[0], ...

### Layer 2: Position Shifting
```python
for i, byte in enumerate(encrypted):
    shifted.append((byte + i) % 256)
```
- Each byte is shifted by its position
- Uses modulo 256 to keep values in byte range (0-255)

### Layer 3: XOR with Reversed Key
```python
reversed_key = key[::-1]
for i, byte in enumerate(shifted):
    xor_key = reversed_key[i % len(reversed_key)]
    final.append(byte ^ xor_key)
```
- XOR again with the key reversed
- Key order: key[6], key[5], ..., key[0]

## Decryption Strategy

### Step 1: Understand XOR Properties
- XOR is its own inverse
- If `A XOR B = C`, then `C XOR B = A`
- This means you can undo XOR by XORing again with the same key

### Step 2: Reverse the Order
Encryption order: Layer 1 → Layer 2 → Layer 3
Decryption order: Layer 3 → Layer 2 → Layer 1

### Step 3: Reverse Each Layer

**Undo Layer 3 (XOR with reversed key):**
```python
reversed_key = key[::-1]
for i, byte in enumerate(encrypted):
    xor_key = reversed_key[i % len(reversed_key)]
    layer3_reversed.append(byte ^ xor_key)
```

**Undo Layer 2 (subtract position):**
```python
for i, byte in enumerate(layer3_reversed):
    layer2_reversed.append((byte - i) % 256)
```
Note: Use modulo 256 to handle negative numbers correctly

**Undo Layer 1 (XOR with rotating key):**
```python
for i, byte in enumerate(layer2_reversed):
    xor_key = key[i % len(key)]
    decrypted.append(byte ^ xor_key)
```

## Common Mistakes to Avoid

1. **Wrong Layer Order**
   - ❌ Reversing layers in encryption order (1→2→3)
   - ✅ Reverse in opposite order (3→2→1)

2. **Negative Numbers in Subtraction**
   - ❌ `byte - i` (can be negative)
   - ✅ `(byte - i) % 256` (always 0-255)

3. **Wrong Key Direction**
   - Layer 1 uses normal key: `D4RKN3T`
   - Layer 3 uses reversed key: `T3NKR4D`

4. **Hex Conversion**
   - ❌ Treating hex string as regular string
   - ✅ Convert hex to bytes: `bytes.fromhex(hex_string)`

## Python Tips

### Converting Hex to Bytes
```python
encrypted_hex = "766a7b646b72296d..."
encrypted_bytes = bytes.fromhex(encrypted_hex)
```

### Converting Bytes to String
```python
decrypted_bytes = b"flag{...}"
decrypted_string = decrypted_bytes.decode()
```

### Handling Modulo with Negative Numbers
```python
# Python's modulo handles negatives correctly
result = (-5) % 256  # Returns 251, not -5
```

### Reversing a Bytes Object
```python
key = b"D4RKN3T"
reversed_key = key[::-1]  # b"T3NKR4D"
```

## Testing Your Solution

1. Your decryption should produce: `flag{r3v3rs3_3ng1n33r1ng_m4st3r}`
2. The flag is 32 bytes long
3. It starts with `flag{` and ends with `}`

## Tools You Might Use

- **Python 3** - For writing the decryption script
- **Text Editor** - To analyze the encryption code
- **Calculator** - For testing XOR operations
- **Online XOR Calculator** - To verify XOR logic

## Real-World Context

This challenge simulates:
- **Ransomware Analysis** - Understanding how ransomware encrypts files
- **Incident Response** - Recovering data without paying ransom
- **Malware Reverse Engineering** - Analyzing malicious code
- **Cryptographic Weaknesses** - Identifying flawed encryption

In real incidents:
- Ransomware groups often use strong encryption (AES, RSA)
- This challenge uses a weaker custom algorithm for educational purposes
- Real decryption usually requires the attacker's private key
- Prevention is better than recovery (backups, security patches)

## Hints System

If you're stuck, use the in-platform hints:

**Hint 1 (5 points):** Explains the layer reversal order
**Hint 2 (10 points):** Reveals the key and XOR strategy
**Hint 3 (15 points):** Shows how to reverse the position shifting

## Success Criteria

✅ You understand the encryption algorithm
✅ You wrote a working decryption script
✅ You successfully decrypted the flag
✅ You can explain why each step works

## Additional Resources

- [XOR Cipher Explained](https://en.wikipedia.org/wiki/XOR_cipher)
- [Python Bytes and Bytearray](https://docs.python.org/3/library/stdtypes.html#bytes)
- [Modular Arithmetic](https://en.wikipedia.org/wiki/Modular_arithmetic)
- [Ransomware Analysis Techniques](https://www.sans.org/white-papers/)

---

**Good luck, Security Researcher! 🔓**

Remember: The best way to learn is by doing. Don't give up if it takes time!
