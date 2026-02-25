export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin?: boolean;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  hint?: string; // Legacy single hint
  hints?: string[]; // New: array of hints
  flag?: string; // Optional because in Real Mode, the client won't receive this
  estimatedTime: string;
  duration: number; // Duration in seconds
  fileUrl?: string; // New field for attachments
  category?: string; // Challenge category (web, crypto, forensics, osint, etc.)
}

export interface Stats {
  correct: number;
  total: number;
  points: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Lucide icon name or emoji
  condition: (stats: Stats) => boolean;
}