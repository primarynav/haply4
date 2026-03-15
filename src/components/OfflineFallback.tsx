import { WifiOff, Heart, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';

export function OfflineFallback() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-rose-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="relative inline-block">
            <WifiOff className="w-20 h-20 text-gray-300 mx-auto" />
            <Heart className="w-8 h-8 text-pink-600 absolute -top-2 -right-2" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-3">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-6">
          It looks like you've lost your internet connection. Don't worry, love can wait! 
          Some features may be limited until you're back online.
        </p>

        <div className="bg-pink-50 border border-pink-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-pink-800">
            <strong>💡 Tip:</strong> Many parts of Haply work offline! You can still browse 
            cached profiles and view your saved matches.
          </p>
        </div>

        <Button 
          onClick={handleRetry}
          className="w-full bg-gradient-to-r from-pink-700 to-rose-700 hover:from-pink-800 hover:to-rose-800 text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Try Again
        </Button>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            Once you're back online, all your data will sync automatically
          </p>
        </div>
      </div>
    </div>
  );
}
