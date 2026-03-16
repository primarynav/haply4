import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Heart, Shield, Users, Sparkles, MessageCircle, Gift, Clock } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

const heroSlides = [
  {
    src: "/images/hero-1.jpg",
    alt: "Couple actively talking and making eye contact during a restaurant date",
    name: "Sarah & Mike",
    story: "Found love again after 2 months",
  },
  {
    src: "/images/hero-2.jpg",
    alt: "Mixed race couple facing each other and laughing together",
    name: "Lisa & James",
    story: "Found their second chance at love through Haply",
  },
  {
    src: "/images/hero-3.jpg",
    alt: "Romantic couple walking on the beach at sunset",
    name: "Karen & David",
    story: "Rediscovered love when they least expected it",
  },
];

interface HeroSectionProps {
  onGetStarted: () => void;
  onLearnMore?: () => void;
}

export function HeroSection({ onGetStarted, onLearnMore }: HeroSectionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="bg-gradient-to-br from-rose-50 to-pink-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-3">
            {/* AI Badge */}
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full">
              <Gift className="w-4 h-4" />
              <span className="text-sm font-semibold">100% FREE for a Limited Time!</span>
            </div>
            
            <div className="space-y-2">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                Find Love Again{' '}
                <span className="text-rose-600">After Divorce</span>
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Simply chat with our AI matchmaker about what you're looking for. No endless swiping—just natural 
                conversation that finds you truly compatible matches who understand your journey.
              </p>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <MessageCircle className="h-5 w-5 text-purple-600" />
                <span>AI-Powered Matching</span>
              </div>
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-rose-500" />
                <span>Verified Profiles</span>
              </div>
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-rose-500" />
                <span>Divorced Singles Only</span>
              </div>
              <div className="flex items-center space-x-2">
                <Heart className="h-5 w-5 text-rose-500" />
                <span>Meaningful Connections</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                size="lg" 
                className="bg-rose-600 hover:bg-rose-700 text-lg px-8 py-3 relative overflow-hidden"
                onClick={onGetStarted}
              >
                <span className="relative z-10">Join Free — Takes 2 Minutes</span>
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="text-lg px-8 py-3"
                onClick={onLearnMore}
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">25K+</div>
                <div className="text-sm text-gray-600">Active Members</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">1,200+</div>
                <div className="text-sm text-gray-600">Success Stories</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">96%</div>
                <div className="text-sm text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="relative">
            <div className="aspect-square rounded-2xl overflow-hidden shadow-2xl relative">
              {heroSlides.map((slide, index) => (
                <div
                  key={slide.name}
                  className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
                  style={{ opacity: index === currentSlide ? 1 : 0 }}
                >
                  <ImageWithFallback
                    src={slide.src}
                    alt={slide.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
              {/* Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.name}
                    onClick={() => setCurrentSlide(index)}
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-white scale-125 shadow-md'
                        : 'bg-white/50 hover:bg-white/75'
                    }`}
                    aria-label={`Show ${slide.name}'s story`}
                  />
                ))}
              </div>
            </div>
            
            {/* Floating Success Badge */}
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 border border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="transition-opacity duration-500">
                  <div className="text-sm font-semibold text-gray-900">{heroSlides[currentSlide].name}</div>
                  <div className="text-xs text-gray-600">{heroSlides[currentSlide].story}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}