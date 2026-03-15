import { ArrowLeft, Shield, MessageSquare, Eye, EyeOff, Flag, Ban, CheckCircle2, Lock, AlertTriangle, Image, FileText } from 'lucide-react';

interface SafeMessagingPageProps {
  onBack: () => void;
}

export function SafeMessagingPage({ onBack }: SafeMessagingPageProps) {
  const features = [
    {
      icon: Lock,
      title: 'End-to-End Encryption',
      description: 'Your messages are encrypted and only visible to you and your match',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Eye,
      title: 'Read Receipts',
      description: 'Know when your messages have been read (Premium feature)',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Ban,
      title: 'Block & Report',
      description: 'Instantly block users and report inappropriate behavior',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Shield,
      title: 'AI Content Moderation',
      description: 'Automatic filtering of inappropriate content and spam',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const safetyTools = [
    {
      title: 'Photo & Media Controls',
      icon: Image,
      description: 'Control what media you receive and share',
      details: [
        'Block incoming photos until you\'re ready',
        'Preview images with blur protection',
        'Report inappropriate photos instantly',
        'Choose who can send you photos',
        'Auto-detect and flag potentially inappropriate content'
      ]
    },
    {
      title: 'Message Filtering',
      icon: MessageSquare,
      description: 'AI-powered protection from unwanted messages',
      details: [
        'Automatic spam and scam detection',
        'Filter out messages with inappropriate language',
        'Detect and warn about potential catfishing',
        'Block messages asking for money or financial info',
        'Flag suspicious links and external contact requests'
      ]
    },
    {
      title: 'Privacy Controls',
      icon: EyeOff,
      description: 'You decide who can message you',
      details: [
        'Only receive messages from mutual matches',
        'Set preferences for who can initiate conversations',
        'Control your online/offline status visibility',
        'Hide your "last active" timestamp if desired',
        'Premium: See who viewed your profile'
      ]
    },
    {
      title: 'Reporting System',
      icon: Flag,
      description: 'Quick and easy reporting tools',
      details: [
        'One-tap reporting from any message',
        'Report entire conversations with context',
        'Block user immediately when reporting',
        'Choose specific violation types',
        'Receive updates on your report status'
      ]
    }
  ];

  const bestPractices = [
    {
      category: 'Getting Started',
      icon: MessageSquare,
      tips: [
        'Take your time getting to know someone through messages',
        'Don\'t feel pressured to respond immediately',
        'Start with light topics and build trust gradually',
        'Pay attention to how they communicate and respect boundaries'
      ]
    },
    {
      category: 'Protecting Your Information',
      icon: Lock,
      tips: [
        'Keep conversations on Haply until you\'re comfortable',
        'Don\'t share phone numbers or social media too quickly',
        'Never share financial information or passwords',
        'Be cautious about sharing details about your children',
        'Avoid giving away your address or workplace location'
      ]
    },
    {
      category: 'Recognizing Red Flags',
      icon: AlertTriangle,
      tips: [
        'Be wary of anyone asking for money or financial help',
        'Watch for inconsistent or evasive answers to questions',
        'Notice if they avoid video calls or meeting in person',
        'Be cautious of overly fast declarations of love',
        'Trust your instincts if something feels off'
      ]
    },
    {
      category: 'When to Block or Report',
      icon: Ban,
      tips: [
        'Report any requests for money or financial assistance',
        'Block users who make you uncomfortable',
        'Report inappropriate or sexually explicit messages',
        'Flag profiles that seem fake or suspicious',
        'Report harassment, threats, or abusive behavior immediately'
      ]
    }
  ];

  const premiumFeatures = [
    {
      feature: 'Read Receipts',
      description: 'See when your messages have been read'
    },
    {
      feature: 'Priority Messaging',
      description: 'Your messages appear first in their inbox'
    },
    {
      feature: 'Advanced Filters',
      description: 'More control over who can message you'
    },
    {
      feature: 'Unlimited Messaging',
      description: 'No daily message limits'
    },
    {
      feature: 'Video & Voice Messaging',
      description: 'Send video and voice messages (coming soon)'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
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
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6">
            <MessageSquare className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-900">Safe Messaging</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect with confidence using our secure, private messaging platform. 
            Your safety and privacy are built into every conversation.
          </p>
        </div>

        {/* Why Safe Messaging Matters */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-indigo-100 p-4 rounded-full">
              <Shield className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-3xl mb-4 text-gray-900">Message with Peace of Mind</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Dating after divorce means starting fresh, and we want you to feel safe every step of the way. 
                Our messaging platform is designed with multiple layers of protection to ensure your conversations 
                remain private, secure, and free from harassment.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Whether you're just starting to chat with a new match or building a deeper connection, 
                Haply gives you the tools to communicate safely on your terms.
              </p>
            </div>
          </div>
        </div>

        {/* Core Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8 text-gray-900">Core Safety Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${feature.color} mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety Tools Detail */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-4 text-gray-900">Advanced Safety Tools</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Comprehensive protection designed specifically for your safety
          </p>
          
          <div className="space-y-6">
            {safetyTools.map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-3 rounded-full">
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-2xl">{tool.title}</h3>
                        <p className="text-indigo-100 mt-1">{tool.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <ul className="grid md:grid-cols-2 gap-3">
                      {tool.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Best Practices */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-4 text-gray-900">Safe Messaging Best Practices</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Follow these guidelines to have safe and positive conversations
          </p>
          
          <div className="grid md:grid-cols-2 gap-6">
            {bestPractices.map((practice, idx) => {
              const Icon = practice.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-3 rounded-full">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="text-xl text-gray-900">{practice.category}</h3>
                  </div>
                  
                  <ul className="space-y-3">
                    {practice.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2 flex-shrink-0"></div>
                        <span className="text-gray-600">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>

        {/* How to Block & Report */}
        <div className="bg-gradient-to-br from-rose-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="flex items-start gap-4">
            <Ban className="w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-3xl mb-4">How to Block or Report Someone</h2>
              <p className="text-rose-50 text-lg mb-6">
                If you ever feel uncomfortable or unsafe, here's how to take action:
              </p>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-xl mb-3">To Block a User:</h3>
                  <ol className="space-y-2 text-rose-50">
                    <li>1. Open the conversation or their profile</li>
                    <li>2. Tap the three dots menu</li>
                    <li>3. Select "Block User"</li>
                    <li>4. Confirm your decision</li>
                  </ol>
                  <p className="text-sm text-rose-100 mt-4">
                    They won't be notified and can't contact you again.
                  </p>
                </div>
                
                <div className="bg-white/10 rounded-xl p-6">
                  <h3 className="text-xl mb-3">To Report a User:</h3>
                  <ol className="space-y-2 text-rose-50">
                    <li>1. Tap the three dots menu</li>
                    <li>2. Select "Report User"</li>
                    <li>3. Choose the violation type</li>
                    <li>4. Add details (optional)</li>
                    <li>5. Submit your report</li>
                  </ol>
                  <p className="text-sm text-rose-100 mt-4">
                    Our team reviews all reports within 24 hours.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Messaging Features */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-16">
          <h2 className="text-3xl text-center mb-4 text-gray-900">Premium Messaging Features</h2>
          <p className="text-center text-gray-600 mb-8 max-w-2xl mx-auto">
            Upgrade to unlock advanced messaging capabilities
          </p>
          
          <div className="grid md:grid-cols-2 gap-4 mb-8">
            {premiumFeatures.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 p-4 bg-indigo-50 rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-indigo-600 flex-shrink-0 mt-1" />
                <div>
                  <h4 className="text-gray-900 mb-1">{item.feature}</h4>
                  <p className="text-gray-600 text-sm">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <button className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-8 py-4 rounded-full hover:from-indigo-600 hover:to-purple-600 transition-all shadow-lg">
              Upgrade to Premium - $29.99/month
            </button>
          </div>
        </div>

        {/* Emergency Help */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-8 md:p-12 text-white">
          <div className="flex items-start gap-4">
            <AlertTriangle className="w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-3xl mb-3">Need Help Right Now?</h2>
              <p className="text-amber-50 text-lg mb-6">
                If you're experiencing harassment, threats, or feel unsafe, we're here to help immediately.
              </p>
              <div className="flex flex-wrap gap-4">
                <button className="bg-white text-amber-600 px-8 py-3 rounded-full hover:bg-amber-50 transition-colors">
                  Contact Safety Team
                </button>
                <button className="bg-amber-600 border-2 border-white text-white px-8 py-3 rounded-full hover:bg-amber-700 transition-colors">
                  Report Emergency
                </button>
              </div>
              <p className="text-sm text-amber-100 mt-6">
                For immediate danger, contact local emergency services (911 in the US).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
