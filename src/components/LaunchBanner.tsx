import { useState } from 'react';
import { X, Sparkles, Clock } from 'lucide-react';

interface LaunchBannerProps {
  onGetStarted: () => void;
}

export function LaunchBanner({ onGetStarted }: LaunchBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-gradient-to-r from-rose-600 via-pink-600 to-purple-600 text-white py-2.5 px-4 relative">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm md:text-base">
        <div className="flex items-center gap-2 animate-pulse">
          <Sparkles className="w-4 h-4" />
          <span className="font-bold">LAUNCH SPECIAL</span>
        </div>
        <span className="hidden sm:inline">|</span>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>
            <strong>100% FREE</strong> for a limited time — All premium features included!
          </span>
        </div>
        <button
          onClick={onGetStarted}
          className="hidden md:inline-flex ml-2 bg-white text-rose-600 font-bold px-4 py-1 rounded-full text-sm hover:bg-rose-50 transition-colors"
        >
          Join Free Now
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
          aria-label="Dismiss banner"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
