import { ArrowLeft, Brain, Heart, Users, Sparkles, TrendingUp, Target, Zap, CheckCircle2, BarChart3 } from 'lucide-react';

interface AISmartMatchingPageProps {
  onBack: () => void;
}

export function AISmartMatchingPage({ onBack }: AISmartMatchingPageProps) {
  const features = [
    {
      icon: Brain,
      title: 'Smart Learning Algorithm',
      description: 'Our AI learns from your preferences and interactions to suggest better matches over time',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Heart,
      title: 'Compatibility Analysis',
      description: 'We analyze values, lifestyle, parenting styles, and relationship goals for deeper compatibility',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Users,
      title: 'Divorce-Specific Matching',
      description: 'Unique factors like co-parenting arrangements, healing timelines, and readiness for commitment',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: Target,
      title: 'Precision Matching',
      description: 'Filter by what matters most: kids, custody, dating intentions, and life stage compatibility',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Build Your Profile',
      description: 'Share your story, values, interests, and what you\'re looking for in a partner',
      icon: Users,
      details: [
        'Tell us about your divorce journey and what you\'ve learned',
        'Share your parenting situation and priorities',
        'Describe your ideal relationship and partner qualities',
        'Select your dealbreakers and must-haves'
      ]
    },
    {
      step: 2,
      title: 'AI Analyzes Compatibility',
      description: 'Our algorithm evaluates hundreds of compatibility factors',
      icon: Brain,
      details: [
        'Personality traits and communication styles',
        'Life goals and relationship expectations',
        'Parenting philosophies and family dynamics',
        'Values, interests, and lifestyle preferences',
        'Location, age range, and practical considerations'
      ]
    },
    {
      step: 3,
      title: 'Get Personalized Matches',
      description: 'Receive daily matches selected specifically for you',
      icon: Sparkles,
      details: [
        'Free members: Up to 10 curated matches per day',
        'Premium members: Unlimited matches',
        'Match quality improves as the AI learns your preferences',
        'See compatibility scores and shared values highlighted'
      ]
    },
    {
      step: 4,
      title: 'Continuous Improvement',
      description: 'The more you use Haply, the smarter your matches become',
      icon: TrendingUp,
      details: [
        'AI learns from your likes, passes, and messaging patterns',
        'Adapts to your evolving preferences over time',
        'Identifies patterns in successful connections',
        'Refines match quality based on your feedback'
      ]
    }
  ];

  const matchingFactors = [
    {
      category: 'Personal Compatibility',
      factors: [
        'Personality type and temperament',
        'Communication style',
        'Sense of humor',
        'Energy level and lifestyle pace',
        'Introvert/extrovert balance'
      ]
    },
    {
      category: 'Values & Beliefs',
      factors: [
        'Core life values',
        'Religious and spiritual beliefs',
        'Political views',
        'Financial philosophies',
        'Life priorities'
      ]
    },
    {
      category: 'Lifestyle & Interests',
      factors: [
        'Hobbies and passions',
        'Travel preferences',
        'Social activities',
        'Health and fitness habits',
        'Cultural interests'
      ]
    },
    {
      category: 'Relationship Goals',
      factors: [
        'Long-term intentions',
        'Timeline for commitment',
        'Views on remarriage',
        'Approach to blended families',
        'Communication expectations'
      ]
    },
    {
      category: 'Divorce-Specific',
      factors: [
        'Co-parenting arrangements',
        'Number and ages of children',
        'Openness to dating parents',
        'Time since divorce',
        'Healing and readiness status'
      ]
    },
    {
      category: 'Practical Considerations',
      factors: [
        'Geographic location',
        'Age range preferences',
        'Education level',
        'Career and work-life balance',
        'Living situation'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
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
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-violet-500 rounded-full mb-6">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-900">AI Smart Matching</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find your perfect match with our intelligent algorithm designed specifically for divorced singles. 
            We understand what matters when you're ready to love again.
          </p>
        </div>

        {/* What Makes It Smart */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-16">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-purple-100 p-4 rounded-full">
              <Zap className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h2 className="text-3xl mb-4 text-gray-900">What Makes Our AI Different?</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                Most dating apps use basic filters and location matching. Haply's AI goes deeper, understanding 
                the unique complexities of dating after divorce. We don't just match you with people nearby – 
                we match you with people who truly align with your values, lifestyle, and relationship goals.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                Our algorithm considers everything from co-parenting schedules to emotional readiness, from 
                communication styles to long-term compatibility. The result? Higher-quality matches that have 
                real potential for lasting love.
              </p>
            </div>
          </div>
        </div>

        {/* Key Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8 text-gray-900">Intelligent Matching Features</h2>
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

        {/* How It Works */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-4 text-gray-900">How AI Matching Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            From profile to perfect match, here's how our AI finds your ideal partner
          </p>
          
          <div className="space-y-8">
            {howItWorks.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-purple-500 to-violet-500 px-8 py-6 text-white">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full">
                        {step.step}
                      </div>
                      <Icon className="w-8 h-8" />
                      <div>
                        <h3 className="text-2xl">{step.title}</h3>
                        <p className="text-purple-100 mt-1">{step.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-8">
                    <ul className="space-y-3">
                      {step.details.map((detail, detailIdx) => (
                        <li key={detailIdx} className="flex items-start gap-3">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
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

        {/* Matching Factors */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-4 text-gray-900">What We Analyze</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our AI considers hundreds of data points across six key categories to find your best matches
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {matchingFactors.map((category, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                  <h3 className="text-lg text-gray-900">{category.category}</h3>
                </div>
                <ul className="space-y-2">
                  {category.factors.map((factor, factorIdx) => (
                    <li key={factorIdx} className="flex items-start gap-2 text-sm">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5 flex-shrink-0"></div>
                      <span className="text-gray-600">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Benefits */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="flex items-start gap-4 mb-6">
            <Sparkles className="w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-3xl mb-4">Unlock Premium Matching</h2>
              <p className="text-indigo-50 text-lg mb-6">
                Premium members get the most out of our AI matching with exclusive features:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Unlimited daily matches</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Advanced compatibility filters</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>See who likes you before matching</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Priority in match suggestions</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Detailed compatibility breakdowns</span>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                  <span>Boost your profile visibility</span>
                </div>
              </div>
              <button className="bg-white text-indigo-600 px-8 py-4 rounded-full hover:bg-indigo-50 transition-colors shadow-lg">
                Upgrade to Premium - $29.99/month
              </button>
            </div>
          </div>
        </div>

        {/* Success Stats */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 mb-16">
          <h2 className="text-3xl text-center mb-8 text-gray-900">Real Results</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl mb-2 bg-gradient-to-r from-purple-600 to-violet-600 bg-clip-text text-transparent">
                87%
              </div>
              <p className="text-gray-600">
                of users say their matches are highly compatible
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                3.2x
              </div>
              <p className="text-gray-600">
                more meaningful conversations than generic dating apps
              </p>
            </div>
            <div className="text-center">
              <div className="text-4xl mb-2 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                65%
              </div>
              <p className="text-gray-600">
                of members find a serious relationship within 6 months
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white text-center">
          <Heart className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl mb-4">Ready to Find Your Match?</h2>
          <p className="text-rose-50 text-lg mb-8 max-w-2xl mx-auto">
            Let our AI help you find someone who truly understands your journey and shares your vision for the future.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-rose-600 px-8 py-4 rounded-full hover:bg-rose-50 transition-colors shadow-lg">
              Get Started Free
            </button>
            <button className="bg-rose-600 border-2 border-white text-white px-8 py-4 rounded-full hover:bg-rose-700 transition-colors">
              See How It Works
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
