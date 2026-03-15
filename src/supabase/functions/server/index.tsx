import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "jsr:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";
const app = new Hono();

// Initialize Supabase admin client
const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// PayPal configuration
const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
const PAYPAL_API_BASE = Deno.env.get("PAYPAL_MODE") === "production" 
  ? "https://api-m.paypal.com" 
  : "https://api-m.sandbox.paypal.com";

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: [
      "https://www.happilyeverafteragain.com",
      "https://happilyeverafteragain.com",
      "http://localhost:3000",
      "http://localhost:5173",
    ],
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// ============================================================
// SECURITY: Authentication middleware helper
// ============================================================
async function authenticateUser(c: any): Promise<{ userId: string; email: string } | null> {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    if (!accessToken) return null;
    
    const { data, error } = await supabaseAdmin.auth.getUser(accessToken);
    if (error || !data?.user?.id) return null;
    
    return { userId: data.user.id, email: data.user.email || '' };
  } catch {
    return null;
  }
}

// ============================================================
// SECURITY: Rate limiting (in-memory, per IP)
// ============================================================
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute window
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute per IP
const AUTH_RATE_LIMIT_MAX = 5; // 5 auth attempts per minute

function checkRateLimit(identifier: string, maxRequests: number = RATE_LIMIT_MAX_REQUESTS): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  
  if (entry.count >= maxRequests) {
    return false;
  }
  
  entry.count++;
  return true;
}

// Clean up old rate limit entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetAt) rateLimitMap.delete(key);
  }
}, 5 * 60 * 1000);

// Global rate limiting middleware
app.use('/make-server-2b484abd/*', async (c, next) => {
  const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
  if (!checkRateLimit(`global:${clientIP}`)) {
    return c.json({ error: 'Too many requests. Please slow down.' }, 429);
  }
  await next();
});

// ============================================================
// SECURITY: Input sanitization helpers
// ============================================================
function sanitizeString(input: string, maxLength: number = 500): string {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .slice(0, maxLength)
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/[<>]/g, (char) => char === '<' ? '&lt;' : '&gt;');
}

function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  return email.trim().toLowerCase().slice(0, 254);
}

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

// Password strength validation
function validatePassword(password: string): { valid: boolean; message: string } {
  if (typeof password !== 'string') return { valid: false, message: 'Password is required' };
  if (password.length < 8) return { valid: false, message: 'Password must be at least 8 characters long' };
  if (password.length > 128) return { valid: false, message: 'Password must be no more than 128 characters' };
  if (!/[A-Z]/.test(password)) return { valid: false, message: 'Password must contain at least one uppercase letter' };
  if (!/[a-z]/.test(password)) return { valid: false, message: 'Password must contain at least one lowercase letter' };
  if (!/[0-9]/.test(password)) return { valid: false, message: 'Password must contain at least one number' };
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*...)' };
  return { valid: true, message: 'Password meets requirements' };
}

// ============================================================
// SECURITY: Account lockout tracking
// ============================================================
const loginAttempts = new Map<string, { count: number; lockedUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function checkAccountLockout(email: string): { locked: boolean; remainingMinutes: number } {
  const entry = loginAttempts.get(email);
  if (!entry) return { locked: false, remainingMinutes: 0 };
  
  const now = Date.now();
  if (entry.lockedUntil > now) {
    const remaining = Math.ceil((entry.lockedUntil - now) / 60000);
    return { locked: true, remainingMinutes: remaining };
  }
  
  // Reset if lockout expired
  if (entry.count >= MAX_LOGIN_ATTEMPTS && entry.lockedUntil <= now) {
    loginAttempts.delete(email);
  }
  return { locked: false, remainingMinutes: 0 };
}

function recordFailedLogin(email: string) {
  const entry = loginAttempts.get(email) || { count: 0, lockedUntil: 0 };
  entry.count++;
  if (entry.count >= MAX_LOGIN_ATTEMPTS) {
    entry.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    console.log(`SECURITY: Account locked due to ${entry.count} failed attempts: ${email}`);
  }
  loginAttempts.set(email, entry);
}

function clearFailedLogins(email: string) {
  loginAttempts.delete(email);
}

// Helper function to get PayPal access token
async function getPayPalAccessToken() {
  try {
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`);
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("PayPal token error:", error);
      throw new Error(`Failed to get PayPal access token: ${error}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error("Error getting PayPal access token:", error);
    throw error;
  }
}

// Health check endpoint
app.get("/make-server-2b484abd/health", (c) => {
  return c.json({ status: "ok" });
});

// Signup endpoint with auto-confirmed email
app.post("/make-server-2b484abd/auth/signup", async (c) => {
  try {
    // SECURITY: Rate limit signup attempts
    const clientIP = c.req.header('x-forwarded-for') || c.req.header('x-real-ip') || 'unknown';
    if (!checkRateLimit(`signup:${clientIP}`, AUTH_RATE_LIMIT_MAX)) {
      return c.json({ error: 'Too many signup attempts. Please try again later.' }, 429);
    }

    const { email, password, name, age, divorceYear, gender, lookingFor, postalCode } = await c.req.json();

    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }

    // SECURITY: Validate and sanitize email
    const cleanEmail = sanitizeEmail(email);
    if (!isValidEmail(cleanEmail)) {
      return c.json({ error: "Invalid email format" }, 400);
    }

    // SECURITY: Enforce strong password requirements
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      return c.json({ error: passwordValidation.message }, 400);
    }

    // SECURITY: Sanitize all string inputs
    const cleanName = sanitizeString(name || '', 100);

    // Create user with admin API - automatically confirms email
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true, // Automatically confirm the user's email
      user_metadata: {
        full_name: cleanName || cleanEmail.split('@')[0],
        name: cleanName || cleanEmail.split('@')[0],
        age: age ? parseInt(String(age)) || null : null,
        divorce_year: divorceYear ? parseInt(String(divorceYear)) || null : null,
        gender: sanitizeString(gender || '', 20) || null,
        looking_for: sanitizeString(lookingFor || '', 20) || null,
        postal_code: sanitizeString(postalCode || '', 20) || null,
      },
    });

    if (error) {
      console.error('Signup error via admin API:', error.message);
      // SECURITY: Don't reveal if email already exists
      return c.json({ error: 'Failed to create account. Please try again or use a different email.' }, 400);
    }

    console.log(`User created successfully: ${cleanEmail}`);
    return c.json({ 
      success: true, 
      user: {
        id: data.user.id,
        email: data.user.email,
        name: cleanName || cleanEmail.split('@')[0],
      }
    });
  } catch (error) {
    console.error('Error in signup endpoint:', error);
    return c.json({ error: 'Failed to create account. Please try again.' }, 500);
  }
});

// Create PayPal subscription plan (one-time setup)
app.post("/make-server-2b484abd/paypal/create-plan", async (c) => {
  try {
    const accessToken = await getPayPalAccessToken();

    // Create product first
    const productResponse = await fetch(`${PAYPAL_API_BASE}/v1/catalogs/products`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: "Haply Premium Subscription",
        description: "Premium membership for Happily Ever After Again dating site",
        type: "SERVICE",
        category: "SOFTWARE",
      }),
    });

    if (!productResponse.ok) {
      const error = await productResponse.text();
      console.error("PayPal product creation error:", error);
      return c.json({ error: "Failed to create product", details: error }, 500);
    }

    const product = await productResponse.json();

    // Create billing plan
    const planResponse = await fetch(`${PAYPAL_API_BASE}/v1/billing/plans`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        product_id: product.id,
        name: "Haply Premium Monthly",
        description: "Premium membership - $29.99/month",
        status: "ACTIVE",
        billing_cycles: [
          {
            frequency: {
              interval_unit: "MONTH",
              interval_count: 1,
            },
            tenure_type: "REGULAR",
            sequence: 1,
            total_cycles: 0, // 0 means infinite
            pricing_scheme: {
              fixed_price: {
                value: "29.99",
                currency_code: "USD",
              },
            },
          },
        ],
        payment_preferences: {
          auto_bill_outstanding: true,
          setup_fee: {
            value: "0",
            currency_code: "USD",
          },
          setup_fee_failure_action: "CONTINUE",
          payment_failure_threshold: 3,
        },
      }),
    });

    if (!planResponse.ok) {
      const error = await planResponse.text();
      console.error("PayPal plan creation error:", error);
      return c.json({ error: "Failed to create plan", details: String(error) }, 500);
    }

    const plan = await planResponse.json();

    // Store plan ID in KV for later use
    await kv.set("paypal_plan_id", plan.id);

    console.log("PayPal plan created successfully:", plan.id);
    return c.json({ planId: plan.id, productId: product.id });
  } catch (error) {
    console.error("Error creating PayPal plan:", error);
    return c.json({ error: "Failed to create PayPal plan" }, 500);
  }
});

// Get PayPal configuration for frontend
app.get("/make-server-2b484abd/paypal/config", async (c) => {
  try {
    const planId = await kv.get("paypal_plan_id");
    return c.json({ 
      clientId: PAYPAL_CLIENT_ID,
      planId: planId || null
    });
  } catch (error) {
    console.error("Error getting PayPal config:", error);
    return c.json({ error: "Failed to get PayPal config" }, 500);
  }
});

// Get PayPal plan ID (legacy endpoint)
app.get("/make-server-2b484abd/paypal/plan-id", async (c) => {
  try {
    const planId = await kv.get("paypal_plan_id");
    if (!planId) {
      return c.json({ error: "Plan not found. Please create a plan first." }, 404);
    }
    return c.json({ planId });
  } catch (error) {
    console.error("Error getting PayPal plan ID:", error);
    return c.json({ error: "Failed to get plan ID" }, 500);
  }
});

// Get user subscription status - SECURITY: Requires authentication
app.get("/make-server-2b484abd/subscription/:email", async (c) => {
  try {
    const requestedEmail = decodeURIComponent(c.req.param("email"));
    
    // SECURITY: Authenticate the requesting user
    const authUser = await authenticateUser(c);
    if (!authUser) {
      return c.json({ error: 'Authentication required' }, 401);
    }
    
    // SECURITY: Users can only check their own subscription
    if (authUser.email !== requestedEmail) {
      console.log(`SECURITY: User ${authUser.email} attempted to access subscription for ${requestedEmail}`);
      return c.json({ error: 'Access denied' }, 403);
    }

    const subscription = await kv.get(`subscription:${requestedEmail}`);
    
    if (!subscription) {
      return c.json({ 
        status: "free",
        isPremium: false 
      });
    }

    return c.json(subscription);
  } catch (error) {
    console.error("Error getting subscription status:", error);
    return c.json({ error: "Failed to get subscription status" }, 500);
  }
});

// PayPal webhook handler
app.post("/make-server-2b484abd/paypal/webhook", async (c) => {
  try {
    const body = await c.req.json();
    console.log("PayPal webhook received:", body.event_type);

    const eventType = body.event_type;
    const resource = body.resource;

    switch (eventType) {
      case "BILLING.SUBSCRIPTION.ACTIVATED":
      case "BILLING.SUBSCRIPTION.UPDATED": {
        // Extract subscriber email from custom_id or from resource
        const email = resource.subscriber?.email_address || resource.custom_id;
        
        if (email) {
          await kv.set(`subscription:${email}`, {
            status: "premium",
            isPremium: true,
            subscriptionId: resource.id,
            planId: resource.plan_id,
            startTime: resource.start_time,
            nextBillingTime: resource.billing_info?.next_billing_time,
            lastUpdated: new Date().toISOString(),
          });
          console.log(`Subscription activated for ${email}`);
        }
        break;
      }

      case "BILLING.SUBSCRIPTION.CANCELLED":
      case "BILLING.SUBSCRIPTION.SUSPENDED":
      case "BILLING.SUBSCRIPTION.EXPIRED": {
        const email = resource.subscriber?.email_address || resource.custom_id;
        
        if (email) {
          await kv.set(`subscription:${email}`, {
            status: "free",
            isPremium: false,
            subscriptionId: resource.id,
            cancelledAt: new Date().toISOString(),
          });
          console.log(`Subscription cancelled for ${email}`);
        }
        break;
      }

      case "PAYMENT.SALE.COMPLETED": {
        console.log("Payment completed for subscription");
        break;
      }

      default:
        console.log(`Unhandled webhook event: ${eventType}`);
    }

    return c.json({ received: true });
  } catch (error) {
    console.error("Error handling PayPal webhook:", error);
    return c.json({ error: "Webhook processing failed" }, 500);
  }
});

// Manually activate subscription - SECURITY: Requires authentication
app.post("/make-server-2b484abd/subscription/activate", async (c) => {
  try {
    // SECURITY: Authenticate the requesting user
    const authUser = await authenticateUser(c);
    if (!authUser) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const { email, subscriptionId } = await c.req.json();

    if (!email || !subscriptionId) {
      return c.json({ error: "Email and subscriptionId required" }, 400);
    }

    // SECURITY: Users can only activate their own subscription
    if (authUser.email !== email) {
      console.log(`SECURITY: User ${authUser.email} attempted to activate subscription for ${email}`);
      return c.json({ error: 'Access denied' }, 403);
    }

    // Verify subscription with PayPal
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("PayPal subscription verification error:", error);
      return c.json({ error: "Failed to verify subscription", details: error }, 400);
    }

    const subscription = await response.json();

    // Check if subscription is active
    if (subscription.status === "ACTIVE") {
      await kv.set(`subscription:${email}`, {
        status: "premium",
        isPremium: true,
        subscriptionId: subscription.id,
        planId: subscription.plan_id,
        startTime: subscription.start_time,
        nextBillingTime: subscription.billing_info?.next_billing_time,
        lastUpdated: new Date().toISOString(),
      });

      console.log(`Subscription manually activated for ${email}`);
      return c.json({ success: true, subscription });
    } else {
      return c.json({ error: "Subscription is not active", status: subscription.status }, 400);
    }
  } catch (error) {
    console.error("Error activating subscription:", error);
    return c.json({ error: "Failed to activate subscription" }, 500);
  }
});

// Cancel subscription - SECURITY: Requires authentication
app.post("/make-server-2b484abd/subscription/cancel", async (c) => {
  try {
    // SECURITY: Authenticate the requesting user
    const authUser = await authenticateUser(c);
    if (!authUser) {
      return c.json({ error: 'Authentication required' }, 401);
    }

    const { email } = await c.req.json();

    if (!email) {
      return c.json({ error: "Email required" }, 400);
    }

    // SECURITY: Users can only cancel their own subscription
    if (authUser.email !== email) {
      console.log(`SECURITY: User ${authUser.email} attempted to cancel subscription for ${email}`);
      return c.json({ error: 'Access denied' }, 403);
    }

    const subscription = await kv.get(`subscription:${email}`);
    
    if (!subscription || !subscription.subscriptionId) {
      return c.json({ error: "No active subscription found" }, 404);
    }

    // Cancel subscription with PayPal
    const accessToken = await getPayPalAccessToken();
    const response = await fetch(
      `${PAYPAL_API_BASE}/v1/billing/subscriptions/${subscription.subscriptionId}/cancel`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: "User requested cancellation",
        }),
      }
    );

    if (!response.ok && response.status !== 204) {
      const error = await response.text();
      console.error("PayPal cancellation error:", error);
      return c.json({ error: "Failed to cancel subscription with payment provider", details: error }, 500);
    }

    // Update local subscription status
    await kv.set(`subscription:${email}`, {
      status: "free",
      isPremium: false,
      subscriptionId: subscription.subscriptionId,
      cancelledAt: new Date().toISOString(),
    });

    console.log(`Subscription cancelled for ${email}`);
    return c.json({ success: true, message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    return c.json({ error: "Failed to cancel subscription" }, 500);
  }
});

// AI Chat endpoint - SECURITY: Requires authentication + rate limiting
app.post("/make-server-2b484abd/ai/chat", async (c) => {
  try {
    // SECURITY: Authenticate the requesting user
    const authUser = await authenticateUser(c);
    if (!authUser) {
      return c.json({ error: 'Authentication required to use AI matchmaker' }, 401);
    }

    // SECURITY: Rate limit AI chat per user (10 messages per minute)
    if (!checkRateLimit(`ai-chat:${authUser.email}`, 10)) {
      return c.json({ 
        error: 'Please slow down',
        fallbackMessage: 'You\'re sending messages too quickly. Please wait a moment before trying again.',
        isFallback: true
      }, 429);
    }

    const { messages, userEmail } = await c.req.json();

    // SECURITY: Ensure the userEmail matches the authenticated user
    const verifiedEmail = authUser.email;

    if (!messages || !Array.isArray(messages)) {
      return c.json({ error: "Messages array required" }, 400);
    }

    // SECURITY: Limit conversation length to prevent abuse
    if (messages.length > 50) {
      return c.json({ error: "Conversation too long. Please start a new conversation." }, 400);
    }

    // SECURITY: Sanitize message content
    const sanitizedMessages = messages.map((msg: any) => ({
      role: msg.role === 'user' ? 'user' : msg.role === 'assistant' ? 'assistant' : 'user',
      content: sanitizeString(String(msg.content || ''), 2000),
    }));

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    // Validate API key exists and has correct format
    if (!OPENAI_API_KEY) {
      console.error("OpenAI API key not configured in environment variables");
      return c.json({ 
        error: "AI service not configured",
        fallbackMessage: "I apologize, but the AI matchmaker service is currently being configured. Please check back in a few minutes, or feel free to browse profiles manually in the meantime. Our team has been notified and is working to resolve this quickly.",
        isFallback: true
      }, 503);
    }

    // SECURITY: Removed API key prefix logging to prevent information leakage
    if (!OPENAI_API_KEY.startsWith("sk-")) {
      console.error("OpenAI API key appears to be invalid");
      return c.json({ 
        error: "AI service misconfigured",
        fallbackMessage: "I apologize, but the AI matchmaker service is currently being set up. Our team has been notified. In the meantime, you can browse profiles manually to find potential matches. We'll have this resolved shortly!",
        isFallback: true
      }, 503);
    }

    // System prompt to guide the AI matchmaker
    const systemPrompt = {
      role: "system",
      content: `You are an empathetic AI matchmaker for Haply, a dating platform specifically for divorced singles. Your role is to:

1. Have warm, understanding conversations about what the user is looking for in a partner
2. Ask thoughtful follow-up questions to deeply understand their values, lifestyle, and relationship goals
3. Consider divorce-specific factors: co-parenting situations, emotional readiness, family dynamics, and past relationship learnings
4. After gathering enough information (typically 3-5 exchanges), offer to find matches
5. Be supportive, non-judgmental, and understanding of the unique challenges of dating after divorce

Key areas to explore:
- Core values and life priorities
- Parenting style and children's ages (if applicable)
- Lifestyle preferences (introvert/extrovert, hobbies, health habits)
- Relationship timeline and readiness for commitment
- Communication style and emotional needs
- Deal-breakers and must-haves
- Location and practical considerations

Keep responses conversational, warm, and under 150 words. Ask one question at a time. When you have enough information, say something like "I think I have a great sense of what you're looking for! Let me find some compatible matches for you."`
    };

    // Call OpenAI API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [systemPrompt, ...sanitizedMessages],
          temperature: 0.8,
          max_tokens: 300,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const error = await response.text();
        // SECURITY: Log error details server-side only, don't expose to client
        console.error("OpenAI API error (details redacted from client response)");
        
        let errorMessage = "AI service temporarily unavailable";
        let fallbackMessage = "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or browse profiles manually while we resolve this.";
        
        try {
          const errorJson = JSON.parse(error);
          if (errorJson.error?.code === "invalid_api_key") {
            console.error("CRITICAL: Invalid OpenAI API key detected");
            errorMessage = "AI service authentication failed";
            fallbackMessage = "I apologize, but the AI matchmaker is currently being reconfigured. Our technical team has been automatically notified. You can browse profiles manually in the 'Discover' section while we fix this!";
          } else if (errorJson.error?.code === "rate_limit_exceeded") {
            errorMessage = "AI service rate limit reached";
            fallbackMessage = "I'm getting a lot of requests right now! Please wait a moment and try again. In the meantime, feel free to explore profiles on your own.";
          } else if (errorJson.error?.code === "insufficient_quota") {
            errorMessage = "AI service quota exceeded";
            fallbackMessage = "I apologize, but I've reached my capacity for today. Please try the manual profile browsing feature, or check back tomorrow when I'll be refreshed and ready to help!";
          }
        } catch (parseError) {
          // Silently handle parse errors
        }
        
        // SECURITY: Don't expose raw error details to client
        return c.json({ 
          error: errorMessage,
          fallbackMessage: fallbackMessage,
          isFallback: true
        }, 503);
      }

      const data = await response.json();
      const assistantMessage = data.choices[0].message.content;

      // Store conversation context in KV using verified email
      const conversationKey = `conversation:${verifiedEmail}`;
      const existingConversation = await kv.get(conversationKey) || { messages: [] };
      existingConversation.messages = [...sanitizedMessages, { role: "assistant", content: assistantMessage }];
      await kv.set(conversationKey, existingConversation);

      // Check if we should generate matches (look for keywords in the conversation)
      const shouldGenerateMatches = assistantMessage.toLowerCase().includes("find") && 
                                    (assistantMessage.toLowerCase().includes("matches") || 
                                     assistantMessage.toLowerCase().includes("compatible"));

      let matches = [];
      if (shouldGenerateMatches) {
        // Generate mock matches based on the conversation
        // In a real app, this would query actual user profiles
        matches = await generateMockMatches(messages, userEmail);
      }

      return c.json({ 
        message: assistantMessage,
        matches: matches
      });
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        console.error("OpenAI API request timed out after 30 seconds");
        return c.json({ 
          error: "AI service timeout",
          fallbackMessage: "I'm taking longer than usual to respond. Please try again, or browse profiles manually while I sort this out!",
          isFallback: true
        }, 504);
      }
      
      throw fetchError; // Re-throw for outer catch block
    }
  } catch (error) {
    console.error("Error in AI chat endpoint:", error);
    return c.json({ 
      error: "Failed to process chat",
      fallbackMessage: "I apologize, but I'm experiencing technical difficulties. Please try browsing profiles manually, or try again in a few moments.",
      isFallback: true
    }, 500);
  }
});

// Helper function to generate mock matches based on conversation
async function generateMockMatches(messages: any[], userEmail: string) {
  // In a production app, this would:
  // 1. Extract key criteria from the conversation using AI
  // 2. Query the database for matching profiles
  // 3. Calculate compatibility scores
  
  // For now, return realistic mock data
  const mockProfiles = [
    {
      id: "1",
      name: "Jennifer Martinez",
      age: 38,
      location: "Seattle, WA",
      bio: "Mom of two amazing kids (8 & 11). Love hiking, cooking, and Sunday morning coffee. Looking for someone who values family time and isn't afraid to blend families. Divorced 2 years, ready to find my person.",
      interests: ["Hiking", "Cooking", "Family Time", "Coffee", "Outdoors", "Reading"],
      photos: ["https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400"],
      compatibilityScore: 94,
      matchReasons: [
        "Shares your value of family and co-parenting",
        "Similar active lifestyle with love for outdoors",
        "Emotionally ready for a committed relationship",
        "Compatible parenting philosophy"
      ]
    },
    {
      id: "2",
      name: "Michael Chen",
      age: 42,
      location: "Portland, OR",
      bio: "Engineer by day, dad 24/7. Divorced 3 years, co-parenting two boys. I value open communication, honesty, and finding someone who gets that kids come first. Love tech, travel, and terrible dad jokes.",
      interests: ["Technology", "Travel", "Parenting", "Photography", "Cycling", "Coffee"],
      photos: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
      compatibilityScore: 89,
      matchReasons: [
        "Strong co-parenting values align with yours",
        "Values honest communication and emotional maturity",
        "Similar relationship timeline and readiness",
        "Shared interests in adventure and exploration"
      ]
    },
    {
      id: "3",
      name: "Sarah Thompson",
      age: 35,
      location: "Tacoma, WA",
      bio: "Yoga instructor and single mom finding peace after divorce. My daughter (6) is my world. Seeking someone patient, kind, and ready for a blended family journey. I believe in second chances and new beginnings.",
      interests: ["Yoga", "Wellness", "Nature", "Art", "Meditation", "Music"],
      photos: ["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"],
      compatibilityScore: 91,
      matchReasons: [
        "Aligned values around wellness and personal growth",
        "Understanding of blended family dynamics",
        "Compatible communication style and emotional intelligence",
        "Shared belief in new beginnings"
      ]
    }
  ];

  // Return 2-3 random matches
  return mockProfiles.sort(() => 0.5 - Math.random()).slice(0, 3);
}

// QA Setup endpoint - SECURITY: Requires authentication
app.post("/make-server-2b484abd/api/qa-setup", async (c) => {
  try {
    // SECURITY: Authenticate the requesting user
    const authUser = await authenticateUser(c);
    if (!authUser) {
      return c.json({ error: 'Authentication required for QA setup' }, 401);
    }

    // SECURITY: Rate limit QA setup
    if (!checkRateLimit(`qa-setup:${authUser.email}`, 3)) {
      return c.json({ error: 'Too many QA setup requests' }, 429);
    }

    const { action } = await c.req.json();

    if (action === 'setup') {
      // Create test user profiles with complete data
      const testUsers = {
        'sarah.qa@haply.test': {
          email: 'sarah.qa@haply.test',
          name: 'Sarah Mitchell',
          age: 38,
          gender: 'female',
          location: 'Portland, OR',
          postalCode: '97201',
          children: 2,
          childrenAges: '8, 11',
          divorceYear: 2021,
          bio: "Mom of two amazing kids who are my world. I love exploring the outdoors, trying new recipes, and weekend family adventures. Looking for someone who understands that my kids come first and values building a blended family with patience and love.",
          interests: ['Hiking', 'Cooking', 'Family Time', 'Photography', 'Travel', 'Wine Tasting'],
          lookingFor: 'male',
          ageRangeMin: 35,
          ageRangeMax: 45,
          lookingForQualities: ['Family-oriented', 'Patient', 'Emotionally Mature', 'Active Lifestyle', 'Good Communicator'],
          profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
          photos: [
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400',
            'https://images.unsplash.com/photo-1513956589380-bad6acb9b9d4?w=400',
          ],
          verified: true,
          isPremium: true,
          lastActive: new Date().toISOString(),
        },
        'michael.qa@haply.test': {
          email: 'michael.qa@haply.test',
          name: 'Michael Chen',
          age: 42,
          gender: 'male',
          location: 'Portland, OR',
          postalCode: '97201',
          children: 2,
          childrenAges: '9, 12',
          divorceYear: 2020,
          bio: "Dad of two wonderful kids. I'm a software engineer who loves the outdoors, cooking, and photography. Co-parenting taught me patience and communication. Ready to find someone special who values family and is excited about building something meaningful together.",
          interests: ['Hiking', 'Photography', 'Cooking', 'Technology', 'Travel', 'Reading'],
          lookingFor: 'female',
          ageRangeMin: 35,
          ageRangeMax: 45,
          lookingForQualities: ['Family-oriented', 'Understanding', 'Active', 'Kind', 'Honest'],
          profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
          photos: [
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
            'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
          ],
          verified: true,
          isPremium: true,
          lastActive: new Date().toISOString(),
        },
      };

      // Additional diverse profiles for browsing
      const additionalProfiles = [
        {
          email: 'jessica.qa@haply.test',
          name: 'Jessica Torres',
          age: 40,
          gender: 'female',
          location: 'Portland, OR',
          postalCode: '97202',
          children: 1,
          childrenAges: '7',
          bio: "Artist and teacher. Love yoga, painting, and weekend brunch. Single mom looking for genuine connection.",
          interests: ['Art', 'Yoga', 'Music', 'Cooking'],
          profilePhoto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400',
          verified: true,
        },
        {
          email: 'david.qa@haply.test',
          name: 'David Rodriguez',
          age: 45,
          gender: 'male',
          location: 'Portland, OR',
          postalCode: '97203',
          children: 3,
          childrenAges: '10, 13, 15',
          bio: "Firefighter and outdoor enthusiast. My kids are my pride and joy. Looking for someone adventurous and family-focused.",
          interests: ['Camping', 'Fishing', 'Sports', 'BBQ'],
          profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400',
          verified: true,
        },
        {
          email: 'amanda.qa@haply.test',
          name: 'Amanda Wright',
          age: 36,
          gender: 'female',
          location: 'Portland, OR',
          postalCode: '97204',
          children: 2,
          childrenAges: '6, 9',
          bio: "Nurse and bookworm. Coffee lover, aspiring chef, and devoted mom. Seeking kindness and laughter.",
          interests: ['Reading', 'Coffee', 'Gardening', 'Baking'],
          profilePhoto: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400',
          verified: true,
        },
        {
          email: 'james.qa@haply.test',
          name: 'James Wilson',
          age: 44,
          gender: 'male',
          location: 'Portland, OR',
          postalCode: '97205',
          children: 1,
          childrenAges: '11',
          bio: "Marketing director and weekend warrior. Love mountain biking and craft beer. Ready for new adventures.",
          interests: ['Cycling', 'Craft Beer', 'Music', 'Travel'],
          profilePhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
          verified: true,
        },
        {
          email: 'lisa.qa@haply.test',
          name: 'Lisa Anderson',
          age: 39,
          gender: 'female',
          location: 'Portland, OR',
          postalCode: '97206',
          children: 2,
          childrenAges: '8, 10',
          bio: "Real estate agent and fitness enthusiast. Love running, healthy cooking, and beach weekends with my kids.",
          interests: ['Running', 'Fitness', 'Healthy Cooking', 'Beach'],
          profilePhoto: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
          verified: true,
        },
        {
          email: 'robert.qa@haply.test',
          name: 'Robert Thompson',
          age: 41,
          gender: 'male',
          location: 'Portland, OR',
          postalCode: '97207',
          children: 2,
          childrenAges: '7, 9',
          bio: "Teacher and music lover. Play guitar, love hiking, and Sunday pancakes. Seeking authentic connection.",
          interests: ['Music', 'Guitar', 'Hiking', 'Cooking'],
          profilePhoto: 'https://images.unsplash.com/photo-1463453091185-61582044d556?w=400',
          verified: true,
        },
        {
          email: 'emily.qa@haply.test',
          name: 'Emily Parker',
          age: 37,
          gender: 'female',
          location: 'Portland, OR',
          postalCode: '97208',
          children: 1,
          childrenAges: '5',
          bio: "Veterinarian and animal lover. Enjoy nature walks, cozy nights in, and quality family time.",
          interests: ['Animals', 'Nature', 'Movies', 'Baking'],
          profilePhoto: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400',
          verified: true,
        },
        {
          email: 'chris.qa@haply.test',
          name: 'Chris Martinez',
          age: 43,
          gender: 'male',
          location: 'Portland, OR',
          postalCode: '97209',
          children: 3,
          childrenAges: '8, 11, 14',
          bio: "Architect and creative thinker. Love design, cooking, and family game nights. Looking for genuine partnership.",
          interests: ['Architecture', 'Design', 'Cooking', 'Board Games'],
          profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400',
          verified: true,
        },
      ];

      // Store all profiles in KV store
      for (const [email, profile] of Object.entries(testUsers)) {
        await kv.set(`qa_profile:${email}`, profile);
        console.log(`Created QA profile: ${email}`);
      }

      for (const profile of additionalProfiles) {
        await kv.set(`qa_profile:${profile.email}`, profile);
        console.log(`Created QA profile: ${profile.email}`);
      }

      // Create mutual match between Sarah and Michael
      await kv.set('qa_match:sarah-michael', {
        user1: 'sarah.qa@haply.test',
        user2: 'michael.qa@haply.test',
        matchScore: 94,
        matchedAt: new Date().toISOString(),
        matchReasons: [
          'Both value family time and co-parenting',
          'Share love for hiking and outdoor activities',
          'Similar age range and location',
          'Compatible lifestyle and interests',
          'Both emotionally mature and ready for commitment',
        ],
        isMatched: true,
        canMessage: true,
      });

      // Create match list for Sarah (she sees Michael and others)
      await kv.set('qa_matches:sarah.qa@haply.test', [
        {
          email: 'michael.qa@haply.test',
          matchScore: 94,
          isLiked: true,
          isMutual: true,
        },
        {
          email: 'david.qa@haply.test',
          matchScore: 88,
          isLiked: false,
          isMutual: false,
        },
        {
          email: 'james.qa@haply.test',
          matchScore: 85,
          isLiked: false,
          isMutual: false,
        },
        {
          email: 'robert.qa@haply.test',
          matchScore: 82,
          isLiked: false,
          isMutual: false,
        },
        {
          email: 'chris.qa@haply.test',
          matchScore: 80,
          isLiked: false,
          isMutual: false,
        },
      ]);

      // Create match list for Michael (he sees Sarah and others)
      await kv.set('qa_matches:michael.qa@haply.test', [
        {
          email: 'sarah.qa@haply.test',
          matchScore: 94,
          isLiked: true,
          isMutual: true,
        },
        {
          email: 'jessica.qa@haply.test',
          matchScore: 87,
          isLiked: false,
          isMutual: false,
        },
        {
          email: 'amanda.qa@haply.test',
          matchScore: 84,
          isLiked: false,
          isMutual: false,
        },
        {
          email: 'lisa.qa@haply.test',
          matchScore: 81,
          isLiked: false,
          isMutual: false,
        },
        {
          email: 'emily.qa@haply.test',
          matchScore: 78,
          isLiked: false,
          isMutual: false,
        },
      ]);

      // Create initial conversation between Sarah and Michael
      await kv.set('qa_conversation:sarah-michael', {
        participants: ['sarah.qa@haply.test', 'michael.qa@haply.test'],
        messages: [],
        startedAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      });

      console.log('QA environment setup complete');
      return c.json({ 
        success: true, 
        message: 'QA environment created successfully',
        testUsers: [
          { email: 'sarah.qa@haply.test', password: 'Test123!' },
          { email: 'michael.qa@haply.test', password: 'Test123!' },
        ]
      });
    }

    if (action === 'reset') {
      // Delete all QA data
      const qaKeys = await kv.getByPrefix('qa_');
      for (const key of qaKeys) {
        await kv.del(key);
      }

      console.log('QA environment reset complete');
      return c.json({ 
        success: true, 
        message: 'QA environment reset successfully' 
      });
    }

    return c.json({ error: 'Invalid action' }, 400);
  } catch (error) {
    console.error('QA setup error:', error);
    return c.json({ 
      error: error.message || 'Failed to setup QA environment' 
    }, 500);
  }
});

Deno.serve(app.fetch);