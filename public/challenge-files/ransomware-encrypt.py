#!/usr/bin/env python3
"""
🔒 DARKNET RANSOMWARE v2.3 🔒
Your files have been encrypted!

This is the encryption algorithm we used.
Good luck reversing it... if you can.

- DarkNet Crew
"""

import sys

def encrypt_data(plaintext, key):
    """
    Multi-layer encryption algorithm
    Layer 1: XOR with rotating key
    Layer 2: Byte shifting
    Layer 3: XOR with key again
    """
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

def main():
    # Our secret encryption key (hardcoded for "security")
    ENCRYPTION_KEY = b"D4RKN3T"
    
    # The original flag (now encrypted)
    original_flag = b"flag{r3v3rs3_3ng1n33r1ng_m4st3r}"
    
    # Encrypt the flag
    encrypted_flag = encrypt_data(original_flag, ENCRYPTION_KEY)
    
    # Convert to hex for storage
    hex_encrypted = encrypted_flag.hex()
    
    print("=" * 60)
    print("🔒 DARKNET RANSOMWARE - ENCRYPTION COMPLETE 🔒")
    print("=" * 60)
    print(f"\nOriginal data length: {len(original_flag)} bytes")
    print(f"Encrypted data length: {len(encrypted_flag)} bytes")
    print(f"\nEncrypted data (hex):")
    print(hex_encrypted)
    print("\n" + "=" * 60)
    print("Your files are now encrypted!")
    print("To decrypt, you must understand our algorithm...")
    print("=" * 60)

if __name__ == "__main__":
    main()
