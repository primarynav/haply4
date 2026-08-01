// PayPal subscription webhook.
//
// This endpoint decides who has paid, so it is the only thing standing between
// a forged HTTP request and free access to a paid feature. It cannot use a
// Supabase JWT — PayPal has none to send — so every request is verified against
// PayPal's own signature check before a single row is written, and anything
// that cannot be verified is dropped.
//
// It fails closed everywhere: missing configuration, an unreachable verifier,
// an unrecognised member, or a signature that does not check out all end in no
// write at all.
//
// Configure with:
//   PAYPAL_ENV            sandbox | live   (defaults to sandbox)
//   PAYPAL_CLIENT_ID      REST app client id
//   PAYPAL_CLIENT_SECRET  REST app secret
//   PAYPAL_WEBHOOK_ID     id of the webhook registered in the PayPal dashboard
//
// Deploy with verify_jwt disabled; the signature check above replaces it.

import { createClient } from 'jsr:@supabase/supabase-js@2';

const PAYPAL_HOSTS = {
  sandbox: 'https://api-m.sandbox.paypal.com',
  live: 'https://api-m.paypal.com'
} as const;

/** PayPal event name to the status we store. Anything else is ignored. */
const STATUS_BY_EVENT: Record<string, string> = {
  'BILLING.SUBSCRIPTION.ACTIVATED': 'active',
  'BILLING.SUBSCRIPTION.RE-ACTIVATED': 'active',
  'BILLING.SUBSCRIPTION.UPDATED': 'active',
  'BILLING.SUBSCRIPTION.CANCELLED': 'cancelled',
  'BILLING.SUBSCRIPTION.SUSPENDED': 'suspended',
  'BILLING.SUBSCRIPTION.EXPIRED': 'expired',
  'BILLING.SUBSCRIPTION.PAYMENT.FAILED': 'past_due'
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function paypalToken(host: string, id: string, secret: string): Promise<string | null> {
  const res = await fetch(`${host}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${btoa(`${id}:${secret}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  if (!res.ok) return null;
  const json = await res.json();
  return typeof json.access_token === 'string' ? json.access_token : null;
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') return new Response('method not allowed', { status: 405 });

  const env = (Deno.env.get('PAYPAL_ENV') ?? 'sandbox') === 'live' ? 'live' : 'sandbox';
  const host = PAYPAL_HOSTS[env];
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID');
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET');
  const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID');
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  // Unconfigured means unverifiable, which means we do not touch entitlement.
  if (!clientId || !clientSecret || !webhookId || !supabaseUrl || !serviceKey) {
    console.error('paypal-webhook: not configured');
    return new Response('not configured', { status: 503 });
  }

  // The raw body is what PayPal signed. Parse a copy; never re-serialise the
  // original before verification.
  const raw = await req.text();
  let event: Record<string, unknown>;
  try {
    event = JSON.parse(raw);
  } catch {
    return new Response('bad request', { status: 400 });
  }

  const token = await paypalToken(host, clientId, clientSecret);
  if (!token) {
    // Could not reach PayPal to verify. Returning 5xx makes PayPal retry later,
    // which is what we want — better a delayed entitlement than an unverified one.
    console.error('paypal-webhook: could not obtain PayPal token');
    return new Response('verification unavailable', { status: 503 });
  }

  const verifyRes = await fetch(`${host}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_algo: req.headers.get('paypal-auth-algo'),
      cert_url: req.headers.get('paypal-cert-url'),
      transmission_id: req.headers.get('paypal-transmission-id'),
      transmission_sig: req.headers.get('paypal-transmission-sig'),
      transmission_time: req.headers.get('paypal-transmission-time'),
      webhook_id: webhookId,
      webhook_event: event
    })
  });

  if (!verifyRes.ok) {
    console.error('paypal-webhook: verifier returned', verifyRes.status);
    return new Response('verification unavailable', { status: 503 });
  }
  const verdict = await verifyRes.json();
  if (verdict?.verification_status !== 'SUCCESS') {
    // Either a forgery or a misconfigured webhook id. Either way, nothing is
    // written, and 401 stops PayPal retrying a request that will never verify.
    console.error('paypal-webhook: signature not verified');
    return new Response('unauthorized', { status: 401 });
  }

  const eventType = String(event.event_type ?? '');
  const status = STATUS_BY_EVENT[eventType];
  // Acknowledge events we do not act on, so PayPal stops resending them.
  if (!status) return new Response('ignored', { status: 200 });

  const resource = (event.resource ?? {}) as Record<string, unknown>;
  const subscriptionId = typeof resource.id === 'string' ? resource.id : null;
  // custom_id carries the member's profile id, set when the subscription is
  // created. Without it we cannot say who paid, and guessing is not an option.
  const profileId = typeof resource.custom_id === 'string' ? resource.custom_id : null;

  if (!subscriptionId || !profileId || !UUID.test(profileId)) {
    console.error('paypal-webhook: missing subscription id or custom_id');
    return new Response('unusable event', { status: 200 });
  }

  const billing = (resource.billing_info ?? {}) as Record<string, unknown>;
  const nextBilling = typeof billing.next_billing_time === 'string' ? billing.next_billing_time : null;
  const planId = typeof resource.plan_id === 'string' ? resource.plan_id : null;

  const admin = createClient(supabaseUrl, serviceKey);

  // The member must already exist. A custom_id naming somebody who is not a
  // member is either a mistake or an attempt, and neither should create a row.
  const { data: profile } = await admin.from('profiles').select('id').eq('id', profileId).maybeSingle();
  if (!profile) {
    console.error('paypal-webhook: custom_id does not match a profile');
    return new Response('unknown member', { status: 200 });
  }

  const { error } = await admin
    .from('subscriptions')
    .upsert(
      {
        profile_id: profileId,
        provider: 'paypal',
        provider_subscription_id: subscriptionId,
        plan_id: planId,
        status,
        current_period_end: nextBilling,
        updated_at: new Date().toISOString()
      },
      { onConflict: 'provider_subscription_id' }
    );

  if (error) {
    console.error('paypal-webhook: write failed', error.message);
    // 5xx so PayPal retries rather than dropping a real payment event.
    return new Response('write failed', { status: 500 });
  }

  return new Response('ok', { status: 200 });
});
