import { Crown, X, Check, Zap, Heart, MessageCircle, Eye, Filter } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface UpgradePromptProps {
  onClose: () => void;
  onUpgrade: () => void;
  reason?: 'time-limit' | 'messaging' | 'likes' | 'filters' | 'general';
}

export function UpgradePrompt({ onClose, onUpgrade, reason = 'general' }: UpgradePromptProps) {
  const reasonContent = {
    'time-limit': {
      title: 'Time Limit Reached',
      description: "You've used your 15 minutes of free access today. Upgrade to Premium for unlimited access!",
      icon: Zap,
      color: 'orange'
    },
    'messaging': {
      title: 'Unlock Unlimited Messaging',
      description: 'Send unlimited messages to all your matches with Premium!',
      icon: MessageCircle,
      color: 'blue'
    },
    'likes': {
      title: 'See Who Likes You',
      description: 'Discover who\'s interested in you before you like them back!',
      icon: Heart,
      color: 'rose'
    },
    'filters': {
      title: 'Advanced Filters Available',
      description: 'Find exactly who you\'re looking for with Premium filters!',
      icon: Filter,
      color: 'purple'
    },
    'general': {
      title: 'Upgrade to Premium',
      description: 'Unlock all features and find your perfect match faster!',
      icon: Crown,
      color: 'purple'
    }
  };

  const content = reasonContent[reason];
  const IconComponent = content.icon;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <Card className="max-w-lg w-full bg-white relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 mb-4">
              <IconComponent className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl text-gray-900 mb-2">
              {content.title}
            </h2>
            <p className="text-gray-600">
              {content.description}
            </p>
          </div>

          {/* Premium Features */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 mb-6 border border-purple-200">
            <div className="flex items-center gap-2 mb-4">
              <Crown className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-semibold text-gray-900">Premium Benefits</h3>
                <p className="text-sm text-gray-600">$29.99/month</p>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Unlimited Access</strong> - No daily time limits</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Unlimited Messaging</strong> - Chat with all matches</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>See Who Likes You</strong> - Know who's interested</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Advanced Filters</strong> - Refined search</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Verified Badge</strong> - Stand out</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="bg-purple-600 rounded-full p-1">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-gray-700"><strong>Priority Support</strong> - 24/7 help</span>
              </li>
            </ul>
          </div>

          {/* Testimonial */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 italic mb-2">
              "Premium was worth every penny. I found my partner within 2 weeks and couldn't be happier!"
            </p>
            <p className="text-xs text-gray-600">- Sarah M., Premium Member</p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={onUpgrade}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
              size="lg"
            >
              <Crown className="w-5 h-5 mr-2" />
              Upgrade to Premium
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="w-full"
              size="lg"
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-4">
            Cancel anytime. No commitment required.
          </p>
        </div>
      </Card>
    </div>
  );
}