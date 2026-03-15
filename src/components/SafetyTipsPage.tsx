import { ArrowLeft, Shield, Eye, Lock, AlertTriangle, UserCheck, MessageSquare, Heart } from 'lucide-react';

interface SafetyTipsPageProps {
  onBack: () => void;
}

export function SafetyTipsPage({ onBack }: SafetyTipsPageProps) {
  const safetyTips = [
    {
      title: 'Protect Your Personal Information',
      icon: Lock,
      color: 'from-blue-500 to-indigo-500',
      tips: [
        'Never share your full name, address, or workplace in your initial messages',
        'Keep financial information private - never send money to someone you haven\'t met',
        'Use Haply\'s messaging system instead of giving out your phone number immediately',
        'Be cautious about sharing social media profiles until you\'ve established trust',
        'Don\'t share details about your children\'s schools or daily routines'
      ]
    },
    {
      title: 'Meeting in Person Safely',
      icon: UserCheck,
      color: 'from-rose-500 to-pink-500',
      tips: [
        'Always meet in a public place for first dates (coffee shops, restaurants, parks)',
        'Tell a friend or family member where you\'re going and who you\'re meeting',
        'Arrange your own transportation - don\'t accept rides from your date initially',
        'Keep your phone charged and accessible throughout the date',
        'Trust your instincts - if something feels off, it\'s okay to leave',
        'Consider a video call before meeting in person to verify their identity'
      ]
    },
    {
      title: 'Recognizing Red Flags',
      icon: AlertTriangle,
      color: 'from-amber-500 to-orange-500',
      tips: [
        'Be wary of anyone who asks for money or financial help',
        'Watch out for inconsistent stories or refusal to video chat',
        'Avoid people who pressure you to move off the platform too quickly',
        'Be cautious of overly generic or scripted-sounding messages',
        'Trust your gut if someone seems too good to be true',
        'Report profiles that seem fake or suspicious'
      ]
    },
    {
      title: 'Online Communication Safety',
      icon: MessageSquare,
      color: 'from-purple-500 to-violet-500',
      tips: [
        'Take your time getting to know someone before meeting',
        'Be yourself, but maintain healthy boundaries',
        'Don\'t feel pressured to share intimate photos or information',
        'Block and report anyone who makes you uncomfortable',
        'Use Haply\'s built-in safety features like user verification',
        'Keep conversations on the platform until you feel comfortable'
      ]
    },
    {
      title: 'Protecting Your Heart',
      icon: Heart,
      color: 'from-pink-500 to-rose-500',
      tips: [
        'Take things at your own pace - there\'s no rush',
        'Be honest about your situation and what you\'re looking for',
        'Don\'t ignore warning signs because you want the relationship to work',
        'It\'s okay to take breaks from dating when you need to',
        'Remember: your emotional safety is just as important as physical safety',
        'Seek support from friends, family, or a therapist during your dating journey'
      ]
    },
    {
      title: 'Divorce-Specific Considerations',
      icon: Eye,
      color: 'from-teal-500 to-cyan-500',
      tips: [
        'Be clear about your custody arrangements and parenting priorities',
        'Don\'t introduce dates to your children until the relationship is serious',
        'Understand that healing from divorce takes time - be patient with yourself',
        'Consider how dating might affect divorce proceedings if they\'re ongoing',
        'Be upfront about any complications from your previous marriage',
        'Use Haply\'s verified profiles feature to ensure matches are actually divorced'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
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

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4 text-gray-900">Safety Tips</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your safety and well-being are our top priorities. Follow these guidelines to have a safe and positive dating experience.
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-xl mb-12">
          <div className="flex gap-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-amber-900 mb-2">Important Reminder</h3>
              <p className="text-amber-800">
                While we work hard to create a safe community, no dating platform can guarantee the intentions of all users. 
                Always trust your instincts and prioritize your safety. If you ever feel unsafe, don't hesitate to block, 
                report, or reach out to our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Safety Categories */}
        <div className="space-y-8">
          {safetyTips.map((category, idx) => {
            const Icon = category.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className={`bg-gradient-to-r ${category.color} px-8 py-6 text-white`}>
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl">{category.title}</h2>
                  </div>
                </div>
                
                <div className="p-8">
                  <ul className="space-y-4">
                    {category.tips.map((tip, tipIdx) => (
                      <li key={tipIdx} className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-2 h-2 bg-gradient-to-r ${category.color} rounded-full`}></div>
                        </div>
                        <p className="text-gray-700">{tip}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
        </div>

        {/* Emergency Contact */}
        <div className="mt-12 bg-gradient-to-r from-red-500 to-rose-500 rounded-2xl p-8 text-white">
          <h2 className="text-2xl mb-3">In Case of Emergency</h2>
          <p className="text-rose-50 mb-6">
            If you feel you're in immediate danger, call emergency services (911 in the US). 
            For non-emergency safety concerns, contact our safety team immediately.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-rose-600 px-8 py-3 rounded-full hover:bg-rose-50 transition-colors">
              Report an Issue
            </button>
            <button className="bg-rose-600 border-2 border-white text-white px-8 py-3 rounded-full hover:bg-rose-700 transition-colors">
              Contact Safety Team
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
