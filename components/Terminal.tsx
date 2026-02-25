import { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon } from 'lucide-react';
import { playTypingSound, playClickSound } from '../utils/audio';

interface TerminalProps {
    onNavigate?: (page: string) => void;
}

const Terminal: React.FC<TerminalProps> = ({ onNavigate }) => {
  const [outputLines, setOutputLines] = useState<string[]>(['Welcome to CyberHack OS v4.0.2', 'Type "help" for available commands.']);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyPointer, setHistoryPointer] = useState(-1);
  
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [outputLines]);

  const handleCommand = (cmd: string) => {
    const cleanCmd = cmd.trim().toLowerCase();
    
    // Update Command History
    let newHistory = commandHistory;
    if (cmd.trim()) {
        newHistory = [...commandHistory, cmd];
        setCommandHistory(newHistory);
        setHistoryPointer(-1); // Reset history pointer
    }

    let output: string[] = [];
    const nav = (page: string, message: string) => {
        output.push(message);
        if(onNavigate) setTimeout(() => onNavigate(page), 800);
    };

    if (!cleanCmd) return;

    switch (cleanCmd) {
      case 'help':
        output = [
            '  help             : Display this help menu',
            '  history          : Show command history',
            '  clear            : Clear terminal display',
            '  status           : Check system status',
            '  whoami           : Current user info',
            '  login            : Navigate to Login',
            '  open cases       : Go to Challenges',
            '  open team        : Go to Team page',
            '  open home        : Go to Home'
        ];
        break;
      
      case 'history':
        output = newHistory.map((c, i) => `  ${i + 1}  ${c}`);
        break;

      case 'status':
        output = [
            'SYSTEM INTEGRITY: 100%', 
            'CONNECTION: ENCRYPTED (TLS 1.3)', 
            'FIREWALL: ACTIVE', 
            'THREAT LEVEL: LOW'
        ];
        break;
        
      case 'whoami':
        output = ['uid=1000(guest) gid=1000(guest) groups=1000(guest)'];
        break;
        
      case 'clear':
        setOutputLines([]);
        return; 
        
      case 'open cases':
      case 'open challenges':
        nav('cases', '>> ACCESSING MISSION CONTROL...');
        break;
        
      case 'open team':
        nav('team', '>> DECRYPTING PERSONNEL FILES...');
        break;

      case 'open home':
        nav('home', '>> RETURNING TO ROOT...');
        break;
        
      case 'login':
      case 'signin':
        nav('login', '>> INITIATING AUTH PROTOCOLS...');
        break;
      
      case 'sudo':
      case 'sudo su':
        output = ['Permission denied: user is not in the sudoers file. This incident will be reported.'];
        break;
      case 'ls':
        output = ['home  bin  etc  usr  var  tmp  challenges.db'];
        break;

      default:
        output = [`Command not found: ${cleanCmd}`, 'Type "help" for a list of commands.'];
    }

    setOutputLines(prev => [...prev, `root@kali:~# ${cmd}`, ...output]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input) return;
    playClickSound();
    handleCommand(input);
    setInput('');
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
      else if (e.key !== 'Enter') {
          playTypingSound();
      }
  };

  return (
    <div className="w-full bg-black/90 border border-slate-700 rounded-lg overflow-hidden font-mono text-sm shadow-2xl flex flex-col h-[320px] backdrop-blur-md">
      <div className="bg-slate-900/90 border-b border-slate-700 px-4 py-2 flex items-center space-x-2 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <div className="w-3 h-3 rounded-full bg-yellow-500" />
        <div className="w-3 h-3 rounded-full bg-green-500" />
        <span className="ml-4 text-slate-400 text-xs flex items-center">
            <TerminalIcon className="w-3 h-3 mr-2" /> root@kali:~
        </span>
      </div>
      <div 
        className="p-4 overflow-y-auto flex-grow space-y-1 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent" 
        onClick={() => document.getElementById('term-input')?.focus()}
      >
        {outputLines.map((line, i) => (
          <div key={i} className={`${line.startsWith('root@kali') ? 'text-slate-300 mt-3 font-bold' : 'text-cyan-400 ml-2 whitespace-pre-wrap'}`}>
            {line}
          </div>
        ))}
        <form onSubmit={handleSubmit} className="flex items-center text-slate-300 mt-2">
          <span className="mr-2 text-green-500 font-bold shrink-0">root@kali:~#</span>
          <input
            id="term-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow bg-transparent outline-none border-none text-slate-100 placeholder-slate-600"
            autoComplete="off"
            autoFocus
          />
        </form>
        <div ref={endRef} />
      </div>
    </div>
  );
};

export default Terminal;