import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  ArrowLeft, 
  Heart, 
  MapPin,
  ArrowRight
} from 'lucide-react';

interface GetStartedPageProps {
  onBack: () => void;
  onContinue: (data: {
    gender: string;
    lookingFor: string;
    postalCode: string;
  }) => void;
}

export function GetStartedPage({ onBack, onContinue }: GetStartedPageProps) {
  const [gender, setGender] = useState<string>('');
  const [lookingFor, setLookingFor] = useState<string>('');
  const [postalCode, setPostalCode] = useState<string>('');
  const [errors, setErrors] = useState<{
    gender?: string;
    lookingFor?: string;
    postalCode?: string;
  }>({});

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!gender) {
      newErrors.gender = 'Please select your gender';
    }
    
    if (!lookingFor) {
      newErrors.lookingFor = 'Please select who you\'re looking for';
    }
    
    if (!postalCode) {
      newErrors.postalCode = 'Please enter your postal code';
    } else if (!/^[A-Za-z0-9\s-]{3,10}$/.test(postalCode)) {
      newErrors.postalCode = 'Please enter a valid postal code';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      onContinue({
        gender,
        lookingFor,
        postalCode: postalCode.toUpperCase().trim()
      });
    }
  };

  const genderOptions = [
    { value: 'woman', label: 'Woman' },
    { value: 'man', label: 'Man' }
  ];

  const lookingForOptions = [
    { value: 'woman', label: 'Women' },
    { value: 'man', label: 'Men' },
    { value: 'any', label: 'Any Gender' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-gray-600 hover:text-rose-600 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-start justify-center min-h-[calc(100vh-80px)] pt-8">
        <div className="w-full max-w-md px-4">
          <Card className="p-8 bg-white shadow-xl border-0">
            {/* Header */}
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="h-8 w-8 text-rose-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Start your journey
              </h1>
              <p className="text-gray-600">
                Find Divorcees in the USA
              </p>
            </div>



            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Gender Selection */}
              <div>
                <Label className="text-gray-900 mb-3 block">I am a divorced...</Label>
                <div className="grid grid-cols-2 gap-3">
                  {genderOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setGender(option.value);
                        setErrors(prev => ({ ...prev, gender: undefined }));
                      }}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        gender === option.value
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.gender && (
                  <p className="text-sm text-red-600 mt-1">{errors.gender}</p>
                )}
              </div>

              {/* Looking For Selection */}
              <div>
                <Label className="text-gray-900 mb-3 block">I'm looking for divorced...</Label>
                <div className="space-y-2">
                  {lookingForOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setLookingFor(option.value);
                        setErrors(prev => ({ ...prev, lookingFor: undefined }));
                      }}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        lookingFor === option.value
                          ? 'border-rose-600 bg-rose-50 text-rose-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {errors.lookingFor && (
                  <p className="text-sm text-red-600 mt-1">{errors.lookingFor}</p>
                )}
              </div>

              {/* Postal Code */}
              <div>
                <Label htmlFor="postalCode" className="text-gray-900 mb-2 block">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Your Postal Code</span>
                  </div>
                </Label>
                <Input
                  id="postalCode"
                  type="text"
                  placeholder="e.g., 90210 or M5V 3A8"
                  value={postalCode}
                  onChange={(e) => {
                    setPostalCode(e.target.value);
                    setErrors(prev => ({ ...prev, postalCode: undefined }));
                  }}
                  className={`w-full ${
                    errors.postalCode ? 'border-red-500' : ''
                  }`}
                />
                {errors.postalCode && (
                  <p className="text-sm text-red-600 mt-1">{errors.postalCode}</p>
                )}
                <p className="text-sm text-gray-500 mt-1">
                  We'll use this to find matches in your area
                </p>
              </div>

              {/* Continue Button */}
              <Button
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white py-3 text-lg"
              >
                <span>Continue</span>
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </form>

            {/* Privacy note */}
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-500">
                Your information is secure and will only be used to help you find compatible matches
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}