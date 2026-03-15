import { AIDemoSection } from './AIDemoSection';

interface LearnMorePageProps {
  onBack: () => void;
  onGetStarted: () => void;
}

export function LearnMorePage({ onBack, onGetStarted }: LearnMorePageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Choose Your Plan
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed">
              Start free and upgrade when you're ready for advanced features. 
              Find meaningful connections at your own pace with plans designed for divorced singles.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            
            {/* Basic Plan */}
            <Card className="p-8 bg-white border-2 border-gray-200 relative">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">Free</span>
                  <span className="text-gray-600"> forever</span>
                </div>
                <p className="text-gray-600">Perfect for getting started and exploring connections</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Create detailed profile</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Browse verified profiles</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">5 likes per day</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Basic location filters</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Match notifications</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Basic messaging with matches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">See who liked you</span>
                </div>
                <div className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">Advanced filters</span>
                </div>
                <div className="flex items-center space-x-3">
                  <X className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-400">Priority support</span>
                </div>
              </div>

              <Button 
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={onGetStarted}
              >
                Get Started Free
              </Button>
            </Card>

            {/* Premium Plan */}
            <Card className="p-8 bg-white border-2 border-rose-300 relative">
              {/* Popular badge */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-rose-600 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Crown className="h-8 w-8 text-rose-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Premium</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold text-gray-900">$29.99</span>
                  <span className="text-gray-600"> /month</span>
                </div>
                <p className="text-gray-600">Everything you need to find your perfect match</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Everything in Basic</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Unlimited likes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">See who liked you</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Advanced filters (income, education, lifestyle)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Profile boost (3x more views)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Read receipts</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Undo accidental passes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Priority customer support</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-500" />
                  <span className="text-gray-700">Travel mode (match globally)</span>
                </div>
              </div>

              <Button 
                className="w-full bg-rose-600 hover:bg-rose-700"
                onClick={onGetStarted}
              >
                Start Premium Trial
              </Button>
              <p className="text-sm text-gray-500 text-center mt-2">7-day free trial, cancel anytime</p>
            </Card>
          </div>
        </div>
      </section>

      {/* AI Conversational Matching Demo */}
      <AIDemoSection onGetStarted={onGetStarted} />

      {/* Feature Highlights */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Designed Specifically for Divorced Singles
            </h2>
            <p className="text-lg text-gray-600">
              Our features understand your unique needs and help you connect with people 
              who share similar life experiences and relationship goals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <Shield className="h-10 w-10 text-blue-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-3">Verified Divorced Status</h3>
              <p className="text-gray-700">
                Every member goes through our verification process to confirm their divorced status, 
                creating a safe and understanding community.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-rose-50 to-rose-100 border-rose-200">
              <Users className="h-10 w-10 text-rose-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-3">Family-Focused Matching</h3>
              <p className="text-gray-700">
                Our algorithm considers children, custody arrangements, and family goals 
                to find truly compatible matches who understand your situation.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <MessageCircle className="h-10 w-10 text-purple-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-3">Meaningful Conversations</h3>
              <p className="text-gray-700">
                Ice-breaker prompts and conversation starters designed specifically 
                for divorced singles help you connect on a deeper level.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <Eye className="h-10 w-10 text-green-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-3">Profile Visibility Control</h3>
              <p className="text-gray-700">
                Control who sees your profile and when. Perfect for maintaining privacy 
                while you navigate dating after divorce.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
              <Filter className="h-10 w-10 text-orange-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-3">Advanced Compatibility</h3>
              <p className="text-gray-700">
                Filter by relationship timeline, co-parenting style, lifestyle preferences, 
                and other factors that matter for long-term success.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-teal-50 to-teal-100 border-teal-200">
              <Sparkles className="h-10 w-10 text-teal-600 mb-4" />
              <h3 className="font-bold text-gray-900 mb-3">Second Chance Stories</h3>
              <p className="text-gray-700">
                Get inspired by real success stories from divorced singles who found 
                love again through our platform.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Success Story with Image */}
      <section className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1685540090414-e8f76d7211cf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdWNjZXNzZnVsJTIwaGFwcHklMjB3b21hbiUyMDQwcyUyMGV4ZWN1dGl2ZSUyMHNtaWxpbmd8ZW58MXx8fHwxNzU5NjQwMDU3fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                  alt="Successful, happy woman in her mid 40s representing high-income members finding love again"
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Floating testimonial */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-w-sm">
                <div className="space-y-3">
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-600">
                    "The Premium features made all the difference. I could see who was genuinely interested and found my perfect match in just 3 months!"
                  </p>
                  <div className="text-sm font-medium text-gray-700">- Sarah, Premium Member</div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Why Members Choose Premium
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Premium members are 3x more likely to find meaningful connections and report 
                higher satisfaction with their dating experience.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                    <Zap className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Faster Connections</h4>
                    <p className="text-gray-600">See who liked you and unlimited likes mean faster, more efficient matching</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                    <Eye className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Better Visibility</h4>
                    <p className="text-gray-600">Profile boost gets you 3x more views from potential matches</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 bg-rose-100 rounded-full flex items-center justify-center mt-1">
                    <Filter className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Precise Matching</h4>
                    <p className="text-gray-600">Advanced filters help you find exactly what you're looking for</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does AI matching work?</h3>
              <p className="text-gray-600">Our AI Smart Matching technology analyzes over 50 compatibility factors including your relationship goals, co-parenting preferences, lifestyle values, and communication style. The system learns from your interactions - when you like, pass, or message someone, the AI refines your future matches. Premium members receive daily curated matches based on deep compatibility analysis, not just location and age. The more you use Haply, the smarter your matches become, helping you find someone who truly aligns with your life and what you're looking for in a second chance at love.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How do I send direct messages?</h3>
              <p className="text-gray-600">When you match with someone (both of you have liked each other's profiles), a chat window opens instantly. Basic members can send 3 messages per day, while Premium members enjoy unlimited messaging. Our safe messaging system keeps all conversations on the platform until you're comfortable sharing contact information. You can send text, emojis, and share photos within the app. Premium members also get read receipts, priority message delivery, and the ability to see who's read their messages. All messages are encrypted and monitored by our safety team to ensure a respectful environment.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I switch between plans?</h3>
              <p className="text-gray-600">Yes! You can upgrade to Premium anytime or downgrade at the end of your billing cycle.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What's included in the Premium trial?</h3>
              <p className="text-gray-600">You get full access to all Premium features for 7 days. Cancel anytime before the trial ends and you won't be charged.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How does verification work?</h3>
              <p className="text-gray-600">Our verification process requires proof of identity and divorce decree or separation agreement. All information is kept secure and confidential.</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my information safe?</h3>
              <p className="text-gray-600">Absolutely. We use bank-level encryption and never share your personal information. You control what's visible on your profile.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-br from-rose-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Find Love Again?
          </h2>
          <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of divorced singles who have found meaningful connections on Haply. 
            Start free and upgrade when you're ready for more.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-rose-600 hover:bg-rose-700 text-lg px-8 py-3"
              onClick={onGetStarted}
            >
              Start Free Today
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={() => onGetStarted()}
            >
              Try Premium Free
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="flex justify-center space-x-8 mt-12 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-green-500" />
              <span>100% Verified</span>
            </div>
            <div className="flex items-center space-x-2">
              <Heart className="h-5 w-5 text-rose-500" />
              <span>1,200+ Success Stories</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <span>25K+ Active Members</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}