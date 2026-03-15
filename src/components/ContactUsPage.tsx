import { ArrowLeft, Mail, MessageCircle, Phone, HelpCircle, Bug, Heart, Clock } from 'lucide-react';
import { useState } from 'react';

interface ContactUsPageProps {
  onBack: () => void;
}

export function ContactUsPage({ onBack }: ContactUsPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  });

  const contactMethods = [
    {
      icon: Mail,
      title: 'Email Support',
      description: 'Get help via email',
      detail: 'support@haply.com',
      color: 'from-blue-500 to-indigo-500'
    },
    {
      icon: MessageCircle,
      title: 'Live Chat',
      description: 'Chat with our team',
      detail: 'Available Mon-Fri, 9am-6pm EST',
      color: 'from-rose-500 to-pink-500'
    },
    {
      icon: Phone,
      title: 'Phone Support',
      description: 'Premium members only',
      detail: '1-800-HAPLY-1',
      color: 'from-purple-500 to-violet-500'
    }
  ];

  const categories = [
    { value: 'technical', label: 'Technical Issue', icon: Bug },
    { value: 'account', label: 'Account & Billing', icon: HelpCircle },
    { value: 'safety', label: 'Safety Concern', icon: Heart },
    { value: 'feedback', label: 'Feedback & Suggestions', icon: MessageCircle },
    { value: 'other', label: 'Other', icon: Mail }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
    alert('Thank you for contacting us! We\'ll get back to you within 24 hours.');
    setFormData({
      name: '',
      email: '',
      category: '',
      subject: '',
      message: ''
    });
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl mb-4 text-gray-900">Contact Us</h1>
          <p className="text-xl text-gray-600">
            We're here to help with whatever you need
          </p>
        </div>

        {/* Contact Methods */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {contactMethods.map((method, idx) => {
            const Icon = method.icon;
            return (
              <div key={idx} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`inline-flex p-4 rounded-full bg-gradient-to-r ${method.color} mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-gray-900 mb-2">{method.title}</h3>
                <p className="text-gray-600 text-sm mb-3">{method.description}</p>
                <p className="text-rose-600">{method.detail}</p>
              </div>
            );
          })}
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl mb-6 text-gray-900">Send us a Message</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-gray-700 mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="category" className="block text-gray-700 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="subject" className="block text-gray-700 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all"
                  required
                />
              </div>

              <div>
                <label htmlFor="message" className="block text-gray-700 mb-2">
                  Message
                </label>
                <textarea
                  id="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 outline-none transition-all resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-rose-500 to-pink-500 text-white py-4 rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl"
              >
                Send Message
              </button>
            </form>
          </div>

          {/* FAQ & Additional Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-8 border border-rose-100">
              <div className="flex items-start gap-3 mb-4">
                <Clock className="w-6 h-6 text-rose-600 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-gray-900 mb-2">Response Times</h3>
                  <p className="text-gray-600">
                    We typically respond to all inquiries within 24 hours during business days. 
                    Premium members receive priority support with faster response times.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-gray-900 mb-4">Quick Answers</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-rose-200 pl-4">
                  <h4 className="text-gray-900 mb-1">Before contacting support...</h4>
                  <p className="text-gray-600 text-sm">
                    Check our Help Center for instant answers to common questions about your account, 
                    matching, and features.
                  </p>
                </div>
                
                <div className="border-l-4 border-purple-200 pl-4">
                  <h4 className="text-gray-900 mb-1">Safety concerns?</h4>
                  <p className="text-gray-600 text-sm">
                    For urgent safety issues, use the "Report" button on any profile or message. 
                    Our safety team reviews reports immediately.
                  </p>
                </div>
                
                <div className="border-l-4 border-blue-200 pl-4">
                  <h4 className="text-gray-900 mb-1">Technical problems?</h4>
                  <p className="text-gray-600 text-sm">
                    Try clearing your browser cache or updating the app. Include device and browser 
                    details in your message for faster troubleshooting.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-8 text-white">
              <h3 className="text-xl mb-3">Community Support</h3>
              <p className="text-purple-50 mb-4">
                Connect with other Haply members in our community forums to share experiences, 
                advice, and support.
              </p>
              <button className="bg-white text-purple-600 px-6 py-2 rounded-full hover:bg-purple-50 transition-colors">
                Visit Forums
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
