import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertCircle, CheckCircle, Lock } from 'lucide-react';
import { db } from '../services/db';
import { User } from '../types';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import MatrixBackground from '../components/MatrixBackground';
import Portal from '../components/Portal';

interface AuthPageProps {
    mode: 'login' | 'signup';
    onLogin: (user: User) => void;
    onNavigate: (page: string) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ mode, onLogin, onNavigate }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // ----------------------------------------------------------------
    // PASSWORD STRENGTH LOGIC
    // ----------------------------------------------------------------
    const getPasswordStrength = (pass: string) => {
        if (!pass) return 0;
        if (pass.length < 4) return 1; // Lowered for demo event simplicity
        let score = 1;
        if (pass.length >= 8) score++;
        if (/[A-Z]/.test(pass)) score++;
        if (/[0-9]/.test(pass)) score++;
        if (/[^A-Za-z0-9]/.test(pass)) score++;
        return Math.min(score, 5);
    };

    const strength = getPasswordStrength(password);

    const getStrengthColor = (s: number) => {
        if (s <= 1) return 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]';
        if (s === 2) return 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]';
        if (s === 3) return 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]';
        if (s === 4) return 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]';
        return 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            if (mode === 'login') {
                const { user, error } = await db.auth.login(email, password);
                if (error) throw new Error(error);
                if (user) onLogin(user);
            } else {
                if (!username) throw new Error("Username required");
                const { user, error } = await db.auth.signup(email, password, username);
                if (error) throw new Error(error);
                if (user) onLogin(user);
            }
        } catch (err: any) {
            let message = "Authentication Failed";
            if (typeof err === 'string') message = err;
            else if (err.response?.data?.message) message = Array.isArray(err.response.data.message) ? err.response.data.message[0] : err.response.data.message;
            else if (err.message) message = err.message;
            else if (err.error) message = typeof err.error === 'string' ? err.error : JSON.stringify(err.error);

            // Final safety check
            if (typeof message === 'object') message = JSON.stringify(message);

            setError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Portal>
            <MatrixBackground />

            {/* Full-screen backdrop overlay */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    padding: '1rem'
                }}
            >
                {/* Modal container with max-height for scrolling */}
                <div
                    style={{
                        width: '100%',
                        maxWidth: '28rem',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}
                >
                    <div className="text-center mb-8">
                        <div className="inline-block p-4 rounded-full bg-slate-900 border border-cyan-500/30 mb-4 shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            <Shield className="w-10 h-10 text-cyan-400" />
                        </div>
                        <h2 className="text-3xl font-extrabold text-white tracking-tight">
                            {mode === 'login' ? 'IDENTITY VERIFICATION' : 'NEW AGENT REGISTRATION'}
                        </h2>
                        <p className="text-slate-400 mt-2 font-mono text-sm">
                            {mode === 'login' ? 'Enter credentials to access mainframe.' : 'Create secure profile to begin operations.'}
                        </p>
                    </div>

                    <Card className="border-t-4 border-t-cyan-500 bg-slate-900/95 backdrop-blur-xl">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {mode === 'signup' && (
                                <Input
                                    label="Agent Alias"
                                    placeholder="CyberNinja"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    required
                                />
                            )}

                            <Input
                                label="Secure Email"
                                type="email"
                                placeholder="agent@cyberhack.net"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                            />

                            <div>
                                <Input
                                    label="Access Key"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                />
                                {mode === 'signup' && password.length > 0 && (
                                    <div className="mt-2 flex items-center space-x-1">
                                        <div className="flex-grow h-1 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full transition-all duration-500 ${getStrengthColor(strength)}`}
                                                style={{ width: `${(strength / 5) * 100}%` }}
                                            />
                                        </div>
                                        <span className="text-xs text-slate-500 font-mono w-16 text-right">
                                            {strength < 3 ? 'WEAK' : strength < 5 ? 'GOOD' : 'SECURE'}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="bg-red-900/20 border border-red-500/30 rounded p-3 flex items-center text-red-400 text-sm"
                                    >
                                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <Button
                                type="submit"
                                className="w-full relative overflow-hidden"
                                disabled={isLoading}
                                icon={isLoading ? undefined : (mode === 'login' ? <Lock className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />)}
                            >
                                {isLoading ? (
                                    <span className="animate-pulse">AUTHENTICATING...</span>
                                ) : (
                                    mode === 'login' ? 'ACCESS SYSTEM' : 'INITIALIZE PROFILE'
                                )}
                            </Button>
                        </form>

                        <div className="mt-6 pt-6 border-t border-slate-800 text-center">
                            <p className="text-slate-400 text-sm">
                                {mode === 'login' ? "No clearance?" : "Already verified?"}
                                <button
                                    onClick={() => onNavigate(mode === 'login' ? 'signup' : 'login')}
                                    className="ml-2 text-cyan-400 hover:text-cyan-300 font-bold hover:underline"
                                >
                                    {mode === 'login' ? "Request Access" : "Login"}
                                </button>
                            </p>
                        </div>
                    </Card>
                </div>
            </div>
        </Portal>
    );
};

export default AuthPage;