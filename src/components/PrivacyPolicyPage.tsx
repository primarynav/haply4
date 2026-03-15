import { ArrowLeft, Shield, Lock, Eye, Database, UserCheck, Bell, Globe } from 'lucide-react';

interface PrivacyPolicyPageProps {
  onBack: () => void;
}

export function PrivacyPolicyPage({ onBack }: PrivacyPolicyPageProps) {
  const sections = [
    {
      icon: Database,
      title: 'Information We Collect',
      content: [
        {
          subtitle: 'Information You Provide',
          text: 'When you create a Haply account, we collect information such as your name, email address, date of birth, gender, location, photos, and profile details. You may also provide information about your divorce status, children, preferences, and interests to help us match you with compatible partners.'
        },
        {
          subtitle: 'Automatically Collected Information',
          text: 'We automatically collect certain information when you use Haply, including device information, IP address, browser type, and usage data. This helps us improve our services and provide a better experience.'
        },
        {
          subtitle: 'Optional Verification Information',
          text: 'Premium members who choose to verify their divorce status may provide documentation that we securely process and then permanently delete after verification is complete.'
        }
      ]
    },
    {
      icon: Eye,
      title: 'How We Use Your Information',
      content: [
        {
          subtitle: 'Providing Our Services',
          text: 'We use your information to create and maintain your profile, suggest compatible matches using our AI matching algorithm, facilitate communication between members, and process your subscription payments.'
        },
        {
          subtitle: 'Improving Haply',
          text: 'Your usage data helps us understand how people use our platform, identify issues, develop new features, and improve our matching algorithms to provide better recommendations.'
        },
        {
          subtitle: 'Safety and Security',
          text: 'We analyze usage patterns to detect and prevent fraud, abuse, and other harmful activities. We may also use your information to enforce our Terms of Service and protect our community.'
        },
        {
          subtitle: 'Communications',
          text: 'We may send you service-related emails, notifications about matches and messages, and promotional communications (which you can opt out of at any time).'
        }
      ]
    },
    {
      icon: UserCheck,
      title: 'Information Sharing',
      content: [
        {
          subtitle: 'With Other Users',
          text: 'Your profile information, photos, and bio are visible to other Haply members. You control what information you include in your profile. Your exact location is never shared - only your general area.'
        },
        {
          subtitle: 'Service Providers',
          text: 'We work with trusted third-party service providers who help us operate Haply, such as payment processors, cloud storage providers, and analytics services. These providers are contractually required to protect your information.'
        },
        {
          subtitle: 'Legal Requirements',
          text: 'We may disclose your information if required by law, in response to legal requests, or to protect the rights, property, or safety of Haply, our users, or others.'
        },
        {
          subtitle: 'Business Transfers',
          text: 'If Haply is involved in a merger, acquisition, or sale of assets, your information may be transferred as part of that transaction.'
        },
        {
          subtitle: 'What We Don\'t Do',
          text: 'We never sell your personal information to third parties. We don\'t share your information with advertisers. Your messages and private conversations remain private.'
        }
      ]
    },
    {
      icon: Lock,
      title: 'Your Privacy Rights',
      content: [
        {
          subtitle: 'Access and Control',
          text: 'You can access, update, or delete your profile information at any time through your account settings. You can also request a copy of all the data we have about you.'
        },
        {
          subtitle: 'Communication Preferences',
          text: 'You can control what notifications you receive and opt out of promotional emails while still receiving important service-related communications.'
        },
        {
          subtitle: 'Account Deletion',
          text: 'You can delete your account at any time. When you delete your account, we remove your profile from Haply and delete your personal information, though we may retain certain information for legal or security purposes.'
        },
        {
          subtitle: 'Cookie Preferences',
          text: 'You can control cookie settings through your browser. Note that disabling certain cookies may affect your ability to use some features of Haply.'
        }
      ]
    },
    {
      icon: Shield,
      title: 'Data Security',
      content: [
        {
          subtitle: 'Protection Measures',
          text: 'We use industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. All sensitive data is encrypted both in transit and at rest.'
        },
        {
          subtitle: 'Access Controls',
          text: 'Access to your personal information is limited to employees and contractors who need it to provide our services. All personnel are bound by confidentiality obligations.'
        },
        {
          subtitle: 'Your Responsibility',
          text: 'Keep your password secure and don\'t share your account credentials. Report any suspicious activity or security concerns to our team immediately.'
        }
      ]
    },
    {
      icon: Globe,
      title: 'International Users',
      content: [
        {
          subtitle: 'Data Transfers',
          text: 'Haply is based in the United States. If you access our services from outside the US, your information may be transferred to, stored, and processed in the US or other countries where our service providers operate.'
        },
        {
          subtitle: 'GDPR Compliance',
          text: 'For users in the European Union, we comply with GDPR requirements. You have additional rights including data portability, the right to object to processing, and the right to lodge a complaint with a supervisory authority.'
        }
      ]
    },
    {
      icon: Bell,
      title: 'Children\'s Privacy',
      content: [
        {
          subtitle: 'Age Requirements',
          text: 'Haply is only available to individuals 18 years of age or older. We do not knowingly collect information from anyone under 18. If we become aware that a user is under 18, we will immediately delete their account and information.'
        }
      ]
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full mb-6">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl mb-4 text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600 mb-4">
            Last updated: October 15, 2025
          </p>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            At Haply, we take your privacy seriously. This policy explains how we collect, use, 
            and protect your personal information.
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
          <p className="text-gray-700 leading-relaxed">
            Welcome to Haply ("we," "us," or "our"). We understand that privacy is especially important 
            when it comes to online dating, and we're committed to being transparent about our practices. 
            This Privacy Policy explains what information we collect, how we use it, who we share it with, 
            and your rights regarding your personal data. By using Haply, you agree to the practices 
            described in this policy.
          </p>
        </div>

        {/* Privacy Sections */}
        <div className="space-y-8">
          {sections.map((section, idx) => {
            const Icon = section.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-8 py-6 text-white">
                  <div className="flex items-center gap-4">
                    <div className="bg-white/20 p-3 rounded-full">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl">{section.title}</h2>
                  </div>
                </div>
                
                <div className="p-8 space-y-6">
                  {section.content.map((item, itemIdx) => (
                    <div key={itemIdx}>
                      <h3 className="text-gray-900 mb-2">{item.subtitle}</h3>
                      <p className="text-gray-600 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Updates Notice */}
        <div className="mt-12 bg-blue-50 border-l-4 border-blue-400 p-6 rounded-r-xl">
          <h3 className="text-blue-900 mb-2">Policy Updates</h3>
          <p className="text-blue-800">
            We may update this Privacy Policy from time to time. If we make significant changes, 
            we'll notify you via email or through a prominent notice on our platform. Your continued 
            use of Happly after such changes constitutes acceptance of the updated policy.
          </p>
        </div>

        {/* Contact Section */}
        <div className="mt-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-8 text-white">
          <h2 className="text-2xl mb-3">Questions About Privacy?</h2>
          <p className="text-indigo-50 mb-6">
            If you have any questions about this Privacy Policy or how we handle your information, 
            please don't hesitate to contact us.
          </p>
          <div className="flex flex-wrap gap-4">
            <button className="bg-white text-indigo-600 px-8 py-3 rounded-full hover:bg-indigo-50 transition-colors">
              Contact Privacy Team
            </button>
            <button className="bg-indigo-600 border-2 border-white text-white px-8 py-3 rounded-full hover:bg-indigo-700 transition-colors">
              Download Policy (PDF)
            </button>
          </div>
          
          <div className="mt-8 pt-8 border-t border-indigo-400">
            <p className="text-sm text-indigo-100">
              <strong>Privacy Officer Contact:</strong><br />
              Email: privacy@haply.com<br />
              Address: Haply Inc., 123 Love Lane, San Francisco, CA 94102
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
