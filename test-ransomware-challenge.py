#!/usr/bin/env python3
"""
Quick test script to verify the Ransomware Reversal challenge works correctly.
This tests both encryption and decryption to ensure they're inverses.
"""

def encrypt_data(plaintext, key):
    """Original encryption algorithm"""
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

def decrypt_data(encrypted_hex, key):
    """Decryption algorithm (reverses encryption)"""
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

def main():
    print("=" * 70)
    print("🔒 RANSOMWARE REVERSAL CHALLENGE - VERIFICATION TEST 🔒")
    print("=" * 70)
    
    # Test data
    key = b"D4RKN3T"
    original_flag = b"flag{r3v3rs3_3ng1n33r1ng_m4st3r}"
    
    print(f"\n[1] Original Flag:")
    print(f"    {original_flag.decode()}")
    print(f"    Length: {len(original_flag)} bytes")
    
    # Encrypt
    print(f"\n[2] Encrypting with key: {key.decode()}")
    encrypted = encrypt_data(original_flag, key)
    encrypted_hex = encrypted.hex()
    print(f"    Encrypted (hex): {encrypted_hex}")
    print(f"    Length: {len(encrypted)} bytes")
    
    # Decrypt
    print(f"\n[3] Decrypting...")
    decrypted = decrypt_data(encrypted_hex, key)
    print(f"    Decrypted: {decrypted.decode()}")
    print(f"    Length: {len(decrypted)} bytes")
    
    # Verify
    print(f"\n[4] Verification:")
    if decrypted == original_flag:
        print("    ✅ SUCCESS! Encryption and decryption are perfect inverses!")
        print("    ✅ Challenge is working correctly!")
    else:
        print("    ❌ FAILED! Decryption did not recover original data!")
        print(f"    Expected: {original_flag}")
        print(f"    Got: {decrypted}")
        return False
    
    # Test with challenge data
    print(f"\n[5] Testing with actual challenge data:")
    challenge_hex = "766a7b646b72296d3c6709da4c306c513d7ddd277ede4302676e15061817701e"
    challenge_decrypted = decrypt_data(challenge_hex, key)
    print(f"    Challenge hex: {challenge_hex}")
    print(f"    Decrypted flag: {challenge_decrypted.decode()}")
    
    if challenge_decrypted == original_flag:
        print("    ✅ Challenge data is correct!")
    else:
        print("    ❌ Challenge data mismatch!")
        return False
    
    print("\n" + "=" * 70)
    print("✅ ALL TESTS PASSED! Challenge is ready for deployment!")
    print("=" * 70)
    
    # Print summary
    print("\n📋 CHALLENGE SUMMARY:")
    print(f"   • Difficulty: Hard")
    print(f"   • Points: 250")
    print(f"   • Key: {key.decode()}")
    print(f"   • Flag: {original_flag.decode()}")
    print(f"   • Encrypted: {challenge_hex}")
    print(f"   • Layers: 3 (XOR → Shift → XOR)")
    print(f"   • Estimated Time: 25 minutes")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
