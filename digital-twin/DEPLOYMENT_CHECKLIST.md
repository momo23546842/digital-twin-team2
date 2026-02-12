# 🚀 Production Deployment Checklist

Before deploying your Digital Twin Career Agent to production, complete this checklist:

## 🔐 Security

- [ ] Change `JWT_SECRET` in `.env.local` to a secure random string
  ```bash
  # Generate a secure secret (run in Node):
  require('crypto').randomBytes(32).toString('hex')
  ```
- [ ] Update admin password from default
- [ ] Enable HTTPS on your domain (Vercel/Railway handle this)
- [ ] Review and approve CORS configuration
- [ ] Remove any console.log statements with sensitive data
- [ ] Set `NODE_ENV=production`
- [ ] Verify rate limiting is enabled
- [ ] Configure database SSL/TLS certificates
- [ ] Ensure all API keys are environment variables, not hardcoded

## 🗄️ Database

- [ ] Backup production database
  ```sql
  -- Create backup on Neon
  pg_dump (use Neon console)
  ```
- [ ] Verify all tables exist and have proper indexes
  ```sql
  SELECT tablename FROM pg_tables WHERE schemaname='public';
  ```
- [ ] Test database connection from production environment
- [ ] Enable connection pooling (Neon): PgBouncer in transaction mode
- [ ] Configure database maintenance (autovacuum)
- [ ] Set up automated backups (Neon Pro tier)
- [ ] Test database restore procedure

## 🤖 AI & APIs

- [ ] Verify Groq API key is valid and has sufficient quota
- [ ] Test chat endpoint with sample messages
- [ ] Verify response quality and latency
- [ ] Monitor Groq usage (set up billing alerts)
- [ ] Test rate limiting (10 requests/min default)
- [ ] Configure appropriate rate limits for your use case
- [ ] Set up API monitoring/alerting

## 📧 Email & Notifications

- [ ] Set up email service (SendGrid/Resend/etc) - optional
  ```bash
  SENDGRID_API_KEY=your-key
  SENDGRID_FROM_EMAIL=noreply@yourdomain.com
  ```
- [ ] Configure notification emails for new contacts
- [ ] Test email sending
- [ ] Set up email templates

## 🎨 Branding & Content

- [ ] Update Landing page title and description
- [ ] Personalize About section with your bio
- [ ] Update AI system prompt with your expertise
- [ ] Upload custom logo/branding
- [ ] Update contact form fields (if needed)
- [ ] Review all copy for accuracy
- [ ] Add your social media links
- [ ] Configure favicon

## 📱 Testing

- [ ] Test on mobile devices (iOS, Android)
- [ ] Test chat functionality
- [ ] Test voice input (if supported)
- [ ] Test contact form submission
- [ ] Test admin login
- [ ] Test admin dashboard
- [ ] Check responsiveness at different screen sizes
- [ ] Test on slow internet (throttle network)
- [ ] Verify no console errors
- [ ] Test cross-browser compatibility

## 📊 Monitoring & Analytics

- [ ] Set up Vercel Analytics (if using Vercel)
- [ ] Configure error tracking (Sentry optional)
  ```bash
  SENTRY_DSN=your-sentry-dsn
  ```
- [ ] Set up uptime monitoring
- [ ] Configure alert rules
- [ ] Set up database monitoring
- [ ] Test error reporting

## 🌐 Domain & DNS

- [ ] Register domain (or use existing)
- [ ] Configure DNS records
  ```
  CNAME: yourdomain.com -> your-deployment-url
  ```
- [ ] Update NEXT_PUBLIC_BASE_URL
- [ ] Test domain resolution
- [ ] Set up SSL certificate (auto with Vercel/Railway)
- [ ] Verify HTTPS works

## 📈 Performance

- [ ] Run Lighthouse audit
- [ ] Optimize images
- [ ] Test Core Web Vitals
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- [ ] Check page load time
- [ ] Verify database query performance
- [ ] Test with high concurrent users (stress test)
- [ ] Enable caching headers
- [ ] Compress assets (gzip enabled)

## 🔄 Deployment

### Vercel Deployment

```bash
# 1. Push code to GitHub
git push origin main

# 2. Connect repo in Vercel dashboard
# https://vercel.com/new

# 3. Configure environment variables:
# GROQ_API_KEY
# DATABASE_URL
# JWT_SECRET
# NEXT_PUBLIC_BASE_URL

# 4. Configure build settings:
BUILD_COMMAND: npm run build
START_COMMAND: npm run start

# 5. Deploy
```

### Railway Deployment

```bash
# 1. Login to Railway
railway login

# 2. Create project
railway init

# 3. Add Postgres plugin (optional)
# or use Neon

# 4. Set variables
railway variables set GROQ_API_KEY=xxx
railway variables set DATABASE_URL=xxx
railway variables set JWT_SECRET=xxx

# 5. Deploy
railway up
```

### Docker Deployment

```bash
# Build image
docker build -t digital-twin . --no-cache

# Test locally
docker run -p 3000:3000 --env-file .env digital-twin

# Push to registry
docker tag digital-twin your-registry/digital-twin
docker push your-registry/digital-twin

# Deploy to your host
```

- [ ] Configure CI/CD pipeline
- [ ] Set up automated deployments
- [ ] Configure rollback procedure
- [ ] Test deployment process
- [ ] Verify rollback works

## 👥 User Management

- [ ] Add team members to admin dashboard
- [ ] Create admin users for team
- [ ] Set password policies
- [ ] Review admin access logs
- [ ] Configure backup admin account

## 📞 Support & Documentation

- [ ] Create support page/email
- [ ] Document customization process
- [ ] Create runbooks for common issues
- [ ] Set up status page (if applicable)
- [ ] Document admin dashboard usage
- [ ] Create troubleshooting guide

## 💰 Cost Optimization

### Estimated Monthly Costs:

| Service | Tier | Cost |
|---------|------|------|
| Neon Postgres | Free | $0 |
| Groq API | Free | $0 |
| Vercel | Hobby | $0 |
| **Total** | | **$0** |

With Pro tiers ($20-50/month):
- Neon Pro: Database backups + dedicated compute
- Groq Inference API: Higher rate limits
- Vercel Pro: Better performance + analytics

Cost optimization:
- [ ] Monitor Neon database usage
- [ ] Review Groq API calls
- [ ] Optimize database queries
- [ ] Set up alerts for high usage
- [ ] Use appropriate database indexes

## ✅ Launch Checklist

- [ ] All security checks passed
- [ ] Database backed up
- [ ] Admin users created
- [ ] Content reviewed and approved
- [ ] URLs configured correctly
- [ ] Email notifications working
- [ ] Monitoring enabled
- [ ] Team trained
- [ ] Support process documented
- [ ] Launch announced to team

## 🎉 Post-Launch

### Day 1
- [ ] Monitor error rates
- [ ] Check database connections
- [ ] Verify emails are sending
- [ ] Monitor response times
- [ ] Check user feedback

### Week 1
- [ ] Analyze traffic patterns
- [ ] Review admin dashboard
- [ ] Check for bugs/issues
- [ ] Gather user feedback
- [ ] Optimize based on usage

### Month 1
- [ ] Analyze conversion metrics
- [ ] Review lead quality
- [ ] Plan improvements
- [ ] Document learnings
- [ ] Plan next features

## 📝 Emergency Procedures

### If Something Goes Wrong

1. **Check Status**
   - Vercel status dashboard
   - Database connection
   - Groq API status

2. **Rollback**
   ```bash
   # Vercel: Automatic rollback to previous deployment
   # Database: Restore from backup (if available)
   ```

3. **Incident Response**
   - [ ] Identify issue
   - [ ] Notify team
   - [ ] Fix or rollback
   - [ ] Communicate status
   - [ ] Document lessons learned

## 🔗 Useful Resources

- [Vercel Deployment Guide](https://vercel.com/docs)
- [Neon Database Guide](https://neon.tech/docs)
- [Groq API Documentation](https://console.groq.com/docs)
- [Next.js Production Guide](https://nextjs.org/docs/going-to-production)
- [Security Best Practices](https://cheatsheetseries.owasp.org/)

---

**Estimated Deploy Time**: 30-60 minutes

**Questions?** Refer to SETUP.md or PRODUCTION_README.md
