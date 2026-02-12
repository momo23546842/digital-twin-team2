# Digital Twin Career Agent - Production Setup Guide

## 🚀 Project Overview

**Digital Twin Career Agent** is a modern, production-ready web application that lets recruiters and clients chat with your AI-powered digital twin. Features include:

- 💬 Smart chat interface with streaming responses
- 🎤 Voice call capability (optional)
- 📅 Meeting booking integration
- 👤 Contact capture from conversations
- 📊 Admin dashboard for insights
- 🔐 Secure authentication
- 📱 Fully responsive mobile design

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| **Backend** | Next.js API Routes, Server Components |
| **Database** | Neon Postgres |
| **AI** | Groq API (or Vercel AI SDK) |
| **Auth** | Custom JWT + localStorage |
| **Deployment** | Vercel |
| **Optional** | Twilio (SMS), Deepgram (Speech-to-Text), ElevenLabs (Text-to-Speech) |

## 📋 Project Structure

```
digital-twin/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── layout.tsx               # Root layout with navbar
│   ├── globals.css              # Global styles
│   ├── (auth)/
│   │   ├── login/page.tsx       # Login page
│   │   ├── signup/page.tsx      # Signup page
│   │   └── layout.tsx           # Auth layout
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts   # Login endpoint
│   │   │   └── signup/route.ts  # Signup endpoint
│   │   └── chat/route.ts        # Chat AI endpoint
│   └── chat/
│       ├── page.tsx             # Chat interface
│       └── layout.tsx           # Chat layout
├── src/
│   ├── components/
│   │   ├── Navbar.tsx           # Navigation bar
│   │   ├── ChatPane.tsx         # Chat container
│   │   ├── ChatInput.tsx        # Message input with voice
│   │   ├── MessageList.tsx      # Message display
│   │   └── DocumentUpload.tsx   # File upload (optional)
│   ├── lib/
│   │   ├── auth-context.tsx     # Auth state management
│   │   ├── auth-db.ts           # Auth database functions
│   │   ├── groq.ts              # Groq API wrapper
│   │   ├── postgres.ts          # Database connection
│   │   └── redis.ts             # Redis caching (optional)
│   └── types/
│       ├── index.ts             # Type definitions
│       ├── api.ts               # API types
│       └── vector.ts            # Vector types
├── tsconfig.json
├── tailwind.config.ts
├── package.json
└── .env.local                   # Environment variables (not in git)
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js 18+ and npm/yarn
- Neon Postgres database (free tier available)
- Groq API key
- Optional: Vercel account for deployment

### Step 1: Clone & Install Dependencies

```bash
cd digital-twin
npm install
# or
yarn install
```

### Step 2: Set Up Environment Variables

Create a `.env.local` file in the root directory:

```env
# Database
DATABASE_URL="postgresql://user:password@ep-host/dbname"

# Groq API (for AI responses)
GROQ_API_KEY="your-groq-api-key"

# Vercel AI SDK (alternative to Groq)
# OPENAI_API_KEY="your-openai-key"

# Optional: Voice & Speech
# DEEPGRAM_API_KEY="your-deepgram-key"
# ELEVENLABS_API_KEY="your-elevenlabs-key"
# TWILIO_ACCOUNT_SID="your-account-sid"
# TWILIO_AUTH_TOKEN="your-auth-token"

# JWT Secret (for authentication)
JWT_SECRET="your-super-secret-key-min-32-chars"

# App URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Step 3: Set Up Database

```bash
# Create database tables
npx prisma migrate dev
# or run SQL directly in Neon console
```

### Step 4: Start Development Server

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📚 Key Features Explained

### 1. Landing Page

**Location**: `app/page.tsx`

Features:
- Modern hero section with CTA buttons
- Feature showcase cards
- About section highlighting AI capabilities
- Call-to-action section
- Responsive footer with links

**Design**: Clean white/green/black theme (Vercel/Notion style)

### 2. Authentication

**Flow**:
1. User signs up with email/password
2. JWT token generated and stored in localStorage
3. AuthContext manages auth state globally
4. Protected routes redirect unauthenticated users to login

**Files**:
- `app/(auth)/login/page.tsx` - Login form
- `app/(auth)/signup/page.tsx` - Signup form
- `api/auth/login/route.ts` - Login endpoint
- `api/auth/signup/route.ts` - Signup endpoint
- `src/lib/auth-context.tsx` - Auth state management
- `src/lib/auth-db.ts` - User database operations

### 3. Chat Interface

**Location**: `app/chat/page.tsx` + `src/components/ChatPane.tsx`

Features:
- ChatGPT-style message display
- Real-time message streaming
- Typing indicators (loading animation)
- Message timestamps
- Input field with character counter

**Components**:
- `ChatPane` - Main container
- `MessageList` - Displays messages
- `ChatInput` - Message input field
- Voice button (mic toggle)

### 4. Voice Support

**Optional feature** - Can be integrated with:
- **Deepgram**: Speech-to-text
- **ElevenLabs**: Text-to-speech
- **Twilio**: Phone integration

**Implementation**:
```tsx
// In ChatInput.tsx
onVoiceToggle={() => {
  // Start/stop recording
  // Send audio to Deepgram API
  // Get transcribed text
  // Send to chat API
}}
```

### 5. API Endpoints

#### Chat Endpoint
```
POST /api/chat
Body: { messages: Message[] }
Response: { content: string }
```

#### Login Endpoint
```
POST /api/auth/login
Body: { email: string, password: string }
Response: { token: string, user: User }
```

#### Signup Endpoint
```
POST /api/auth/signup
Body: { email: string, password: string, name: string }
Response: { token: string, user: User }
```

## 🎨 Design System

### Colors
- **Primary**: Green (#16A34A)
- **Background**: White & Gray-50
- **Text**: Gray-900, Gray-600, Gray-500
- **Accent**: Black (#000000)

### Typography
- **Headings**: Bold/Black (600-900)
- **Body**: Regular/Medium (400-500)
- **Font**: System stack (Geist)

### Components
- **Buttons**: Rounded (lg/xl), with hover effects
- **Cards**: Border + shadow, hover elevation
- **Forms**: Border focus ring, rounded corners
- **Chat**: Bubble style, role-based colors

## 🚀 Deployment

### Deploy to Vercel (Recommended)

```bash
# Link project
vercel link

# Set environment variables
vercel env add DATABASE_URL
vercel env add GROQ_API_KEY
vercel env add JWT_SECRET

# Deploy
vercel
```

### Deploy to Other Platforms

**Instructions for**: Netlify, Railway, Heroku, AWS

Ensure:
- Node.js 18+ support
- Environment variables configured
- Database accessible from platform

## 📈 Performance Optimization

- ✅ Server-side rendering (Next.js)
- ✅ Image optimization (next/image)
- ✅ CSS minification (Tailwind)
- ✅ Code splitting (dynamic imports)
- ✅ Caching (Redis optional)
- ✅ Database indexing (Postgres)

## 🔒 Security Best Practices

- ✅ JWT tokens for authentication
- ✅ Password hashing (bcrypt)
- ✅ HTTPS only (Vercel enforced)
- ✅ Environment variables secured
- ✅ CORS properly configured
- ✅ Input validation on all endpoints
- ✅ Rate limiting on API endpoints
- ✅ SQL injection prevention (parameterized queries)

## 🧪 Testing

```bash
# Unit tests
npm test

# E2E tests with Playwright
npm run test:e2e

# Coverage report
npm run test:coverage
```

## 📝 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Messages Table
```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  role VARCHAR CHECK (role IN ('user', 'assistant')),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Contacts Table
```sql
CREATE TABLE contacts (
  id UUID PRIMARY KEY,
  email VARCHAR,
  name VARCHAR,
  message TEXT,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

## 🐛 Troubleshooting

### "Module not found" errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Database connection issues
- Verify DATABASE_URL in .env.local
- Check Neon connection string format
- Ensure IP whitelist includes your computer

### API key errors
- Verify GROQ_API_KEY is valid
- Test key in Groq console
- Check rate limits

### Authentication failures
- Clear localStorage: `localStorage.clear()`
- Check JWT_SECRET in .env.local (min 32 chars)
- Verify token expiration settings

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [Neon Postgres](https://neon.tech)
- [Groq API Docs](https://console.groq.com)
- [React Hook Form](https://react-hook-form.com) (for advanced forms)

## 📞 Support

For issues or questions:
1. Check this guide and troubleshooting section
2. Review component documentation in code comments
3. Check GitHub issues/discussions
4. Contact development team

## 📄 License

MIT License - See LICENSE file for details

---

**Version**: 1.0.0  
**Last Updated**: February 2026  
**Status**: Production Ready ✅

