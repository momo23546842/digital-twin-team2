# Deploying to Vercel

This Next.js application can be deployed to Vercel. Follow these steps:

## Quick Deploy

1. **Import Project to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Project Settings**
   - Vercel will auto-detect Next.js
   - **No changes needed to Framework Preset or Build Settings**
   - The root `package.json` handles the subdirectory build automatically

3. **Set Environment Variables**
   
   Go to Project Settings → Environment Variables and add:

   ### Required Variables
   ```
   JWT_SECRET=your-secret-key-at-least-32-characters-long
   DATABASE_URL=postgresql://user:password@host:port/database
   ```

   ### Optional Variables
   ```
   GROQ_API_KEY=your-groq-api-key
   ALLOWED_ORIGIN=https://your-domain.vercel.app
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will run `npm run build` which automatically builds the `digital-twin` subdirectory

## Environment Variables Explained

### JWT_SECRET (Required)
- Used for signing authentication tokens
- Must be at least 32 characters
- Generate a secure random string: `openssl rand -base64 32`
- **IMPORTANT**: Set this in Vercel environment variables before deploying

### DATABASE_URL (Required at Runtime)
- PostgreSQL connection string
- Format: `postgresql://username:password@host:port/database`
- Can use Vercel Postgres, Neon, Supabase, or any PostgreSQL provider
- Not required during build, but required when the app starts

### GROQ_API_KEY (Optional)
- For AI chat completions using Groq
- Get from: https://console.groq.com
- If not set, chat will use placeholder responses

### ALLOWED_ORIGIN (Optional)
- CORS allowed origin for API requests
- Set to your frontend domain (e.g., `https://yourdomain.vercel.app`)
- Defaults to `http://localhost:3000` if not set

## Project Structure

```
digital-twin-team2/           ← Root (you are here)
├── package.json              ← Wrapper that runs build in digital-twin/
├── digital-twin/             ← Actual Next.js application
│   ├── package.json          ← Next.js dependencies
│   ├── src/
│   │   └── app/             ← Next.js App Router
│   └── ...
└── ...
```

## Troubleshooting

### Build fails with "JWT_SECRET is required"
- This should not happen as JWT_SECRET is only required at runtime, not build time
- If you see this, check that you're using the latest code with the build-time bypass

### Build fails with "Cannot find module"
- Make sure dependencies are listed in `digital-twin/package.json`, not root `package.json`
- The root package.json runs `npm install` in the subdirectory

### Runtime error: "JWT_SECRET is required"
- Add JWT_SECRET to your Vercel environment variables
- Minimum 32 characters
- Redeploy after adding the variable

### Database connection errors
- Ensure DATABASE_URL is set in Vercel environment variables
- Test the connection string with `psql` or a database client
- Make sure the database allows connections from Vercel IPs

## Notes

- The build succeeds without environment variables because Next.js does static pre-rendering
- Environment variables are needed at **runtime** when the serverless functions execute
- Vercel automatically injects environment variables at runtime

