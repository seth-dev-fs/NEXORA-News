# NEXORA News - Deployment Checklist

Use this checklist before and after deploying to Vercel.

## Pre-Deployment

### Local Validation
- [x] `npm install` runs without errors
- [x] `npm run build` completes successfully
- [x] All 78 pages generated (homepage + 10 categories + 59 articles + static pages)
- [x] TypeScript compilation: 0 errors
- [x] Next.js build: 0 warnings
- [x] Image optimization configured
- [x] ISR revalidation set to 60 seconds

### Environment Variables Prepared
- [ ] `GEMINI_API_KEY` - Get from https://ai.google.dev/
- [ ] `REVALIDATE_TOKEN` - Generate with `openssl rand -base64 32`
- [ ] `UNSPLASH_ACCESS_KEY` (optional) - Get from https://unsplash.com/developers

### Configuration Files
- [x] `next.config.js` - Production optimized
- [x] `vercel.json` - Headers and caching configured
- [x] `package.json` - Node.js version >= 20.9.0 specified
- [x] `.gitignore` - Excludes .env.local
- [x] `.env.example` - Template provided

### Repository Status
- [ ] All changes committed to Git
- [ ] Pushed to GitHub main branch
- [ ] No uncommitted local changes

## Vercel Setup

### Project Connection
- [ ] GitHub repository connected to Vercel
- [ ] Vercel project created
- [ ] Automatic deployments enabled

### Environment Variables in Vercel
- [ ] `GEMINI_API_KEY` added (Production + Preview + Dev)
- [ ] `REVALIDATE_TOKEN` added (Production + Preview + Dev)
- [ ] `UNSPLASH_ACCESS_KEY` added (Production only) - OPTIONAL

### Build Settings
- [ ] Framework: Next.js (auto-detected)
- [ ] Build Command: `npm run build` (default)
- [ ] Output Directory: `.next` (default)
- [ ] Install Command: `npm install` (default)
- [ ] Node.js Version: 20.x (from package.json)

## Deployment

### First Deployment
- [ ] Trigger deployment from Vercel Dashboard or CLI
- [ ] Monitor build logs for errors
- [ ] Build completes in ~2-3 minutes
- [ ] Deployment URL generated

## Post-Deployment Verification

### Basic Functionality
- [ ] Homepage loads: `https://your-domain.vercel.app/`
- [ ] Articles render: `https://your-domain.vercel.app/noticias/[any-slug]`
- [ ] Categories work: `https://your-domain.vercel.app/categoria/smartphones`
- [ ] Static pages load: `https://your-domain.vercel.app/sobre-nos`

### API Routes
- [ ] Newsletter API responds:
  ```bash
  curl -X POST https://your-domain.vercel.app/api/newsletter \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com"}'
  ```
- [ ] Revalidation API works:
  ```bash
  curl "https://your-domain.vercel.app/api/revalidate?secret=YOUR_TOKEN"
  ```

### Image Optimization
- [ ] Article images load correctly
- [ ] Images served as WebP/AVIF (check DevTools Network tab)
- [ ] No 404 errors for images (check Console)
- [ ] Placeholder images work if RSS image fails

### Performance
- [ ] First Load JS < 110 kB (check build output)
- [ ] Core Web Vitals pass (Vercel Analytics)
- [ ] Page loads in < 3 seconds (Lighthouse)

### Security Headers
- [ ] HSTS header present (check DevTools → Network → Response Headers)
- [ ] X-Frame-Options: DENY
- [ ] X-Content-Type-Options: nosniff
- [ ] Powered-by header removed

### ISR (Incremental Static Regeneration)
- [ ] Pages regenerate after 60 seconds
- [ ] Manual revalidation works via API
- [ ] Vercel logs show revalidation events

## Optional Enhancements

### Domain Configuration
- [ ] Custom domain configured (if applicable)
- [ ] DNS records pointing to Vercel
- [ ] SSL certificate active

### Monitoring
- [ ] Vercel Analytics enabled
- [ ] Speed Insights enabled
- [ ] Error tracking configured

### Automation
- [ ] GitHub Actions workflow (if custom CI/CD)
- [ ] Vercel Cron jobs for article generation (if applicable)

## Rollback Plan

### In Case of Issues
- [ ] Previous deployment URL identified
- [ ] Rollback procedure tested:
  - Via Vercel Dashboard → Promote to Production
  - Via CLI: `vercel promote [PREVIOUS_URL]`
- [ ] Team notified of rollback

## Known Issues & Mitigations

- [ ] No blocking issues identified
- [ ] Edge cases documented
- [ ] Error handling in place for API routes

---

## Quick Commands Reference

```bash
# Local build test
npm run build

# Deploy to Vercel (CLI)
vercel --prod

# Check environment variables
vercel env pull

# View deployment logs
vercel logs YOUR_DEPLOYMENT_URL

# Rollback deployment
vercel promote PREVIOUS_DEPLOYMENT_URL
```

---

**Last Updated**: 2025-11-22
**Deployment Status**: READY
**Build Validated**: YES
**Configuration Optimized**: YES
