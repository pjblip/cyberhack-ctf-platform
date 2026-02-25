import { motion } from 'framer-motion';
import { Download, FileText, FileArchive, Image, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { User } from '../types';

interface FilesPageProps {
  currentUser: User | null;
  onNavigate: (page: string) => void;
}

interface ChallengeFile {
  id: string;
  name: string;
  description: string;
  size: string;
  icon: any;
  path: string;
  challenges: string[];
}

const FILES: ChallengeFile[] = [
  {
    id: 'challenge_html',
    name: 'challenge.html',
    description: 'Evidence file for Easy challenges (Q1-Q4)',
    size: '8 KB',
    icon: FileText,
    path: '/challenge-files/challenge.html',
    challenges: ['The Broken Code', 'Decode Me', 'Cyber Basics MCQ', 'Hidden In The Code']
  },
  {
    id: 'riya_backup',
    name: 'riya_phone_backup.zip',
    description: 'Corrupted backup file for Hard challenge - Case #CF-2024-089',
    size: '2 KB',
    icon: FileArchive,
    path: '/challenge-files/riya_phone_backup.zip',
    challenges: ['Case #CF-2024-089: The Vanishing']
  },
  {
    id: 'secret_image',
    name: 'secret_image.png',
    description: 'Image file for Medium forensics challenge',
    size: '156 KB',
    icon: Image,
    path: '/challenge-files/secret_image.png',
    challenges: ['Hidden In Plain Sight']
  }
];

const FilesPage: React.FC<FilesPageProps> = ({ currentUser, onNavigate }) => {
  const MotionDiv = motion.div as any;

  const handleDownload = (file: ChallengeFile) => {
    const link = document.createElement('a');
    link.href = file.path;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md p-8 text-center">
          <div className="text-red-500 mb-4">
            <FileText className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Access Denied</h2>
          <p className="text-slate-400 mb-6">You must be logged in to download challenge files.</p>
          <Button onClick={() => onNavigate('/login')} variant="primary">
            Login Now
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <div className="mb-8">
        <button 
          onClick={() => onNavigate('/challenges')}
          className="flex items-center text-slate-400 hover:text-cyan-400 transition-colors font-mono text-sm mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" /> BACK TO CHALLENGES
        </button>
        
        <div className="text-center">
          <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl font-black text-white mb-2 tracking-tight">
              CHALLENGE FILES
            </h1>
            <div className="h-1 w-full bg-gradient-to-r from-transparent via-cyan-500 to-transparent mb-4"></div>
          </MotionDiv>
          <p className="text-slate-400 max-w-2xl mx-auto font-mono text-sm">
            Download evidence files required for specific challenges. Make sure to read the challenge description before downloading.
          </p>
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {FILES.map((file, index) => {
          const Icon = file.icon;
          
          return (
            <MotionDiv
              key={file.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full flex flex-col hover:border-cyan-500/50 transition-all" hoverEffect>
                {/* File Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-20 h-20 bg-cyan-900/20 rounded-full flex items-center justify-center border border-cyan-500/30">
                    <Icon className="w-10 h-10 text-cyan-400" />
                  </div>
                </div>

                {/* File Info */}
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-white mb-2 text-center font-mono">
                    {file.name}
                  </h3>
                  
                  <p className="text-slate-400 text-sm mb-4 text-center">
                    {file.description}
                  </p>

                  <div className="bg-slate-900/50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between items-center text-xs font-mono mb-2">
                      <span className="text-slate-500">File Size:</span>
                      <span className="text-cyan-400">{file.size}</span>
                    </div>
                    <div className="text-xs text-slate-500 mb-2">Required for:</div>
                    <div className="space-y-1">
                      {file.challenges.map((challenge, idx) => (
                        <div key={idx} className="flex items-start text-xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-slate-400">{challenge}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Download Button */}
                <Button
                  onClick={() => handleDownload(file)}
                  variant="primary"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download File
                </Button>
              </Card>
            </MotionDiv>
          );
        })}
      </div>

      {/* Instructions */}
      <div className="mt-12 max-w-4xl mx-auto">
        <Card className="bg-yellow-900/10 border-yellow-500/30">
          <h3 className="text-yellow-400 font-bold mb-3 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            Important Instructions
          </h3>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              <span>Download files only when needed for specific challenges</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              <span>Some files may appear corrupted or broken — this is intentional!</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              <span>Use appropriate tools (hex editors, decoders, etc.) to analyze files</span>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-400 mr-2">•</span>
              <span>Read challenge descriptions carefully for hints on what tools to use</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

export default FilesPage;
