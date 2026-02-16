# 🔐 Security Guide - CRITICAL

**⚠️ IMPORTANT**: A `.env.local` file with credentials was previously committed to this repository. Read below for immediate actions.

---

## 🚨 Critical Security Alert (Feb 14, 2026)

**If you cloned this repository BEFORE February 14, 2026**:

### ❌ DO NOT Use These Credentials
The exposed credentials are now **compromised** and must not be used in any environment.

### ✅ IMMEDIATE ACTIONS REQUIRED

**1. Generate New Groq API Key:**
- Visit https://console.groq.com/keys
- Delete the old API key
- Create a new API key
- Copy it to `.env.local`

**2. Rotate PostgreSQL Password:**
- Access your Neon or local PostgreSQL
- Change the database password
- Update DATABASE_URL in `.env.local` with new password

**3. Generate New JWT Secret:**
```bash
# macOS/Linux
openssl rand -base64 32

# Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object {[byte](Get-Random -Max 256)}))
```

**4. Update All Environments:**
- ✅ Local: Update `.env.local`
- ✅ Staging: Update environment variables in hosting platform
- ✅ Production: Update environment variables in Vercel/hosting

**5. Commit These Changes:**
```bash
git add .env.local
git commit -m "security: rotate credentials after exposure"
```

---

## ✅ Security Best Practices

### 🔐 Environment Variables

**DO:**
- ✅ Use `.env.local` (in .gitignore) for secrets
- ✅ Use `.env.example` as public template (no real values)
- ✅ Add `.env*` files to `.gitignore`
- ✅ Rotate credentials if exposed

**DON'T:**
- ❌ Hardcode secrets in source code
- ❌ Commit `.env.local` to Git
- ❌ Share credentials via email/chat
- ❌ Use default credentials

### 🛡️ Git Security

**1. Setup `.gitignore` properly:**
```bash
# .gitignore
.env
.env.local
.env.*.local
.env.production.local
*.key
*.pem
```

**2. Verify files aren't tracked:**
```bash
git status  # Should NOT list .env* files
```

**3. If accidentally committed:**
```bash
# Remove from Git tracking
git rm --cached .env.local
git commit -m "chore: remove .env from tracking"

# To remove from git history (advanced):
git filter-branch --tree-filter 'rm -f .env.local' HEAD
```

### 🔑 API Key Management

**Groq API Keys:**
- ✅ Store ONLY in `.env.local`
- ✅ Rotate every 90 days
- ✅ Use different keys for dev/staging/prod
- ✅ Access at https://console.groq.com/keys
- ❌ Never embed in client code
- ❌ Never commit to repository

**Database Credentials:**
- ✅ Use strong passwords (20+ characters)
- ✅ Unique user per environment
- ✅ Store ONLY in `.env.local`
- ✅ Use SSL for remote connections
- ❌ Never share connection strings
- ❌ Never use default credentials

### 🌐 Production Security

**Environment Setup:**
```env
# Local Development
DATABASE_URL=postgresql://dev_user:password@localhost:5432/digital_twin_dev
GROQ_API_KEY=development_key_only

# Production (Different!)
DATABASE_URL=postgresql://prod_user:strong_password@prod.db.com:5432/digital_twin?sslmode=require
GROQ_API_KEY=production_key_only
```

**Deployment Checklist:**
1. ✅ Set ALL env vars in hosting platform (Vercel dashboard)
2. ✅ Never copy `.env.local` to production
3. ✅ Enable 2FA on all service accounts
4. ✅ Enable HTTPS/SSL
5. ✅ Configure database backups
6. ✅ Monitor access logs
7. ✅ Setup error tracking

### 🛡️ Next.js Security

**Protecting Secrets:**
```typescript
// ✅ GOOD - Server-side only
const apiKey = process.env.GROQ_API_KEY; // Never exposed to client

// ❌ BAD - Exposed to client
export const apiKey = process.env.GROQ_API_KEY;

// ✅ GOOD - Public config
const apiUrl = process.env.NEXT_PUBLIC_API_URL; // Safe to expose
```

**API Route Security:**
```typescript
// app/api/chat/route.ts
export async function POST(req: Request) {
  // Verify authentication
  const auth = req.headers.get('authorization');
  if (!auth) {
    return new Response('Unauthorized', { status: 401 });
  }

  // Use server-side secrets only
  const groqKey = process.env.GROQ_API_KEY; // ✅ Safe
  
  // Process request...
}
```

---

## 📋 Complete Security Checklist

### Pre-Deployment ✅
- [ ] `.env.local` in `.gitignore`
- [ ] No secrets in source code
- [ ] All API keys generated
- [ ] Database password is strong (20+ chars)
- [ ] SSL enabled for database
- [ ] 2FA enabled on GitHub
- [ ] 2FA enabled on Groq account
- [ ] 2FA enabled on database provider
- [ ] Backup strategy documented

### Production Deployment ✅
- [ ] Environment variables in hosting platform
- [ ] Database backups configured
- [ ] SSL certificates valid
- [ ] Monitoring configured
- [ ] Access logs enabled
- [ ] Rate limiting configured
- [ ] HTTPS redirect enabled
- [ ] Error tracking setup (Sentry, etc.)

### Post-Deployment ✅
- [ ] Monitor error logs
- [ ] Check backup status
- [ ] Verify no secrets in logs
- [ ] Test authentication flow
- [ ] Schedule credential rotation (quarterly)
- [ ] Review access logs monthly
- [ ] Update security documentation

---

## 🚨 If Credentials ARE Exposed

**Immediate (0-5 min):**
1. Revoke all exposed credentials
2. Generate new credentials
3. Update `.env.local` locally
4. Stop the application

**Short-term (5-30 min):**
1. Update production env vars
2. Restart application
3. Check database logs for unauthorized access
4. Review API usage for anomalies

**Long-term (30+ min):**
1. Audit all database changes
2. Check for unauthorized AI API usage
3. Implement credential rotation policy
4. Add security monitoring

---

## 📚 Security Resources

- [OWASP Secrets Management](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/nodejs-security/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security)
- [Neon Security](https://neon.tech/docs/security)

---

**Last Updated:** February 17, 2026  
**Status:** ⚠️ CRITICAL - Review If Cloned Before Feb 14, 2026
