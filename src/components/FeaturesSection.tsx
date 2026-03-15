import { Card, CardContent } from './ui/card';
import { Shield, Heart, MessageCircle, UserCheck, Calendar, Star, Sparkles, Bot, Target } from 'lucide-react';

interface FeaturesSectionProps {
  onGetStarted: () => void;
  onLearnMore: () => void;
}

export function FeaturesSection({ onGetStarted, onLearnMore }: FeaturesSectionProps) {
  const features = [
    {
      icon: Bot,
      title: 'AI Conversational Matching',
      description: 'Simply chat about what you\'re looking for. Our AI understands your needs and finds truly compatible matches.',
      highlight: true
    },
    {
      icon: Sparkles,
      title: 'Natural Language Search',
      description: 'No forms or filters—just tell us in your own words what matters most to you in a partner.',
      highlight: true
    },
    {
      icon: Target,
      title: 'Intelligent Understanding',
      description: 'Our AI learns from the conversation to understand values, lifestyle, parenting styles, and relationship goals.',
      highlight: true
    },
    {
      icon: Shield,
      title: 'Verified Divorce Status',
      description: 'All members provide verified proof of divorce, ensuring genuine connections within our community.'
    },
    {
      icon: Heart,
      title: 'Empathetic Matching',
      description: 'Our algorithm considers your emotional readiness and relationship goals, not just preferences.'
    },
    {
      icon: UserCheck,
      title: 'Profile Verification',
      description: 'Rigorous profile verification process ensures authentic connections with real people.'
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* AI First Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span>AI-First Dating Platform</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stop Swiping. Start Talking.
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Haply is the first dating platform designed around conversation, not swiping. Our AI matchmaker 
            chats with you to deeply understand what you're looking for, then finds matches that truly align 
            with your values, lifestyle, and relationship goals.
          </p>
        </div>
        
        {/* How It Works Banner */}
        <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl p-8 mb-16 border border-purple-100">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="space-y-3">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg text-gray-900">1. Have a Conversation</h3>
              <p className="text-gray-600 text-sm">
                Chat naturally with our AI about your ideal partner, values, and what matters most to you
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-violet-600 rounded-full flex items-center justify-center mx-auto">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg text-gray-900">2. AI Finds Your Matches</h3>
              <p className="text-gray-600 text-sm">
                Our intelligent system analyzes compatibility across hundreds of factors unique to divorced dating
              </p>
            </div>
            <div className="space-y-3">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg text-gray-900">3. Meet Your Matches</h3>
              <p className="text-gray-600 text-sm">
                Connect with people who truly understand your journey and share your vision for the future
              </p>
            </div>
          </div>
        </div>

        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Built for Your Second Chapter
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Beyond AI matching, Haply offers features specifically designed for divorced singles 
            who are ready to find meaningful, lasting love.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                feature.highlight ? 'ring-2 ring-purple-200 bg-gradient-to-br from-purple-50 to-white' : ''
              }`}
            >
              <CardContent className="p-8 text-center">
                <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
                  feature.highlight 
                    ? 'bg-gradient-to-br from-purple-600 to-violet-600' 
                    : 'bg-rose-100'
                }`}>
                  <feature.icon className={`h-8 w-8 ${
                    feature.highlight ? 'text-white' : 'text-rose-600'
                  }`} />
                </div>
                {feature.highlight && (
                  <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs mb-3">
                    <Sparkles className="w-3 h-3" />
                    AI Powered
                  </div>
                )}
                <h3 className="text-xl font-semibold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Call-to-action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-purple-600 via-violet-600 to-rose-500 rounded-2xl p-8 text-white">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Sparkles className="w-6 h-6" />
              <h3 className="text-2xl font-bold">
                Experience AI-First Matching Today
              </h3>
            </div>
            <p className="text-lg mb-6 opacity-90">
              No more endless swiping. Just have a conversation and find truly compatible matches 
              who understand your journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={onGetStarted}
                className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-50 hover:shadow-lg hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                Start Chatting Now
              </button>
              <button 
                onClick={onLearnMore}
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-purple-600 transition-colors"
              >
                Learn More
              </button>
            </div>
            <p className="text-sm mt-4 opacity-75">
              Join 25,000+ divorced singles using AI to find their perfect match
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}