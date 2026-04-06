# 🎯 CyberHack CTF Platform - Gandhinagar University Tech Xtreme 2026

A modern, real-time Capture The Flag (CTF) platform built with React, TypeScript, and NestJS.

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- SQLite3

### Installation

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

### Running the Platform

```bash
# Terminal 1 - Start Backend
cd backend
npm run start:dev

# Terminal 2 - Start Frontend
npm run dev
```

**Access the platform:** http://localhost:5173

---

## 📊 Event Information

**Event:** Gandhinagar University - Tech Xtreme 2026  
**Date:** March 18, 2026  
**Duration:** 60 minutes  
**Total Challenges:** 10  
**Maximum Points:** 500

---

## 🎯 Challenge Overview

### 🟢 Easy Challenges (5 × 10 points = 50 points)
1. **Web Recon** - Analyze HTTP headers
2. **Base64 Decoder** - Decode Base64 string
3. **Hidden Comments** - Find flag in HTML comments
4. **Robots Protocol** - Check robots.txt file
5. **Cookie Tampering** - Modify cookie values

### 🟡 Medium Challenges (4 × 50 points = 200 points)
1. **SQL Injection 101** - Bypass login (Interactive HTML)
2. **Command Injection** - Inject shell commands (Interactive HTML)
3. **Weak RSA** - Factor and decrypt RSA
4. **Image Steganography** - Extract hidden data (Interactive HTML)

### 🔴 Hard Challenge (1 × 250 points = 250 points)
1. **Ransomware Reversal** - Reverse XOR encryption (Programming)

---

## 🔑 Default Credentials

### Admin Account
- **Username:** `SystemAdmin`
- **Password:** `admin`

### Test User (Optional)
Create your own account via the registration page.

---

## 📁 Project Structure

```
cyberhack-ctf-platform/
├── backend/                    # NestJS backend
│   ├── src/
│   │   ├── admin/             # Admin management
│   │   ├── auth/              # Authentication
│   │   ├── challenges/        # Challenge logic
│   │   ├── database/          # Database entities
│   │   ├── events/            # Real-time events
│   │   ├── leaderboard/       # Scoring system
│   │   └── users/             # User management
│   ├── cyberhack.db           # SQLite database
│   └── package.json
│
├── components/                 # React components
│   ├── ui/                    # UI components
│   ├── Navbar.tsx
│   ├── Terminal.tsx
│   ├── HintSystem.tsx
│   └── ...
│
├── pages/                      # Page components
│   ├── Home.tsx
│   ├── Auth.tsx
│   ├── Challenges.tsx
│   ├── ChallengeDetail.tsx
│   └── Admin.tsx
│
├── public/
│   └── challenge-files/       # Downloadable challenge files
│       ├── sql-injection-login.html
│       ├── command-injection.html
│       ├── image-steganography.html
│       └── weak-rsa-challenge.txt
│
├── services/                   # API services
├── docs/                       # Documentation
├── README.md                   # This file
└── CHALLENGE_SOLUTIONS.md      # Complete walkthrough
```

---

## 🎮 Features

### For Players
- ✅ Real-time leaderboard
- ✅ Live activity feed
- ✅ Challenge timer system
- ✅ Hint system (with point cost)
- ✅ Personal statistics dashboard
- ✅ Downloadable challenge files
- ✅ Interactive challenges (HTML/JS)

### For Admins
- ✅ User management
- ✅ Challenge management
- ✅ Event control (start/stop/reset)
- ✅ Announcement system
- ✅ Activity logs
- ✅ Real-time monitoring
- ✅ Ban/unban users

---

## 🛠️ Technology Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for styling
- **Lucide React** for icons
- **Axios** for API calls

### Backend
- **NestJS** framework
- **TypeORM** for database
- **SQLite** database
- **JWT** authentication
- **bcrypt** for password hashing
- **Server-Sent Events** for real-time updates

---

## 📚 Documentation

- **Challenge Solutions:** See `CHALLENGE_SOLUTIONS.md` for complete walkthrough
- **User FAQ:** See `docs/USER_FAQ.md`
- **Setup Guides:** See `docs/setup-guides/`

---

## 🔧 Configuration

### Environment Variables

**Frontend (`.env.local`):**
```env
VITE_API_URL=http://localhost:3000
```

**Backend (`backend/.env`):**
```env
JWT_SECRET=your-secret-key-here
PORT=3000
```

---

## 🗄️ Database

The platform uses SQLite with the following main tables:
- `users` - User accounts
- `challenges` - Challenge definitions
- `solves` - Completed challenges
- `submissions` - All flag attempts
- `activity_log` - Platform activity
- `announcements` - Admin announcements

**Database location:** `backend/cyberhack.db`

---

## 🎯 Admin Panel

Access: http://localhost:5173 → Login as admin → Click "Admin Panel"

### Admin Features:
- **Users Tab:** View, ban, delete users
- **Challenges Tab:** Manage challenges
- **Event Control:** Start/stop/reset event
- **Announcements:** Broadcast messages
- **Logs:** View activity logs
- **Analytics:** Platform statistics

---

## 🚨 Troubleshooting

### Backend won't start
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
npm run start:dev
```

### Frontend won't start
```bash
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### Database issues
```bash
cd backend
# Backup current database
cp cyberhack.db cyberhack.db.backup
# Reset database (will lose data)
rm cyberhack.db
npm run start:dev  # Will recreate database
```

### Port already in use
```bash
# Kill process on port 3000 (backend)
npx kill-port 3000

# Kill process on port 5173 (frontend)
npx kill-port 5173
```

---

## 📝 Development

### Adding New Challenges

1. **Add to database:**
```sql
INSERT INTO challenges (id, title, description, difficulty, points, flag, file_url, duration, hints)
VALUES (
    'uuid-here',
    'Challenge Title',
    'Challenge description',
    'medium',
    50,
    'flag{your_flag_here}',
    '/challenge-files/your-file.html',
    300,
    json_array('hint1', 'hint2', 'hint3', 'hint4')
);
```

2. **Create challenge file** in `public/challenge-files/`

3. **Test the challenge** thoroughly

### Running Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

---

## 🤝 Contributing

This is an educational CTF platform for Gandhinagar University. For improvements or bug fixes:

1. Test your changes thoroughly
2. Ensure all challenges work correctly
3. Update documentation if needed
4. Test with multiple users

---

## 📄 License

Educational use for Gandhinagar University - Tech Xtreme 2026

---

## 🎓 Credits

**Developed for:** Gandhinagar University  
**Event:** Tech Xtreme 2026  
**Platform:** CyberHack CTF  

---

## 📞 Support

For technical issues during the event:
- Check `docs/USER_FAQ.md`
- Contact event administrators
- Check browser console for errors

---

## 🎉 Event Day Checklist

### Before Event:
- [ ] Start backend server
- [ ] Start frontend server
- [ ] Test admin login
- [ ] Verify all challenges work
- [ ] Test flag submissions
- [ ] Check leaderboard updates
- [ ] Prepare announcements

### During Event:
- [ ] Monitor real-time activity
- [ ] Watch for technical issues
- [ ] Respond to questions (no spoilers!)
- [ ] Track completion rates
- [ ] Manage announcements

### After Event:
- [ ] Export leaderboard
- [ ] Save activity logs
- [ ] Backup database
- [ ] Gather feedback
- [ ] Prepare awards

---

**🚀 Ready to hack! Good luck to all participants!**
