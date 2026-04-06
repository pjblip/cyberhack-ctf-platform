# 🛡️ CyberHack CTF Platform

<p align="center">
  <img src="public/logo.png" alt="CyberHack Logo" width="120" />
</p>

<p align="center">
  A full-stack Capture The Flag (CTF) competition platform built for cybersecurity events.
  Features real-time leaderboards, challenge management, admin panel, and participant tracking.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/NestJS-Backend-red?logo=nestjs" />
  <img src="https://img.shields.io/badge/TailwindCSS-3-cyan?logo=tailwindcss" />
  <img src="https://img.shields.io/badge/SQLite-Database-lightgrey?logo=sqlite" />
  <img src="https://img.shields.io/badge/Vite-Build-purple?logo=vite" />
</p>

---

## 📸 Screenshots

> _Add screenshots of your platform here (e.g., the challenges page, leaderboard, admin panel)._

---

## ✨ Features

- 🏆 **Real-time Leaderboard** — Live score updates using Server-Sent Events (SSE)
- 🧩 **Challenge Management** — Multiple categories (Web, Crypto, Forensics, Ransomware, etc.)
- 🔐 **Authentication System** — User registration, login, and session management
- 👤 **Admin Panel** — Full control over challenges, users, scores, and event settings
- 📊 **Activity Tracking** — Tracks all flag submissions and participant activity
- 🌐 **Local Network Support** — Designed to run on a LAN for in-person events
- 📱 **Responsive UI** — Works on desktop and mobile browsers
- 🎨 **Dark Hacker Theme** — Custom cyberpunk-inspired design

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite |
| **Styling** | TailwindCSS 3, Framer Motion |
| **Backend** | NestJS (Node.js) |
| **Database** | SQLite (via TypeORM) |
| **Real-time** | Server-Sent Events (SSE) |
| **Icons** | Lucide React |

---

## 📁 Project Structure

```
cyberhack-ctf-platform/
├── backend/                  # NestJS API server
│   └── src/
│       ├── auth/             # Authentication (JWT)
│       ├── challenges/       # Challenge CRUD & flag validation
│       ├── leaderboard/      # Score calculation & SSE
│       ├── users/            # User management
│       ├── admin/            # Admin-only routes
│       ├── activity/         # Submission activity logs
│       └── events/           # SSE event broadcasting
├── components/               # Reusable React components
├── pages/                    # Page-level components (Home, Challenges, Leaderboard)
├── services/                 # API service layer
├── utils/                    # Helper utilities
├── types.ts                  # Shared TypeScript types
├── constants.ts              # App-wide constants
└── App.tsx                   # Root app & routing
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm v9+

### 1. Clone the Repository

```bash
git clone https://github.com/pjblip/cyberhack-ctf-platform.git
cd cyberhack-ctf-platform
```

### 2. Set Up the Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` folder:

```env
PORT=3000
JWT_SECRET=your_super_secret_key_here
NODE_ENV=development
```

Start the backend server:

```bash
npm run start:dev
```

The API will be available at `http://localhost:3000`

### 3. Set Up the Frontend

Open a new terminal in the project root:

```bash
npm install
npm run dev
```

The frontend will be available at `http://localhost:5173`

### 4. (Optional) Run on Local Network

To make the platform accessible to participants on the same Wi-Fi/LAN:

```bash
npm run host
```

Share your machine's local IP (e.g., `http://192.168.1.x:5173`) with participants.

---

## 🔑 Default Admin Access

After first run, use the admin panel at `/admin` to:
- Add/edit/delete challenges
- Manage registered users
- Monitor live submissions
- Reset scores if needed

> ⚠️ **Change the default admin credentials immediately before hosting an event.**

---

## 🧩 Challenge Categories

The platform supports the following challenge types out of the box:

| Category | Description |
|----------|-------------|
| 🌐 Web | SQL Injection, XSS, CSRF, etc. |
| 🔐 Cryptography | Caesar, Base64, RSA, hashing |
| 🔍 Forensics | File analysis, steganography |
| 💀 Ransomware | Malware analysis challenges |
| 🔢 Miscellaneous | Logic, OSINT, trivia |

---

## 📊 Architecture Overview

```
┌─────────────────────┐        HTTP/SSE       ┌──────────────────────┐
│   React Frontend    │ ◄──────────────────► │   NestJS Backend     │
│  (Vite + TS)        │                       │  (REST API + SSE)    │
└─────────────────────┘                       └──────────┬───────────┘
                                                         │
                                                    TypeORM│
                                                         ▼
                                              ┌──────────────────────┐
                                              │    SQLite Database   │
                                              └──────────────────────┘
```

---

## 🛠️ Scripts Reference

| Script | Description |
|--------|-------------|
| `npm run dev` | Start frontend dev server |
| `npm run host` | Start frontend on local network |
| `npm run build` | Build frontend for production |
| `cd backend && npm run start:dev` | Start backend in dev mode |
| `backup-database.bat / .sh` | Backup the SQLite database |
| `export-results.bat / .sh` | Export competition results to CSV |

---

## 🏆 Event Results

This platform was used to host **CyberHack CTF** — a live cybersecurity competition.

> _Add your event date, number of participants, top teams, and any highlights here._

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve this platform:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add my feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📜 License

This project is licensed under the **MIT License** — feel free to use, modify, and distribute.

---

## 👨‍💻 Author

**Pushkar** — Built with ❤️ for the cybersecurity community.

- GitHub: [@pjblip](https://github.com/pjblip)

---

<p align="center">Made for hackers, by a hacker 🔓</p>
