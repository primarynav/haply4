import { ArrowLeft, Heart, Quote } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SuccessStoriesPageProps {
  onBack: () => void;
}

export function SuccessStoriesPage({ onBack }: SuccessStoriesPageProps) {
  const stories = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1589144044802-567f743dd649?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMGNvdXBsZSUyMHN1bnNldHxlbnwxfHx8fDE3NjA0OTUxODF8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      names: 'Sarah & Michael',
      ages: '42 & 45',
      location: 'Portland, OR',
      story: "After my divorce, I thought my dating days were over. I had two teenagers and a demanding career - who would want to deal with all that? Then I met Michael on Haply. He understood because he'd been there too. We bonded over our shared experiences of co-parenting and starting over. Now, two years later, we're engaged and our blended family is thriving. Haply gave us both a second chance at happiness.",
      monthsTogether: 24,
      previouslyDivorced: 'Both divorced with kids',
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1758686253706-5d45c46112f0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYXR1cmUlMjBjb3VwbGUlMjBsYXVnaGluZ3xlbnwxfHx8fDE3NjA1ODM5ODJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      names: 'Jennifer & David',
      ages: '38 & 51',
      location: 'Austin, TX',
      story: "I was skeptical about online dating after my divorce. But Haply was different - everyone here gets it. There's no judgment, just understanding. David and I matched because we both valued honesty and were looking for something real, not just a rebound. The verified profiles gave me peace of mind, and the AI matching really understood what I was looking for. We've been married for six months now and couldn't be happier!",
      monthsTogether: 18,
      previouslyDivorced: 'Both divorced, Jennifer has 1 child',
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1719559981587-040e4614b4dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjB3YWxraW5nJTIwYmVhY2h8ZW58MXx8fHwxNzYwNTgzOTgyfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      names: 'Marcus & Elena',
      ages: '47 & 43',
      location: 'San Diego, CA',
      story: "My divorce was messy and left me with trust issues. I spent two years healing before I felt ready to date again. Elena was the first person I matched with on Haply, and I'm so glad I took that chance. She was patient with me as I learned to trust again, and I supported her through her own healing journey. We understood each other's baggage because we both had some. Today we're planning our wedding and merging our families. Love really can happen twice.",
      monthsTogether: 30,
      previouslyDivorced: 'Both divorced, Marcus has 3 kids, Elena has 2 kids',
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1748551419099-a4b01b092361?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyb21hbnRpYyUyMGNvdXBsZSUyMGNvZmZlZXxlbnwxfHx8fDE3NjA1ODM5ODN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      names: 'Rebecca & James',
      ages: '35 & 39',
      location: 'Denver, CO',
      story: "I joined Haply not expecting much - just hoping to meet some new people and maybe make friends who understood what divorce feels like. James sent me a thoughtful message about my profile, and we started chatting. Three months of daily conversations later, we finally met in person, and it was like coming home. We took things slow, introduced our kids gradually, and built a solid foundation. A year later, we're living together and our kids are best friends. Sometimes the best things come when you're not even looking.",
      monthsTogether: 15,
      previouslyDivorced: 'Both divorced with kids',
    },
  ];

  const stats = [
    { number: '15,000+', label: 'Success Stories' },
    { number: '78%', label: 'Find Meaningful Connection' },
    { number: '4.8/5', label: 'Average Happiness Rating' },
    { number: '6 months', label: 'Average Time to Match' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Heart className="w-16 h-16 text-rose-500 fill-current" />
          </div>
          <h1 className="text-5xl mb-4 text-gray-900">Success Stories</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real stories from real people who found love again after divorce. These couples prove that it's never too late for a happy ending - or rather, a beautiful new beginning.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl text-rose-600 mb-2">{stat.number}</div>
              <div className="text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Success Stories */}
        <div className="space-y-16">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden ${
                index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
              } flex flex-col md:flex`}
            >
              <div className="md:w-1/2">
                <ImageWithFallback
                  src={story.image}
                  alt={`${story.names} - Success Story`}
                  className="w-full h-full object-cover min-h-[400px]"
                />
              </div>
              <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
                <Quote className="w-10 h-10 text-rose-200 mb-4" />
                <p className="text-gray-700 text-lg mb-6 italic leading-relaxed">
                  "{story.story}"
                </p>
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-2xl text-gray-900 mb-2">{story.names}</h3>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <span>Ages {story.ages}</span>
                    <span>•</span>
                    <span>{story.location}</span>
                  </div>
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Heart className="w-4 h-4 mr-2 text-rose-500" />
                      Together for {story.monthsTogether} months
                    </div>
                    <div className="text-gray-500">
                      {story.previouslyDivorced}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl mb-4">Ready to Write Your Own Success Story?</h2>
          <p className="text-xl mb-8 text-rose-50">
            Join thousands of divorced singles who've found love, companionship, and happiness on Haply.
          </p>
          <button
            onClick={onBack}
            className="bg-white text-rose-600 px-8 py-4 rounded-full hover:bg-rose-50 transition-all transform hover:scale-105"
          >
            Start Your Journey Today
          </button>
        </div>

        {/* Testimonial Quote */}
        <div className="mt-16 text-center">
          <p className="text-gray-600 text-lg italic max-w-3xl mx-auto">
            "The best part about Haply is that everyone understands. We've all been through divorce, we all have baggage, and we're all looking for someone who gets it. There's no pretending to be perfect here - just real people looking for real love."
          </p>
          <p className="text-gray-500 mt-4">- Happy Haply Member</p>
        </div>
      </div>
    </div>
  );
}
