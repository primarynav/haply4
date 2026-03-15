import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Heart, MessageCircle, Settings, User, X, Check, EyeOff, Crown, Sparkles } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { ProfileSettings } from './ProfileSettings';
import { ProfileSettingsComplete } from './ProfileSettingsComplete';
import { MessageDialog } from './MessageDialog';
import { ProfileDetailDialog } from './ProfileDetailDialog';
import { SubscriptionPage } from './SubscriptionPage';
import { AIConversationalMatch } from './AIConversationalMatch';
import { UsageTracker } from './UsageTracker';
import { OnboardingFlow } from './OnboardingFlow';
import { UpgradePrompt } from './UpgradePrompt';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { toast } from 'sonner';

interface UserDashboardProps {
  user: { name: string; email: string };
  onLogout: () => void;
  onCommunity: () => void;
}

interface SubscriptionStatus {
  status: 'free' | 'premium';
  isPremium: boolean;
}

interface Profile {
  id: number;
  name: string;
  age: number;
  gender: 'male' | 'female';
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

interface Message {
  id: number;
  text: string;
  senderId: string;
  timestamp: Date;
}

interface Conversation {
  matchId: number;
  messages: Message[];
}

// LAUNCH MODE: All features free, no usage limits
const LAUNCH_FREE_MODE = true;

export function UserDashboard({ user, onLogout, onCommunity }: UserDashboardProps) {
  const [activeTab, setActiveTab] = useState('discover');
  const [showSubscription, setShowSubscription] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>({ 
    status: 'free', 
    isPremium: false 
  });
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState<'time-limit' | 'messaging' | 'likes' | 'filters' | 'general'>('general');
  
  // User's gender preference (could be loaded from user settings)
  const [genderPreference, setGenderPreference] = useState<'male' | 'female' | 'both'>('female');

  // Mock data for potential matches
  const potentialMatches = [
    {
      id: 1,
      name: 'Emily',
      age: 42,
      gender: 'female' as const,
      location: 'Seattle, WA',
      image: 'https://images.unsplash.com/photo-1690444963408-9573a17a8058?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NjA1ODY3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      images: [
        'https://images.unsplash.com/photo-1690444963408-9573a17a8058?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBvcnRyYWl0JTIwc21pbGluZ3xlbnwxfHx8fDE3NjA1ODY3MzJ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1609086306691-c0ecf3d8598f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBoa2ltaW5n8ZW58MXx8fHwxNzYwNTg2NzMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHlvZ2ElMjBwcmFjdGljZXxlbnwxfHx8fDE3NjA1ODY3MzN8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1509042239860-f550ce710b93?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGNvZmZlZSUyMGNhZmV8ZW58MXx8fHwxNzYwNTg2NzMzfDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGxpZmVzdHlsZSUyMGhhcHB5fGVufDF8fHx8MTc2MDU4NjczM3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      ],
      bio: 'Divorced mom of two, yoga instructor, loves hiking and good coffee. Looking for genuine connection and someone who values mindfulness and outdoor adventures.',
      divorceYear: 2021,
      interests: ['Yoga', 'Hiking', 'Photography'],
      occupation: 'Yoga Instructor',
      education: 'Bachelor\'s in Health Sciences',
      height: '5\'6"',
      children: '2 (ages 8 and 10)',
      lookingFor: 'A genuine connection with someone who understands the journey of starting over and values family, wellness, and authentic communication.'
    },
    {
      id: 2,
      name: 'Michael',
      age: 38,
      gender: 'male' as const,
      location: 'Portland, OR',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjA1ODY3MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBwcm9mZXNzaW9uYWwlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjA1ODY3MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1551632811-561732d1e306?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBvdXRkb29yJTIwYWR2ZW50dXJlfGVufDF8fHx8MTc2MDU4NjczNHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1556910103-1c02745aae4d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBjb29raW5nJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NjA1ODY3MzR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBjYXN1YWwlMjBsaWZlc3R5bGV8ZW58MXx8fHwxNzYwNTg2NzM1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjB0ZWNobm9sb2d5JTIwd29ya2luZ3xlbnwxfHx8fDE3NjA1ODY3MzV8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      ],
      bio: 'Recently divorced dad, software engineer, enjoys cooking and weekend adventures. Ready for a fresh start with someone who appreciates good food and spontaneous road trips.',
      divorceYear: 2022,
      interests: ['Cooking', 'Technology', 'Travel'],
      occupation: 'Software Engineer',
      education: 'Master\'s in Computer Science',
      height: '6\'0"',
      children: '1 (age 6)',
      lookingFor: 'Looking for a partner who enjoys both cozy nights in and outdoor adventures. Someone who values family and isn\'t afraid of a little spontaneity.'
    },
    {
      id: 3,
      name: 'Sarah',
      age: 35,
      gender: 'female' as const,
      location: 'San Francisco, CA',
      image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGFydGlzdCUyMGNyZWF0aXZlfGVufDF8fHx8MTc2MDU4NjczNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      images: [
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGFydGlzdCUyMGNyZWF0aXZlfGVufDF8fHx8MTc2MDU4NjczNXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1554907984-15263bfd63bd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG11c2V1bSUyMGFydHxlbnwxfHx8fDE3NjA1ODY3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1577896851231-70ef18881754?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHRlYWNoaW5nJTIwY2xhc3Nyb29tfGVufDF8fHx8MTc2MDU4NjczNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1513364776144-60967b0f800f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMHBhaW50aW5nJTIwc3R1ZGlvfGVufDF8fHx8MTc2MDU4NjczNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMGNhc3VhbCUyMGZyaWVuZGx5fGVufDF8fHx8MTc2MDU4NjczNnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
      ],
      bio: 'Artist and teacher who believes in second chances. Love painting, museums, and weekend farmers markets. Looking for someone who appreciates creativity and meaningful conversations.',
      divorceYear: 2020,
      interests: ['Art', 'Teaching', 'Museums'],
      occupation: 'Art Teacher',
      education: 'MFA in Fine Arts',
      height: '5\'7"',
      children: 'No children',
      lookingFor: 'Seeking a partner who appreciates art, culture, and deep conversations. Someone who sees beauty in the everyday and isn\'t afraid to try new things.'
    },
    {
      id: 4,
      name: 'David',
      age: 44,
      gender: 'male' as const,
      location: 'Austin, TX',
      image: 'https://images.unsplash.com/photo-1622812947502-0a643f17387e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBzbWlsaW5nJTIwcG9ydHJhaXR8ZW58MXx8fHwxNzYwNDQ4MjA2fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      bio: 'Musician by night, accountant by day. Two kids who are my world. Looking for someone who gets it.',
      divorceYear: 2019,
      interests: ['Music', 'Parenting', 'Live Shows']
    },
    {
      id: 5,
      name: 'Jessica',
      age: 39,
      gender: 'female' as const,
      location: 'Denver, CO',
      image: 'https://images.unsplash.com/photo-1650484094047-bbbf2ca7c261?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3b21hbiUyMG91dGRvb3IlMjBwb3J0cmFpdHxlbnwxfHx8fDE3NjA0NDQ3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      bio: 'Nurse, adventurer, dog mom. Divorced and ready to write a new chapter filled with laughter and love.',
      divorceYear: 2021,
      interests: ['Healthcare', 'Dogs', 'Adventure']
    },
    {
      id: 6,
      name: 'James',
      age: 41,
      gender: 'male' as const,
      location: 'Chicago, IL',
      image: 'https://images.unsplash.com/photo-1638016329956-1127c6e4c96f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtYW4lMjBoYXBweSUyMHBvcnRyYWl0fGVufDF8fHx8MTc2MDQ3NDcwMHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
      bio: 'Chef and single dad who believes the best meals are shared. Looking for someone to create new memories with.',
      divorceYear: 2020,
      interests: ['Cooking', 'Wine', 'Family Time']
    }
  ];

  // State management
  const [allProfiles, setAllProfiles] = useState<Profile[]>(potentialMatches);
  const [likedProfiles, setLikedProfiles] = useState<number[]>([1, 3]); // Simulated: user has liked profiles 1 and 3
  const [hiddenProfiles, setHiddenProfiles] = useState<number[]>([]);
  const [mutualMatches, setMutualMatches] = useState<number[]>([1, 3]); // Simulated: profiles 1 and 3 liked back
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      matchId: 1,
      messages: [
        {
          id: 1,
          text: "Hey! Thanks for the match. How's your day going?",
          senderId: '1',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
          id: 2,
          text: "Hi! It's going great, thanks! Love your profile, you seem really interesting.",
          senderId: 'current-user',
          timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000)
        }
      ]
    },
    {
      matchId: 3,
      messages: [
        {
          id: 1,
          text: "Hi there! Your art sounds amazing. Would love to hear more about it!",
          senderId: 'current-user',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
          id: 2,
          text: "Thank you! I'd love to share. Do you have any creative hobbies?",
          senderId: '3',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        }
      ]
    }
  ]);
  const [selectedMatch, setSelectedMatch] = useState<Profile | null>(null);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [selectedProfileForDetail, setSelectedProfileForDetail] = useState<Profile | null>(null);
  const [isProfileDetailOpen, setIsProfileDetailOpen] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(0);

  // Filter profiles by gender preference and hidden status
  const visibleProfiles = allProfiles.filter(profile => {
    // Filter by gender preference
    if (genderPreference !== 'both' && profile.gender !== genderPreference) {
      return false;
    }
    // Filter out hidden profiles
    return !hiddenProfiles.includes(profile.id);
  });

  // Get mutual matches
  const matches = allProfiles.filter((profile) =>
    mutualMatches.includes(profile.id)
  );

  // Handle like action
  const handleLike = (profileId: number) => {
    if (!likedProfiles.includes(profileId)) {
      setLikedProfiles([...likedProfiles, profileId]);
      
      // Simulate 30% chance of mutual match
      if (Math.random() < 0.3) {
        setMutualMatches([...mutualMatches, profileId]);
        // Initialize empty conversation
        setConversations([
          ...conversations,
          { matchId: profileId, messages: [] }
        ]);
        // Show success feedback
        alert('🎉 It\'s a match! You can now message each other.');
      }
    }
  };

  // Handle pass/hide action
  const handlePass = (profileId: number) => {
    setHiddenProfiles([...hiddenProfiles, profileId]);
  };

  // Handle opening chat with a match
  const handleOpenChat = (match: Profile) => {
    if (mutualMatches.includes(match.id)) {
      setSelectedMatch(match);
      setIsMessageDialogOpen(true);
    } else {
      alert('You can only message people you\'ve matched with!');
    }
  };

  // Handle sending a message
  const handleSendMessage = (text: string) => {
    if (!selectedMatch) return;

    const newMessage: Message = {
      id: Date.now(),
      text,
      senderId: 'current-user',
      timestamp: new Date()
    };

    setConversations((prev) =>
      prev.map((conv) =>
        conv.matchId === selectedMatch.id
          ? { ...conv, messages: [...conv.messages, newMessage] }
          : conv
      )
    );
  };

  // Get messages for selected match
  const getMessagesForMatch = (matchId: number): Message[] => {
    const conversation = conversations.find((conv) => conv.matchId === matchId);
    return conversation ? conversation.messages : [];
  };

  // Get last message for a match
  const getLastMessage = (matchId: number) => {
    const messages = getMessagesForMatch(matchId);
    if (messages.length === 0) return 'Start a conversation';
    const lastMsg = messages[messages.length - 1];
    return lastMsg.text;
  };

  // Get last message time
  const getLastMessageTime = (matchId: number) => {
    const messages = getMessagesForMatch(matchId);
    if (messages.length === 0) return '';
    const lastMsg = messages[messages.length - 1];
    const now = new Date();
    const diff = now.getTime() - lastMsg.timestamp.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  // Handle opening profile detail
  const handleOpenProfileDetail = (profile: Profile) => {
    setSelectedProfileForDetail(profile);
    setIsProfileDetailOpen(true);
  };

  // Fetch subscription status on mount
  useEffect(() => {
    const fetchSubscriptionStatus = async () => {
      try {
        // SECURITY: Use authenticated session token instead of anon key
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token || publicAnonKey;
        
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/subscription/${encodeURIComponent(user.email)}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setSubscriptionStatus(data);
        }
      } catch (err) {
        console.error('Error fetching subscription status:', err);
      }
    };

    fetchSubscriptionStatus();
  }, [user.email]);

  // Check if user needs onboarding
  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem(`onboarding_${user.email}`);
    if (!hasSeenOnboarding) {
      // Show onboarding after a short delay so the dashboard loads first
      setTimeout(() => setShowOnboarding(true), 500);
    }
  }, [user.email]);

  // If showing subscription page, render it instead
  if (showSubscription) {
    return (
      <SubscriptionPage 
        user={user} 
        onBack={async () => {
          setShowSubscription(false);
          // Refresh subscription status when coming back
          try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token || publicAnonKey;
            const res = await fetch(
              `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/subscription/${encodeURIComponent(user.email)}`,
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );
            if (res.ok) {
              const data = await res.json();
              setSubscriptionStatus(data);
            }
          } catch (err) {
            console.error('Error refreshing subscription:', err);
          }
        }} 
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Heart className="h-8 w-8 text-rose-500" />
              <h1 className="text-xl font-bold">Haply</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Hello, {user.name}!</span>
              {LAUNCH_FREE_MODE ? (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  FREE Launch Access
                </Badge>
              ) : subscriptionStatus.isPremium ? (
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              ) : null}
              <button 
                onClick={onCommunity}
                className="text-gray-700 hover:text-rose-600 transition-colors"
              >
                Community
              </button>
              <button 
                onClick={() => setActiveTab('profile')}
                className="text-gray-700 hover:text-rose-600 transition-colors"
              >
                Profile
              </button>
              <button 
                onClick={() => setShowSubscription(true)}
                className="text-gray-700 hover:text-rose-600 transition-colors flex items-center gap-1"
              >
                {!subscriptionStatus.isPremium && <Crown className="w-4 h-4" />}
                Subscription
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className="text-gray-700 hover:text-rose-600 transition-colors"
              >
                Settings
              </button>
              <Button variant="outline" onClick={onLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-match" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              AI Match
            </TabsTrigger>
            <TabsTrigger value="discover">Discover</TabsTrigger>
            <TabsTrigger value="matches">Matches</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* AI Match Tab - Conversational Matching */}
          <TabsContent value="ai-match" className="p-0 -mt-8">
            <AIConversationalMatch 
              onBack={() => setActiveTab('discover')} 
              userEmail={user.email}
            />
          </TabsContent>

          {/* Discover Tab - TikTok Style Feed */}
          <TabsContent value="discover" className="p-0 -mt-8">
            <div className="h-[calc(100vh-8rem)] overflow-y-scroll snap-y snap-mandatory">
              {visibleProfiles.map((profile, index) => (
                <div key={profile.id} className="relative h-[calc(100vh-8rem)] snap-start flex-shrink-0">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 cursor-pointer"
                    onClick={() => handleOpenProfileDetail(profile)}
                  >
                    <ImageWithFallback
                      src={profile.image}
                      alt={profile.name}
                      className="w-full h-full object-cover"
                    />
                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
                    
                    {/* Tap to view hint */}
                    <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full">
                      Tap to view profile
                    </div>
                  </div>

                  {/* Match indicator */}
                  {mutualMatches.includes(profile.id) && (
                    <div className="absolute top-4 left-4 z-10">
                      <Badge className="bg-rose-500 text-white border-none">
                        <Heart className="h-3 w-3 mr-1 fill-current" />
                        Mutual Match
                      </Badge>
                    </div>
                  )}

                  {/* Action Buttons - Right Side */}
                  <div className="absolute right-4 bottom-24 flex flex-col space-y-4 z-10">
                    <Button
                      size="lg"
                      className={`w-14 h-14 rounded-full backdrop-blur-sm hover:bg-rose-500 border transition-all ${
                        likedProfiles.includes(profile.id)
                          ? 'bg-rose-500 border-rose-400'
                          : 'bg-white/20 border-white/30'
                      }`}
                      onClick={() => handleLike(profile.id)}
                      title="Like"
                    >
                      <Heart
                        className={`h-7 w-7 text-white ${
                          likedProfiles.includes(profile.id) ? 'fill-current' : ''
                        }`}
                      />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 border border-white/30"
                      onClick={() => handlePass(profile.id)}
                      title="Pass"
                    >
                      <X className="h-7 w-7 text-white" />
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className={`w-14 h-14 rounded-full backdrop-blur-sm border transition-all ${
                        mutualMatches.includes(profile.id)
                          ? 'bg-blue-500/80 hover:bg-blue-600 border-blue-400'
                          : 'bg-white/20 hover:bg-white/30 border-white/30'
                      }`}
                      onClick={() => handleOpenChat(profile)}
                      title={mutualMatches.includes(profile.id) ? 'Send Message' : 'Match first to message'}
                    >
                      <MessageCircle className="h-7 w-7 text-white" />
                    </Button>
                  </div>

                  {/* Profile Info - Bottom Left */}
                  <div className="absolute bottom-8 left-6 right-20 text-white z-10">
                    <h2 className="text-3xl font-bold mb-2">{profile.name}, {profile.age}</h2>
                    <p className="text-lg mb-3 opacity-90">{profile.location}</p>
                    
                    <div className="space-y-3">
                      <p className="text-base leading-relaxed max-w-sm">{profile.bio}</p>
                      
                      <div className="flex flex-wrap gap-2">
                        {profile.interests.map((interest, interestIndex) => (
                          <Badge 
                            key={interestIndex} 
                            className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                          >
                            {interest}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="text-sm opacity-90 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 w-fit border border-white/20">
                        <Check className="h-4 w-4 text-green-400 bg-green-500/20 rounded-full p-0.5" />
                        <span className="font-medium">Verified Divorced • {profile.divorceYear}</span>
                      </p>
                    </div>
                  </div>

                  {/* Swipe Indicator - Center Bottom */}
                  <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-white/60 text-xs flex items-center space-x-1">
                    <span>Scroll for more</span>
                    <div className="w-1 h-6 bg-white/40 rounded-full animate-pulse" />
                  </div>
                </div>
              ))}
              
              {/* End of feed message */}
              <div className="h-[calc(100vh-8rem)] snap-start flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-rose-50 to-blue-50">
                <div className="text-center p-8">
                  <Heart className="h-16 w-16 text-rose-400 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-800 mb-4">You've seen everyone for now!</h3>
                  <p className="text-gray-600 mb-6">Check back later for new potential matches.</p>
                  <Button 
                    onClick={() => {setCurrentMatchIndex(0); window.scrollTo(0, 0);}}
                    className="bg-rose-500 hover:bg-rose-600"
                  >
                    Start Over
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Matches Tab */}
          <TabsContent value="matches" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Matches ({matches.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No matches yet</p>
                    <p className="text-sm mt-2">Keep swiping to find your perfect match!</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {matches.map((match) => (
                      <Card
                        key={match.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleOpenChat(match)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage src={match.image} alt={match.name} />
                              <AvatarFallback>{match.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-semibold">{match.name}, {match.age}</h3>
                              <p className="text-sm text-gray-600">{match.location}</p>
                              <Badge variant="secondary" className="mt-2">
                                <Heart className="h-3 w-3 mr-1" />
                                Mutual Match
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {matches.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <MessageCircle className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg">No messages yet</p>
                    <p className="text-sm mt-2">Match with someone to start chatting!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="flex items-center space-x-4 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleOpenChat(match)}
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={match.image} alt={match.name} />
                          <AvatarFallback>{match.name[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{match.name}</h3>
                          <p className="text-sm text-gray-600 truncate">
                            {getLastMessage(match.id)}
                          </p>
                        </div>
                        <div className="text-xs text-gray-500 whitespace-nowrap">
                          {getLastMessageTime(match.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-6">
                  <Avatar className="h-24 w-24">
                    <AvatarFallback className="text-2xl">{user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-2xl font-bold">{user.name}</h3>
                    <p className="text-gray-600">{user.email}</p>
                    <Button 
                      variant="outline" 
                      className="mt-2"
                      onClick={() => setActiveTab('settings')}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">About Me</h4>
                    <p className="text-gray-700">
                      Recently divorced and ready to find love again. I believe in second chances and new beginnings. 
                      Looking for someone who understands the journey and is ready to build something beautiful together.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">My Interests</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">Reading</Badge>
                      <Badge variant="secondary">Travel</Badge>
                      <Badge variant="secondary">Cooking</Badge>
                      <Badge variant="secondary">Fitness</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <ProfileSettingsComplete 
              user={user} 
              onSave={(data) => console.log('Profile settings saved:', data)} 
            />
          </TabsContent>
        </Tabs>
      </div>

      {/* Message Dialog */}
      {selectedMatch && (
        <MessageDialog
          isOpen={isMessageDialogOpen}
          onClose={() => {
            setIsMessageDialogOpen(false);
            setSelectedMatch(null);
          }}
          match={selectedMatch}
          messages={getMessagesForMatch(selectedMatch.id)}
          onSendMessage={handleSendMessage}
          currentUserId="current-user"
        />
      )}

      {/* Profile Detail Dialog */}
      {selectedProfileForDetail && (
        <ProfileDetailDialog
          isOpen={isProfileDetailOpen}
          onClose={() => {
            setIsProfileDetailOpen(false);
            setSelectedProfileForDetail(null);
          }}
          profile={selectedProfileForDetail}
          isLiked={likedProfiles.includes(selectedProfileForDetail.id)}
          isMatched={mutualMatches.includes(selectedProfileForDetail.id)}
          onLike={() => handleLike(selectedProfileForDetail.id)}
          onPass={() => handlePass(selectedProfileForDetail.id)}
          onMessage={() => handleOpenChat(selectedProfileForDetail)}
        />
      )}

      {/* Usage Tracker - disabled during free launch */}
      {!LAUNCH_FREE_MODE && (
        <UsageTracker
          userEmail={user.email}
          isPremium={subscriptionStatus.isPremium}
          onUpgrade={() => setShowSubscription(true)}
          onLimitReached={() => {
            setUpgradeReason('time-limit');
            setShowUpgradePrompt(true);
            toast.error('Daily limit reached! Upgrade to Premium for unlimited access.');
          }}
        />
      )}

      {/* Onboarding Flow */}
      {showOnboarding && (
        <OnboardingFlow
          userName={user.name}
          onComplete={() => {
            setShowOnboarding(false);
            localStorage.setItem(`onboarding_${user.email}`, 'completed');
            // Direct users to profile settings to upload photos
            setActiveTab('settings');
            toast.success('Welcome to Haply! Complete your profile to start getting matches.');
          }}
          onUpgrade={() => setShowSubscription(true)}
        />
      )}

      {/* Upgrade Prompt - disabled during free launch */}
      {!LAUNCH_FREE_MODE && showUpgradePrompt && (
        <UpgradePrompt
          onClose={() => setShowUpgradePrompt(false)}
          onUpgrade={() => {
            setShowUpgradePrompt(false);
            setShowSubscription(true);
          }}
          reason={upgradeReason}
        />
      )}
    </div>
  );
}