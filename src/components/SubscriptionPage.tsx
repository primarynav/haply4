import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Crown, Sparkles, Shield, Heart, MessageCircle, Users, Star, X } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';

interface SubscriptionPageProps {
  user: { name: string; email: string };
  onBack: () => void;
}

interface SubscriptionStatus {
  status: 'free' | 'premium';
  isPremium: boolean;
  subscriptionId?: string;
  nextBillingTime?: string;
  cancelledAt?: string;
}

export function SubscriptionPage({ user, onBack }: SubscriptionPageProps) {
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ 
    status: 'free', 
    isPremium: false 
  });
  const [loading, setLoading] = useState(true);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load PayPal SDK
  useEffect(() => {
    const loadPayPalScript = async () => {
      try {
        // Get PayPal Client ID from the server
        const configResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/paypal/config`,
          {
            headers: {
              'Authorization': `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!configResponse.ok) {
          setError('Failed to load payment configuration. Please contact support.');
          return;
        }

        const config = await configResponse.json();
        const clientId = config.clientId;

        if (!clientId) {
          setError('Payment system not configured. Please contact support.');
          return;
        }

        // Set plan ID if available
        if (config.planId) {
          setPlanId(config.planId);
        }
        
        if (document.querySelector('script[src*="paypal.com/sdk/js"]')) {
          setPaypalLoaded(true);
          return;
        }

        const script = document.createElement('script');
        script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&vault=true&intent=subscription`;
        script.async = true;
        script.onload = () => setPaypalLoaded(true);
        script.onerror = () => {
          setError('Failed to load PayPal. Please refresh the page.');
        };
        document.body.appendChild(script);
      } catch (err) {
        console.error('Error loading PayPal:', err);
        setError('Failed to load PayPal SDK');
      }
    };

    loadPayPalScript();
  }, []);

  // Fetch subscription status
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        // SECURITY: Use authenticated session token
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || publicAnonKey;
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/subscription/${encodeURIComponent(user.email)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data);
        }
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionStatus();
  }, [user.email]);

  // Note: Plan ID is now loaded in the PayPal SDK loading effect above
  // This useEffect is kept for backwards compatibility but is no longer needed

  // Render PayPal button when ready
  useEffect(() => {
    if (paypalLoaded && planId && !subscriptionStatus.isPremium && window.paypal) {
      const container = document.getElementById('paypal-button-container');
      if (container && container.children.length === 0) {
        window.paypal.Buttons({
          style: {
            shape: 'rect',
            color: 'gold',
            layout: 'vertical',
            label: 'subscribe'
          },
          createSubscription: function(data: any, actions: any) {
            return actions.subscription.create({
              plan_id: planId,
              custom_id: user.email,
              subscriber: {
                email_address: user.email,
              }
            });
          },
          onApprove: async function(data: any, actions: any) {
            setProcessing(true);
            try {
              // SECURITY: Use authenticated session token
              const { data: { session } } = await supabase.auth.getSession();
              const token = session?.access_token || publicAnonKey;

              // Activate the subscription in our database
              const response = await fetch(
                `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/subscription/activate`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    email: user.email,
                    subscriptionId: data.subscriptionID,
                  }),
                }
              );

              if (response.ok) {
                const result = await response.json();
                setSubscriptionStatus({
                  status: 'premium',
                  isPremium: true,
                  subscriptionId: data.subscriptionID,
                  nextBillingTime: result.subscription?.billing_info?.next_billing_time,
                });
                setError(null);
              } else {
                const errorData = await response.json();
                setError(errorData.error || 'Failed to activate subscription');
              }
            } catch (err) {
              console.error('Error activating subscription:', err);
              setError('Failed to activate subscription. Please contact support.');
            } finally {
              setProcessing(false);
            }
          },
          onError: function(err: any) {
            console.error('PayPal error:', err);
            setError('Payment failed. Please try again.');
          }
        }).render('#paypal-button-container');
      }
    }
  }, [paypalLoaded, planId, subscriptionStatus.isPremium, user.email]);

  const handleCancelSubscription = async () => {
    if (!confirm('Are you sure you want to cancel your premium subscription? You will lose access to all premium features.')) {
      return;
    }

    setProcessing(true);
    try {
      // SECURITY: Use authenticated session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/subscription/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      if (response.ok) {
        setSubscriptionStatus({
          status: 'free',
          isPremium: false,
          cancelledAt: new Date().toISOString(),
        });
        setError(null);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to cancel subscription');
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err);
      setError('Failed to cancel subscription. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  const premiumFeatures = [
    { icon: MessageCircle, title: 'Unlimited Messaging', description: 'Send unlimited messages to your matches' },
    { icon: Users, title: 'See Who Liked You', description: 'View everyone who has liked your profile' },
    { icon: Star, title: 'Priority Matching', description: 'Get shown to more potential matches' },
    { icon: Shield, title: 'Enhanced Privacy', description: 'Control who sees your profile' },
    { icon: Heart, title: 'Super Likes', description: '5 super likes per day to stand out' },
    { icon: Sparkles, title: 'Profile Boost', description: 'Monthly profile boost for maximum visibility' },
  ];

  const freeFeatures = [
    'Create a detailed profile',
    'Browse potential matches',
    'Send 5 messages per day',
    'See mutual matches',
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-6">
        <div className="max-w-4xl mx-auto">
          <Button onClick={onBack} variant="ghost" className="mb-6">
            ← Back to Dashboard
          </Button>
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading subscription information...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white p-6">
      <div className="max-w-4xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          ← Back to Dashboard
        </Button>

        <div className="text-center mb-8">
          <h1 className="mb-4 text-pink-600">Subscription</h1>
          {subscriptionStatus.isPremium ? (
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
              <Crown className="w-4 h-4 mr-2" />
              Premium Member
            </Badge>
          ) : (
            <Badge variant="secondary">Free Member</Badge>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-red-800">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-600 hover:text-red-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Free Plan */}
          <Card className={!subscriptionStatus.isPremium ? 'border-2 border-pink-300' : ''}>
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Basic features to get started</CardDescription>
              <div className="mt-4">
                <span className="text-gray-900">$0</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {freeFeatures.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              {subscriptionStatus.isPremium && (
                <Button 
                  variant="outline" 
                  className="w-full mt-6"
                  onClick={handleCancelSubscription}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : 'Downgrade to Free'}
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Premium Plan */}
          <Card className={subscriptionStatus.isPremium ? 'border-2 border-purple-500 bg-gradient-to-br from-purple-50 to-pink-50' : 'border-2 border-purple-300'}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Crown className="w-6 h-6 text-purple-600" />
                <CardTitle className="text-purple-900">Premium</CardTitle>
              </div>
              <CardDescription>Unlock all features for the best experience</CardDescription>
              <div className="mt-4">
                <span className="text-gray-900">$29.99</span>
                <span className="text-gray-600">/month</span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature, index) => {
                  const Icon = feature.icon;
                  return (
                    <li key={index} className="flex items-start gap-3">
                      <Icon className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-gray-900">{feature.title}</p>
                        <p className="text-gray-600">{feature.description}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {subscriptionStatus.isPremium ? (
                <div className="space-y-3">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-800">✓ You're subscribed to Premium</p>
                    {subscriptionStatus.nextBillingTime && (
                      <p className="text-green-700 mt-1">
                        Next billing: {new Date(subscriptionStatus.nextBillingTime).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleCancelSubscription}
                    disabled={processing}
                  >
                    {processing ? 'Processing...' : 'Cancel Subscription'}
                  </Button>
                </div>
              ) : (
                <div>
                  {!planId ? (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg space-y-3">
                      <p className="text-yellow-800">
                        ⚠️ Payment system requires setup
                      </p>
                      <p className="text-sm text-yellow-700">
                        The subscription plan needs to be created by an administrator. 
                        Please visit the admin setup page to complete the configuration.
                      </p>
                      <Button 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => window.location.href = '?admin=setup'}
                      >
                        Go to Admin Setup
                      </Button>
                    </div>
                  ) : processing ? (
                    <Button disabled className="w-full">
                      Processing...
                    </Button>
                  ) : (
                    <div id="paypal-button-container" className="w-full"></div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Additional Information */}
        <Card>
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-gray-900 mb-2">Can I cancel anytime?</h3>
              <p className="text-gray-600">
                Yes! You can cancel your premium subscription at any time. You'll continue to have access until the end of your billing period.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">Will I lose my matches if I downgrade?</h3>
              <p className="text-gray-600">
                No, your matches and profile information will remain intact. You'll just have limited access to some premium features.
              </p>
            </div>
            <div>
              <h3 className="text-gray-900 mb-2">Is my payment information secure?</h3>
              <p className="text-gray-600">
                Absolutely. All payments are processed securely through PayPal. We never store your payment details on our servers.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Extend window interface for PayPal SDK
declare global {
  interface Window {
    paypal?: any;
  }
}