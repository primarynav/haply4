# PayPal Integration Setup Guide

This guide will help you set up PayPal subscriptions for Haply premium memberships.

## Prerequisites

1. **PayPal Business Account**
   - Create a PayPal Business account at https://www.paypal.com/business
   - Complete account verification

2. **PayPal Developer Account**
   - Go to https://developer.paypal.com
   - Create an app to get your API credentials

## Step 1: Get PayPal Credentials

### For Sandbox (Testing)
1. Go to https://developer.paypal.com/dashboard/
2. Create a new app or use an existing one
3. Copy the **Client ID** and **Secret** from the Sandbox section

### For Production
1. Go to https://developer.paypal.com/dashboard/
2. Switch to "Live" mode
3. Copy the **Client ID** and **Secret** from the Live section

## Step 2: Configure Environment Variables

You've already been prompted to add:
- `PAYPAL_CLIENT_ID` - Your PayPal Client ID
- `PAYPAL_SECRET` - Your PayPal Secret Key

**For Production Mode:**
Add one more environment variable:
- `PAYPAL_MODE` - Set to `production` (leave empty or unset for sandbox mode)

## Step 3: Create Subscription Plan

1. Navigate to: `?admin=setup` (add this to your app URL)
   Example: `https://your-app-url.com?admin=setup`

2. Click "Create PayPal Plan" button

3. Copy the Plan ID and Product ID that are generated

4. **Important:** Save these IDs for your records

## Step 4: Set Up Webhooks

Webhooks notify your app when subscription events occur (e.g., payments, cancellations).

1. Go to PayPal Developer Dashboard: https://developer.paypal.com/dashboard/
2. Select your app
3. Scroll down to "Webhooks"
4. Click "Add Webhook"
5. Enter the webhook URL (shown in the admin setup page):
   ```
   https://[your-project-id].supabase.co/functions/v1/make-server-2b484abd/paypal/webhook
   ```

6. Subscribe to these events:
   - `BILLING.SUBSCRIPTION.ACTIVATED`
   - `BILLING.SUBSCRIPTION.UPDATED`
   - `BILLING.SUBSCRIPTION.CANCELLED`
   - `BILLING.SUBSCRIPTION.SUSPENDED`
   - `BILLING.SUBSCRIPTION.EXPIRED`
   - `PAYMENT.SALE.COMPLETED`

7. Save the webhook

## Step 5: Test the Integration

### In Sandbox Mode:
1. Create a test account in PayPal Sandbox
2. Log in to your Haply app
3. Navigate to Subscription page
4. Click "Subscribe to Premium"
5. Use PayPal Sandbox test credentials to complete payment
6. Verify that premium features are unlocked

### Testing Checklist:
- [ ] Can create subscription
- [ ] Premium badge appears in dashboard
- [ ] Premium features are accessible
- [ ] Can cancel subscription
- [ ] Subscription status updates correctly

## Step 6: Go Live

1. Set `PAYPAL_MODE` environment variable to `production`
2. Update `PAYPAL_CLIENT_ID` and `PAYPAL_SECRET` with production credentials
3. Create a new subscription plan using the admin setup page (repeat Step 3)
4. Set up production webhooks (repeat Step 4 with production credentials)
5. Test with a real payment to confirm everything works

## Pricing Structure

- **Free Plan**: $0/month
  - Create profile
  - Browse matches
  - 5 messages per day
  - See mutual matches

- **Premium Plan**: $29.99/month
  - All Free features
  - Unlimited messaging
  - See who liked you
  - Priority matching
  - Enhanced privacy controls
  - 5 super likes per day
  - Monthly profile boost

## Troubleshooting

### "Payment system not configured" error
- Verify that PAYPAL_CLIENT_ID and PAYPAL_SECRET are set correctly
- Check that the environment variables are available to the server

### "Plan not found" error
- Run the admin setup to create a subscription plan
- Verify that the plan was created successfully in PayPal dashboard

### Subscription not activating
- Check webhook configuration
- Verify webhook URL is correct
- Check server logs for webhook errors
- Ensure webhook events are properly subscribed

### PayPal button not appearing
- Check browser console for errors
- Verify PAYPAL_CLIENT_ID is correct
- Clear browser cache and reload

## Support

For PayPal-specific issues:
- PayPal Developer Documentation: https://developer.paypal.com/docs/subscriptions/
- PayPal Support: https://www.paypal.com/us/smarthelp/contact-us

For Haply app issues:
- Check server logs in Supabase dashboard
- Review webhook delivery status in PayPal dashboard
- Contact your development team

## Security Notes

- Never commit PayPal credentials to version control
- Use environment variables for all sensitive data
- PAYPAL_SECRET must remain confidential
- Use HTTPS for all PayPal communication
- Implement webhook signature verification for production
- Regularly review PayPal transaction logs
