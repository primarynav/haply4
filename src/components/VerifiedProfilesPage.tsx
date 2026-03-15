import { ArrowLeft, ShieldCheck, CheckCircle2, Lock, UserCheck, Award, Star, AlertCircle } from 'lucide-react';

interface VerifiedProfilesPageProps {
  onBack: () => void;
}

export function VerifiedProfilesPage({ onBack }: VerifiedProfilesPageProps) {
  const benefits = [
    {
      icon: ShieldCheck,
      title: 'Trust & Authenticity',
      description: 'Know that the people you\'re connecting with are who they say they are',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: UserCheck,
      title: 'Divorce Verification',
      description: 'Confirm that matches are actually divorced and ready for a new relationship',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Award,
      title: 'Premium Status',
      description: 'Stand out with a verified badge that shows you\'re a serious member',
      color: 'from-purple-500 to-violet-500'
    },
    {
      icon: Star,
      title: 'Better Matches',
      description: 'Connect with other verified members for higher quality connections',
      color: 'from-amber-500 to-orange-500'
    }
  ];

  const verificationSteps = [
    {
      step: 1,
      title: 'Upgrade to Premium',
      description: 'Verified profiles are available exclusively to Premium members ($29.99/month)',
      icon: Award
    },
    {
      step: 2,
      title: 'Submit Verification',
      description: 'Provide documentation of your divorce (decree, settlement agreement, or certificate)',
      icon: Lock
    },
    {
      step: 3,
      title: 'Quick Review',
      description: 'Our team reviews your submission within 24-48 hours with complete confidentiality',
      icon: UserCheck
    },
    {
      step: 4,
      title: 'Get Verified',
      description: 'Once approved, your profile displays the verified badge for all members to see',
      icon: ShieldCheck
    }
  ];

  const faqs = [
    {
      q: 'What documents are accepted for verification?',
      a: 'We accept divorce decrees, final divorce judgments, divorce certificates, or finalized settlement agreements. Documents must be official court documents or certified copies.'
    },
    {
      q: 'How long does verification take?',
      a: 'Most verifications are completed within 24-48 hours. During peak times, it may take up to 72 hours. You\'ll receive an email notification once your verification is approved.'
    },
    {
      q: 'Is my documentation kept private and secure?',
      a: 'Absolutely. We use bank-level encryption to protect your documents. Once verification is complete, we permanently delete your documents from our system. We only retain a record that you\'ve been verified.'
    },
    {
      q: 'Can I verify if my divorce is still being finalized?',
      a: 'We require that your divorce be legally finalized. If you\'re in the process of divorcing, you can still join Haply and update your verification status once the divorce is final.'
    },
    {
      q: 'Will other users see my divorce documents?',
      a: 'No, never. Your documents are only viewed by our verification team and are permanently deleted after verification. Other users only see a verification badge on your profile.'
    },
    {
      q: 'What if I don\'t want to verify?',
      a: 'Verification is completely optional. You can still use Haply without verification. However, many members prefer to match with verified users for added peace of mind.'
    },
    {
      q: 'Can I filter to only see verified profiles?',
      a: 'Yes! Premium members can use the verified filter to only view other verified members in their matches.'
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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full mb-6">
            <ShieldCheck className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-900">Verified Profiles</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build trust and find genuine connections with our verification system. 
            Verify your divorce status and connect with confidence.
          </p>
        </div>

        {/* What is Verification */}
        <div className="bg-white rounded-3xl p-8 md:p-12 shadow-lg border border-gray-100 mb-12">
          <div className="flex items-start gap-4 mb-6">
            <div className="bg-blue-100 p-4 rounded-full">
              <CheckCircle2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-3xl mb-4 text-gray-900">What is Profile Verification?</h2>
              <p className="text-gray-600 text-lg leading-relaxed mb-4">
                At Haply, we understand that trust is essential when you're ready to date again after divorce. 
                Our verification system allows Premium members to confirm their divorce status, giving you and 
                your matches peace of mind.
              </p>
              <p className="text-gray-600 text-lg leading-relaxed">
                When you see a <span className="inline-flex items-center gap-1 text-blue-600 font-semibold">
                  <ShieldCheck className="w-4 h-4" /> Verified
                </span> badge on a profile, you know that person has provided proof of their divorce 
                and has been authenticated by our team. It's one less thing to worry about as you start this new chapter.
              </p>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8 text-gray-900">Why Get Verified?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {benefits.map((benefit, idx) => {
              const Icon = benefit.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${benefit.color} mb-4`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl text-gray-900 mb-3">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Process */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-4 text-gray-900">How Verification Works</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Our verification process is simple, secure, and completely confidential
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {verificationSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="relative">
                  <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 h-full">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full text-white">
                        {step.step}
                      </div>
                      <Icon className="w-6 h-6 text-blue-600" />
                    </div>
                    <h3 className="text-lg text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                  {idx < verificationSteps.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 w-6 h-0.5 bg-gradient-to-r from-blue-300 to-transparent transform -translate-y-1/2" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Security & Privacy */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-3xl p-8 md:p-12 text-white mb-16">
          <div className="flex items-start gap-4 mb-6">
            <Lock className="w-10 h-10 flex-shrink-0" />
            <div>
              <h2 className="text-3xl mb-4">Your Privacy is Protected</h2>
              <div className="space-y-4 text-indigo-50">
                <p className="text-lg">
                  We take the security of your personal documents extremely seriously:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>All documents are encrypted using bank-level security during upload and storage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>Only authorized verification team members can access your documents</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>Documents are permanently deleted after verification is complete</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>We never share your documents with other users or third parties</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-1" />
                    <span>Your verification status is private - you choose whether to display your badge</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="mb-16">
          <h2 className="text-3xl text-center mb-8 text-gray-900">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-gray-900 mb-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  {faq.q}
                </h3>
                <p className="text-gray-600 pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-500 rounded-3xl p-8 md:p-12 text-white text-center">
          <ShieldCheck className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-3xl mb-4">Ready to Get Verified?</h2>
          <p className="text-rose-50 text-lg mb-8 max-w-2xl mx-auto">
            Join our community of verified members and start building meaningful connections 
            with confidence and trust.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <button className="bg-white text-rose-600 px-8 py-4 rounded-full hover:bg-rose-50 transition-colors shadow-lg">
              Upgrade to Premium
            </button>
            <button className="bg-rose-600 border-2 border-white text-white px-8 py-4 rounded-full hover:bg-rose-700 transition-colors">
              Learn More About Premium
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
