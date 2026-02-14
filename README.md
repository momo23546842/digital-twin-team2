# 🤖 Digital Twin Career Agent

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-blue)
![Database](https://img.shields.io/badge/Database-Neon%20Postgres-green)
![Groq](https://img.shields.io/badge/AI-Groq%20API-orange)

> **⚡ START HERE: Get running in 5 minutes with [QUICKSTART.md](./digital-twin/QUICKSTART.md)**

## 🔐 SECURITY WARNING - READ FIRST

**⚠️ CRITICAL**: A `.env.local` file with sensitive credentials was previously committed to this repository. **See [SECURITY.md](./SECURITY.md) for immediate action required.**

**If you cloned this repo before February 14, 2026:**
- DO NOT use the exposed credentials
- Generate NEW API keys and database credentials
- Follow the security checklist in [SECURITY.md](./SECURITY.md)

## 🎯 Overview

A production-ready AI-powered web application that enables users to have intelligent conversations with a personalized digital twin. Acts as an active digital representative combining:

- 🗣️ **Real-time AI Chat** via Groq (sub-second responses)
- 🎙️ **Voice Support** with Web Speech API
- 📝 **Persistent Memory** with Neon PostgreSQL
- 👨‍💼 **Admin Dashboard** for business intelligence
- 📞 **Lead Capture** for scalable outreach
- 🔐 **Secure Authentication** with JWT tokens

## 📋 Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Frontend** | Next.js | 16.1 |
| **Language** | TypeScript | 5 |
| **Styling** | Tailwind CSS | 4 |
| **AI Engine** | Groq API | Latest |
| **Database** | Neon PostgreSQL | Latest |
| **Auth** | JWT + PBKDF2 | Custom |
| **Voice** | Web Speech API | Native |
| **Deployment** | Vercel / Docker | Any |

## ⚡ Quick Start

**Get running in 3 commands:**

```bash
cd digital-twin
npm install
cp ../.env.example .env.local  # Copy template and add YOUR credentials
npm run dev
```

Then:
1. Open http://localhost:3000
2. Edit `.env.local` with your Groq API key + Database URL (see [QUICKSTART.md](./digital-twin/QUICKSTART.md))
3. Start chatting! 🎉

> 📖 **Full setup guide** → [QUICKSTART.md](./digital-twin/QUICKSTART.md)

## 🔧 Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org))
- **Neon Postgres Account** (Free tier available at [neon.tech](https://neon.tech))
- **Groq API Key** (Free tier available at [console.groq.com](https://console.groq.com))

## 📦 Installation

**Quick setup:**

```bash
cd digital-twin
npm install
```

**With startup script (recommended):**

```bash
# Windows (PowerShell)
.\startup.ps1

# macOS/Linux
bash startup.sh
```

## 🔧 Configuration

### 1. Get API Keys (Free!)

- **Groq**: https://console.groq.com (sign up → create API key)
- **Neon**: https://neon.tech (sign up → create project → copy connection string)

### 2. Create `.env.local`

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your credentials
```

Required environment variables:

```env
GROQ_API_KEY=gsk_your_key_here
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-in-production
```

> ⚠️ **NEVER commit `.env.local` to git!** It's already in `.gitignore`.

## 🚀 Running

```bash
npm run dev
```

Visit: http://localhost:3000

## ✨ Features

| Feature | Status | Details |
|---------|--------|---------|
| 💬 **Chat Interface** | ✅ | ChatGPT-style conversation UI |
| 🎙️ **Voice Input** | ✅ | Web Speech API with transcription |
| 💾 **Chat History** | ✅ | Persisted in Neon PostgreSQL |
| 📞 **Lead Capture** | ✅ | Contact form with email/phone |
| 📅 **Meeting Scheduling** | ✅ | Schedule calls and follow-ups |
| 👨‍💼 **Admin Dashboard** | ✅ | View all users, conversations, metrics |
| 🔐 **Authentication** | ✅ | JWT-based admin login |
| 📱 **Mobile Responsive** | ✅ | Works on all devices |
| 🎨 **Modern UI** | ✅ | Dark theme with professional design |

## 📂 Project Structure

```
digital-twin/
├── app/
│   ├── page.tsx                  ← Landing page
│   ├── chat/page.tsx              ← Chat interface
│   ├── admin/                     ← Admin dashboard & login
│   └── api/                       ← Backend API routes
│
├── src/
│   ├── components/                ← React components
│   │   ├── landing/Landing.tsx
│   │   ├── ChatPageComplete.tsx
│   │   ├── ChatInputEnhanced.tsx
│   │   ├── MessageListEnhanced.tsx
│   │   ├── ContactForm.tsx
│   │   └── AdminDashboard.tsx
│   ├── lib/                       ← Utilities
│   │   ├── schema.ts              ← DB schema
│   │   ├── database.ts            ← DB operations
│   │   ├── auth-utils.ts          ← Auth utilities
│   │   ├── postgres.ts            ← Connection pooling
│   │   └── ...
│   └── types/index.ts             ← TypeScript definitions
│
├── .env.local                     ← Your secrets (create this!)
├── .env.example                   ← Template
├── package.json
├── next.config.ts
├── tailwind.config.ts
├── Dockerfile                     ← Docker container config
├── docker-compose.yml             ← Local Postgres setup
├── QUICKSTART.md                  ← 5-minute guide
├── SETUP.md                       ← Full setup guide
├── PRODUCTION_README.md           ← Complete documentation
└── DEPLOYMENT_CHECKLIST.md        ← Pre-launch checklist
```

## 🔗 API Endpoints

### Public Endpoints
- `POST /api/chat` - Chat messages
- `POST /api/conversations` - Create conversation
- `POST /api/contacts` - Submit contact form
- `POST /api/meetings` - Schedule meeting
- `POST /api/analytics` - Track events

### Admin Endpoints (Protected with JWT)
- `GET /api/admin/dashboard` - Statistics
- `GET /api/admin/contacts` - View all contacts
- `GET /api/admin/conversations` - View conversations
- `POST /api/admin-auth` - Login
- `PATCH /api/admin-auth` - Create admin user

## 🗄️ Database Tables

- `conversations` - Chat sessions
- `messages` - Individual chat messages
- `contacts` - Lead information
- `meetings` - Meeting schedule
- `admin_users` - Admin accounts
- `voice_recordings` - Audio files
- `analytics` - Event tracking
- `embeddings` - Vector storage (for RAG)

## 🎨 Customization

### Change Landing Page
Edit: [`src/components/landing/Landing.tsx`](./digital-twin/src/components/landing/Landing.tsx)

### Update AI Personality
Edit: [`app/api/chat/route.ts`](./digital-twin/app/api/chat/route.ts)

### Modify Colors
Edit: [`app/globals.css`](./digital-twin/app/globals.css) and [`tailwind.config.ts`](./digital-twin/tailwind.config.ts)

## 🚀 Deployment

### Vercel (Easiest)
```bash
npm i -g vercel
vercel
# Follow prompts, set environment variables
```

### Docker
```bash
docker build -t digital-twin .
docker run -p 3000:3000 --env-file .env digital-twin
```

### Railway / Render / Others
Connect your GitHub repo and set environment variables in their dashboard.

See [DEPLOYMENT_CHECKLIST.md](./digital-twin/DEPLOYMENT_CHECKLIST.md) for detailed steps.

## 📊 Performance

- Landing: < 0.5s
- Chat UI: < 1s  
- AI Response: 1-3s (Groq)
- Database: < 100ms

## 🆘 Troubleshooting

### "Port 3000 in use"
```bash
npm run dev -- -p 3001
```

### "DATABASE_URL is missing"
Check that `.env.local` exists with your Neon connection string.

### "Groq API error"
Verify your API key at https://console.groq.com/keys

### "npm install fails"
```bash
npm cache clean --force && npm install
```

See [SETUP.md](./digital-twin/SETUP.md) for more troubleshooting.

## 📚 Documentation

| Document | Purpose |
|----------|---------|
| [SECURITY.md](./SECURITY.md) | Security notices and best practices |
| [QUICKSTART.md](./digital-twin/QUICKSTART.md) | 5-minute setup (START HERE!) |
| [SETUP.md](./digital-twin/SETUP.md) | Comprehensive setup guide |
| [PRODUCTION_README.md](./digital-twin/PRODUCTION_README.md) | Complete feature documentation |
| [DEPLOYMENT_CHECKLIST.md](./digital-twin/DEPLOYMENT_CHECKLIST.md) | Pre-launch checklist |
| [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) | Database migration |

## 🧪 Testing

### Test Features
1. **Landing**: Visit http://localhost:3000
2. **Chat**: Click "Start Chat" or go to http://localhost:3000/chat
3. **Voice**: Try recording in chat
4. **Contact**: Fill out the contact form
5. **Admin**: Login at http://localhost:3000/admin/login

### Create Admin User
```bash
curl -X PATCH http://localhost:3000/api/admin-auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password",
    "name": "Your Name"
  }'
```

## 🔐 Security

- ✅ JWT authentication (24-hour expiration)
- ✅ PBKDF2 password hashing (100k iterations)
- ✅ Environment variable secrets
- ✅ SQL parameterized queries
- ✅ CORS headers configured
- ✅ Connection pooling
- ✅ Admin token validation

**See [SECURITY.md](./SECURITY.md) for security best practices and incident response.**

## 📈 Roadmap

- ✅ Core chat interface
- ✅ Voice support
- ✅ Admin dashboard  
- ✅ Lead capture
- ⏳ Text-to-speech (ElevenLabs)
- ⏳ Calendar integration (Google/Outlook)
- ⏳ Email notifications (SendGrid)
- ⏳ Advanced analytics

## 🤝 Contributing

1. Create feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add your feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

MIT License

## 🎯 Next Steps

1. **Get running**: `npm install && npm run dev`
2. **Grab API keys**: Groq (free) and Neon (free)
3. **Configure**: Create `.env.local` from `.env.example`
4. **Customize**: Edit landing page and AI personality
5. **Deploy**: Follow [DEPLOYMENT_CHECKLIST.md](./digital-twin/DEPLOYMENT_CHECKLIST.md)

---

## ✅ Acceptance Criteria (From PRD)

* ✅ Core digital twin runs successfully
* ✅ Voice interaction enabled (Milestone 6)
* ✅ Database persistence with Neon Postgres (Milestone 3)
* ✅ Repository includes PRD, README, and agent documentation

---

**Team 2** | Digital Twin Project | 2026

**Questions?** Read [QUICKSTART.md](./digital-twin/QUICKSTART.md) for detailed guide!

Made with ❤️ for Digital Twin Team 2
