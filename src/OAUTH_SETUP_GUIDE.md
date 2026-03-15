# OAuth Setup Guide for Haply

This guide will help you configure Google, Apple, and Facebook sign-in for your Haply dating application.

## Overview

Haply now supports three OAuth providers:
- **Google** - Sign in with Google
- **Apple** - Sign in with Apple
- **Facebook** - Sign in with Facebook

Each provider requires configuration in your Supabase dashboard. Follow the steps below for each provider you want to enable.

---

## 🔴 IMPORTANT: Before You Start

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: **zqifimvhdbghputyhihg**
3. Navigate to: **Authentication** → **Providers**

---

## 1. Google OAuth Setup

### Step 1: Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the OAuth consent screen if you haven't already
6. For Application Type, select **Web Application**

### Step 2: Configure Redirect URIs
Add these authorized redirect URIs:
```
https://zqifimvhdbghputyhihg.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback (for local development)
```

### Step 3: Get Your Credentials
- Copy the **Client ID**
- Copy the **Client Secret**

### Step 4: Configure in Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Find **Google** and enable it
3. Paste your **Client ID**
4. Paste your **Client Secret**
5. Click **Save**

### Additional Resources
- [Supabase Google Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-google)

---

## 2. Apple OAuth Setup

### Step 1: Create Apple Service ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **+** (to create new)
4. Select **Services IDs** and continue
5. Register a new Service ID (e.g., `com.haply.auth`)

### Step 2: Configure Sign in with Apple
1. Enable **Sign in with Apple** for your Service ID
2. Configure domains and redirect URLs:
   - **Domain**: `zqifimvhdbghputyhihg.supabase.co`
   - **Redirect URL**: `https://zqifimvhdbghputyhihg.supabase.co/auth/v1/callback`

### Step 3: Create Private Key
1. In Apple Developer Portal, go to **Keys**
2. Click **+** to create a new key
3. Enable **Sign in with Apple**
4. Download the `.p8` key file (you can only download it once!)
5. Note the **Key ID**

### Step 4: Get Your Team ID
1. In Apple Developer Portal, go to **Membership**
2. Copy your **Team ID**

### Step 5: Configure in Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Find **Apple** and enable it
3. Enter your **Service ID** (e.g., `com.haply.auth`)
4. Enter your **Team ID**
5. Enter your **Key ID**
6. Paste the contents of your `.p8` file (including the header and footer)
7. Click **Save**

### Additional Resources
- [Supabase Apple Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-apple)

---

## 3. Facebook OAuth Setup

### Step 1: Create Facebook App
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **My Apps** → **Create App**
3. Select **Consumer** as the app type
4. Fill in your app details and create the app

### Step 2: Add Facebook Login Product
1. In your Facebook App Dashboard, click **Add Product**
2. Find **Facebook Login** and click **Set Up**
3. Select **Web** as your platform

### Step 3: Configure OAuth Redirect URIs
1. Go to **Facebook Login** → **Settings**
2. Add these Valid OAuth Redirect URIs:
```
https://zqifimvhdbghputyhihg.supabase.co/auth/v1/callback
http://localhost:3000/auth/callback (for local development)
```
3. Click **Save Changes**

### Step 4: Get Your App Credentials
1. Go to **Settings** → **Basic**
2. Copy your **App ID**
3. Copy your **App Secret** (click Show to reveal it)

### Step 5: Make Your App Live
1. Toggle the app from **Development** to **Live** mode (top of dashboard)
2. You may need to complete the App Review for certain permissions

### Step 6: Configure in Supabase
1. In Supabase Dashboard → Authentication → Providers
2. Find **Facebook** and enable it
3. Paste your **App ID** (as Client ID)
4. Paste your **App Secret** (as Client Secret)
5. Click **Save**

### Additional Resources
- [Supabase Facebook Auth Documentation](https://supabase.com/docs/guides/auth/social-login/auth-facebook)

---

## Testing Your Integration

### 1. Test Locally
1. Run your application
2. Click on one of the social login buttons
3. You should be redirected to the provider's login page
4. After authentication, you should be redirected back to your app
5. Check the browser console for any errors

### 2. Common Issues

**"Provider is not enabled" error:**
- Make sure you enabled the provider in Supabase Dashboard
- Check that you saved your credentials correctly

**Redirect URI mismatch:**
- Verify the redirect URI in the provider's settings matches:
  `https://zqifimvhdbghputyhihg.supabase.co/auth/v1/callback`

**Email not provided by provider:**
- Some providers may not share email if the user hasn't verified it
- You may need to request additional permissions/scopes

### 3. Check User Data
After successful login, user data is stored in:
- Supabase Authentication Users table
- User metadata includes provider-specific information
- Access via: Dashboard → Authentication → Users

---

## Email/Password Authentication

Email/password authentication is already configured and working! Users can:
- Sign up with email and password
- Sign in with email and password
- Their profile information (name, age, divorce year, gender preferences) is stored in user metadata

**Note**: For production use, you should configure email verification:
1. In Supabase Dashboard → Authentication → Settings
2. Configure an SMTP provider (like SendGrid, AWS SES, etc.)
3. Enable "Confirm email" to require verification

---

## Next Steps

1. ✅ Configure at least one OAuth provider (Google recommended for quickest setup)
2. ✅ Test the authentication flow
3. ✅ Set up email verification for production
4. Consider adding more profile fields specific to divorced singles
5. Implement user profile completion flow after OAuth signup
6. Add provider-specific branding and messaging

---

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Check Supabase logs: Dashboard → Logs → Auth Logs
3. Refer to the official Supabase documentation linked above
4. Check that all credentials are correctly entered with no extra spaces

---

**Last Updated**: October 2025
**Supabase Project**: zqifimvhdbghputyhihg
