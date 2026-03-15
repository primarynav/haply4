import { ArrowLeft, Search, HelpCircle, MessageCircle, Shield, Heart } from 'lucide-react';

interface HelpCenterPageProps {
  onBack: () => void;
}

export function HelpCenterPage({ onBack }: HelpCenterPageProps) {
  const faqs = [
    {
      category: 'Getting Started',
      icon: Heart,
      questions: [
        {
          q: 'How do I create an account?',
          a: 'Click the "Get Started" button, answer a few quick questions about yourself, and then complete your profile. You can start browsing matches immediately!'
        },
        {
          q: 'What makes Haply different from other dating apps?',
          a: 'Haply is specifically designed for divorced singles. We understand the unique challenges of dating after divorce and offer features like verified divorce status, co-parenting filters, and a supportive community.'
        },
        {
          q: 'Is my divorce status verified?',
          a: 'Premium members can verify their divorce status through our secure verification process. This builds trust and ensures you\'re meeting genuine divorced singles.'
        }
      ]
    },
    {
      category: 'Profile & Matching',
      icon: HelpCircle,
      questions: [
        {
          q: 'How does the AI matching work?',
          a: 'Our AI analyzes your preferences, values, lifestyle, and co-parenting situation to suggest compatible matches. The more you interact with the app, the smarter the recommendations become.'
        },
        {
          q: 'Can I filter matches by parenting status?',
          a: 'Yes! You can filter by whether someone has children, their custody arrangement, and their openness to dating someone with kids.'
        },
        {
          q: 'How do I update my profile?',
          a: 'Click on your profile icon in the dashboard, then select "Settings" to update your photos, bio, preferences, and other details.'
        }
      ]
    },
    {
      category: 'Safety & Privacy',
      icon: Shield,
      questions: [
        {
          q: 'How is my personal information protected?',
          a: 'We use industry-standard encryption to protect your data. Your information is never shared with third parties without your consent. See our Privacy Policy for details.'
        },
        {
          q: 'Can I block or report someone?',
          a: 'Absolutely. You can block any user from your match screen or message thread. To report inappropriate behavior, use the report button on their profile.'
        },
        {
          q: 'What information is visible to other users?',
          a: 'Other users can see your photos, bio, and basic information you choose to share. Your contact information, location details, and private messages remain secure.'
        }
      ]
    },
    {
      category: 'Subscription & Billing',
      icon: MessageCircle,
      questions: [
        {
          q: 'What\'s included in the free tier?',
          a: 'Free members can create a profile, browse matches, and receive a limited number of matches per day. Upgrade to Premium for unlimited matching, advanced filters, and priority support.'
        },
        {
          q: 'How much does Premium cost?',
          a: 'Premium membership is $29.99/month. This includes unlimited matches, verified profile badge, advanced filters, read receipts, and more.'
        },
        {
          q: 'Can I cancel my subscription anytime?',
          a: 'Yes, you can cancel your Premium subscription at any time from your account settings. You\'ll continue to have Premium access until the end of your billing period.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-900">Help Center</h1>
          <p className="text-xl text-gray-600 mb-8">
            We're here to help you find love again
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search for help..."
              className="w-full pl-12 pr-4 py-4 rounded-full border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
            />
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="space-y-8">
          {faqs.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-rose-100 p-3 rounded-full">
                    <Icon className="w-6 h-6 text-rose-600" />
                  </div>
                  <h2 className="text-2xl text-gray-900">{category.category}</h2>
                </div>
                
                <div className="space-y-6">
                  {category.questions.map((item, qIdx) => (
                    <div key={qIdx} className="border-l-4 border-rose-200 pl-6 py-2">
                      <h3 className="text-gray-900 mb-2">{item.q}</h3>
                      <p className="text-gray-600">{item.a}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Contact Support */}
        <div className="mt-12 bg-gradient-to-r from-rose-500 to-pink-500 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl mb-3">Still Need Help?</h2>
          <p className="text-rose-50 mb-6">
            Our support team is here for you
          </p>
          <button className="bg-white text-rose-600 px-8 py-3 rounded-full hover:bg-rose-50 transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}
