# Digital Twin Career Agent - Setup & Deployment Guide

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and npm
- **Neon Postgres** account (free tier works)
- **Groq API** key for AI inference
- **Git** for version control

### 1. Environment Setup

Create a `.env.local` file in the `digital-twin` directory:

```env
# AI Inference (Groq)
GROQ_API_KEY=your_groq_api_key_here

# Database (Neon Postgres)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require&channel_binding=require

# Optional Services
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
UPSTASH_VECTOR_REST_URL=your_vector_url
UPSTASH_VECTOR_REST_TOKEN=your_vector_token

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development

# JWT Secret (change in production)
JWT_SECRET=your-secure-secret-key-change-this
```

### 2. Install Dependencies

```bash
cd digital-twin
npm install
```

### 3. Initialize Database

The database schema is automatically initialized on first run. Tables created:
- `users` - User accounts (optional auth)
- `admin_users` - Admin authentication
- `conversations` - Chat sessions
- `messages` - Individual chat messages
- `contacts` - Lead capture
- `meetings` - Scheduled meetings
- `voice_recordings` - Voice message storage
- `analytics` - Event tracking

### 4. Create Admin User

Open a Node.js terminal and run:

```javascript
const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(32).toString('hex');
  const hash = crypto
    .pbkdf2Sync(password, salt, 100000, 64, 'sha512')
    .toString('hex');
  return `${salt}:${hash}`;
}

console.log(hashPassword('your-admin-password-here'));
// Copy the output and paste it in the admin_users table
```

Or use the API:
```bash
curl -X PATCH http://localhost:3000/api/admin-auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-secure-password",
    "name": "Admin User"
  }'
```

### 5. Start Development Server

```bash
npm run dev
```

Visit:
- **Landing Page**: http://localhost:3000
- **Chat**: http://localhost:3000/chat
- **Admin**: http://localhost:3000/admin/login

## 📁 Project Structure

```
digital-twin/
├── app/                           # Next.js app router
│   ├── api/
│   │   ├── chat/route.ts         # Chat with AI
│   │   ├── conversations/         # Conversation management
│   │   ├── contacts/              # Lead capture
│   │   ├── meetings/              # Meeting scheduling
│   │   ├── analytics/             # Event tracking
│   │   ├── admin/                 # Admin-only endpoints
│   │   │   ├── dashboard/
│   │   │   ├── contacts/
│   │   │   └── conversations/
│   │   └── admin-auth/            # Admin authentication
│   ├── page.tsx                   # Landing page
│   ├── chat/page.tsx              # Chat interface
│   ├── admin/
│   │   ├── page.tsx               # Admin dashboard
│   │   └── login/page.tsx         # Admin login
│   ├── layout.tsx                 # Root layout
│   └── globals.css                # Global styles
│
├── src/
│   ├── components/
│   │   ├── landing/Landing.tsx      # Landing page component
│   │   ├── ChatPageComplete.tsx     # Main chat interface
│   │   ├── ChatInputEnhanced.tsx    # Chat input with voice
│   │   ├── MessageListEnhanced.tsx  # Message display
│   │   ├── ContactForm.tsx          # Lead capture form
│   │   ├── AdminDashboard.tsx       # Admin panel
│   │   └── Navbar.tsx               # Navigation bar
│   │
│   ├── lib/
│   │   ├── postgres.ts             # Database connection
│   │   ├── schema.ts               # Database schema
│   │   ├── database.ts             # DB operations
│   │   ├── auth-utils.ts           # Password & JWT utilities
│   │   ├── groq.ts                 # Groq AI integration
│   │   ├── embeddings.ts           # Vector embeddings
│   │   └── rateLimit.ts            # Rate limiting
│   │
│   ├── types/
│   │   └── index.ts                # TypeScript definitions
│   │
│   └── utils/
│       └── animations.ts           # Animation utilities
│
└── package.json
```

## 🔧 Configuration Files

### tailwind.config.ts
```typescript
// Customized for dark theme with green/blue accent colors
// Includes custom colors: slate-900, emerald-500, blue-500
```

### next.config.ts
```typescript
// Turbopack support with root directory configuration
// CORS headers for API routes
// Image optimization
```

### typescript.json
```typescript
// Strict mode TypeScript with path aliases (@/*)
```

## 🎯 Features Checklist

- ✅ Landing page with hero section
- ✅ Modern chat interface (ChatGPT-style)
- ✅ Voice input/output support
- ✅ AI responses (Groq LLM)
- ✅ Conversation history storage
- ✅ Lead capture form
- ✅ Meeting scheduling
- ✅ Admin dashboard
- ✅ Admin authentication
- ✅ Analytics tracking
- ✅ Responsive mobile design
- ✅ Production-ready styling

## 🔐 Security Best Practices

1. **Environment Variables**: Never commit `.env.local` to git
2. **JWT Secret**: Change `JWT_SECRET` in production
3. **Admin Routes**: Protected with Bearer token authentication
4. **Password Hashing**: Uses PBKDF2 with salt
5. **Database**: Use Neon Postgres with SSL connections
6. **CORS**: Configure allowed origins in production

## 📊 Database Schema

```sql
-- Active conversations
CREATE TABLE conversations (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  session_id TEXT,
  title TEXT,
  status TEXT DEFAULT 'active',
  summary TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Chat messages
CREATE TABLE messages (
  id TEXT PRIMARY KEY,
  conversation_id TEXT NOT NULL REFERENCES conversations(id),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  voice_url TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Lead capture
CREATE TABLE contacts (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  title TEXT,
  message TEXT,
  source TEXT DEFAULT 'chat',
  status TEXT DEFAULT 'new',
  conversation_id TEXT REFERENCES conversations(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meeting scheduling
CREATE TABLE meetings (
  id TEXT PRIMARY KEY,
  contact_id TEXT NOT NULL REFERENCES contacts(id),
  scheduled_at TIMESTAMP NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  status TEXT DEFAULT 'scheduled',
  notes TEXT,
  zoom_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Admin users
CREATE TABLE admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🚀 Production Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
GROQ_API_KEY=...
DATABASE_URL=...
JWT_SECRET=...
```

### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "run", "start"]
```

```bash
docker build -t digital-twin .
docker run -p 3000:3000 --env-file .env digital-twin
```

## 📈 API Endpoints

### Public Endpoints
- `POST /api/chat` - Send message to AI
- `POST /api/conversations` - Create conversation
- `POST /api/contacts` - Submit contact form
- `POST /api/meetings` - Schedule meeting
- `POST /api/analytics` - Track events

### Admin Endpoints (Protected)
- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/contacts` - View contacts
- `PUT /api/admin/contacts` - Update contact
- `GET /api/admin/conversations` - View conversations
- `POST /api/admin-auth` - Admin login
- `PATCH /api/admin-auth` - Create admin user

## 🎨 Customization

### Branding
Update in `src/components/landing/Landing.tsx`:
```typescript
const heroTitle = "Meet Your Digital Twin";
const aboutMe = "I'm a passionate full-stack engineer...";
```

### Contact Form Fields
Edit `src/components/ContactForm.tsx` to add/remove fields

### AI System Prompt
Modify in `app/api/chat/route.ts`:
```typescript
const SYSTEM_PROMPT = `You are a Digital Twin...`;
```

### Color Scheme
Edit `app/globals.css` and `tailwind.config.ts`:
- Primary: Emerald (#10b981)
- Accent: Blue (#3b82f6)
- Background: Slate-900
- Text: Slate-100

## 📱 Mobile Optimization

The application is fully responsive with:
- Mobile-first design
- Touch-friendly buttons
- Responsive grid layouts
- Mobile sidebar navigation
- Optimized touch interactions

## 🐛 Troubleshooting

### Database Connection Errors
```bash
# Test connection
psql "postgresql://user:password@host/db?sslmode=require"
```

### Port Already in Use
```bash
# Use custom port
npm run dev -- -p 3001
```

### Build Errors
```bash
# Clean and rebuild
rm -rf .next
npm run build
```

## 📚 Additional Resources

- [Next.js 14 Documentation](https://nextjs.org)
- [Tailwind CSS](https://tailwindcss.com)
- [Groq API](https://console.groq.com)
- [Neon Postgres](https://neon.tech)
- [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API)

## 📄 License

This project is open source and available under the MIT License.

---

**Questions?** Check the README.md or contact support.
