import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

interface AdminSetupProps {
  onBack: () => void;
}

export function AdminSetup({ onBack }: AdminSetupProps) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [planInfo, setPlanInfo] = useState<{ planId?: string; productId?: string } | null>(null);

  const handleCreatePlan = async () => {
    setStatus('loading');
    setMessage('Creating PayPal subscription plan...');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/paypal/create-plan`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setPlanInfo(data);
        setStatus('success');
        setMessage('PayPal subscription plan created successfully! The app is now ready to accept premium subscriptions.');
      } else {
        const errorData = await response.json();
        setStatus('error');
        setMessage(errorData.error || 'Failed to create PayPal plan');
        console.error('Error creating plan:', errorData);
      }
    } catch (err) {
      setStatus('error');
      setMessage('Network error. Please check your connection and try again.');
      console.error('Error creating plan:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white p-6">
      <div className="max-w-2xl mx-auto">
        <Button onClick={onBack} variant="ghost" className="mb-6">
          ← Back
        </Button>

        <Card>
          <CardHeader>
            <CardTitle>Admin Setup - PayPal Integration</CardTitle>
            <CardDescription>
              Set up PayPal subscription plans for premium memberships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-semibold">Prerequisites</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  PayPal Business account created
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  PayPal Client ID and Secret configured in environment variables
                </p>
                <p className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  For production: PAYPAL_MODE environment variable set to "production"
                </p>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Step 1: Create Subscription Plan</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will create a PayPal subscription plan for Haply Premium ($29.99/month).
                You only need to do this once.
              </p>
              
              <Button
                onClick={handleCreatePlan}
                disabled={status === 'loading' || status === 'success'}
                className="w-full"
              >
                {status === 'loading' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {status === 'success' ? 'Plan Created ✓' : 'Create PayPal Plan'}
              </Button>
            </div>

            {status !== 'idle' && (
              <div className={`p-4 rounded-lg border ${
                status === 'success' 
                  ? 'bg-green-50 border-green-200' 
                  : status === 'error'
                  ? 'bg-red-50 border-red-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-start gap-3">
                  {status === 'loading' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />}
                  {status === 'success' && <Check className="w-5 h-5 text-green-600 mt-0.5" />}
                  {status === 'error' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  <div className="flex-1">
                    <p className={
                      status === 'success' 
                        ? 'text-green-800' 
                        : status === 'error'
                        ? 'text-red-800'
                        : 'text-blue-800'
                    }>
                      {message}
                    </p>
                    {planInfo && (
                      <div className="mt-2 space-y-1 text-sm text-green-700">
                        <p>Plan ID: <code className="bg-green-100 px-2 py-0.5 rounded">{planInfo.planId}</code></p>
                        <p>Product ID: <code className="bg-green-100 px-2 py-0.5 rounded">{planInfo.productId}</code></p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {status === 'success' && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-3">Next Steps</h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="flex items-start gap-2">
                    <span className="text-green-600 font-semibold">1.</span>
                    Set up PayPal webhook URL in your PayPal dashboard:
                  </p>
                  <code className="block bg-gray-100 p-2 rounded text-xs break-all ml-6">
                    https://{projectId}.supabase.co/functions/v1/make-server-2b484abd/paypal/webhook
                  </code>
                  <p className="flex items-start gap-2 mt-3">
                    <span className="text-green-600 font-semibold">2.</span>
                    Subscribe to these webhook events:
                  </p>
                  <ul className="ml-6 space-y-1">
                    <li>• BILLING.SUBSCRIPTION.ACTIVATED</li>
                    <li>• BILLING.SUBSCRIPTION.UPDATED</li>
                    <li>• BILLING.SUBSCRIPTION.CANCELLED</li>
                    <li>• BILLING.SUBSCRIPTION.SUSPENDED</li>
                    <li>• BILLING.SUBSCRIPTION.EXPIRED</li>
                    <li>• PAYMENT.SALE.COMPLETED</li>
                  </ul>
                  <p className="flex items-start gap-2 mt-3">
                    <span className="text-green-600 font-semibold">3.</span>
                    Users can now upgrade to premium from the Subscription page!
                  </p>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-3">Important Notes</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• For testing, use PayPal Sandbox mode (default)</p>
                <p>• For production, set PAYPAL_MODE=production environment variable</p>
                <p>• Make sure your PayPal account has the necessary permissions for subscriptions</p>
                <p>• Webhook verification is recommended for production use</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}