# 🤖 Digital Twin Career Agent

> A sophisticated AI-powered career intelligence engine that embodies your professional persona. Chat, speak, and schedule meetings with your Digital Twin.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC?style=flat-square&logo=tailwind-css)
![Groq](https://img.shields.io/badge/Groq-LLM-green?style=flat-square)
![Neon](https://img.shields.io/badge/Neon-Postgres-336791?style=flat-square)

## ✨ Features

- **🗣️ AI Chat** - Natural conversations powered by Groq LLM
- **🎤 Voice Support** - Speak to your Digital Twin using Web Speech API
- **📊 Conversation History** - All chats stored in Postgres
- **👥 Lead Capture** - Collect contact information from visitors
- **📅 Meeting Scheduling** - Built-in booking system
- **📊 Admin Dashboard** - View all leads, conversations, and analytics
- **🔐 Admin Authentication** - Secure access to dashboards
- **📱 Mobile Optimized** - Fully responsive design
- **🎨 Modern UI** - Clean, professional, production-ready design
- **⚡ Fast Inference** - Sub-second response times with Groq
- **🗄️ Persistent Storage** - All data saved in Postgres

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────┐
│         Landing Page / Chat Interface            │
└──────────────────┬──────────────────────────────┘
                   │
     ┌─────────────┼─────────────┐
     │             │             │
┌────▼────┐ ┌─────▼────┐ ┌──────▼──────┐
│ Chat    │ │ Contact  │ │ Meetings     │
│ API     │ │ Capture  │ │ Scheduler    │
└────┬────┘ └─────┬────┘ └──────┬──────┘
     │             │             │
     └─────────────┼─────────────┘
                   │
          ┌────────▼────────┐
          │  Postgres DB    │
          │  (Conversations,│
          │   Contacts,     │
          │   Meetings)     │
          └─────────────────┘

┌─────────────────────────────────────────────────┐
│     Admin Dashboard (Protected)                  │
├─────────────────────────────────────────────────┤
│ • View all leads                                │
│ • Manage conversations                          │
│ • Schedule meetings                             │
│ • Analytics & insights                          │
└─────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Neon Postgres (free at [neon.tech](https://neon.tech))
- Groq API key (free at [console.groq.com](https://console.groq.com))

### 1. Clone & Setup

```bash
# Navigate to the project
cd digital-twin

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
```

### 2. Configure Environment

Edit `.env.local`:
```env
GROQ_API_KEY=your-key-from-groq
DATABASE_URL=your-neon-postgres-url
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-secret-key
```

### 3. Create Admin User

```bash
curl -X PATCH http://localhost:3000/api/admin-auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure-password",
    "name": "Admin User"
  }'
```

### 4. Start Development

```bash
npm run dev
```

Visit:
- 🏠 Landing: http://localhost:3000
- 💬 Chat: http://localhost:3000/chat
- 🔐 Admin: http://localhost:3000/admin/login (admin@example.com)

## 📁 Project Structure

```
digital-twin/
├── app/                              # Next.js app directory
│   ├── api/
│   │   ├── chat/route.ts            # AI chat endpoint
│   │   ├── conversations/            # Conversation CRUD
│   │   ├── contacts/                 # Lead capture
│   │   ├── meetings/                 # Scheduling
│   │   ├── analytics/                # Event tracking
│   │   └── admin/                    # Protected endpoints
│   ├── page.tsx                      # Landing page
│   ├── chat/                         # Chat page
│   ├── admin/                        # Admin dashboard
│   └── globals.css                   # Global styles
│
├── src/
│   ├── components/
│   │   ├── landing/Landing.tsx       # Landing page
│   │   ├── ChatPageComplete.tsx      # Main chat UI
│   │   ├── ChatInputEnhanced.tsx     # Chat input w/ voice
│   │   ├── MessageListEnhanced.tsx   # Message display
│   │   ├── ContactForm.tsx           # Lead form
│   │   └── AdminDashboard.tsx        # Admin UI
│   │
│   ├── lib/
│   │   ├── postgres.ts               # DB connection
│   │   ├── schema.ts                 # DB schema
│   │   ├── database.ts               # DB queries
│   │   ├── auth-utils.ts             # Auth helpers
│   │   └── groq.ts                   # Groq API client
│   │
│   └── types/
│       └── index.ts                  # TypeScript definitions
│
├── SETUP.md                          # Detailed setup guide
├── docker-compose.yml                # Local Postgres
├── Dockerfile                        # Production build
├── package.json                      # Dependencies
└── tailwind.config.ts                # Tailwind config
```

## 🔌 API Endpoints

### Public Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Send message to AI |
| `POST` | `/api/conversations` | Create conversation |
| `GET` | `/api/conversations` | List conversations |
| `POST` | `/api/contacts` | Submit contact form |
| `POST` | `/api/meetings` | Schedule meeting |
| `POST` | `/api/analytics` | Track event |

### Admin Endpoints (Requires Bearer token)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin-auth` | Login |
| `GET` | `/api/admin/dashboard` | Dashboard stats |
| `GET` | `/api/admin/contacts` | List all contacts |
| `PUT` | `/api/admin/contacts` | Update contact |
| `GET` | `/api/admin/conversations` | List conversations |

## 🎨 Customization

### Personalization

Edit your profile information in:
- `src/components/landing/Landing.tsx` - About section
- `app/api/chat/route.ts` - AI system prompt
- `tailwind.config.ts` - Colors and branding

### Database Fields

Extend `src/types/index.ts` for custom fields

## 🐳 Docker & Deployment

### Docker Build

```bash
# Build image
docker build -t digital-twin .

# Run container
docker run -p 3000:3000 --env-file .env digital-twin
```

### Deploy to Vercel

```bash
npm i -g vercel
vercel --prod
```

Set environment variables in Vercel dashboard

### Deploy to Railway

```bash
# Push to GitHub
git push

# Connect in Railway dashboard
# Set environment variables
# Deploy
```

## 📊 Database Schema

### Conversations Table
```sql
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  title TEXT,
  status TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT REFERENCES conversations(id),
  role TEXT,
  content TEXT,
  voice_url TEXT,
  created_at TIMESTAMP
);
```

### Contacts Table
```sql
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  email TEXT,
  name TEXT,
  phone TEXT,
  company TEXT,
  title TEXT,
  message TEXT,
  status TEXT,
  source TEXT,
  conversation_id TEXT,
  created_at TIMESTAMP
);
```

### Meetings Table
```sql
CREATE TABLE meetings (
  id TEXT PRIMARY KEY,
  contact_id TEXT REFERENCES contacts(id),
  scheduled_at TIMESTAMP,
  duration_minutes INTEGER,
  status TEXT,
  notes TEXT,
  zoom_url TEXT,
  created_at TIMESTAMP
);
```

## 🔒 Security

- ✅ HTTPS in production
- ✅ JWT authentication for admin
- ✅ Password hashing with PBKDF2
- ✅ SQL injection prevention (parameterized queries)
- ✅ CORS headers configured
- ✅ Rate limiting support
- ✅ Environment variables secured

## 📈 Performance

- ⚡ Sub-second AI responses (Groq)
- 📱 Mobile-optimized
- 🎯 Lazy loading
- 💾 Database indexes
- 🔄 Connection pooling

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repo
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

**Issues?** Check [SETUP.md](./SETUP.md) for detailed troubleshooting

- **Database Error?** Verify DATABASE_URL format
- **API timeout?** Check GROQ_API_KEY
- **Build issue?** Try `npm run build`

## 🎯 Roadmap

- [ ] Analytics dashboard improvements
- [ ] Calendar integration (Google/Outlook)
- [ ] Advanced voice features
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Custom domain support
- [ ] White-label version

## 🚀 Next Steps

1. **Customize branding** - Update colors, copy, and images
2. **Train AI** - Customize the system prompt with your details
3. **Deploy** - Push to Vercel or Railway
4. **Share** - Send landing page to visitors
5. **Monitor** - Check admin dashboard for leads

---

**Made with ❤️ using Next.js, TypeScript, and Tailwind CSS**
