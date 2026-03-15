import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Heart, X, MessageCircle, MapPin, Briefcase, GraduationCap, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface Profile {
  id: number;
  name: string;
  age: number;
  location: string;
  image: string;
  images?: string[];
  bio: string;
  divorceYear: number;
  interests: string[];
  occupation?: string;
  education?: string;
  height?: string;
  children?: string;
  lookingFor?: string;
}

interface ProfileDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile;
  isLiked: boolean;
  isMatched: boolean;
  onLike: () => void;
  onPass: () => void;
  onMessage: () => void;
}

export function ProfileDetailDialog({
  isOpen,
  onClose,
  profile,
  isLiked,
  isMatched,
  onLike,
  onPass,
  onMessage
}: ProfileDetailDialogProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [touchStartX, setTouchStartX] = useState(0);
  const [touchEndX, setTouchEndX] = useState(0);
  
  const allImages = profile.images || [profile.image];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStartX - touchEndX > 50) {
      // Swiped left - next image
      nextImage();
    }
    if (touchEndX - touchStartX > 50) {
      // Swiped right - previous image
      prevImage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-[98vw] h-[70vh] p-0 overflow-hidden">
        <DialogTitle className="sr-only">
          {profile.name}'s Profile
        </DialogTitle>
        <DialogDescription className="sr-only">
          View detailed profile information for {profile.name}, {profile.age} from {profile.location}
        </DialogDescription>
        <div className="grid md:grid-cols-2 h-full">
          {/* Left Side - Images */}
          <div 
            className="relative bg-gray-900 h-full"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <ImageWithFallback
              src={allImages[currentImageIndex]}
              alt={`${profile.name} - Photo ${currentImageIndex + 1}`}
              className="w-full h-full object-cover"
            />
            
            {/* Image navigation */}
            {allImages.length > 1 && (
              <>
                <div className="absolute top-1/2 left-2 transform -translate-y-1/2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-black/30 hover:bg-black/50 text-white rounded-full"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>
                </div>
                <div className="absolute top-1/2 right-2 transform -translate-y-1/2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="bg-black/30 hover:bg-black/50 text-white rounded-full"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>
                </div>
                
                {/* Image indicators */}
                <div className="absolute top-4 left-0 right-0 flex justify-center gap-1 px-4">
                  {allImages.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1 flex-1 rounded-full transition-all ${
                        index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}

            {/* Verified badge */}
            <div className="absolute bottom-4 left-4">
              <Badge className="bg-white/90 text-gray-900 border-none">
                <Check className="h-3 w-3 mr-1 text-green-600" />
                Verified Divorced
              </Badge>
            </div>
          </div>

          {/* Right Side - Details */}
          <div className="flex flex-col h-full overflow-hidden bg-white">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header */}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900">
                      {profile.name}, {profile.age}
                    </h2>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                  {isMatched && (
                    <Badge className="bg-rose-100 text-rose-700 border-rose-200">
                      <Heart className="h-3 w-3 mr-1 fill-current" />
                      Match
                    </Badge>
                  )}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {profile.occupation && (
                  <div className="flex items-start gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{profile.occupation}</span>
                  </div>
                )}
                {profile.education && (
                  <div className="flex items-start gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{profile.education}</span>
                  </div>
                )}
              </div>

              {/* Bio */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">About Me</h3>
                <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
              </div>

              {/* Additional Info */}
              <div className="space-y-3">
                <div className="flex justify-between text-sm border-b pb-2">
                  <span className="text-gray-600">Divorced</span>
                  <span className="font-medium text-gray-900">{profile.divorceYear}</span>
                </div>
                {profile.children && (
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-gray-600">Children</span>
                    <span className="font-medium text-gray-900">{profile.children}</span>
                  </div>
                )}
                {profile.height && (
                  <div className="flex justify-between text-sm border-b pb-2">
                    <span className="text-gray-600">Height</span>
                    <span className="font-medium text-gray-900">{profile.height}</span>
                  </div>
                )}
              </div>

              {/* Interests */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <Badge key={index} variant="secondary" className="bg-rose-50 text-rose-700 border-rose-200">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Looking For */}
              {profile.lookingFor && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Looking For</h3>
                  <p className="text-gray-700">{profile.lookingFor}</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="border-t bg-gray-50 p-4">
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-300 hover:bg-gray-100"
                  onClick={() => {
                    onPass();
                    onClose();
                  }}
                >
                  <X className="h-5 w-5 mr-2" />
                  Pass
                </Button>
                <Button
                  className={`flex-1 ${
                    isLiked
                      ? 'bg-rose-500 hover:bg-rose-600'
                      : 'bg-rose-500 hover:bg-rose-600'
                  }`}
                  onClick={() => {
                    onLike();
                    if (!isMatched) {
                      // Only close if not yet matched, so user can see match notification
                      setTimeout(onClose, 100);
                    }
                  }}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {isLiked ? 'Liked' : 'Like'}
                </Button>
                {isMatched && (
                  <Button
                    className="flex-1 bg-blue-500 hover:bg-blue-600"
                    onClick={() => {
                      onMessage();
                      onClose();
                    }}
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Message
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
