# Secret Image for Steganography Challenge

## Creating secret_image.png

Since I cannot create actual image files, you need to:

### Option 1: Use an Existing Image
1. Find any PNG image (university logo, random photo, etc.)
2. Rename it to `secret_image.png`
3. Place it in `public/challenge-files/`
4. For the CTF event, just accept the flag directly: `flag{5t3g0_m4st3r_2024}`

### Option 2: Create Image with Hidden Message (Advanced)
1. Get any PNG image
2. Use steghide to hide a message:
   ```bash
   echo "flag{5t3g0_m4st3r_2024}" > secret.txt
   steghide embed -cf secret_image.png -ef secret.txt
   ```
3. Students can extract with:
   ```bash
   steghide extract -sf secret_image.png
   ```

### Option 3: Simple Placeholder
For testing, just use any image and tell students the flag is:
`flag{5t3g0_m4st3r_2024}`

## For Your Event

Since this is a 1-hour event and steganography tools might be complex:
- Provide the image as a download
- Give generous hints
- Or skip this challenge and replace with another web/crypto challenge
