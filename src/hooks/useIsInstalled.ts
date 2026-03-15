import { useState, useEffect } from 'react';

/**
 * Hook to detect if the app is installed as a PWA
 * Returns true if running in standalone mode (installed)
 */
export function useIsInstalled(): boolean {
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode
    const standalone = 
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    setIsInstalled(standalone);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsInstalled(e.matches);
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  return isInstalled;
}

/**
 * Hook to detect iOS devices
 */
export function useIsIOS(): boolean {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(iOS);
  }, []);

  return isIOS;
}

/**
 * Hook to detect if PWA installation is supported
 */
export function useCanInstall(): boolean {
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const supported = 
      'serviceWorker' in navigator &&
      ('BeforeInstallPromptEvent' in window || useIsIOS());
    
    setCanInstall(supported);
  }, []);

  return canInstall;
}
