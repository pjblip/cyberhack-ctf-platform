import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Wifi, Shield, Cpu, HardDrive } from 'lucide-react';
import { playTypingSound, playClickSound } from '../utils/audio';

interface TerminalProps {
    onNavigate?: (page: string) => void;
    challengeMode?: boolean;
    challengeId?: string;
}

const Terminal: React.FC<TerminalProps> = ({ onNavigate, challengeMode = false, challengeId }) => {
  const [outputLines, setOutputLines] = useState<string[]>([
    challengeMode ? '=== SECURE TERMINAL ACCESS ===' : 'Welcome to CyberHack OS v4.0.2',
    challengeMode ? 'Challenge environment initialized.' : 'Type "help" for available commands.',
    challengeMode ? 'Type "help" for challenge-specific commands.' : ''
  ].filter(Boolean));
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  const [currentDirectory, setCurrentDirectory] = useState('~');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLines]);

  // Command suggestions based on input
  const allCommands = challengeMode ? [
    'help', 'ls', 'cat', 'cd', 'pwd', 'find', 'grep', 'ps', 'netstat', 'whoami', 
    'history', 'clear', 'decrypt', 'analyze', 'hexdump', 'strings', 'file', 'chmod',
    'ssh', 'scp', 'wget', 'curl', 'nmap', 'wireshark', 'john', 'hashcat', 'hint',
    'python3', 'python', 'xxd', 'wc', 'md5sum'
  ] : [
    'help', 'history', 'clear', 'status', 'whoami', 'login', 'open cases', 
    'open team', 'open home', 'ls', 'sudo', 'sysinfo', 'nmap'
  ];

  useEffect(() => {
    if (input.trim()) {
      const matches = allCommands.filter(cmd => 
        cmd.toLowerCase().startsWith(input.toLowerCase())
      );
      setSuggestions(matches.slice(0, 5));
      setShowSuggestions(matches.length > 0 && input.length > 0);
    } else {
      setShowSuggestions(false);
    }
  }, [input]);

  const getSystemInfo = () => [
    '╔══════════════════════════════════════╗',
    '║         SYSTEM INFORMATION           ║',
    '╠══════════════════════════════════════╣',
    '║ OS: Kali Linux 2024.1               ║',
    '║ Kernel: 6.1.0-kali7-amd64           ║',
    '║ Architecture: x86_64                 ║',
    '║ Memory: 16GB DDR4                    ║',
    '║ CPU: Intel i7-12700K @ 3.60GHz      ║',
    '║ Network: Encrypted Tunnel Active    ║',
    '║ Security: Maximum                    ║',
    '╚══════════════════════════════════════╝'
  ];

  const getChallengeFiles = (challengeId?: string) => {
    if (challengeId === 'crypto004') {
      return [
        'total 24K',
        'drwxr-xr-x 2 root root 4.0K Mar 12 10:30 .',
        'drwxr-xr-x 3 root root 4.0K Mar 12 10:29 ..',
        '-rw-r--r-- 1 root root  156 Mar 12 10:30 encrypted_data.txt',
        '-rwxr-xr-x 1 root root 2.1K Mar 12 10:30 ransomware.py',
        '-rw-r--r-- 1 root root  89  Mar 12 10:30 README.txt',
        '-rw-r--r-- 1 root root  45  Mar 12 10:30 key_hint.txt'
      ];
    }
    return [
      'total 12K',
      'drwxr-xr-x 2 root root 4.0K Mar 12 10:30 .',
      'drwxr-xr-x 3 root root 4.0K Mar 12 10:29 ..',
      '-rw-r--r-- 1 root root  234 Mar 12 10:30 challenge_info.txt',
      '-rwxr-xr-x 1 root root 1.2K Mar 12 10:30 exploit.sh'
    ];
  };

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    
    // Update Command History
    let newHistory = commandHistory;
    if (cmd.trim()) {
        newHistory = [...commandHistory, cmd];
        setCommandHistory(newHistory);
        setHistoryPointer(-1);
    }

    let output: string[] = [];
    const nav = (page: string, message: string) => {
        output.push(message);
        if(onNavigate) setTimeout(() => onNavigate(page), 800);
    };

    if (!cleanCmd) return;

    // Challenge-specific commands
    if (challengeMode) {
      switch (cleanCmd) {
        case 'help':
          output = [
            '═══════════════ CHALLENGE TERMINAL HELP ═══════════════',
            '',
            '  NAVIGATION:',
            '    ls [path]        : List directory contents',
            '    cd <path>        : Change directory',
            '    pwd              : Print working directory',
            '    find <pattern>   : Search for files',
            '',
            '  FILE OPERATIONS:',
            '    cat <file>       : Display file contents',
            '    hexdump <file>   : Show hex representation',
            '    strings <file>   : Extract readable strings',
            '    file <file>      : Identify file type',
            '    xxd              : Hex dump analysis',
            '    wc <file>        : Count words/chars/bytes',
            '',
            '  ANALYSIS TOOLS:',
            '    analyze <file>   : Cryptographic analysis',
            '    grep <pattern>   : Search within files',
            '    hint             : Show challenge hints',
            '',
            '  CRYPTO TOOLS:',
            '    python3          : Python interpreter for calculations',
            '    decrypt          : Attempt decryption (limited)',
            '',
            '  SYSTEM:',
            '    ps               : Show running processes',
            '    netstat          : Network connections',
            '    whoami           : Current user info',
            '    history          : Command history',
            '    clear            : Clear terminal',
            '',
            '  ⚠️  HARD CHALLENGE: No automated solutions!',
            '',
            '═══════════════════════════════════════════════════════'
          ];
          break;

        case 'ls':
        case 'ls -la':
        case 'ls -l':
          output = getChallengeFiles(challengeId);
          break;

        case 'pwd':
          output = [currentDirectory === '~' ? '/root' : currentDirectory];
          break;

        case 'cat encrypted_data.txt':
          if (challengeId === 'crypto004') {
            output = [
              '=== ENCRYPTED DATA RECOVERED ===',
              '',
              'Encrypted String: 7b5f4e2a1c8d9e3f6a2b5c8e1f4a7d0b',
              'Encryption Method: XOR with rotating key',
              'Key Length: 4 bytes',
              'Original Length: 32 characters',
              '',
              'WARNING: Ransomware used mathematical operations',
              'Hint: The key might be related to the file size...'
            ];
          } else {
            output = ['cat: encrypted_data.txt: No such file or directory'];
          }
          break;

        case 'cat ransomware.py':
          if (challengeId === 'crypto004') {
            output = [
              '#!/usr/bin/env python3',
              '# Ransomware Encryption Script - RECOVERED (PARTIAL)',
              '',
              'import hashlib',
              'import os',
              '',
              'def generate_key(seed_data):',
              '    """Generate encryption key from seed"""',
              '    # Key generation algorithm - REDACTED',
              '    # Hint: Uses mathematical properties of the data',
              '    hash_obj = hashlib.md5(str(seed_data).encode())',
              '    return hash_obj.hexdigest()[:4]  # First 4 chars',
              '',
              'def encrypt_data(plaintext, key):',
              '    """XOR encryption with rotating key"""',
              '    result = ""',
              '    for i, char in enumerate(plaintext):',
              '        key_char = key[i % len(key)]',
              '        encrypted = ord(char) ^ ord(key_char)',
              '        result += format(encrypted, "02x")',
              '    return result',
              '',
              '# CRITICAL CLUE: seed_data = len(target_file)',
              '# Target file was the original flag file',
              '# Encrypted result: 7b5f4e2a1c8d9e3f6a2b5c8e1f4a7d0b',
              '',
              '# TODO: Reverse engineer the key generation',
              '# TODO: Implement decryption algorithm'
            ];
          } else {
            output = ['cat: ransomware.py: No such file or directory'];
          }
          break;

        case 'cat key_hint.txt':
          if (challengeId === 'crypto004') {
            output = [
              'RECOVERED FRAGMENT - ENCRYPTION NOTES',
              '=====================================',
              '',
              'The attacker left partial notes:',
              '',
              '"Key generation uses MD5 hash of file length"',
              '"Take first 4 characters of hash as XOR key"',
              '"Original file contained the flag text"',
              '',
              'MISSING INFORMATION:',
              '• What was the original file length?',
              '• How to calculate MD5 hash?',
              '• How to apply XOR decryption?',
              '',
              'CHALLENGE: Figure out the missing pieces!',
              '',
              'Hint: Standard CTF flags are usually 20-30 characters'
            ];
          } else {
            output = ['cat: key_hint.txt: No such file or directory'];
          }
          break;

        case 'cat readme.txt':
          if (challengeId === 'crypto004') {
            output = [
              'INCIDENT REPORT - RANSOMWARE ATTACK',
              '=====================================',
              '',
              'Date: March 12, 2026',
              'Affected System: Production Server',
              'Attack Vector: Email Phishing',
              '',
              'RECOVERY STATUS:',
              '✓ Encryption script recovered',
              '✓ Encrypted data extracted', 
              '✓ Key generation method identified',
              '',
              'NEXT STEPS: Reverse the encryption algorithm'
            ];
          } else {
            output = ['cat: readme.txt: No such file or directory'];
          }
          break;

        case 'analyze encrypted_data.txt':
          if (challengeId === 'crypto004') {
            output = [
              '🔍 CRYPTOGRAPHIC ANALYSIS REPORT',
              '=================================',
              '',
              'File: encrypted_data.txt',
              'Size: 32 hex characters (16 bytes)',
              'Encoding: Hexadecimal',
              '',
              '📊 PATTERN ANALYSIS:',
              '• Appears to be XOR cipher',
              '• Key length: Unknown (likely 2-8 bytes)',
              '• No obvious repeating patterns',
              '• Entropy: High (good encryption)',
              '',
              '🔑 KEY ANALYSIS:',
              '• Key derivation: Mathematical formula',
              '• Source: Related to plaintext properties',
              '• Hint: Check the ransomware algorithm',
              '',
              '⚠️  MANUAL WORK REQUIRED:',
              '• Study the encryption source code',
              '• Calculate key using the algorithm',
              '• Implement decryption manually',
              '',
              '❗ No automated tools available for this cipher'
            ];
          } else {
            output = ['analyze: No target file specified'];
          }
          break;

        case 'hexdump encrypted_data.txt':
          if (challengeId === 'crypto004') {
            output = [
              '00000000  37 62 35 66 34 65 32 61  31 63 38 64 39 65 33 66  |7b5f4e2a1c8d9e3f|',
              '00000010  36 61 32 62 35 63 38 65  31 66 34 61 37 64 30 62  |6a2b5c8e1f4a7d0b|',
              '00000020',
              '',
              'Hex string: 7b5f4e2a1c8d9e3f6a2b5c8e1f4a7d0b',
              'Length: 32 characters (16 bytes of encrypted data)'
            ];
          } else {
            output = ['hexdump: No such file'];
          }
          break;

        case 'strings ransomware.py':
          if (challengeId === 'crypto004') {
            output = [
              'Extracting readable strings...',
              '',
              'encrypt_data',
              'len(original_flag)',
              'flag{',
              'format(encrypted, "02x")',
              'The key was: len(original_flag) converted to hex',
              'Original flag format: flag{...}',
              '7b5f4e2a1c8d9e3f6a2b5c8e1f4a7d0b'
            ];
          } else {
            output = ['strings: No such file'];
          }
          break;

        case 'file *':
          if (challengeId === 'crypto004') {
            output = [
              'encrypted_data.txt: ASCII text',
              'ransomware.py: Python script, ASCII text executable',
              'README.txt: ASCII text',
              'key_hint.txt: ASCII text'
            ];
          } else {
            output = ['file: No files found'];
          }
          break;

        case 'decrypt encrypted_data.txt':
        case 'decrypt':
          if (challengeId === 'crypto004') {
            output = [
              '🔓 DECRYPTION TOOL v2.0',
              '========================',
              '',
              '❌ ERROR: Automatic decryption failed',
              '',
              '⚠️  ANALYSIS REQUIRED:',
              '   • Unknown encryption algorithm detected',
              '   • Key derivation method unclear',
              '   • Manual analysis needed',
              '',
              '💡 SUGGESTIONS:',
              '   • Study the ransomware source code',
              '   • Analyze the key generation method',
              '   • Calculate the key manually',
              '   • Use external tools for decryption',
              '',
              '📋 HINT: The key is mathematical, not random',
              '',
              '❗ This is a 250-point challenge - no shortcuts!'
            ];
          } else {
            output = ['decrypt: No encrypted files found in current directory'];
          }
          break;

        case 'hint':
          if (challengeId === 'crypto004') {
            output = [
              '💡 CHALLENGE HINTS (250 POINTS)',
              '================================',
              '',
              '🔍 ANALYSIS REQUIRED:',
              '• This is advanced cryptography',
              '• No automated solutions provided',
              '• Must understand the algorithm completely',
              '',
              '📚 STUDY THESE CONCEPTS:',
              '• MD5 hashing algorithms',
              '• XOR encryption/decryption',
              '• Hexadecimal encoding/decoding',
              '• Key rotation in ciphers',
              '',
              '🧮 MATHEMATICAL APPROACH:',
              '1. Determine original file length',
              '2. Calculate MD5 hash of that length',
              '3. Extract first 4 characters as key',
              '4. Implement XOR decryption',
              '5. Convert result from hex to ASCII',
              '',
              '⚠️  NO SHORTCUTS: Use external tools or write code',
              '',
              'Good luck! This is why it\'s worth 250 points.'
            ];
          } else {
            output = ['hint: No hints available for this challenge'];
          }
          break;

        case 'python3':
        case 'python':
          output = [
            'Python 3.9.2 (default, Feb 28 2021, 17:03:44)',
            '[GCC 10.2.1 20210110] on linux',
            'Type "help", "copyright", "credits" or "license" for more info.',
            '>>> # Python interpreter available for calculations',
            '>>> # Example MD5 calculation:',
            '>>> # import hashlib',
            '>>> # hashlib.md5(b"16").hexdigest()[:4]',
            '>>> # Result can be used as XOR key',
            '>>> exit()',
            '',
            'Use Python for crypto calculations!'
          ];
          break;

        case 'xxd':
          output = [
            'xxd: hex dump utility',
            '',
            'Encrypted data analysis:',
            '7b5f4e2a1c8d9e3f6a2b5c8e1f4a7d0b',
            '',
            '• 32 hex characters = 16 bytes',
            '• Each byte represents 1 encrypted character',
            '• Original plaintext was 16 characters long',
            '',
            'Key insight: flag length = 16 characters!',
            'Now calculate: MD5("16")[:4] for the key'
          ];
          break;

        case 'wc':
        case 'wc encrypted_data.txt':
          output = [
            'Word count analysis of encrypted data:',
            '',
            'Hex string: 7b5f4e2a1c8d9e3f6a2b5c8e1f4a7d0b',
            'Length: 32 hex chars = 16 bytes = 16 original chars',
            '',
            'CRITICAL DISCOVERY:',
            'The original flag was exactly 16 characters!',
            '',
            'Next step: Calculate MD5 hash of "16"',
            'Take first 4 chars as XOR key',
            'Decrypt the hex string manually'
          ];
          break;

        case 'ps':
          output = [
            'PID    PPID   CMD',
            '1      0      /sbin/init',
            '2      0      [kthreadd]',
            '1337   1      /usr/bin/ransomware_detector',
            '2048   1      /bin/bash',
            '4096   2048   ps'
          ];
          break;

        case 'netstat':
          output = [
            'Active Internet connections:',
            'Proto Recv-Q Send-Q Local Address    Foreign Address  State',
            'tcp   0      0      127.0.0.1:22     0.0.0.0:*        LISTEN',
            'tcp   0      0      0.0.0.0:80       0.0.0.0:*        LISTEN',
            'tcp   0      0      192.168.1.100:443 ESTABLISHED'
          ];
          break;

        case 'whoami':
          output = ['root'];
          break;

        case 'clear':
          setOutputLines([]);
          return;

        case 'history':
          output = newHistory.map((c, i) => `  ${i + 1}  ${c}`);
          break;

        default:
          output = [`bash: ${cleanCmd}: command not found`, 'Type "help" for available commands.'];
      }
    } else {
      // Original home terminal commands
      switch (cleanCmd) {
        case 'help':
          output = [
              '╔═══════════════════════════════════════════════════════╗',
              '║                  CYBERHACK TERMINAL                   ║',
              '╠═══════════════════════════════════════════════════════╣',
              '║  help             : Display this help menu           ║',
              '║  sysinfo          : Show detailed system info        ║',
              '║  history          : Show command history             ║',
              '║  clear            : Clear terminal display           ║',
              '║  status           : Check system status              ║',
              '║  whoami           : Current user info                ║',
              '║  login            : Navigate to Login                ║',
              '║  open cases       : Go to Challenges                 ║',
              '║  open team        : Go to Team page                  ║',
              '║  open home        : Go to Home                       ║',
              '║  ls               : List directory contents          ║',
              '║  nmap             : Network reconnaissance           ║',
              '╚═══════════════════════════════════════════════════════╝'
          ];
          break;
        
        case 'sysinfo':
          output = getSystemInfo();
          break;

        case 'history':
          output = newHistory.map((c, i) => `  ${i + 1}  ${c}`);
          break;

        case 'status':
          output = [
              '┌─────────────────────────────────────────┐',
              '│           SYSTEM STATUS                 │',
              '├─────────────────────────────────────────┤',
              '│ 🟢 SYSTEM INTEGRITY: 100%              │',
              '│ 🔒 CONNECTION: ENCRYPTED (TLS 1.3)     │',
              '│ 🛡️  FIREWALL: ACTIVE                    │',
              '│ ⚡ THREAT LEVEL: LOW                    │',
              '│ 📡 NETWORK: SECURE TUNNEL              │',
              '│ 💾 MEMORY USAGE: 42%                   │',
              '│ 🔋 POWER: STABLE                       │',
              '└─────────────────────────────────────────┘'
          ];
          break;
          
        case 'whoami':
          output = ['uid=1000(hacker) gid=1000(hacker) groups=1000(hacker),27(sudo)'];
          break;
          
        case 'clear':
          setOutputLines([]);
          return; 
          
        case 'open cases':
        case 'open challenges':
          nav('challenges', '>> ACCESSING MISSION CONTROL...');
          break;
          
        case 'open team':
          nav('team', '>> DECRYPTING PERSONNEL FILES...');
          break;

        case 'open home':
          nav('home', '>> RETURNING TO ROOT...');
          break;
          
        case 'login':
        case 'signin':
          nav('auth', '>> INITIATING AUTH PROTOCOLS...');
          break;
        
        case 'sudo':
        case 'sudo su':
          output = ['[sudo] password for hacker: ', 'Sorry, try again.', 'Permission denied.'];
          break;

        case 'ls':
        case 'ls -la':
          output = [
            'total 48K',
            'drwxr-xr-x 8 hacker hacker 4.0K Mar 12 10:30 .',
            'drwxr-xr-x 3 root   root   4.0K Mar 12 10:29 ..',
            '-rw------- 1 hacker hacker  220 Mar 12 10:29 .bash_history',
            '-rw-r--r-- 1 hacker hacker 3.7K Mar 12 10:29 .bashrc',
            'drwx------ 2 hacker hacker 4.0K Mar 12 10:30 .ssh',
            'drwxr-xr-x 2 hacker hacker 4.0K Mar 12 10:30 challenges',
            'drwxr-xr-x 2 hacker hacker 4.0K Mar 12 10:30 tools',
            '-rw-r--r-- 1 hacker hacker  156 Mar 12 10:30 README.txt'
          ];
          break;

        case 'nmap':
          output = [
            'Starting Nmap 7.94 ( https://nmap.org )',
            'Nmap scan report for localhost (127.0.0.1)',
            'Host is up (0.000012s latency).',
            'PORT     STATE SERVICE',
            '22/tcp   open  ssh',
            '80/tcp   open  http',
            '443/tcp  open  https',
            '3000/tcp open  ppp',
            '',
            'Nmap done: 1 IP address (1 host up) scanned in 0.05 seconds'
          ];
          break;

        default:
          output = [`bash: ${cleanCmd}: command not found`, 'Type "help" for a list of commands.'];
      }
    }

    const prompt = challengeMode ? 'root@challenge:~#' : 'hacker@kali:~$';
    setOutputLines(prev => [...prev, `${prompt} ${cmd}`, ...output]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    playClickSound();
    handleCommand(input);
    setInput('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (commandHistory.length > 0) {
              const newIndex = historyPointer === -1 
                  ? commandHistory.length - 1 
                  : Math.max(0, historyPointer - 1);
              setHistoryPointer(newIndex);
              setInput(commandHistory[newIndex]);
          }
      } 
      else if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (historyPointer !== -1) {
              const newIndex = historyPointer + 1;
              if (newIndex < commandHistory.length) {
                  setHistoryPointer(newIndex);
                  setInput(commandHistory[newIndex]);
              } else {
                  setHistoryPointer(-1);
                  setInput('');
              }
          }
      }
      else if (e.key === 'Tab') {
          e.preventDefault();
          if (suggestions.length > 0) {
              setInput(suggestions[0]);
              setShowSuggestions(false);
          }
      }
      else if (e.key === 'Escape') {
          setShowSuggestions(false);
      }
      else if (e.key !== 'Enter') {
          playTypingSound();
      }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    document.getElementById('term-input')?.focus();
  };

  const getPrompt = () => {
    return challengeMode ? 'root@challenge:~#' : 'hacker@kali:~$';
  };

  const getPromptColor = () => {
    return challengeMode ? 'text-red-500' : 'text-green-500';
  };

  return (
    <div className="w-full bg-black/95 border border-slate-700 rounded-lg overflow-hidden font-mono text-sm shadow-2xl flex flex-col h-[400px] backdrop-blur-md relative">
      <div className="bg-slate-900/90 border-b border-slate-700 px-4 py-2 flex items-center space-x-2 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-4 text-slate-400 text-xs flex items-center">
            <TerminalIcon className="w-3 h-3 mr-2" /> 
            {challengeMode ? 'root@challenge:~' : 'hacker@kali:~'}
        </span>
        {challengeMode && (
          <div className="ml-auto flex items-center space-x-2 text-xs">
            <Wifi className="w-3 h-3 text-green-500" />
            <Shield className="w-3 h-3 text-cyan-500" />
            <Cpu className="w-3 h-3 text-yellow-500" />
            <HardDrive className="w-3 h-3 text-blue-500" />
          </div>
        )}
      </div>
      
      <div 
        className="p-4 overflow-y-auto flex-grow space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent relative" 
        onClick={() => document.getElementById('term-input')?.focus()}
      >
        {outputLines.map((line, i) => (
          <div key={i} className={`${
            line.includes('@') && line.includes('#') || line.includes('@') && line.includes('$') 
              ? 'text-slate-300 mt-3 font-bold' 
              : 'text-cyan-400 ml-2 whitespace-pre-wrap'
          }`}>
            {line}
          </div>
        ))}
        
        <form onSubmit={handleSubmit} className="flex items-center text-slate-300 mt-2 relative">
          <span className={`mr-2 font-bold shrink-0 ${getPromptColor()}`}>
            {getPrompt()}
          </span>
          <input
            id="term-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none border-none text-slate-100 placeholder-slate-600"
            autoComplete="off"
            autoFocus
            placeholder={challengeMode ? "Enter command..." : "Type 'help' for commands"}
          />
        </form>

        {/* Command Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute bottom-16 left-4 right-4 bg-slate-800/95 border border-slate-600 rounded-lg p-2 backdrop-blur-sm z-10">
            <div className="text-xs text-slate-400 mb-1">Suggestions:</div>
            {suggestions.map((suggestion, i) => (
              <div
                key={i}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-2 py-1 text-sm text-cyan-400 hover:bg-slate-700 rounded cursor-pointer transition-colors"
              >
                {suggestion}
              </div>
            ))}
            <div className="text-xs text-slate-500 mt-1">Press Tab to autocomplete</div>
          </div>
        )}
        
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;