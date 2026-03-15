import { Button } from './ui/button';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { 
  Heart,
  Sparkles,
  Bot,
  User as UserIcon,
  Send
} from 'lucide-react';

interface AIDemoSectionProps {
  onGetStarted: () => void;
}

export function AIDemoSection({ onGetStarted }: AIDemoSectionProps) {
  return (
    <section className="py-16 bg-gradient-to-br from-purple-50 via-white to-violet-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-violet-600 text-white px-6 py-3 rounded-full mb-6">
            <Sparkles className="w-5 h-5" />
            <span>AI-First Experience</span>
          </div>
          <h2 className="text-4xl text-gray-900 mb-6">
            See How AI Matching Works
          </h2>
          <p className="text-xl text-gray-600">
            No more endless swiping. Just have a natural conversation with our AI matchmaker, 
            and we'll find people who truly align with what you're looking for.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
          {/* Chat Demo */}
          <div className="relative">
            <Card className="shadow-2xl border-gray-200 overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg">Your AI Matchmaker</h3>
                    <p className="text-purple-100 text-sm">Powered by intelligent conversation</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="p-6 space-y-4 bg-white min-h-[500px]">
                {/* AI Message 1 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                      <p className="text-gray-900">
                        Hi! I'm here to help you find someone special. Let's start with what matters most to you in a relationship. What are you looking for in a partner?
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">10:23 AM</p>
                  </div>
                </div>

                {/* User Message 1 */}
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="inline-block bg-purple-600 text-white p-4 rounded-2xl rounded-tr-none">
                      <p>
                        I'm looking for someone who understands that I have kids and values family time. Someone emotionally mature and ready for a real relationship.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">10:24 AM</p>
                  </div>
                </div>

                {/* AI Message 2 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                      <p className="text-gray-900">
                        That's wonderful! Family values are so important. Tell me about your parenting situation. How many kids do you have, and how do you envision blending families with a future partner?
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">10:25 AM</p>
                  </div>
                </div>

                {/* User Message 2 */}
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="inline-block bg-purple-600 text-white p-4 rounded-2xl rounded-tr-none">
                      <p>
                        I have two kids (8 and 11). I'm looking for someone patient who's open to blended families and understands that my kids come first.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">10:26 AM</p>
                  </div>
                </div>

                {/* AI Message 3 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-100 p-4 rounded-2xl rounded-tl-none">
                      <p className="text-gray-900">
                        Perfect! I'm getting a clear picture. One more thing - what kind of lifestyle and activities do you enjoy? This helps me find someone compatible with your day-to-day life.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">10:27 AM</p>
                  </div>
                </div>

                {/* User Message 3 */}
                <div className="flex gap-3 flex-row-reverse">
                  <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 text-right">
                    <div className="inline-block bg-purple-600 text-white p-4 rounded-2xl rounded-tr-none">
                      <p>
                        I love outdoor activities - hiking, biking. Also enjoy cooking and trying new restaurants. Weekend family time is important.
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">10:28 AM</p>
                  </div>
                </div>

                {/* AI Message 4 */}
                <div className="flex gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="bg-gradient-to-br from-purple-100 to-violet-100 p-4 rounded-2xl rounded-tl-none border-2 border-purple-200">
                      <p className="text-gray-900 mb-2">
                        Excellent! I think I have a great sense of what you're looking for. Let me find some compatible matches for you...
                      </p>
                      <div className="flex items-center gap-2 text-purple-600">
                        <Sparkles className="w-4 h-4 animate-pulse" />
                        <span className="text-sm">Finding your matches...</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 px-2">10:29 AM</p>
                  </div>
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-2">
                  <div className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-2 text-gray-400">
                    Type your message...
                  </div>
                  <button className="bg-purple-600 text-white p-2 rounded-lg">
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Matched Profiles */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl text-gray-900 mb-4 flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-purple-600" />
                Your AI-Matched Profiles
              </h3>
              <p className="text-gray-600 mb-6">
                Based on your conversation, here are highly compatible matches who share your values and lifestyle
              </p>
            </div>

            {/* Match Card 1 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-purple-100">
              <div className="flex items-start gap-4 p-4">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"
                  alt="Match"
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg text-gray-900">Michael C.</h4>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      94% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">42 • Portland, OR</p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    Dad of two boys. Love hiking and cooking. Values family time and open communication.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">Hiking</Badge>
                    <Badge variant="outline" className="text-xs">Cooking</Badge>
                    <Badge variant="outline" className="text-xs">Family</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">Strong co-parenting values align with yours</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">Shares love for outdoor activities</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Match Card 2 */}
            <Card className="overflow-hidden hover:shadow-lg transition-shadow border-2 border-purple-100">
              <div className="flex items-start gap-4 p-4">
                <img
                  src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
                  alt="Match"
                  className="w-20 h-20 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-lg text-gray-900">Jennifer M.</h4>
                    <Badge className="bg-purple-100 text-purple-700 text-xs">
                      91% Match
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">38 • Seattle, WA</p>
                  <p className="text-sm text-gray-700 mb-3 line-clamp-2">
                    Mom of two. Love nature, Sunday coffee, and quality family time. Ready for new beginnings.
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">Nature</Badge>
                    <Badge variant="outline" className="text-xs">Coffee</Badge>
                    <Badge variant="outline" className="text-xs">Family</Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">Similar parenting philosophy and family values</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Heart className="w-4 h-4 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">Compatible lifestyle with outdoor interests</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* CTA */}
            <div className="bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl p-6 text-white">
              <div className="flex items-start gap-3 mb-4">
                <Sparkles className="w-6 h-6 flex-shrink-0" />
                <div>
                  <h4 className="text-lg mb-2">Try AI Matching Today</h4>
                  <p className="text-purple-100 text-sm">
                    Join 25,000+ divorced singles using conversational AI to find their perfect match. 
                    No endless swiping—just natural conversation.
                  </p>
                </div>
              </div>
              <Button 
                className="w-full bg-white text-purple-600 hover:bg-purple-50"
                onClick={onGetStarted}
              >
                Start Your Journey
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
