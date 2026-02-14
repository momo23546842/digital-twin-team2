# 🔐 Security Notice - IMPORTANT

## ⚠️ Critical Security Update (February 14, 2026)

**ACTION REQUIRED**: The `.env.local` file was previously committed to this repository, exposing sensitive credentials. 

### If you cloned this repository before this fix:

1. **DO NOT use the exposed credentials** - they are now considered compromised
2. **Generate new credentials immediately**:
   - Create a new Neon Postgres database or rotate password
   - Generate a new Groq API key at https://console.groq.com/keys
   - Generate a new JWT secret: `openssl rand -base64 32`

3. **Setup your local environment**:
   ```bash
   # Copy the example file
   cp .env.example .env.local
   
   # Edit .env.local with your NEW credentials
   # Never commit this file to git!
   ```

## 🔒 Security Best Practices

### Environment Variables
- ✅ **NEVER** commit `.env.local` or `.env` files to git
- ✅ Use `.env.example` as a template only (no real credentials)
- ✅ Add all `.env*` files to `.gitignore`
- ✅ Rotate credentials if accidentally exposed

### API Keys & Secrets
- ✅ Store all secrets in environment variables
- ✅ Use different credentials for development/production
- ✅ Rotate API keys regularly
- ✅ Use strong, randomly generated JWT secrets

### Database Security
- ✅ Use SSL/TLS for database connections (`sslmode=require`)
- ✅ Use strong, unique passwords
- ✅ Restrict database access by IP when possible
- ✅ Never share connection strings publicly

### Production Deployment
- ✅ Set all environment variables in your hosting platform (Vercel, Railway, etc.)
- ✅ Never include credentials in source code
- ✅ Enable 2FA on all service accounts (GitHub, Neon, Groq, etc.)
- ✅ Review and audit access logs regularly

## 📋 Credential Rotation Checklist

If credentials were exposed:

- [ ] Revoke old Groq API key at https://console.groq.com/keys
- [ ] Generate new Groq API key
- [ ] Change Neon Postgres password at https://console.neon.tech
- [ ] Update DATABASE_URL with new password
- [ ] Generate new JWT_SECRET: `openssl rand -base64 32`
- [ ] Update all `.env.local` files (local and CI/CD)
- [ ] Update environment variables on deployment platform (Vercel/Railway)
- [ ] Test application with new credentials
- [ ] Monitor for unauthorized access

## 🚨 Reporting Security Issues

If you discover a security vulnerability:

1. **DO NOT** create a public GitHub issue
2. Email the repository owner directly
3. Include details about the vulnerability
4. Allow time for the issue to be addressed before public disclosure

## 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Neon Security Best Practices](https://neon.tech/docs/security/security-overview)
- [Vercel Security](https://vercel.com/docs/security)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)

---

**Last Updated**: February 14, 2026  
**Status**: Security patches applied - credentials require rotation
