import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, ExternalLink, Terminal, Shield, Cpu, Zap, Search, Key, Database } from 'lucide-react';
import Button from '../components/ui/Button';

const Resources = () => {
    const categories = [
        {
            title: "CTF Fundamentals",
            icon: <Shield className="w-6 h-6 text-cyan-400" />,
            items: [
                {
                    name: "What is a CTF?",
                    desc: "Capture The Flag (CTF) is a cybersecurity competition where participants solve digital puzzles to find a hidden 'flag' (a specific string of text).",
                    link: "https://ctftime.org/ctf-wtf/"
                },
                {
                    name: "The Flag Format",
                    desc: "On this platform, all flags follow the format: flag{secret_text_here}. Always include the curly braces when submitting!",
                    link: null
                }
            ]
        },
        {
            title: "Essential Tools",
            icon: <Zap className="w-6 h-6 text-yellow-400" />,
            items: [
                {
                    name: "CyberChef",
                    desc: "The 'Cyber Swiss Army Knife'. Use it for decoding Base64, Hex, URL encoding, and hundreds of other formats.",
                    link: "https://gchq.github.io/CyberChef/"
                },
                {
                    name: "Online Hash Cracker",
                    desc: "If you find an MD5 or SHA hash, use tools like CrackStation to see if the plaintext has already been leaked.",
                    link: "https://crackstation.net/"
                },
                {
                    name: "Base64 Decoder",
                    desc: "Simple tool to convert Base64 strings back to readable text.",
                    link: "https://www.base64decode.org/"
                }
            ]
        },
        {
            title: "Technique: Web Recon",
            icon: <Search className="w-6 h-6 text-purple-400" />,
            items: [
                {
                    name: "Inspect Element (F12)",
                    desc: "Right-click any page and select 'Inspect'. Look at the 'Elements', 'Network', and 'Console' tabs for hidden clues.",
                    link: null
                },
                {
                    name: "Viewing Source Code",
                    desc: "Press Ctrl+U to see the raw HTML of a website. Developers often leave comments (<!-- flag{...} -->) by mistake.",
                    link: null
                }
            ]
        },
        {
            title: "Technique: Forensics",
            icon: <Cpu className="w-6 h-6 text-emerald-400" />,
            items: [
                {
                    name: "File Metadata",
                    desc: "Images and PDFs often contain 'EXIF' data about who created the file and where. Use an EXIF viewer to check.",
                    link: "https://exifinfo.org/"
                },
                {
                    name: "Strings Command",
                    desc: "Binary files (like .exe or .png) contain hidden text. Use the 'strings' tool to extract all human-readable text from any file.",
                    link: null
                }
            ]
        }
    ];

    return (
        <div className="max-w-6xl mx-auto py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-12 text-center"
            >
                <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-mono mb-6">
                    <BookOpen className="w-4 h-4 mr-2" />
                    SYSTEM_MANUAL_LOADED
                </div>
                <h1 className="text-5xl font-black text-white mb-4 tracking-tighter">TRAINING <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">RESOURCES</span></h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Welcome to the CyberHack academy. If you are new to Capture The Flag events, use the guides below to sharpen your skills and learn the tools of the trade.
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {categories.map((category, idx) => (
                    <motion.div
                        key={category.title}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="group relative p-8 bg-slate-900/40 border border-slate-800 rounded-3xl backdrop-blur-sm hover:border-cyan-500/30 transition-all duration-300"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

                        <div className="relative z-10">
                            <div className="flex items-center space-x-4 mb-8">
                                <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700 group-hover:border-cyan-500/30 transition-colors">
                                    {category.icon}
                                </div>
                                <h2 className="text-2xl font-bold text-white tracking-tight">{category.title}</h2>
                            </div>

                            <div className="space-y-6">
                                {category.items.map((item) => (
                                    <div key={item.name} className="border-l-2 border-slate-800 pl-4 group/item hover:border-cyan-500/50 transition-colors">
                                        <div className="flex items-center justify-between mb-1">
                                            <h3 className="font-bold text-slate-200 group-active:text-cyan-400 transition-colors">{item.name}</h3>
                                            {item.link && (
                                                <a
                                                    href={item.link}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-slate-500 hover:text-cyan-400 transition-colors"
                                                    title={`Visit ${item.name}`}
                                                >
                                                    <ExternalLink className="w-4 h-4" />
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-400 leading-relaxed">{item.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-16 p-8 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border border-cyan-500/20 rounded-3xl text-center"
            >
                <Terminal className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Ready to test your skills?</h3>
                <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                    Head over to the challenges section to start your first mission. Remember: Google is a hacker's best friend. If you get stuck, research the technique!
                </p>
                <Button
                    variant="primary"
                    onClick={() => window.location.hash = '#/challenges'}
                    className="px-8 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                >
                    Access Missions
                </Button>
            </motion.div>
        </div>
    );
};

export default Resources;
