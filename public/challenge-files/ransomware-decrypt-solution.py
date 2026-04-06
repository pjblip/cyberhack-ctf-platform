#!/usr/bin/env python3
"""
🔓 RANSOMWARE DECRYPTION SOLUTION 🔓

This is the solution script that reverses the DarkNet ransomware encryption.
Study this to understand how to reverse multi-layer encryption.
"""

def decrypt_data(encrypted_hex, key):
    """
    Reverse the multi-layer encryption
    Must undo in reverse order: Layer 3 → Layer 2 → Layer 1
    """
    # Convert hex string to bytes
    encrypted = bytes.fromhex(encrypted_hex)
    
    # Reverse Layer 3: XOR with reversed key (undo the final XOR)
    reversed_key = key[::-1]
    layer3_reversed = bytearray()
    for i, byte in enumerate(encrypted):
        xor_key = reversed_key[i % len(reversed_key)]
        layer3_reversed.append(byte ^ xor_key)
    
    # Reverse Layer 2: Subtract position (undo the shift)
    layer2_reversed = bytearray()
    for i, byte in enumerate(layer3_reversed):
        # Subtract position and handle negative numbers with modulo
        layer2_reversed.append((byte - i) % 256)
    
    # Reverse Layer 1: XOR with rotating key (undo the first XOR)
    decrypted = bytearray()
    for i, byte in enumerate(layer2_reversed):
        xor_key = key[i % len(key)]
        decrypted.append(byte ^ xor_key)
    
    return bytes(decrypted)

def main():
    # The encrypted data from the challenge
    encrypted_hex = "766a7b646b72296d3c6709da4c306c513d7ddd277ede4302676e15061817701e"
    
    # The encryption key (found in ransomware-encrypt.py)
    key = b"D4RKN3T"
    
    print("=" * 60)
    print("🔓 DARKNET RANSOMWARE - DECRYPTION TOOL 🔓")
    print("=" * 60)
    print(f"\nEncrypted data (hex): {encrypted_hex}")
    print(f"Key: {key.decode()}")
    print(f"\nDecrypting...")
    
    # Decrypt the data
    decrypted = decrypt_data(encrypted_hex, key)
    
    print(f"\n✅ Decryption successful!")
    print(f"\nDecrypted flag: {decrypted.decode()}")
    print("\n" + "=" * 60)
    print("Congratulations! You've reversed the ransomware encryption!")
    print("=" * 60)

if __name__ == "__main__":
    main()
