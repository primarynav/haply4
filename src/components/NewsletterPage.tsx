import { ArrowLeft, Mail, Heart, Sparkles, Users, Calendar, CheckCircle2, Send } from 'lucide-react';
import { useState } from 'react';

interface NewsletterPageProps {
  onBack: () => void;
}

export function NewsletterPage({ onBack }: NewsletterPageProps) {
  const [email, setEmail] = useState('');
  const [preferences, setPreferences] = useState({
    successStories: true,
    datingTips: true,
    weeklyMatches: false,
    communityNews: true,
    events: false
  });
  const [subscribed, setSubscribed] = useState(false);

  const newsletterBenefits = [
    {
      icon: Heart,
      title: 'Real Success Stories',
      description: 'Be inspired by couples who found love again on Haply',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Sparkles,
      title: 'Expert Dating Tips',
      description: 'Guidance for navigating relationships after divorce',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Users,
      title: 'Community Highlights',
      description: 'Stories, advice, and support from our community',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Calendar,
      title: 'Exclusive Updates',
      description: 'Be the first to know about new features and events',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Newsletter subscription:', { email, preferences });
    setSubscribed(true);
  };

  const togglePreference = (key: keyof typeof preferences) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  if (subscribed) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-purple-50 to-white flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-gray-100">
            <div className="inline-flex p-6 rounded-full bg-gradient-to-r from-rose-500 to-pink-500 mb-6">
              <CheckCircle2 className="w-16 h-16 text-white" />
            </div>
            <h1 className="text-4xl mb-4 text-gray-900">Welcome to the Haply Family! 💝</h1>
            <p className="text-xl text-gray-600 mb-8">
              You're now subscribed to our newsletter. Get ready for inspiring stories, 
              expert advice, and updates that will support your journey to finding love again.
            </p>
            <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 mb-8 border border-rose-100">
              <p className="text-gray-700">
                📧 Check your inbox at <span className="text-rose-600">{email}</span> to 
                confirm your subscription and get your welcome guide!
              </p>
            </div>
            <button
              onClick={onBack}
              className="bg-gradient-to-r from-rose-500 to-pink-500 text-white px-8 py-4 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-purple-50 to-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-700 px-6 py-3 rounded-full mb-6">
            <Mail className="w-5 h-5" />
            <span>Stay Connected with Haply</span>
          </div>
          <h1 className="text-5xl mb-4 text-gray-900">Newsletter</h1>
          <p className="text-2xl text-gray-600 max-w-3xl mx-auto">
            Join thousands of divorced singles on their journey to finding love again. 
            Get inspiring stories, expert advice, and exclusive updates delivered to your inbox.
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {newsletterBenefits.map((benefit, idx) => {
            const Icon = benefit.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${benefit.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Subscription Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl mb-6 text-gray-900">Subscribe to Our Newsletter</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-4">
                  What would you like to receive?
                </label>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences.successStories}
                      onChange={() => togglePreference('successStories')}
                      className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-gray-900 group-hover:text-rose-600 transition-colors">Success Stories</div>
                      <div className="text-sm text-gray-500">Real stories from couples who found love again</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences.datingTips}
                      onChange={() => togglePreference('datingTips')}
                      className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-gray-900 group-hover:text-rose-600 transition-colors">Dating Tips & Advice</div>
                      <div className="text-sm text-gray-500">Expert guidance for post-divorce dating</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences.weeklyMatches}
                      onChange={() => togglePreference('weeklyMatches')}
                      className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-gray-900 group-hover:text-rose-600 transition-colors">Weekly Match Highlights</div>
                      <div className="text-sm text-gray-500">Curated profiles you might like</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences.communityNews}
                      onChange={() => togglePreference('communityNews')}
                      className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-gray-900 group-hover:text-rose-600 transition-colors">Community News</div>
                      <div className="text-sm text-gray-500">Updates from the Haply community</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={preferences.events}
                      onChange={() => togglePreference('events')}
                      className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
                    />
                    <div>
                      <div className="text-gray-900 group-hover:text-rose-600 transition-colors">Events & Meetups</div>
                      <div className="text-sm text-gray-500">Local and virtual events for members</div>
                    </div>
                  </label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Subscribe to Newsletter
              </button>

              <p className="text-sm text-gray-500 text-center">
                We respect your privacy. Unsubscribe anytime.
              </p>
            </form>
          </div>

          {/* Testimonials & Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-2xl p-8 text-white">
              <h3 className="text-2xl mb-4">Why Our Members Love It</h3>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/90 mb-2">
                    "The weekly success stories give me so much hope. I love seeing real people who found love after divorce!"
                  </p>
                  <p className="text-sm text-white/70">— Jennifer, 42, Member since 2023</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                  <p className="text-white/90 mb-2">
                    "The dating tips are so helpful. It's nice to get advice specific to dating as a divorced parent."
                  </p>
                  <p className="text-sm text-white/70">— Michael, 38, Member since 2024</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-4">What to Expect</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-gray-900 mb-1">Weekly Digest</h4>
                    <p className="text-gray-600 text-sm">
                      One thoughtfully curated email every week with the best stories and tips
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-gray-900 mb-1">No Spam, Ever</h4>
                    <p className="text-gray-600 text-sm">
                      We only send valuable content. Your inbox won't be flooded
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-gray-900 mb-1">Exclusive Content</h4>
                    <p className="text-gray-600 text-sm">
                      Subscriber-only dating advice, early feature access, and special events
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-500 flex-shrink-0 mt-1" />
                  <div>
                    <h4 className="text-gray-900 mb-1">Easy Unsubscribe</h4>
                    <p className="text-gray-600 text-sm">
                      Change your mind? Unsubscribe with one click, no questions asked
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
              <h3 className="text-gray-900 mb-3">Newsletter Archive</h3>
              <p className="text-gray-600 mb-4">
                Want to see what you've been missing? Check out our past newsletters to get a taste 
                of the inspiring stories and valuable advice we share.
              </p>
              <button className="text-rose-600 hover:text-rose-700 transition-colors">
                Browse Archive →
              </button>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-3xl p-12 text-center text-white">
          <h2 className="text-3xl mb-4">Join 50,000+ Subscribers</h2>
          <p className="text-xl text-purple-100 mb-6 max-w-2xl mx-auto">
            Be part of a supportive community that believes in second chances and happily ever afters.
          </p>
          <div className="flex items-center justify-center gap-8 text-purple-100">
            <div className="flex items-center gap-2">
              <Heart className="w-5 h-5" />
              <span>Weekly Inspiration</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span>Expert Tips</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              <span>Community Support</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
