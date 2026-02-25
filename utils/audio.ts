// A pure Web Audio API synthesizer for Cyberpunk UI sounds
// No external files required.

const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();

// Initialize mute state from local storage
let isMuted = localStorage.getItem('cyberhack_muted') === 'true';

export const toggleAudio = () => {
  isMuted = !isMuted;
  localStorage.setItem('cyberhack_muted', String(isMuted));
  return isMuted;
};

export const getAudioStatus = () => isMuted;

const playTone = (freq: number, type: OscillatorType, duration: number, vol: number = 0.1) => {
  if (isMuted) return;

  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }

  const oscillator = audioCtx.createOscillator();
  const gainNode = audioCtx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime);

  gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);

  oscillator.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  oscillator.start();
  oscillator.stop(audioCtx.currentTime + duration);
};

export const playHoverSound = () => {
  // High pitched short blip
  playTone(800, 'sine', 0.05, 0.03);
};

export const playClickSound = () => {
  // Deeper confirm sound
  playTone(400, 'square', 0.1, 0.05);
  setTimeout(() => playTone(600, 'sine', 0.1, 0.03), 50);
};

export const playSuccessSound = () => {
  // Rising arcade sound
  playTone(440, 'sine', 0.2, 0.1);
  setTimeout(() => playTone(554, 'sine', 0.2, 0.1), 100);
  setTimeout(() => playTone(659, 'sine', 0.4, 0.1), 200);
};

export const playErrorSound = () => {
  // Low buzz
  playTone(150, 'sawtooth', 0.3, 0.1);
  setTimeout(() => playTone(120, 'sawtooth', 0.3, 0.1), 150);
};

export const playTypingSound = () => {
  // Very quiet click
  // Randomize pitch slightly for realism
  const freq = 600 + Math.random() * 200;
  playTone(freq, 'triangle', 0.03, 0.02);
};