import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Check, Loader2, ArrowLeft, User, Users, MessageCircle } from 'lucide-react';

interface QASetupProps {
  onBack: () => void;
}

export function QASetup({ onBack }: QASetupProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSetup = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // SECURITY: Use authenticated session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/api/qa-setup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'setup' })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('QA environment setup complete!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to setup QA environment');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error connecting to server');
      console.error('QA Setup Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // SECURITY: Use authenticated session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/api/qa-setup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ action: 'reset' })
        }
      );

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage('QA environment reset complete!');
      } else {
        setStatus('error');
        setMessage(data.error || 'Failed to reset QA environment');
      }
    } catch (error) {
      setStatus('error');
      setMessage('Error connecting to server');
      console.error('QA Reset Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-violet-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-purple-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl text-gray-900 mb-4">QA Environment Setup</h1>
          <p className="text-xl text-gray-600">
            Setup realistic test users and data for comprehensive testing
          </p>
        </div>

        {/* Test Users Card */}
        <Card className="p-8 mb-8">
          <h2 className="text-2xl text-gray-900 mb-6">Test User Accounts</h2>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Female User */}
            <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">Sarah Mitchell</h3>
                  <Badge className="bg-purple-600">Female User</Badge>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> sarah.qa@haply.test</p>
                <p><strong>Password:</strong> Test123!</p>
                <p><strong>Age:</strong> 38</p>
                <p><strong>Location:</strong> Portland, OR</p>
                <p><strong>Children:</strong> 2 (ages 8, 11)</p>
                <p><strong>Interests:</strong> Hiking, Cooking, Family Time</p>
                <p><strong>Looking For:</strong> Male, 35-45, Family-oriented</p>
              </div>
            </div>

            {/* Male User */}
            <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg text-gray-900">Michael Chen</h3>
                  <Badge className="bg-blue-600">Male User</Badge>
                </div>
              </div>
              
              <div className="space-y-2 text-sm">
                <p><strong>Email:</strong> michael.qa@haply.test</p>
                <p><strong>Password:</strong> Test123!</p>
                <p><strong>Age:</strong> 42</p>
                <p><strong>Location:</strong> Portland, OR</p>
                <p><strong>Children:</strong> 2 (ages 9, 12)</p>
                <p><strong>Interests:</strong> Hiking, Photography, Cooking</p>
                <p><strong>Looking For:</strong> Female, 35-45, Family-oriented</p>
              </div>
            </div>
          </div>

          {/* Features Included */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Included Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Complete user profiles with photos and bios</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>AI-generated compatibility scores and match reasons</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Pre-configured filters (age, location, interests)</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Mutual matching enabled for messaging</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Sample conversation starters</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Additional 8 diverse profiles for browsing</span>
              </li>
            </ul>
          </div>

          {/* Testing Scenarios */}
          <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-lg p-6">
            <h3 className="text-lg text-gray-900 mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-purple-600" />
              Test Scenarios
            </h3>
            <ol className="space-y-3 text-sm text-gray-700 list-decimal list-inside">
              <li><strong>Login & Profile:</strong> Login as Sarah, view and edit profile settings</li>
              <li><strong>AI Matching:</strong> Use AI chat to describe preferences, receive matches</li>
              <li><strong>Browse Matches:</strong> View match cards with compatibility scores</li>
              <li><strong>Filter & Refine:</strong> Adjust age range, distance, and interest filters</li>
              <li><strong>Mutual Match:</strong> Both users like each other to unlock messaging</li>
              <li><strong>Messaging:</strong> Send and receive real-time messages</li>
              <li><strong>Profile Views:</strong> View detailed profiles with photos and info</li>
              <li><strong>Cross-Testing:</strong> Login as Michael to test from male perspective</li>
            </ol>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="flex-1 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700 text-white py-6"
          >
            {isLoading && status === 'idle' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Setting Up...
              </>
            ) : (
              <>
                <Users className="w-5 h-5 mr-2" />
                Setup QA Environment
              </>
            )}
          </Button>

          <Button
            onClick={handleReset}
            disabled={isLoading}
            variant="outline"
            className="flex-1 py-6 border-2"
          >
            {isLoading && status !== 'idle' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Resetting...
              </>
            ) : (
              'Reset QA Data'
            )}
          </Button>
        </div>

        {/* Status Message */}
        {message && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              status === 'success'
                ? 'bg-green-50 border border-green-200'
                : status === 'error'
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
            }`}
          >
            <div className="flex items-start gap-3">
              {status === 'success' && <Check className="w-5 h-5 text-green-600 mt-0.5" />}
              {status === 'error' && <span className="text-red-600">❌</span>}
              {status === 'idle' && <Loader2 className="w-5 h-5 text-blue-600 animate-spin mt-0.5" />}
              <div className="flex-1">
                <p
                  className={`${
                    status === 'success'
                      ? 'text-green-800'
                      : status === 'error'
                      ? 'text-red-800'
                      : 'text-blue-800'
                  }`}
                >
                  {message}
                </p>
                {status === 'success' && (
                  <p className="text-sm text-gray-600 mt-2">
                    You can now login with either test account to start testing!
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Important Notes */}
        <Card className="mt-8 p-6 bg-yellow-50 border-yellow-200">
          <h3 className="text-lg text-gray-900 mb-3">⚠️ Important Notes</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>• This is a QA/Testing environment - data is for testing purposes only</li>
            <li>• Test users can be reset at any time using the "Reset QA Data" button</li>
            <li>• All test data is stored separately from production data</li>
            <li>• Use incognito/private browsing to test multiple users simultaneously</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}