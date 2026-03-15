import { useState, useEffect } from 'react';
import { X, Download } from 'lucide-react';
import { Button } from './ui/button';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = window.matchMedia('(display-mode: standalone)').matches || 
                      (window.navigator as any).standalone;
    setIsStandalone(standalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);

    // For iOS devices not in standalone mode, show iOS-specific install prompt
    if (iOS && !standalone) {
      const hasSeenPrompt = localStorage.getItem('haply-ios-prompt-dismissed');
      if (!hasSeenPrompt) {
        // Show iOS prompt after a short delay
        setTimeout(() => setShowIOSPrompt(true), 5000);
      }
    }

    // Handle beforeinstallprompt event (Android/Chrome)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      const hasSeenPrompt = localStorage.getItem('haply-install-prompt-dismissed');
      if (!hasSeenPrompt) {
        setShowPrompt(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Handle successful installation
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setShowPrompt(false);
      setShowIOSPrompt(false);
      localStorage.removeItem('haply-install-prompt-dismissed');
      localStorage.removeItem('haply-ios-prompt-dismissed');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    }

    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('haply-install-prompt-dismissed', 'true');
  };

  const handleIOSDismiss = () => {
    setShowIOSPrompt(false);
    localStorage.setItem('haply-ios-prompt-dismissed', 'true');
  };

  // Don't show anything if already installed
  if (isStandalone) return null;

  // iOS Install Prompt
  if (showIOSPrompt && isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-700 to-rose-700 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleIOSDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-start gap-3 pr-8">
            <Download className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-1">Install Haply App</h3>
              <p className="text-sm text-pink-100 mb-2">
                Add Haply to your home screen for a better experience!
              </p>
              <ol className="text-sm text-pink-100 space-y-1 list-decimal list-inside">
                <li>Tap the Share button <span className="inline-block px-2 py-0.5 bg-white/20 rounded">⬆️</span> in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" to install</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Android/Chrome Install Prompt
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-r from-pink-700 to-rose-700 text-white p-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center justify-between gap-4 pr-8">
            <div className="flex items-start gap-3">
              <Download className="w-6 h-6 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-lg mb-1">Install Haply App</h3>
                <p className="text-sm text-pink-100">
                  Get the app experience! Install Haply on your device for quick access and a native feel.
                </p>
              </div>
            </div>
            <Button
              onClick={handleInstallClick}
              className="bg-white text-pink-700 hover:bg-pink-50 flex-shrink-0"
            >
              Install
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
