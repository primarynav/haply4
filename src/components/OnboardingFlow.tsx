import { useState } from 'react';
import { CheckCircle2, ArrowRight, Sparkles, Heart, MessageCircle, Shield, Crown, X, Camera, Gift } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface OnboardingFlowProps {
  userName: string;
  onComplete: () => void;
  onUpgrade: () => void;
}

export function OnboardingFlow({ userName, onComplete, onUpgrade }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: `Welcome to Haply, ${userName}!`,
      subtitle: "Your journey to love starts here",
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 text-lg">
            You're now part of a community designed specifically for divorced singles who are ready to find love again.
          </p>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
            <h3 className="font-semibold text-gray-900 mb-3">What makes Haply different?</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Heart className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Understanding community of people who've been through similar experiences</span>
              </li>
              <li className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">AI-powered matching that understands your unique needs</span>
              </li>
              <li className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Verified profiles and safe messaging environment</span>
              </li>
            </ul>
          </div>
        </div>
      ),
      icon: Heart,
      color: 'rose'
    },
    {
      title: "Your Free Account is Ready!",
      subtitle: "All features are FREE during our launch!",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Gift className="w-5 h-5 text-green-600" />
              <span className="font-bold text-green-700">Launch Special: Everything is FREE!</span>
            </div>
            <p className="text-sm text-gray-700">
              All premium features are unlocked at no cost during our launch period. No credit card needed!
            </p>
          </div>
          <div className="grid gap-3">
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Unlimited AI Matchmaker</p>
                <p className="text-sm text-gray-600">Chat with our AI to find your perfect match — no limits</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">Unlimited Messaging</p>
                <p className="text-sm text-gray-600">Chat with all your matches freely</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-green-50 border border-green-200">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">All Premium Features</p>
                <p className="text-sm text-gray-600">Advanced filters, who likes you, verified badge & more</p>
              </div>
            </div>
          </div>
        </div>
      ),
      icon: CheckCircle2,
      color: 'green'
    },
    {
      title: "Complete Your Profile to Get Matches",
      subtitle: "Profiles with photos get 10x more matches!",
      content: (
        <div className="space-y-4">
          <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-lg p-6 border border-rose-200">
            <div className="flex items-center gap-3 mb-4">
              <Camera className="w-8 h-8 text-rose-500" />
              <div>
                <h3 className="text-lg font-bold text-gray-900">Add Your Photos</h3>
                <p className="text-sm text-gray-600">This is the #1 thing that gets you matches</p>
              </div>
            </div>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Upload at least <strong>3 clear photos</strong> of yourself</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Include a <strong>clear headshot</strong> as your main photo</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                <span className="text-gray-700">Add photos showing your <strong>hobbies and lifestyle</strong></span>
              </li>
            </ul>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              <strong>Quick tip:</strong> Go to Settings after this to complete your profile with photos, bio, and interests. 
              Complete profiles are shown to more people!
            </p>
          </div>
        </div>
      ),
      icon: Camera,
      color: 'rose'
    }
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleUpgradeAndComplete = () => {
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 animate-in fade-in">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto bg-white">
        {/* Progress Bar */}
        <div className="flex gap-2 p-4 border-b border-gray-200">
          {steps.map((_, idx) => (
            <div
              key={idx}
              className={`h-2 flex-1 rounded-full transition-all ${
                idx <= currentStep
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        <div className="p-8">
          {/* Icon */}
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-${currentStepData.color}-100 mb-6`}>
            <currentStepData.icon className={`w-8 h-8 text-${currentStepData.color}-600`} />
          </div>

          {/* Title */}
          <h2 className="text-3xl text-gray-900 mb-2">
            {currentStepData.title}
          </h2>
          <p className="text-gray-600 mb-6">{currentStepData.subtitle}</p>

          {/* Content */}
          <div className="mb-8">
            {currentStepData.content}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {currentStep === steps.length - 1 ? (
              <>
                <Button
                  onClick={onComplete}
                  className="flex-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white hover:from-rose-600 hover:to-pink-700"
                  size="lg"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Complete My Profile Now
                </Button>
              </>
            ) : (
              <>
                {currentStep > 0 && (
                  <Button
                    onClick={() => setCurrentStep(currentStep - 1)}
                    variant="outline"
                    size="lg"
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={handleNext}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700"
                  size="lg"
                >
                  {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </>
            )}
          </div>

          {/* Skip option */}
          {currentStep < steps.length - 1 && (
            <button
              onClick={onComplete}
              className="w-full text-center text-sm text-gray-500 hover:text-gray-700 mt-4"
            >
              Skip tutorial
            </button>
          )}
        </div>
      </Card>
    </div>
  );
}