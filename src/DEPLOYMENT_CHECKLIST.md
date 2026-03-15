# 🚀 Haply Deployment Checklist

## Pre-Deployment (Complete Before Deploying)

### 1. PWA Assets ⏳
- [ ] Generate app icons using `/scripts/generate-icons.html`
- [ ] Save all 9 icon sizes to `/public/icons/` folder
- [ ] Create screenshots (optional): `/public/screenshots/`
- [ ] Verify `/public/manifest.json` has correct app name and colors
- [ ] Verify `/public/service-worker.js` exists

### 2. Environment Variables ✅
Already configured in Supabase:
- [x] SUPABASE_URL
- [x] SUPABASE_ANON_KEY
- [x] SUPABASE_SERVICE_ROLE_KEY
- [x] SUPABASE_DB_URL
- [x] PAYPAL_CLIENT_ID
- [x] PAYPAL_SECRET
- [x] OPENAI_API_KEY
- [x] HaplyKey

### 3. Code Review
- [ ] All components working correctly
- [ ] No console errors in production build
- [ ] All links and navigation working
- [ ] Auth flow tested (signup, login, OAuth, logout)
- [ ] Messaging system tested
- [ ] AI matching tested
- [ ] PayPal subscription tested
- [ ] Mobile responsive on all pages

### 4. Build Test
```bash
# Test production build locally
npm run build
npm run preview

# Check for:
- [ ] No build errors
- [ ] App loads correctly
- [ ] Service worker registers
- [ ] All assets load properly
```

## Deployment to Vercel

### 1. Connect Repository
```bash
# If not already connected:
vercel login
vercel link

# Or use Vercel dashboard:
# 1. Go to vercel.com
# 2. Click "New Project"
# 3. Import your Git repository
```

### 2. Configure Project Settings
- [ ] Set Framework Preset: Vite
- [ ] Set Build Command: `npm run build` or `vite build`
- [ ] Set Output Directory: `dist`
- [ ] Set Install Command: `npm install`

### 3. Set Environment Variables in Vercel
Go to Project Settings → Environment Variables, add:
- [ ] SUPABASE_URL = `[your supabase url]`
- [ ] SUPABASE_ANON_KEY = `[your anon key]`
- [ ] SUPABASE_SERVICE_ROLE_KEY = `[your service role key]`
- [ ] PAYPAL_CLIENT_ID = `[your paypal client id]`
- [ ] PAYPAL_SECRET = `[your paypal secret]`
- [ ] OPENAI_API_KEY = `[your openai key]`
- [ ] HaplyKey = `[your haply key]`

### 4. Deploy
```bash
# Deploy to production
vercel --prod

# Or use Vercel dashboard:
# Click "Deploy" button
```

### 5. Verify Deployment
- [ ] Visit your deployed URL
- [ ] Check all pages load correctly
- [ ] Test authentication flow
- [ ] Check browser console for errors
- [ ] Verify service worker registered (DevTools → Application → Service Workers)

## Post-Deployment Testing

### PWA Functionality
- [ ] Open Chrome DevTools → Lighthouse
- [ ] Run PWA audit
- [ ] Score should be 90+ (ideal: 100)
- [ ] Fix any issues reported

### Installation Testing

#### iOS (Safari):
- [ ] Visit site on iPhone/iPad
- [ ] Wait for install banner (appears after 5 seconds)
- [ ] Follow instructions to add to home screen
- [ ] Open installed app
- [ ] Verify it runs in standalone mode (no Safari UI)
- [ ] Test offline: Enable airplane mode, open app
- [ ] Verify cached content loads

#### Android (Chrome):
- [ ] Visit site on Android device
- [ ] Wait for install banner
- [ ] Click "Install"
- [ ] Open installed app from home screen
- [ ] Verify standalone mode
- [ ] Test offline mode

#### Desktop (Chrome/Edge):
- [ ] Visit site in Chrome or Edge
- [ ] Look for install icon in address bar
- [ ] Click to install
- [ ] Open installed app
- [ ] Verify window opens without browser UI

### Feature Testing

#### Authentication:
- [ ] Sign up new user
- [ ] Email/password login
- [ ] Google OAuth login
- [ ] Facebook OAuth login
- [ ] Logout
- [ ] Session persistence (refresh page while logged in)

#### User Dashboard:
- [ ] Profile settings save correctly
- [ ] AI conversational matching works
- [ ] Match results appear
- [ ] Can view match profiles
- [ ] Can send messages

#### Messaging:
- [ ] Send message to match
- [ ] Receive messages
- [ ] Message notifications work
- [ ] Conversation history loads

#### Subscription:
- [ ] PayPal integration loads
- [ ] Can upgrade to Premium
- [ ] Premium features unlock
- [ ] Subscription status displays correctly

#### Community & Content:
- [ ] All navigation links work
- [ ] Footer links work
- [ ] Help center loads
- [ ] Safety tips display
- [ ] Privacy policy accessible

### Performance Testing
- [ ] Page load time < 3 seconds
- [ ] Images optimized and loading quickly
- [ ] No layout shift (good CLS score)
- [ ] Smooth scrolling and interactions
- [ ] Good mobile performance

### SEO & Metadata
- [ ] Page title correct
- [ ] Meta description present
- [ ] Open Graph tags working
- [ ] Twitter card tags working
- [ ] Favicon displays

## Domain Setup (happilyeverafteragain.com)

### 1. Configure Domain in Vercel
- [ ] Go to Vercel Project Settings → Domains
- [ ] Add domain: `happilyeverafteragain.com`
- [ ] Add www subdomain: `www.happilyeverafteragain.com`
- [ ] Copy DNS records provided by Vercel

### 2. Update DNS Settings
At your domain registrar (GoDaddy, Namecheap, etc.):
- [ ] Add A record: `@` → `76.76.21.21` (Vercel IP)
- [ ] Add CNAME record: `www` → `cname.vercel-dns.com`
- [ ] Wait for DNS propagation (can take up to 48 hours)

### 3. Enable HTTPS
- [ ] Vercel auto-provisions SSL certificate
- [ ] Verify HTTPS works: `https://happilyeverafteragain.com`
- [ ] Check for SSL certificate (green lock icon)

### 4. Set up Redirects (Optional)
In `/vercel.json`, add:
```json
{
  "redirects": [
    {
      "source": "/:path((?!www\\.)?.*)",
      "has": [
        {
          "type": "host",
          "value": "happilyeverafteragain.com"
        }
      ],
      "destination": "https://www.happilyeverafteragain.com/:path",
      "permanent": true
    }
  ]
}
```

## OAuth Redirect URIs Update

### Update Supabase OAuth Settings
After deploying to custom domain:
- [ ] Go to Supabase Dashboard → Authentication → URL Configuration
- [ ] Update Site URL: `https://happilyeverafteragain.com`
- [ ] Add Redirect URLs:
  - `https://happilyeverafteragain.com/**`
  - `https://www.happilyeverafteragain.com/**`

### Update OAuth Providers
- [ ] Google: Add authorized redirect URI in Google Cloud Console
- [ ] Facebook: Add OAuth redirect URI in Facebook App settings

## Monitoring & Analytics (Optional)

### Set up Vercel Analytics
- [ ] Enable Vercel Analytics in project settings
- [ ] View real-time visitor data
- [ ] Monitor Core Web Vitals

### Set up Google Analytics (Optional)
```bash
# Add to your app:
# 1. Create GA4 property
# 2. Add tracking code to index.html
# 3. Verify data collection
```

### Error Monitoring (Optional)
Consider adding Sentry or similar:
```bash
npm install @sentry/react
# Configure error tracking
```

## Launch Checklist

### Final Pre-Launch
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance optimized
- [ ] SEO optimized
- [ ] PWA score 90+
- [ ] Mobile responsive
- [ ] All features working
- [ ] Privacy policy updated
- [ ] Terms of service ready
- [ ] Contact information correct

### Launch Day
- [ ] Deploy to production
- [ ] Verify custom domain works
- [ ] Test on multiple devices
- [ ] Monitor for errors
- [ ] Watch server logs
- [ ] Check analytics

### Post-Launch
- [ ] Monitor user feedback
- [ ] Watch for error reports
- [ ] Track key metrics:
  - User signups
  - PWA installs
  - Active users
  - Match success rate
  - Subscription conversions
- [ ] Plan first update/improvements

## App Store Submission (Future)

When ready to submit to app stores, see `/PWA_SETUP_GUIDE.md` for:
- iOS App Store submission process
- Google Play Store submission process
- Required assets and configurations

## Support Resources

- **Vercel Support**: https://vercel.com/support
- **Supabase Docs**: https://supabase.com/docs
- **PWA Best Practices**: https://web.dev/progressive-web-apps/
- **PayPal Integration**: https://developer.paypal.com/
- **Lighthouse CI**: https://github.com/GoogleChrome/lighthouse-ci

---

## 🎉 You're Ready to Launch!

Once you complete this checklist:
✅ Your app will be live at happilyeverafteragain.com  
✅ Users can install it as a PWA on any device  
✅ All features will be working perfectly  
✅ You'll be ready to help divorced singles find love again!

**Good luck with your launch! 💕**
