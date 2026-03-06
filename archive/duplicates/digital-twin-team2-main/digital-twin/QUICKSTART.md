# ⚡ Quick Start Guide

Get your Digital Twin Career Agent running in **5 minutes**!

## 🎯 Prerequisites

- [Node.js 18+](https://nodejs.org) (check with `node --version`)
- [Neon Postgres Account](https://neon.tech) - Free ✅
- [Groq API Key](https://console.groq.com) - Free ✅

## 📍 Step 1: Get Your API Keys (2 minutes)

### Groq API Key
1. Go to [https://console.groq.com](https://console.groq.com)
2. Sign up (free)
3. Create API key
4. Copy it to clipboard

### Neon Database
1. Go to [https://neon.tech](https://neon.tech)
2. Sign up (free)
3. Create a new project
4. Copy the connection string: `postgresql://...`

## 🚀 Step 2: Clone & Setup (2 minutes)

### ⭐ Windows (PowerShell) - YOU ARE HERE:
```powershell
# Navigate to project
cd c:\Users\YourName\OneDrive\Desktop\digital-twin-team2\digital-twin

# Run startup script (handles everything automatically)
.\startup.ps1
```

### macOS/Linux Only:
```bash
# Navigate to project
cd ~/path/to/digital-twin-team2/digital-twin

# Make script executable (macOS/Linux ONLY - NOT for Windows!)
chmod +x startup.sh

# Run startup script
./startup.sh
```

### Manual Setup (If scripts don't work):
```bash
# Install dependencies
npm install
```

## 🔧 Step 3: Configure Environment (1 minute)

Create `.env.local` file:

```env
# AI Inference
GROQ_API_KEY=gsk_your_key_here

# Database
DATABASE_URL=postgresql://user:pass@host/db?sslmode=require

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
JWT_SECRET=your-secret-key-change-this

# Environment
NODE_ENV=development
```

**Paste your Groq and Neon credentials** from Step 1.

## ✨ Step 4: Start the Server

```bash
npm run dev
```

You'll see:
```
✁ Ready in 2.5s
- Local:       http://localhost:3000
- Network:     http://192.168.1.x:3000
```

## 🎉 Step 5: Visit Your App!

Open your browser:

| URL | What |
|-----|------|
| http://localhost:3000 | 🏠 Landing page |
| http://localhost:3000/chat | 💬 Chat interface |
| http://localhost:3000/admin/login | 🔐 Admin dashboard |

## 👤 Create Admin User

Open another terminal and run:

```bash
curl -X PATCH http://localhost:3000/api/admin-auth \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your-password",
    "name": "Your Name"
  }'
```

Then login at: http://localhost:3000/admin/login

## ✅ You're Done!

Your Digital Twin is live! 🎉

### Next Steps:
1. **Customize** - Edit `src/components/landing/Landing.tsx` with your info
2. **Update AI** - Edit `app/api/chat/route.ts` system prompt
3. **Deploy** - See DEPLOYMENT_CHECKLIST.md

## 🐛 Troubleshooting

### "Port 3000 in use"
```bash
# Change port
npm run dev -- -p 3001
```

### "DATABASE_URL is missing"
Check that `.env.local` has your Neon connection string

### "Groq API error"
Verify your `GROQ_API_KEY` is correct and not expired

### "npm install fails"
```bash
# Clear cache and try again
npm cache clean --force
npm install
```

## 📚 Learn More

- [SETUP.md](./SETUP.md) - Detailed setup guide
- [PRODUCTION_README.md](./PRODUCTION_README.md) - Full documentation
- [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - Production checklist

## 🎨 Customization Examples

### Change the landing page title:
```typescript
// src/components/landing/Landing.tsx
<h2 className="text-5xl ...">
  Meet {YOUR_NAME}
</h2>
```

### Update the AI personality:
```typescript
// app/api/chat/route.ts
const SYSTEM_PROMPT = `
  You are ${YOUR_NAME}, a professional with expertise in...
`;
```

### Add your social links:
```typescript
// src/components/landing/Landing.tsx
<a href="https://linkedin.com/in/yourprofile">LinkedIn</a>
<a href="https://github.com/yourprofile">GitHub</a>
```

## 🚀 Deploy in Next 5 Minutes

### Option 1: Vercel (Easiest)
```bash
npm i -g vercel
vercel
```
Follow the prompts and set environment variables

### Option 2: Railway
Visit [railway.app](https://railway.app), connect your GitHub repo

### Option 3: Docker
```bash
docker build -t digital-twin .
docker run -p 3000:3000 --env-file .env digital-twin
```

## 📊 File Structure

```
digital-twin/
├── app/
│   ├── page.tsx              ← Landing page
│   ├── chat/page.tsx         ← Chat page
│   ├── admin/                ← Admin pages
│   └── api/                  ← API routes
├── src/
│   ├── components/           ← React components
│   ├── lib/                  ← Utilities
│   └── types/                ← TypeScript types
├── .env.local                ← Your secrets (create this!)
├── .env.example              ← Template
└── package.json
```

## 🆘 Need Help?

### Still getting errors?
1. Check [SETUP.md](./SETUP.md) troubleshooting section
2. Verify all environment variables are set
3. Clear Node modules: `rm -rf node_modules && npm install`
4. Check [Groq status](https://status.groq.com)
5. Check [Neon status](https://status.neon.tech)

### Want to customize more?
See [PRODUCTION_README.md](./PRODUCTION_README.md) for complete documentation

### Ready to deploy?
Follow [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

**That's it!** Your Digital Twin is ready to go. 🚀

Next stop: Customize it and deploy! 🎯
