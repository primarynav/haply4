import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Eye, EyeOff, Heart, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../utils/supabase/client';
import { projectId, publicAnonKey } from '../utils/supabase/info';

// Feature flag: Enable this ONLY after configuring OAuth providers in Supabase
// See OAUTH_SETUP_GUIDE.md for configuration instructions
const ENABLE_SOCIAL_LOGIN = false;

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'login' | 'signup';
  onTypeChange: (type: 'login' | 'signup') => void;
  onSuccess: (user: { name: string; email: string }) => void;
  signupData?: {
    gender?: string;
    lookingFor?: string;
    postalCode?: string;
  };
}

export function AuthModal({ isOpen, onClose, type, onTypeChange, onSuccess, signupData }: AuthModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [socialLoading, setSocialLoading] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    divorceYear: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    // Password validation
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    // SECURITY: Enforce strong password requirements
    if (type === 'signup') {
      if (!/[A-Z]/.test(formData.password)) {
        toast.error('Password must contain at least one uppercase letter');
        return;
      }
      if (!/[a-z]/.test(formData.password)) {
        toast.error('Password must contain at least one lowercase letter');
        return;
      }
      if (!/[0-9]/.test(formData.password)) {
        toast.error('Password must contain at least one number');
        return;
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)) {
        toast.error('Password must contain at least one special character');
        return;
      }
    }

    // Signup-specific validation
    if (type === 'signup') {
      if (!formData.name || !formData.age || !formData.divorceYear) {
        toast.error('Please fill in all required fields');
        return;
      }

      const age = parseInt(formData.age);
      if (isNaN(age) || age < 18 || age > 100) {
        toast.error('Please enter a valid age (18-100)');
        return;
      }

      const divorceYear = parseInt(formData.divorceYear);
      const currentYear = new Date().getFullYear();
      if (isNaN(divorceYear) || divorceYear < 1950 || divorceYear > currentYear) {
        toast.error(`Please enter a valid divorce year (1950-${currentYear})`);
        return;
      }
    }

    setIsLoading(true);

    try {
      if (type === 'login') {
        // Sign in with email and password
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Login error:', error);
          toast.error(error.message || 'Failed to sign in. Please check your credentials.');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const userData = {
            name: data.user.user_metadata?.full_name || 
                  data.user.user_metadata?.name || 
                  formData.name || 
                  data.user.email?.split('@')[0] || 
                  'User',
            email: data.user.email || formData.email
          };
          
          toast.success('Successfully signed in!');
          onSuccess(userData);
          onClose();
        }
      } else {
        // Sign up via server endpoint (auto-confirms email)
        const signupResponse = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/auth/signup`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${publicAnonKey}`,
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
              name: formData.name,
              age: formData.age,
              divorceYear: formData.divorceYear,
              gender: signupData?.gender,
              lookingFor: signupData?.lookingFor,
              postalCode: signupData?.postalCode,
            }),
          }
        );

        const signupResult = await signupResponse.json();

        if (!signupResponse.ok || signupResult.error) {
          console.error('Signup error:', signupResult.error);
          toast.error(signupResult.error || 'Failed to create account. Please try again.');
          setIsLoading(false);
          return;
        }

        // Now sign in the user
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (error) {
          console.error('Auto-login error after signup:', error);
          toast.success('Account created! Please sign in.');
          onTypeChange('login');
          setIsLoading(false);
          return;
        }

        if (data.user) {
          const userData = {
            name: formData.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || formData.email
          };
          
          toast.success('Account created successfully!');
          onSuccess(userData);
          onClose();
        }
      }
    } catch (err) {
      console.error('Unexpected auth error:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSocialLogin = async (provider: 'google' | 'apple' | 'facebook') => {
    try {
      setSocialLoading(provider);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error(`Error during ${provider} OAuth:`, error);
        
        // Check for specific error types
        if (error.message?.includes('not enabled') || error.message?.includes('validation_failed')) {
          const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
          toast.error(
            `${providerName} sign-in is not configured yet. Please use email/password or contact support.`,
            { duration: 5000 }
          );
        } else {
          toast.error(`Failed to sign in with ${provider.charAt(0).toUpperCase() + provider.slice(1)}. Please try again.`);
        }
        
        setSocialLoading(null);
        return;
      }

      // Note: The actual user session will be established after the OAuth redirect
      // We don't close the modal here because the user will be redirected
      toast.success(`Redirecting to ${provider.charAt(0).toUpperCase() + provider.slice(1)}...`);
      
    } catch (err: any) {
      console.error(`Unexpected error during ${provider} OAuth:`, err);
      
      // Handle validation_failed error
      if (err?.error_code === 'validation_failed' || err?.msg?.includes('not enabled')) {
        const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
        toast.error(
          `${providerName} sign-in is not configured yet. Please use email/password or contact support.`,
          { duration: 5000 }
        );
      } else {
        toast.error(`An unexpected error occurred. Please try again.`);
      }
      
      setSocialLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-left">
            {type === 'login' ? 'Sign in' : 'Create account'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {type === 'login' 
              ? 'Sign in to your Haply account' 
              : 'Create a new Haply account'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {type === 'signup' && signupData && (
            <div className="bg-rose-50 p-4 rounded-lg border border-rose-200 mb-4">
              <h4 className="font-semibold text-rose-800 mb-2">Your Preferences</h4>
              <div className="space-y-1 text-sm text-rose-700">
                <p>• I am a {signupData.gender}</p>
                <p>• Looking for {signupData.lookingFor === 'any' ? 'any gender' : signupData.lookingFor}</p>
                <p>• Location: {signupData.postalCode}</p>
              </div>
            </div>
          )}

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'signup' && (
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  required
                  className="h-12"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                required
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder={type === 'signup' ? 'Min 8 chars, uppercase, number, symbol' : 'Enter your password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  required
                  className="h-12"
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {type === 'signup' && formData.password && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[
                      formData.password.length >= 8,
                      /[A-Z]/.test(formData.password),
                      /[a-z]/.test(formData.password),
                      /[0-9]/.test(formData.password),
                      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password),
                    ].map((met, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full ${met ? 'bg-green-500' : 'bg-gray-200'}`} />
                    ))}
                  </div>
                  <ul className="text-xs text-gray-500 space-y-0.5">
                    <li className={formData.password.length >= 8 ? 'text-green-600' : ''}>
                      {formData.password.length >= 8 ? '\u2713' : '\u2022'} At least 8 characters
                    </li>
                    <li className={/[A-Z]/.test(formData.password) ? 'text-green-600' : ''}>
                      {/[A-Z]/.test(formData.password) ? '\u2713' : '\u2022'} One uppercase letter
                    </li>
                    <li className={/[0-9]/.test(formData.password) ? 'text-green-600' : ''}>
                      {/[0-9]/.test(formData.password) ? '\u2713' : '\u2022'} One number
                    </li>
                    <li className={/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? 'text-green-600' : ''}>
                      {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password) ? '\u2713' : '\u2022'} One special character
                    </li>
                  </ul>
                </div>
              )}
            </div>

            {type === 'signup' && (
              <>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="age">Age *</Label>
                    <Input
                      id="age"
                      type="number"
                      placeholder="Your age"
                      value={formData.age}
                      onChange={(e) => handleInputChange('age', e.target.value)}
                      required
                      min="18"
                      max="100"
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="divorceYear">Divorce Year *</Label>
                    <Input
                      id="divorceYear"
                      type="number"
                      placeholder="Year divorced"
                      value={formData.divorceYear}
                      onChange={(e) => handleInputChange('divorceYear', e.target.value)}
                      required
                      min="1950"
                      max={new Date().getFullYear().toString()}
                      className="h-12"
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-600 bg-rose-50 p-3 rounded-lg">
                  <p className="font-medium text-rose-800 mb-1">Divorced Singles Only</p>
                  <p>Haply is exclusively for individuals who have been through divorce and are ready to find love again. We verify all profiles to maintain our community standards.</p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-rose-600 hover:bg-rose-700"
                  disabled={isLoading || socialLoading !== null}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </Button>
              </>
            )}

            {type === 'login' && (
              <Button 
                type="submit" 
                className="w-full h-12 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                disabled={isLoading || socialLoading !== null}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            )}
          </form>

          {/* Account Toggle */}
          <div className="text-center text-sm">
            {type === 'login' ? (
              <p>
                New to Haply?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => onTypeChange('signup')}
                >
                  Create account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  type="button"
                  className="text-blue-600 hover:underline font-medium"
                  onClick={() => onTypeChange('login')}
                >
                  Log in
                </button>
              </p>
            )}
          </div>

          {/* Conditional Social Login Section */}
          {ENABLE_SOCIAL_LOGIN && (
            <>
              {/* OR Separator */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-500 text-sm">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-3"
                  onClick={() => handleSocialLogin('google')}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === 'google' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-3"
                  onClick={() => handleSocialLogin('apple')}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === 'apple' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                      </svg>
                      <span>Continue with Apple</span>
                    </>
                  )}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12 border border-gray-300 hover:bg-gray-50 flex items-center justify-center space-x-3"
                  onClick={() => handleSocialLogin('facebook')}
                  disabled={socialLoading !== null}
                >
                  {socialLoading === 'facebook' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connecting...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                      <span>Continue with Facebook</span>
                    </>
                  )}
                </Button>
              </div>

              {/* OAuth Setup Notice (Development Info) */}
              <div className="text-xs text-gray-600 bg-blue-50 border border-blue-200 p-3 rounded-lg">
                <p className="font-medium text-blue-900 mb-1">ℹ️ For Developers</p>
                <p>
                  Social login requires OAuth provider configuration in your Supabase dashboard. 
                  See <code className="bg-blue-100 px-1 rounded">OAUTH_SETUP_GUIDE.md</code> for setup instructions.
                </p>
              </div>
            </>
          )}

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center">
            By submitting, I accept Haply's{' '}
            <a href="#" className="text-blue-600 hover:underline">
              terms of use
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}