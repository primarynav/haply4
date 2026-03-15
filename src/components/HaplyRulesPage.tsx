import { ArrowLeft, Heart, Shield, Users, MessageCircle, AlertCircle, CheckCircle, Ban } from 'lucide-react';

interface HaplyRulesPageProps {
  onBack: () => void;
}

export function HaplyRulesPage({ onBack }: HaplyRulesPageProps) {
  const coreRules = [
    {
      icon: Heart,
      title: 'Be Respectful & Kind',
      description: 'Treat everyone with dignity and respect. We\'re all here with the same goal - to find meaningful connections after divorce. Remember that everyone has a story and deserves compassion.',
      examples: [
        'Use polite and considerate language',
        'Respect boundaries when someone declines',
        'Be patient with those new to online dating',
      ],
    },
    {
      icon: Shield,
      title: 'Be Honest & Authentic',
      description: 'Honesty is the foundation of any good relationship. Use recent, accurate photos and be truthful about your situation, including your divorce status, children, and what you\'re looking for.',
      examples: [
        'Use photos taken within the last year',
        'Be upfront about having children',
        'State your intentions clearly (dating, friendship, relationship)',
      ],
    },
    {
      icon: Users,
      title: 'Respect Privacy',
      description: 'Everyone deserves privacy and the right to share information at their own pace. Don\'t pressure others to share personal details before they\'re ready.',
      examples: [
        'Don\'t ask for addresses or exact locations early on',
        'Respect if someone doesn\'t want to share about their divorce',
        'Never share screenshots of private conversations',
      ],
    },
    {
      icon: MessageCircle,
      title: 'Communicate Thoughtfully',
      description: 'Take time to read profiles and send personalized messages. Generic messages or inappropriate content will not be tolerated.',
      examples: [
        'Reference something specific from their profile',
        'Ask genuine questions to get to know them',
        'Avoid copy-paste messages sent to multiple people',
      ],
    },
  ];

  const prohibited = [
    {
      title: 'Harassment & Abuse',
      items: [
        'Sending unwanted messages after being asked to stop',
        'Using threatening, abusive, or hateful language',
        'Stalking or obsessive behavior',
        'Sharing intimate images without consent',
      ],
    },
    {
      title: 'Dishonest Behavior',
      items: [
        'Catfishing or using fake photos',
        'Lying about marital status (claiming divorced when still married)',
        'Creating multiple accounts to evade blocks',
        'Misrepresenting age, location, or other key information',
      ],
    },
    {
      title: 'Inappropriate Content',
      items: [
        'Sexually explicit messages or images without consent',
        'Solicitation or commercial activity',
        'Spam or promotional content',
        'Content promoting illegal activities',
      ],
    },
    {
      title: 'Scams & Financial Requests',
      items: [
        'Asking for money or financial assistance',
        'Promoting investment schemes or business opportunities',
        'Requesting gift cards or wire transfers',
        'Phishing for personal financial information',
      ],
    },
  ];

  const safetyTips = [
    'Take your time getting to know someone before meeting in person',
    'Always meet in public places for the first few dates',
    'Tell a friend or family member about your plans',
    'Trust your instincts - if something feels off, it probably is',
    'Never share financial information or send money',
    'Use Haply\'s messaging system until you feel comfortable sharing contact info',
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 to-white">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="w-16 h-16 text-rose-500" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-900">Haply Rules</h1>
          <p className="text-xl text-gray-600">
            Our community guidelines help create a safe, respectful, and welcoming environment for all members. By using Haply, you agree to follow these rules.
          </p>
        </div>

        {/* Mission Statement */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-8 text-white mb-16">
          <h2 className="text-2xl mb-4">Our Mission</h2>
          <p className="text-rose-50 text-lg leading-relaxed">
            Haply is a community built on understanding, respect, and second chances. We know that dating after divorce can be challenging, and we're committed to providing a safe space where you can be yourself, heal, and find genuine connections. These rules ensure everyone has a positive experience.
          </p>
        </div>

        {/* Core Rules */}
        <div className="mb-16">
          <h2 className="text-3xl text-gray-900 mb-8">Core Community Rules</h2>
          <div className="space-y-8">
            {coreRules.map((rule, index) => {
              const Icon = rule.icon;
              return (
                <div key={index} className="bg-white rounded-xl shadow-md p-6 border-l-4 border-rose-500">
                  <div className="flex items-start gap-4">
                    <div className="bg-rose-100 p-3 rounded-lg flex-shrink-0">
                      <Icon className="w-6 h-6 text-rose-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl text-gray-900 mb-2">{rule.title}</h3>
                      <p className="text-gray-600 mb-4">{rule.description}</p>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <p className="text-sm text-gray-500 mb-2">Examples:</p>
                        <ul className="space-y-1">
                          {rule.examples.map((example, i) => (
                            <li key={i} className="flex items-start text-sm text-gray-700">
                              <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Prohibited Behavior */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <Ban className="w-8 h-8 text-red-600" />
            <h2 className="text-3xl text-gray-900">Prohibited Behavior</h2>
          </div>
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-800">
              The following behaviors are strictly prohibited and will result in immediate suspension or permanent ban from Haply:
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {prohibited.map((category, index) => (
              <div key={index} className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg text-gray-900 mb-4">{category.title}</h3>
                <ul className="space-y-2">
                  {category.items.map((item, i) => (
                    <li key={i} className="flex items-start text-sm text-gray-700">
                      <Ban className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Safety Tips */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <AlertCircle className="w-8 h-8 text-amber-600" />
            <h2 className="text-3xl text-gray-900">Stay Safe on Haply</h2>
          </div>
          <div className="bg-amber-50 rounded-xl p-8">
            <p className="text-gray-700 mb-6">
              Your safety is our top priority. Follow these tips to protect yourself while using Haply:
            </p>
            <ul className="space-y-3">
              {safetyTips.map((tip, index) => (
                <li key={index} className="flex items-start">
                  <Shield className="w-5 h-5 text-amber-600 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Reporting */}
        <div className="mb-16">
          <h2 className="text-3xl text-gray-900 mb-6">Report Violations</h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <p className="text-gray-700 mb-6">
              If you encounter behavior that violates our rules or makes you uncomfortable, please report it immediately. We take all reports seriously and investigate them promptly.
            </p>
            <div className="bg-rose-50 rounded-lg p-6">
              <h3 className="text-lg text-gray-900 mb-3">How to Report:</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  Click the three-dot menu on any profile or message
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  Select "Report" and choose the violation type
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  Provide details about the incident
                </li>
                <li className="flex items-start">
                  <span className="text-rose-600 mr-2">•</span>
                  Our safety team will review within 24 hours
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Consequences */}
        <div className="mb-16">
          <h2 className="text-3xl text-gray-900 mb-6">Consequences of Violations</h2>
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="space-y-4">
              <div className="border-l-4 border-yellow-500 pl-4">
                <h3 className="text-lg text-gray-900 mb-2">First Offense (Minor)</h3>
                <p className="text-gray-600">Warning and account review</p>
              </div>
              <div className="border-l-4 border-orange-500 pl-4">
                <h3 className="text-lg text-gray-900 mb-2">Second Offense or Moderate Violation</h3>
                <p className="text-gray-600">Temporary suspension (7-30 days)</p>
              </div>
              <div className="border-l-4 border-red-600 pl-4">
                <h3 className="text-lg text-gray-900 mb-2">Serious or Repeated Violations</h3>
                <p className="text-gray-600">Permanent ban from Haply</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              We reserve the right to suspend or ban any account at our discretion based on the severity of the violation and the safety of our community.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-12 text-white">
          <h2 className="text-3xl mb-4">Together We Build a Better Community</h2>
          <p className="text-xl text-rose-50 mb-6">
            Every member plays a role in keeping Haply safe and welcoming. Thank you for being part of our community and helping others find love again.
          </p>
          <button
            onClick={onBack}
            className="bg-white text-rose-600 px-8 py-4 rounded-full hover:bg-rose-50 transition-all transform hover:scale-105"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
