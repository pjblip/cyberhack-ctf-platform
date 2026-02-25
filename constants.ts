import { Challenge, Achievement } from './types';

export const MOCK_CASES: Challenge[] = [
  // ==============================================================================
  // TIER 1: RECRUIT (EASY) - 5 Challenges, 10 Points Each, Total 50
  // ==============================================================================
  {
      id: 'web001',
      title: 'Hello World Error',
      description: 'The developer wrote a simple Hello World program but forgot the closing html tag. See the source code and find the flag in that code.',
      difficulty: 'easy',
      points: 10,
      hint: 'Open the downloaded file in a text editor. The flag is the missing closing tag at the very bottom.',
      flag: 'flag{</html>}',
      estimatedTime: '1 MIN',
      duration: 120,
      fileUrl: 'mock'
  },
  {
      id: 'web002',
      title: 'Robots Protocol',
      description: 'Search engines are polite, but hackers are not. Analyze the robots.txt file to find the hidden administrative flag.',
      difficulty: 'easy',
      points: 10,
      hint: 'Robots.txt files define what search engines should not visit. Look for "Disallow" rules.',
      flag: 'flag{disallow_admin_panel}',
      estimatedTime: '1 MIN',
      duration: 120,
      fileUrl: 'mock'
  },
  {
      id: 'crypto001',
      title: 'Just Base64',
      description: 'We intercepted a suspicious text file. It contains a weird string ending with an equal sign. Decode it.',
      difficulty: 'easy',
      points: 10,
      hint: 'The string is Base64 encoded. Use a decoder tool.',
      flag: 'flag{base64_is_not_encryption}',
      estimatedTime: '2 MIN',
      duration: 120,
      fileUrl: 'mock'
  },
  {
      id: 'crypto002',
      title: 'Caesar\'s Salad',
      description: 'The Roman emperor sent a text file with a scrambled message. Decrypt it to reveal the flag.',
      difficulty: 'easy',
      points: 10,
      hint: 'It is a ROT13 cipher (a type of Caesar cipher).',
      flag: 'flag{rot13_is_easy}',
      estimatedTime: '1 MIN',
      duration: 120,
      fileUrl: 'mock'
  },
  {
      id: 'forensics001',
      title: 'Metadata Analysis',
      description: 'We recovered a log dump from a digital camera. The photographer hid their location and a secret message within the EXIF data block.',
      difficulty: 'easy',
      points: 10,
      hint: 'Open the text file and search for the "UserComment" field.',
      flag: 'flag{always_strip_metadata}',
      estimatedTime: '2 MIN',
      duration: 120,
      fileUrl: 'mock'
  },

  // ==============================================================================
  // TIER 2: OPERATIVE (MEDIUM) - 4 Challenges, 50 Points Each, Total 200
  // ==============================================================================
  {
      id: 'rev001',
      title: 'Hardcoded Secrets',
      description: 'We decompiled a binary and found this string comparison. What is the password?',
      difficulty: 'medium',
      points: 50,
      hint: 'Open the binary in a text editor and look for "flag{".',
      flag: 'flag{strings_command_is_powerful}',
      estimatedTime: '5 MIN',
      duration: 300,
      fileUrl: 'mock'
  },
  {
      id: 'net001',
      title: 'Packet Sniffer',
      description: 'An employee logged into a non-SSL website while we were recording network traffic. Find their password in the capture log.',
      difficulty: 'medium',
      points: 50,
      hint: 'Look for HTTP POST requests in the text log.',
      flag: 'flag{plaintext_credentials_bad}',
      estimatedTime: '5 MIN',
      duration: 300,
      fileUrl: 'mock'
  },
  {
      id: 'forensics002',
      title: 'Corrupted Header',
      description: 'This PDF file won\'t open. The magic bytes at the start of the file seem to be missing or altered. Fix it to read the content.',
      difficulty: 'medium',
      points: 50,
      hint: 'A PDF should start with %PDF. Open the file in a text editor to see the content.',
      flag: 'flag{magic_bytes_restored}',
      estimatedTime: '8 MIN',
      duration: 480,
      fileUrl: 'mock'
  },
  {
      id: 'crypto003',
      title: 'Hash Cracker',
      description: 'We found this MD5 hash in a leak: "5f4dcc3b5aa765d61d8327deb882cf99". Crack it to find the password.',
      difficulty: 'medium',
      points: 50,
      hint: 'It is a very common password. Use a rainbow table or online cracker.',
      flag: 'flag{password}',
      estimatedTime: '5 MIN',
      duration: 300,
  },

  // ==============================================================================
  // TIER 3: BLACK OPS (HARD) - 2 Challenges, 125 Points Each, Total 250
  // ==============================================================================
  {
      id: 'pwn001',
      title: 'Buffer Overflow',
      description: 'The input buffer is 64 bytes, but the program reads 128 bytes. We have the source code. Find the goal function.',
      difficulty: 'hard',
      points: 125,
      hint: 'Read the source code to find the "win" function print statement.',
      flag: 'flag{segfault_controlled}',
      estimatedTime: '15 MIN',
      duration: 900,
      fileUrl: 'mock'
  },
  {
      id: 'rev002',
      title: 'The Time Lock',
      description: 'This script only outputs the flag if the system time matches a specific timestamp from the future.',
      difficulty: 'hard',
      points: 125,
      hint: 'Read the logic. The flag is right there in the success condition.',
      flag: 'flag{temporal_manipulation}',
      estimatedTime: '15 MIN',
      duration: 900,
      fileUrl: 'mock'
  }
];

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_blood',
    title: 'First Blood',
    description: 'Solve your first challenge.',
    icon: '🔰',
    condition: (stats) => stats.correct >= 1
  },
  {
    id: 'script_kiddie',
    title: 'Script Kiddie',
    description: 'Reach 50 Points (Clear Easy Tier).',
    icon: '💻',
    condition: (stats) => stats.points >= 50
  },
  {
    id: 'hacker',
    title: 'White Hat',
    description: 'Reach 250 Points (Clear Easy + Medium).',
    icon: '🕵️',
    condition: (stats) => stats.points >= 250
  },
  {
    id: 'elite',
    title: 'Elite Hacker',
    description: 'Reach 500 Points (Max Score).',
    icon: '💀',
    condition: (stats) => stats.points >= 500
  },
  {
    id: 'crypto_master',
    title: 'Cryptography Expert',
    description: 'Reach 100 Points.',
    icon: '🔐',
    condition: (stats) => stats.points >= 100
  },
  {
    id: 'perfectionist',
    title: 'Completionist',
    description: 'Solve All 11 Challenges.',
    icon: '🏆',
    condition: (stats) => stats.correct >= 11
  }
];