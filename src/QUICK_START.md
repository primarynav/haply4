# Haply - Quick Start Guide

## ✅ Current Status: Ready to Use!

Your Haply dating application is **fully functional** with email/password authentication. No additional setup required!

---

## What's Working Right Now

### Authentication ✅
- **Sign Up**: Users can create accounts with email/password (no email confirmation needed!)
- **Sign In**: Users can log in with email/password  
- **Auto-Login**: After signup, users are automatically signed in
- **Email Auto-Confirmation**: Emails are automatically confirmed via server-side admin API
- **Profile Data**: Name, age, divorce year, gender preferences are collected and stored
- **Validation**: All forms have proper validation and error handling
- **Security**: Powered by Supabase Auth (industry standard)

### User Features ✅
- User dashboard with profile swiping
- Profile management and editing
- Messaging system
- Subscription system with PayPal integration
- Browse matches
- Safety features and community guidelines

---

## Social Login (Optional - Not Required)

Social login buttons (Google, Apple, Facebook) are **currently disabled** to prevent configuration errors.

### To Enable Social Login (Optional):

1. **Configure OAuth in Supabase** (see `OAUTH_SETUP_GUIDE.md`)
2. **Update the feature flag** in `/components/AuthModal.tsx`:
   ```typescript
   const ENABLE_SOCIAL_LOGIN = true;
   ```
3. **Test** the OAuth flow

### Why It's Disabled:
- OAuth requires external provider setup (Google Cloud, Apple Developer, Facebook Developer)
- Takes time to configure properly
- Email/password authentication works great without it
- You can enable it later when ready

---

## Testing Your App

### Test Email/Password Sign Up:
1. Click "Get Started" or "Sign Up"
2. Fill in your details:
   - Gender & preferences
   - Email & password (min 6 chars)
   - Name, age, divorce year
3. Click "Create Account"
4. ✅ Account created and automatically logged in!
5. ✅ No email confirmation needed - you're ready to use the app!

### Test Login:
1. Click "Sign In"
2. Enter your email and password
3. Click "Sign In"
4. ✅ You're logged in!

---

## File Structure

### Authentication Files
- `/components/AuthModal.tsx` - Main authentication modal
- `/utils/supabase/client.tsx` - Supabase client singleton
- `/utils/supabase/info.tsx` - Supabase project configuration

### Setup Guides
- `QUICK_START.md` - This file
- `OAUTH_SETUP_GUIDE.md` - How to configure social login
- `OAUTH_ERROR_FIXES.md` - OAuth troubleshooting
- `PAYPAL_SETUP.md` - PayPal subscription setup

### Main Components
- `/App.tsx` - Main application router
- `/components/UserDashboard.tsx` - User dashboard with swiping
- `/components/ProfileSettings.tsx` - Profile management
- `/components/SubscriptionPage.tsx` - Subscription & billing

---

## Common Tasks

### Add a New User Field
1. Update signup form in `/components/AuthModal.tsx`
2. Add field to user metadata in signup handler
3. Update form validation as needed

### Customize Email/Password Requirements
Edit validation in `/components/AuthModal.tsx`:
```typescript
// Password validation
if (formData.password.length < 6) {
  toast.error('Password must be at least 6 characters long');
  return;
}
```

### Check User Data
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select project: `zqifimvhdbghputyhihg`
3. Navigate to: **Authentication** → **Users**
4. See all registered users and their metadata

---

## Next Steps (Optional)

- [ ] Configure OAuth providers (see `OAUTH_SETUP_GUIDE.md`)
- [ ] Set up email verification (requires SMTP configuration)
- [ ] Configure PayPal for subscriptions (see `PAYPAL_SETUP.md`)
- [ ] Customize branding and colors in `/styles/globals.css`
- [ ] Add more profile fields as needed
- [ ] Test on mobile devices for responsive design

---

## Support & Documentation

### Supabase Documentation
- [Authentication](https://supabase.com/docs/guides/auth)
- [User Management](https://supabase.com/docs/guides/auth/managing-user-data)
- [Social Login](https://supabase.com/docs/guides/auth/social-login)

### Project Links
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Project ID**: `zqifimvhdbghputyhihg`

---

## Troubleshooting

### "Invalid login credentials"
- Check that email and password are correct
- Passwords are case-sensitive
- Ensure account was created successfully

### Can't see social login buttons
- This is expected! They're disabled by default
- See "Social Login (Optional)" section above to enable

### Form validation errors
- All fields marked with * are required
- Email must be valid format
- Password must be at least 6 characters
- Age must be 18-100
- Divorce year must be 1950-current year

---

**Last Updated**: October 2025  
**Version**: 1.0  
**Status**: ✅ Production Ready (Email/Password Auth)
