import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { FeaturesSection } from './components/FeaturesSection';
import { AIDemoSection } from './components/AIDemoSection';
import { AuthModal } from './components/AuthModal';
import { UserDashboard } from './components/UserDashboard';
import { LearnMorePage } from './components/LearnMorePage';
import { GetStartedPage } from './components/GetStartedPage';
import { CommunityPage } from './components/CommunityPage';
import { HelpCenterPage } from './components/HelpCenterPage';
import { SafetyTipsPage } from './components/SafetyTipsPage';
import { ContactUsPage } from './components/ContactUsPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { VerifiedProfilesPage } from './components/VerifiedProfilesPage';
import { AISmartMatchingPage } from './components/AISmartMatchingPage';
import { SafeMessagingPage } from './components/SafeMessagingPage';
import { SuccessStoriesPage } from './components/SuccessStoriesPage';
import { HaplyRulesPage } from './components/HaplyRulesPage';
import { NewsletterPage } from './components/NewsletterPage';
import { AdminSetup } from './components/AdminSetup';
import { QASetup } from './components/QASetup';
import { PWAMetaTags } from './components/PWAMetaTags';
import { PWAInstallPrompt } from './components/PWAInstallPrompt';
import { LaunchBanner } from './components/LaunchBanner';
import { supabase } from './utils/supabase/client';
import { registerServiceWorker } from './utils/pwa-register';
import { toast } from 'sonner';

// Haply Dating App - Fully Functional for Public Launch
// All users get full access to all features
export default function App() {
  const [user, setUser] = useState<{ name: string; email: string } | null>(null);
  const [currentPage, setCurrentPage] = useState<'home' | 'learn-more' | 'get-started' | 'community' | 'help-center' | 'safety-tips' | 'contact-us' | 'privacy-policy' | 'verified-profiles' | 'ai-smart-matching' | 'safe-messaging' | 'success-stories' | 'haply-rules' | 'newsletter' | 'admin-setup' | 'qa-setup'>('home');
  
  // Check for existing session and OAuth callback on mount
  useEffect(() => {
    // Register service worker for PWA functionality
    registerServiceWorker();

    const params = new URLSearchParams(window.location.search);
    if (params.get('admin') === 'setup') {
      setCurrentPage('admin-setup');
    }
    if (params.get('qa') === 'setup') {
      setCurrentPage('qa-setup');
    }

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          name: session.user.user_metadata?.full_name || 
                session.user.user_metadata?.name || 
                session.user.email?.split('@')[0] || 
                'User',
          email: session.user.email || ''
        };
        setUser(userData);
        toast.success('Welcome back!');
      }
    });

    // Listen for auth state changes (OAuth callback)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = {
          name: session.user.user_metadata?.full_name || 
                session.user.user_metadata?.name || 
                session.user.email?.split('@')[0] || 
                'User',
          email: session.user.email || ''
        };
        setUser(userData);
        toast.success(`Welcome, ${userData.name}!`);
        
        // Clean up URL after OAuth redirect
        window.history.replaceState({}, document.title, window.location.pathname);
      }
      
      if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);
  const [signupData, setSignupData] = useState<{
    gender?: string;
    lookingFor?: string;
    postalCode?: string;
  }>({});
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    type: 'login' | 'signup';
  }>({
    isOpen: false,
    type: 'login'
  });

  const handleAuthClick = (type: 'login' | 'signup') => {
    setAuthModal({ isOpen: true, type });
  };

  const handleAuthSuccess = (userData: { name: string; email: string }) => {
    setUser(userData);
    setAuthModal({ isOpen: false, type: 'login' });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    toast.success('You have been logged out');
  };

  const handleCloseModal = () => {
    setAuthModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleTypeChange = (type: 'login' | 'signup') => {
    setAuthModal(prev => ({ ...prev, type }));
  };

  const handleNavigateToLearnMore = () => {
    setCurrentPage('learn-more');
  };

  const handleNavigateToHome = () => {
    setCurrentPage('home');
  };

  const handleGetStarted = () => {
    setCurrentPage('get-started');
  };

  const handleNavigateToCommunity = () => {
    setCurrentPage('community');
  };

  const handleNavigateToHelpCenter = () => {
    setCurrentPage('help-center');
  };

  const handleNavigateToSafetyTips = () => {
    setCurrentPage('safety-tips');
  };

  const handleNavigateToContactUs = () => {
    setCurrentPage('contact-us');
  };

  const handleNavigateToPrivacyPolicy = () => {
    setCurrentPage('privacy-policy');
  };

  const handleNavigateToVerifiedProfiles = () => {
    setCurrentPage('verified-profiles');
  };

  const handleNavigateToAISmartMatching = () => {
    setCurrentPage('ai-smart-matching');
  };

  const handleNavigateToSafeMessaging = () => {
    setCurrentPage('safe-messaging');
  };

  const handleNavigateToSuccessStories = () => {
    setCurrentPage('success-stories');
  };

  const handleNavigateToHaplyRules = () => {
    setCurrentPage('haply-rules');
  };

  const handleNavigateToNewsletter = () => {
    setCurrentPage('newsletter');
  };

  const handleGetStartedComplete = (data: {
    gender: string;
    lookingFor: string;
    postalCode: string;
  }) => {
    setSignupData(data);
    // Now open the signup modal with the collected data
    setAuthModal({ isOpen: true, type: 'signup' });
    setCurrentPage('home'); // Return to home page with modal open
  };

  // If user is logged in, show dashboard
  if (user) {
    return <UserDashboard user={user} onLogout={handleLogout} onCommunity={handleNavigateToCommunity} />;
  }

  // Show Get Started page
  if (currentPage === 'get-started') {
    return (
      <GetStartedPage 
        onBack={handleNavigateToHome}
        onContinue={handleGetStartedComplete}
      />
    );
  }

  // Show Learn More page
  if (currentPage === 'learn-more') {
    return (
      <LearnMorePage 
        onBack={handleNavigateToHome}
        onGetStarted={handleGetStarted}
      />
    );
  }

  // Show Community page
  if (currentPage === 'community') {
    return (
      <CommunityPage 
        onBack={handleNavigateToHome}
        user={user}
        onGetStarted={handleGetStarted}
      />
    );
  }

  // Show Help Center page
  if (currentPage === 'help-center') {
    return <HelpCenterPage onBack={handleNavigateToHome} />;
  }

  // Show Safety Tips page
  if (currentPage === 'safety-tips') {
    return <SafetyTipsPage onBack={handleNavigateToHome} />;
  }

  // Show Contact Us page
  if (currentPage === 'contact-us') {
    return <ContactUsPage onBack={handleNavigateToHome} />;
  }

  // Show Privacy Policy page
  if (currentPage === 'privacy-policy') {
    return <PrivacyPolicyPage onBack={handleNavigateToHome} />;
  }

  // Show Verified Profiles page
  if (currentPage === 'verified-profiles') {
    return <VerifiedProfilesPage onBack={handleNavigateToHome} />;
  }

  // Show AI Smart Matching page
  if (currentPage === 'ai-smart-matching') {
    return <AISmartMatchingPage onBack={handleNavigateToHome} />;
  }

  // Show Safe Messaging page
  if (currentPage === 'safe-messaging') {
    return <SafeMessagingPage onBack={handleNavigateToHome} />;
  }

  // Show Success Stories page
  if (currentPage === 'success-stories') {
    return <SuccessStoriesPage onBack={handleNavigateToHome} />;
  }

  // Show Haply Rules page
  if (currentPage === 'haply-rules') {
    return <HaplyRulesPage onBack={handleNavigateToHome} />;
  }

  // Show Newsletter page
  if (currentPage === 'newsletter') {
    return <NewsletterPage onBack={handleNavigateToHome} />;
  }

  // Show Admin Setup page
  if (currentPage === 'admin-setup') {
    return <AdminSetup onBack={handleNavigateToHome} />;
  }

  // Show QA Setup page
  if (currentPage === 'qa-setup') {
    return <QASetup onBack={handleNavigateToHome} />;
  }

  // Otherwise, show landing page
  return (
    <div className="min-h-screen bg-white">
      <PWAMetaTags />
      <PWAInstallPrompt />
      <LaunchBanner onGetStarted={handleGetStarted} />
      
      <Header 
        onAuthClick={handleAuthClick}
        onGetStarted={handleGetStarted}
        user={user}
        onLogout={handleLogout}
        onLearnMore={handleNavigateToLearnMore}
        onCommunity={handleNavigateToCommunity}
      />
      
      <main>
        <HeroSection 
          onGetStarted={handleGetStarted}
          onLearnMore={handleNavigateToLearnMore}
        />
        <AIDemoSection onGetStarted={handleGetStarted} />
        <FeaturesSection 
          onGetStarted={handleGetStarted}
          onLearnMore={handleNavigateToLearnMore}
        />
      </main>

      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">Haply</h3>
              <p className="text-gray-400">
                Happily Ever After Again - A dating platform for divorced singles ready to find love again.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li 
                  onClick={handleNavigateToVerifiedProfiles}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Verified Profiles
                </li>
                <li 
                  onClick={handleNavigateToAISmartMatching}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  AI Smart Matching
                </li>
                <li 
                  onClick={handleNavigateToSafeMessaging}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Safe Messaging
                </li>
                <li 
                  onClick={handleNavigateToSuccessStories}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Success Stories
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li 
                  onClick={handleNavigateToHelpCenter}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Help Center
                </li>
                <li 
                  onClick={handleNavigateToSafetyTips}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Safety Tips
                </li>
                <li 
                  onClick={handleNavigateToContactUs}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Contact Us
                </li>
                <li 
                  onClick={handleNavigateToPrivacyPolicy}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Privacy Policy
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li 
                  onClick={handleNavigateToHaplyRules}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Haply Rules
                </li>
                <li 
                  onClick={handleNavigateToNewsletter}
                  className="cursor-pointer hover:text-rose-400 transition-colors"
                >
                  Newsletter
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Happily Ever After Again (Haply). All rights reserved. Made with love for second chances.</p>
            <p className="text-xs mt-2 text-gray-500">www.happilyeverafteragain.com</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={handleCloseModal}
        type={authModal.type}
        onTypeChange={handleTypeChange}
        onSuccess={handleAuthSuccess}
        signupData={signupData}
      />
    </div>
  );
}