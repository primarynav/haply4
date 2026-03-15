# 🏗️ Haply PWA Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     USER DEVICES                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📱 iOS (Safari)     📱 Android (Chrome)     💻 Desktop      │
│                                                              │
│  ┌──────────────┐   ┌──────────────┐      ┌──────────────┐ │
│  │   Browser    │   │   Browser    │      │   Browser    │ │
│  │              │   │              │      │              │ │
│  │  ┌────────┐  │   │  ┌────────┐  │      │  ┌────────┐  │ │
│  │  │  PWA   │  │   │  │  PWA   │  │      │  │  PWA   │  │ │
│  │  │  Icon  │  │   │  │  Icon  │  │      │  │  Icon  │  │ │
│  │  └────────┘  │   │  └────────┘  │      │  └────────┘  │ │
│  └──────────────┘   └──────────────┘      └──────────────┘ │
│                                                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ HTTPS
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              VERCEL HOSTING (EDGE NETWORK)                   │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📄 manifest.json     (App Configuration)                    │
│  🔧 service-worker.js (Offline Support)                      │
│  🎨 /icons/           (App Icons 72px-512px)                 │
│  📱 React App         (Main Application)                     │
│                                                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ API Calls
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  SUPABASE BACKEND                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  🔐 Authentication    (User login, OAuth)                    │
│  💾 PostgreSQL DB     (User data, matches, messages)         │
│  📦 Storage           (Profile photos, media)                │
│  ⚡ Edge Functions    (Business logic, AI matching)          │
│                                                              │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        │ External APIs
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                  THIRD-PARTY SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  💳 PayPal           (Subscriptions)                         │
│  🤖 OpenAI           (AI Matching)                           │
│  📧 Email Provider   (Notifications - future)                │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## PWA Component Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER OPENS APP                            │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
                ┌───────────────┐
                │  App.tsx      │ ◄── Main Entry Point
                │  loads        │
                └───────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ PWAMetaTags  │ │ Service      │ │ PWAInstall   │
│              │ │ Worker       │ │ Prompt       │
│ Sets meta    │ │ Registration │ │              │
│ tags for iOS │ │              │ │ Shows banner │
│ & Android    │ │ Enables      │ │ for install  │
└──────────────┘ │ offline      │ └──────────────┘
                 │ support      │
                 └──────┬───────┘
                        │
                        ▼
        ┌───────────────────────────┐
        │   Service Worker Active   │
        │                           │
        │  ┌─────────────────────┐  │
        │  │  Network Request?   │  │
        │  └──────────┬──────────┘  │
        │             │              │
        │   ┌─────────┴─────────┐   │
        │   │                   │   │
        │   ▼                   ▼   │
        │ ONLINE?            OFFLINE?│
        │   │                   │   │
        │   ▼                   ▼   │
        │ Fetch from         Return  │
        │ Network            from    │
        │ & Cache            Cache   │
        │                           │
        └───────────────────────────┘
```

---

## File Structure

```
haply-app/
│
├── public/                         # Static Assets
│   ├── manifest.json               # ⚙️  PWA Configuration
│   ├── service-worker.js           # 🔧 Offline Support
│   ├── pwa-test.html              # 🧪 Test Suite
│   │
│   ├── icons/                     # 🎨 App Icons
│   │   ├── icon-72x72.png         #    Android notification
│   │   ├── icon-96x96.png         #    Android home
│   │   ├── icon-128x128.png       #    Standard
│   │   ├── icon-144x144.png       #    Windows
│   │   ├── icon-152x152.png       #    iOS iPad
│   │   ├── icon-180x180.png       #    iOS iPhone
│   │   ├── icon-192x192.png       #    Android standard
│   │   ├── icon-384x384.png       #    High-res
│   │   └── icon-512x512.png       #    Splash screen
│   │
│   └── screenshots/               # 📸 Optional
│       ├── screenshot-1.png       #    Mobile view
│       └── screenshot-2.png       #    Desktop view
│
├── components/                    # React Components
│   ├── PWAMetaTags.tsx            # 🏷️  Meta tags manager
│   ├── PWAInstallPrompt.tsx       # 📥 Install banner
│   └── OfflineFallback.tsx        # 📴 Offline UI
│
├── hooks/                         # React Hooks
│   └── useIsInstalled.ts          # 🔌 PWA detection
│
├── utils/                         # Utilities
│   └── pwa-register.ts            # 📝 SW registration
│
├── scripts/                       # Tools
│   └── generate-icons.html        # 🎨 Icon generator
│
├── App.tsx                        # 🏠 Main App (updated)
├── vercel.json                    # ⚙️  Deployment config (updated)
│
└── Documentation/                 # 📚 Guides
    ├── PWA_README.md              #    Main guide
    ├── PWA_QUICK_START.md         #    Quick setup
    ├── PWA_SETUP_GUIDE.md         #    Detailed setup
    ├── PWA_IMPLEMENTATION_SUMMARY.md  # What was added
    ├── PWA_FILES_CHECKLIST.md     #    File checklist
    ├── PWA_ARCHITECTURE.md        #    This file!
    └── DEPLOYMENT_CHECKLIST.md    #    Deployment guide
```

---

## Installation Flow

### iOS Installation Path

```
User visits site in Safari
        │
        ▼
Wait 5 seconds
        │
        ▼
┌──────────────────────────────────┐
│  PWA Install Prompt Appears      │
│  (Custom React Component)        │
│                                  │
│  "Add Haply to your home screen" │
│                                  │
│  Instructions:                   │
│  1. Tap Share button ⬆️           │
│  2. Tap "Add to Home Screen"     │
│  3. Tap "Add"                    │
└──────────────────────────────────┘
        │
        ▼
User follows instructions
        │
        ▼
Icon appears on home screen
        │
        ▼
User taps icon
        │
        ▼
App opens in standalone mode
(No Safari UI, full screen)
```

### Android Installation Path

```
User visits site in Chrome
        │
        ▼
User interacts with site
(scroll, click, etc.)
        │
        ▼
Browser detects PWA criteria:
✓ manifest.json
✓ service-worker.js
✓ HTTPS
✓ Icons
        │
        ▼
┌──────────────────────────────────┐
│  Native Install Banner Appears   │
│  (From Chrome)                   │
│                                  │
│  ┌────────────────────────────┐  │
│  │  Install Haply             │  │
│  │  [Install]  [×]            │  │
│  └────────────────────────────┘  │
└──────────────────────────────────┘
        │
        ▼
User taps "Install"
        │
        ▼
App installs to home screen
        │
        ▼
User opens from app drawer
        │
        ▼
App runs in standalone mode
```

---

## Service Worker Lifecycle

```
┌──────────────────────────────────────────────────────────┐
│  1. REGISTRATION                                          │
│                                                           │
│  App.tsx loads → pwa-register.ts → Register SW          │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  2. INSTALLATION                                          │
│                                                           │
│  Service Worker downloads                                │
│  'install' event fires                                   │
│  Cache essential files:                                  │
│    - /                                                   │
│    - /styles/globals.css                                │
│    - /manifest.json                                     │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  3. ACTIVATION                                            │
│                                                           │
│  'activate' event fires                                  │
│  Clean up old caches                                     │
│  Take control of all pages                              │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  4. FETCH INTERCEPTION                                    │
│                                                           │
│  For each network request:                               │
│                                                           │
│  API call? → Try network, fail gracefully                │
│  Static asset? → Try network, cache response             │
│  Navigation? → Try network, fall back to cache           │
└─────────────────────────┬─────────────────────────────────┘
                          │
                          ▼
┌──────────────────────────────────────────────────────────┐
│  5. UPDATE CHECK (Every 60 seconds)                       │
│                                                           │
│  New version available?                                  │
│  → Prompt user to reload                                │
│  → Install new service worker                            │
│  → Activate and take over                               │
└──────────────────────────────────────────────────────────┘
```

---

## Caching Strategy

```
                    ┌─────────────────────┐
                    │  Network Request    │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │   What type?        │
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────┐
        │                      │                      │
        ▼                      ▼                      ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│  API Call    │      │  Static      │      │  Navigation  │
│              │      │  Asset       │      │  Request     │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │                     │                     │
       ▼                     ▼                     ▼
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│ Network      │      │ Network      │      │ Network      │
│ First        │      │ First        │      │ First        │
│              │      │              │      │              │
│ If offline:  │      │ Cache        │      │ If offline:  │
│ Return error │      │ response     │      │ Serve cached │
│ JSON         │      │ for next     │      │ page         │
└──────────────┘      │ time         │      └──────────────┘
                      └──────────────┘
```

---

## Data Flow

### Online State

```
User Action
    │
    ▼
React Component
    │
    ▼
API Request
    │
    ▼
Service Worker (passes through)
    │
    ▼
Network → Supabase Backend
    │
    ▼
Response
    │
    ▼
Service Worker (caches if appropriate)
    │
    ▼
React Component
    │
    ▼
UI Update
```

### Offline State

```
User Action
    │
    ▼
React Component
    │
    ▼
API Request
    │
    ▼
Service Worker (intercepts)
    │
    ▼
Network Unavailable!
    │
    ▼
Check Cache
    │
    ├─→ Found in cache? → Return cached data
    │
    └─→ Not in cache? → Return offline error
    │
    ▼
React Component (handles gracefully)
    │
    ▼
Show offline UI or cached data
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        HTTPS ONLY                            │
│  (Required for PWA - enforced by Vercel)                     │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SERVICE WORKER SCOPE                       │
│  (Can only intercept requests from same origin)              │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE SECURITY                          │
│                                                              │
│  ✓ Row Level Security (RLS)                                 │
│  ✓ JWT-based authentication                                │
│  ✓ Encrypted at rest                                       │
│  ✓ Encrypted in transit                                    │
└─────────────────────────┬────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT SECURITY                           │
│                                                              │
│  ✓ No sensitive keys in frontend                            │
│  ✓ Tokens stored securely (httpOnly cookies via Supabase)  │
│  ✓ XSS protection via React                                │
│  ✓ CSRF protection                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────┐
│  FIRST VISIT                                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Download HTML                (Fast - from Vercel Edge)  │
│  2. Download JavaScript          (Code splitting)           │
│  3. Download CSS                 (Inline critical CSS)      │
│  4. Register Service Worker      (Background)               │
│  5. Cache essential assets       (For next time)            │
│                                                              │
│  Time: ~2-3 seconds                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SUBSEQUENT VISITS (Online)                                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Service Worker active        (Instant)                  │
│  2. Fetch from cache             (Instant)                  │
│  3. Update from network          (Background)               │
│  4. Show cached, update when ready                          │
│                                                              │
│  Time: <1 second (feels instant!)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  SUBSEQUENT VISITS (Offline)                                 │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  1. Service Worker active        (Instant)                  │
│  2. Serve entirely from cache    (Instant)                  │
│  3. Show offline indicator       (If API calls needed)      │
│                                                              │
│  Time: <500ms (lightning fast!)                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Browser Compatibility

```
┌──────────────┬──────────┬──────────┬──────────┬──────────┐
│   Feature    │   iOS    │ Android  │  Chrome  │   Edge   │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ Service      │    ✓     │    ✓     │    ✓     │    ✓     │
│ Worker       │ 11.3+    │  5.0+    │   40+    │   17+    │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ Web App      │    ✓     │    ✓     │    ✓     │    ✓     │
│ Manifest     │ 11.3+    │  5.0+    │   39+    │   17+    │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ Add to Home  │    ✓     │    ✓     │    ✓     │    ✓     │
│ Screen       │  (all)   │  (all)   │   40+    │   17+    │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ Standalone   │    ✓     │    ✓     │    ✓     │    ✓     │
│ Mode         │  (all)   │  5.0+    │   40+    │   17+    │
├──────────────┼──────────┼──────────┼──────────┼──────────┤
│ Offline      │    ✓     │    ✓     │    ✓     │    ✓     │
│ Support      │ 11.3+    │  5.0+    │   40+    │   17+    │
└──────────────┴──────────┴──────────┴──────────┴──────────┘

Coverage: 95%+ of all users worldwide ✓
```

---

## Key Takeaways

1. **PWA = Web + Native**: Best of both worlds
2. **HTTPS Required**: Security is mandatory
3. **Progressive Enhancement**: Works everywhere, better on supported browsers
4. **Offline First**: Service worker enables offline functionality
5. **Installable**: One codebase, works on all platforms
6. **Updateable**: Push updates without app store approval
7. **Discoverable**: Can be found via search engines
8. **Linkable**: Share via URL, no install required to try

---

For implementation details, see the other documentation files!
