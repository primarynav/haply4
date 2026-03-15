import { useEffect, useState } from 'react';
import { Clock, Crown, Zap } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Progress } from './ui/progress';

interface UsageTrackerProps {
  userEmail: string;
  isPremium: boolean;
  onUpgrade: () => void;
  onLimitReached?: () => void;
}

interface UsageData {
  usageMinutes: number;
  lastResetDate: string;
  limitReached: boolean;
}

const FREE_DAILY_LIMIT_MINUTES = 15;

export function UsageTracker({ userEmail, isPremium, onUpgrade, onLimitReached }: UsageTrackerProps) {
  const [usageData, setUsageData] = useState<UsageData>({
    usageMinutes: 0,
    lastResetDate: new Date().toDateString(),
    limitReached: false
  });
  const [isVisible, setIsVisible] = useState(false);

  // Load usage data from localStorage
  useEffect(() => {
    const loadUsage = () => {
      const stored = localStorage.getItem(`usage_${userEmail}`);
      if (stored) {
        const data = JSON.parse(stored);
        const today = new Date().toDateString();
        
        // Reset if it's a new day
        if (data.lastResetDate !== today) {
          const resetData = {
            usageMinutes: 0,
            lastResetDate: today,
            limitReached: false
          };
          setUsageData(resetData);
          localStorage.setItem(`usage_${userEmail}`, JSON.stringify(resetData));
        } else {
          setUsageData(data);
        }
      }
    };

    loadUsage();
  }, [userEmail]);

  // Track usage time
  useEffect(() => {
    if (isPremium) return; // No tracking for premium users

    const interval = setInterval(() => {
      setUsageData(prev => {
        const newMinutes = prev.usageMinutes + (1 / 60); // Add 1 second
        const limitReached = newMinutes >= FREE_DAILY_LIMIT_MINUTES;
        
        const newData = {
          usageMinutes: newMinutes,
          lastResetDate: prev.lastResetDate,
          limitReached
        };
        
        localStorage.setItem(`usage_${userEmail}`, JSON.stringify(newData));
        
        if (limitReached && !prev.limitReached && onLimitReached) {
          onLimitReached();
        }
        
        return newData;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [isPremium, userEmail, onLimitReached]);

  // Show/hide based on usage
  useEffect(() => {
    if (isPremium) {
      setIsVisible(false);
    } else if (usageData.usageMinutes > 5 || usageData.limitReached) {
      setIsVisible(true);
    }
  }, [isPremium, usageData.usageMinutes, usageData.limitReached]);

  if (isPremium || !isVisible) return null;

  const remainingMinutes = Math.max(0, FREE_DAILY_LIMIT_MINUTES - usageData.usageMinutes);
  const remainingSeconds = Math.floor(remainingMinutes * 60);
  const progressPercentage = (usageData.usageMinutes / FREE_DAILY_LIMIT_MINUTES) * 100;
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;

  if (usageData.limitReached) {
    return (
      <Card className="fixed bottom-4 right-4 z-50 p-4 bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-2xl max-w-sm animate-in slide-in-from-bottom">
        <div className="flex items-start gap-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Clock className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Daily Limit Reached</h3>
            <p className="text-sm text-purple-100 mb-3">
              You've used your 15 minutes of free access today. Upgrade to Premium for unlimited access!
            </p>
            <div className="flex gap-2">
              <Button
                onClick={onUpgrade}
                className="bg-white text-purple-600 hover:bg-purple-50 font-semibold"
                size="sm"
              >
                <Crown className="w-4 h-4 mr-1" />
                Upgrade Now
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="ghost"
                className="text-white hover:bg-white/20"
                size="sm"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  const isLowTime = remainingMinutes < 5;

  return (
    <Card className={`fixed bottom-4 right-4 z-50 p-4 shadow-xl max-w-sm transition-all ${
      isLowTime ? 'bg-gradient-to-br from-orange-500 to-rose-500 text-white animate-pulse' : 'bg-white'
    }`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${isLowTime ? 'bg-white/20' : 'bg-purple-100'}`}>
          <Clock className={`w-5 h-5 ${isLowTime ? 'text-white' : 'text-purple-600'}`} />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h3 className={`font-semibold ${isLowTime ? 'text-white' : 'text-gray-900'}`}>
              {isLowTime ? 'Time Running Low!' : 'Free Daily Usage'}
            </h3>
            <span className={`text-sm font-mono ${isLowTime ? 'text-white' : 'text-gray-700'}`}>
              {minutes}:{seconds.toString().padStart(2, '0')}
            </span>
          </div>
          <Progress value={progressPercentage} className="mb-2 h-2" />
          <p className={`text-xs mb-3 ${isLowTime ? 'text-white' : 'text-gray-600'}`}>
            {isLowTime 
              ? `Only ${minutes} minutes left today. Upgrade for unlimited access!`
              : `${minutes} minutes remaining today`
            }
          </p>
          <Button
            onClick={onUpgrade}
            className={`w-full ${
              isLowTime 
                ? 'bg-white text-rose-600 hover:bg-rose-50' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700'
            }`}
            size="sm"
          >
            <Zap className="w-4 h-4 mr-1" />
            Upgrade to Premium
          </Button>
        </div>
      </div>
    </Card>
  );
}
