import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../database/entities/user.entity';
import { Challenge } from '../database/entities/challenge.entity';

@Injectable()
export class AdminSeedService implements OnModuleInit {
    private readonly logger = new Logger(AdminSeedService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Challenge)
        private readonly challengeRepo: Repository<Challenge>,
    ) { }

    async onModuleInit() {
        await this.seedAdminUser();
        await this.seedChallenges();
    }

    private async seedAdminUser() {
        const adminExists = await this.userRepo.findOne({ where: { isAdmin: true } });
        if (adminExists) {
            this.logger.log('Admin user already exists.');
            return;
        }

        this.logger.log('No admin user found. Creating default admin...');
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash('admin', salt);

        const admin = this.userRepo.create({
            username: 'SystemAdmin',
            email: 'admin@ctf.net',
            passwordHash: hashedPassword,
            isAdmin: true,
            points: 0,
            banned: false,
        });

        try {
            await this.userRepo.save(admin);
            this.logger.log('Default admin user created successfully.');
            this.logger.log('Credentials: SystemAdmin / admin');
        } catch (error) {
            this.logger.error('Failed to create admin user:', error);
        }
    }

    private async seedChallenges() {
        const count = await this.challengeRepo.count();
        if (count > 0) {
            this.logger.log(`Challenges already exist (${count} found). Skipping challenge seed.`);
            return;
        }

        this.logger.log('No challenges found. Seeding default training missions...');

        const defaultChallenges = [
            // 5 Easy (Recruit) - 3 minutes (180s)
            { id: uuidv4(), title: 'Web Recon', description: 'Analyze the HTTP headers of the target server.', difficulty: 'easy', points: 10, flag: 'flag{w3b_r3c0n_succ3ss}', isActive: true, duration: 180, fileUrl: '/challenges/web-recon.txt' },
            { id: uuidv4(), title: 'Base64 Decoder', description: 'Decode this hidden message: ZmxhZ3tiYXNlNjRfaXNfZWFzeX0=', difficulty: 'easy', points: 10, flag: 'flag{base64_is_easy}', isActive: true, duration: 180, fileUrl: '/challenges/base64-decoder.txt' },
            { id: uuidv4(), title: 'Hidden Comments', description: 'Inspect the page source to find the developer\'s secret comment.', difficulty: 'easy', points: 10, flag: 'flag{h1dd3n_c0mm3nts_s33n}', isActive: true, duration: 180, fileUrl: '/challenges/hidden-comments.html' },
            { id: uuidv4(), title: 'Robots Protocol', description: 'Check where bots are not allowed to go.', difficulty: 'easy', points: 10, flag: 'flag{r0b0ts_txt_r34d}', isActive: true, duration: 180, fileUrl: '/challenge-files/robots-protocol.html' },
            { id: uuidv4(), title: 'Cookie Tampering', description: 'Change your role from user to admin in the cookie.', difficulty: 'easy', points: 10, flag: 'flag{c00k13_m0nst3r}', isActive: true, duration: 180, fileUrl: '/challenge-files/cookie-tampering.html' },

            // 4 Medium (Operative)
            { id: uuidv4(), title: 'SQL Injection 101', description: 'Bypass the login prompt using classic SQL injection.', difficulty: 'medium', points: 50, flag: 'flag{sql1_byp4ss_m4st3r}', isActive: true },
            { id: uuidv4(), title: 'Directory Traversal', description: 'Read the /etc/passwd file from the server.', difficulty: 'medium', points: 50, flag: 'flag{p4th_tr4v3rs4l_w1n}', isActive: true },
            { id: uuidv4(), title: 'Weak RSA', description: 'Crack the cipher given a very small N and e.', difficulty: 'medium', points: 50, flag: 'flag{sm4ll_rs4_cr4ck3d}', isActive: true },
            { id: uuidv4(), title: 'Buffer Overflow Entry', description: 'Overwrite the return address to call the flag function.', difficulty: 'medium', points: 50, flag: 'flag{b0f_c0ntr0ll3d}', isActive: true },

            // 1 Hard (Black Ops)
            { 
                id: uuidv4(), 
                title: 'Ransomware Reversal', 
                description: 'DarkNet ransomware encrypted our database. We recovered the encryption script from memory. Analyze the multi-layer encryption algorithm and write a decryption script to recover the flag.', 
                difficulty: 'hard', 
                points: 250, 
                flag: 'flag{r3v3rs3_3ng1n33r1ng_m4st3r}', 
                isActive: true, 
                duration: 900, 
                fileUrl: '/challenge-files/ransomware-reversal.html',
                hints: [
                    'The encryption uses 3 layers. You must reverse them in opposite order: Layer 3 → Layer 2 → Layer 1',
                    'XOR is its own inverse. The key "D4RKN3T" is visible in the encryption script. Use it to undo both XOR operations.',
                    'Layer 2 uses addition (byte + position) mod 256. Reverse it with subtraction: (byte - position) mod 256. In Python: (byte - i) % 256'
                ],
                hintCosts: [5, 10, 15],
                estimatedTime: 25
            },

        ];

        try {
            await this.challengeRepo.save(defaultChallenges);
            this.logger.log('10 default challenges seeded successfully.');
        } catch (error) {
            this.logger.error('Failed to seed challenges', error);
        }
    }
}
