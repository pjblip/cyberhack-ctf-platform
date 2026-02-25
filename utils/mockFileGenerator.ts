import { Challenge } from '../types';

/**
 * This file acts as a "Virtual File Server". 
 * Since we don't have a real backend hosting .zip or .pcap files,
 * we generate them on the fly as Blobs when the user clicks download.
 */

export const generateChallengeFile = (challengeId: string): { filename: string, content: string, mimeType: string } | null => {
  
  switch (challengeId) {
    // ---------------------------------------------------------
    // WEB001: Hello World Error
    // Simple Hello World with missing closing tag
    // ---------------------------------------------------------
    case 'web001':
      return {
        filename: 'hello_world.html',
        mimeType: 'text/html',
        content: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Hello World</title>
</head>
<body>
    <h1>Hello World</h1>
    <p>My first website!</p>
    
    <script>
        console.log("Hello World");
        alert("Welcome to my site!");
    </script>
    
    <!-- 
       TODO: I feel like I'm forgetting something at the bottom of this file...
       Anyway, here is the secret flag: flag{</html>} 
    -->
        `
      };

    // ---------------------------------------------------------
    // WEB002: Robots Protocol
    // Robots.txt file
    // ---------------------------------------------------------
    case 'web002':
      return {
        filename: 'robots.txt',
        mimeType: 'text/plain',
        content: `
User-agent: *
Disallow: /private/
Disallow: /admin-panel/

# The flag is hidden in the directory name below:
# flag{disallow_admin_panel}
        `
      };

    // ---------------------------------------------------------
    // CRYPTO001: Just Base64
    // Text file with encoded string
    // ---------------------------------------------------------
    case 'crypto001':
      return {
        filename: 'intercepted_message.txt',
        mimeType: 'text/plain',
        content: `
INTERCEPTED TRANSMISSION
------------------------
SENDER: UNKNOWN
TIMESTAMP: 2024-05-15 09:00:00 UTC

MESSAGE BODY:
ZmxhZ3tiYXNlNjRfaXNfbm90X2VuY3J5cHRpb259

END OF TRANSMISSION
        `
      };

    // ---------------------------------------------------------
    // CRYPTO002: Caesar's Salad
    // Text file with ROT13 string
    // ---------------------------------------------------------
    case 'crypto002':
      return {
        filename: 'roman_scroll.txt',
        mimeType: 'text/plain',
        content: `
Hail Caesar!

The following message has been encrypted for your eyes only using our standard 13-shift rotation:

synt{ebg13_vf_rnfl}

Decrypt it immediately.
        `
      };

    // ---------------------------------------------------------
    // NET001: Packet Sniffer
    // We simulate a Wireshark/TCPDump ASCII export
    // ---------------------------------------------------------
    case 'net001':
      return {
        filename: 'capture_traffic.log',
        mimeType: 'text/plain',
        content: `
TCPDUMP OUTPUT - CAPTURE SESSION #9021
---------------------------------------
192.168.1.5 > 10.0.0.1: SYN
10.0.0.1 > 192.168.1.5: SYN, ACK
192.168.1.5 > 10.0.0.1: ACK

192.168.1.5 > 10.0.0.1: HTTP POST /login
Host: secure-bank.com
User-Agent: Mozilla/5.0
Content-Type: application/x-www-form-urlencoded
Content-Length: 42

username=admin&password=flag{plaintext_credentials_bad}

10.0.0.1 > 192.168.1.5: HTTP 302 Redirect
Location: /dashboard
---------------------------------------
[END STREAM]
        `
      };

    // ---------------------------------------------------------
    // FORENSICS001: Exif / Metadata
    // Simulating a raw log or hex dump where a flag is hidden
    // ---------------------------------------------------------
    case 'forensics001':
      return {
        filename: 'camera_dump.txt',
        mimeType: 'text/plain',
        content: `
IMAGE_ID: IMG_8821.JPG
SIZE: 4.2MB
RESOLUTION: 4032x3024
ISO: 200
APERTURE: f/1.8
MAKE: Canon
MODEL: EOS 5D

[EXIF METADATA BLOCK]
0x0010: 45 78 69 66 00 00 4D 4D
0x0020: 00 2A 00 00 00 08 00 02
0x0030: UserComment: flag{always_strip_metadata}
0x0040: GPSLatitude: 37.7749 N
0x0050: GPSLongitude: 122.4194 W
        `
      };

    // ---------------------------------------------------------
    // REV001: Hardcoded Secrets
    // Simulating a binary file with strings inside
    // ---------------------------------------------------------
    case 'rev001':
      // We generate some "garbage" binary-looking text with the flag buried inside
      const garbage = Array(50).fill(0).map(() => Math.random().toString(36).substring(2)).join('');
      return {
        filename: 'program.bin',
        mimeType: 'application/octet-stream',
        content: `ELF...${garbage}...@821...func_main...strcmp(input, "flag{strings_command_is_powerful}")...${garbage}...END`
      };

    // ---------------------------------------------------------
    // FORENSICS002: Corrupted Header
    // ---------------------------------------------------------
    case 'forensics002':
      return {
        filename: 'damaged_doc.pdf',
        mimeType: 'text/plain',
        content: `
%NOT_PDF-1.4
%
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj
3 0 obj
<<
/Type /Page
/Contents (Congratulation! You fixed the header. The flag is: flag{magic_bytes_restored})
>>
endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
trailer
<<
/Root 1 0 R
>>
%%EOF
        `
      };

    // ---------------------------------------------------------
    // PWN001: Buffer Overflow
    // Providing C Source Code
    // ---------------------------------------------------------
    case 'pwn001':
      return {
        filename: 'vuln.c',
        mimeType: 'text/plain',
        content: `
#include <stdio.h>
#include <string.h>

void win() {
    printf("Congratulations! flag{segfault_controlled}\\n");
}

void vulnerable_function() {
    char buffer[64];
    printf("Enter some text: ");
    gets(buffer); // VULNERABILITY: No boundary check!
}

int main() {
    printf("Welcome to the buffer overflow challenge.\\n");
    vulnerable_function();
    return 0;
}
        `
      };

    // ---------------------------------------------------------
    // REV002: Time Lock
    // ---------------------------------------------------------
    case 'rev002':
      return {
        filename: 'timelock.js',
        mimeType: 'text/javascript',
        content: `
function checkTime() {
  const targetTime = new Date('2099-12-31T23:59:59').getTime();
  const currentTime = Date.now();
  
  if (currentTime >= targetTime) {
    console.log("Access Granted: flag{temporal_manipulation}");
  } else {
    console.log("Access Denied: It is not time yet.");
  }
}

checkTime();
        `
      };

    default:
      return null;
  }
};