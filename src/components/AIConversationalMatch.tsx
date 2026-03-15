import { projectId, publicAnonKey } from '../utils/supabase/info';
import { supabase } from '../utils/supabase/client';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, Sparkles, User, Bot, Heart, X, ChevronRight, MessageCircle, Loader2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Avatar } from './ui/avatar';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface MatchProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  bio: string;
  interests: string[];
  photos: string[];
  compatibilityScore: number;
  matchReasons: string[];
}

interface AIConversationalMatchProps {
  onBack: () => void;
  userEmail: string;
}

export function AIConversationalMatch({ onBack, userEmail }: AIConversationalMatchProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your personal matchmaking assistant. I'm here to help you find someone special who truly aligns with what you're looking for. Let's have a natural conversation about your ideal partner. What matters most to you in a relationship?",
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [matches, setMatches] = useState<MatchProfile[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const [conversationStarted, setConversationStarted] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setConversationStarted(true);

    try {
      // SECURITY: Use authenticated session token
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token || publicAnonKey;

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-2b484abd/ai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(m => ({
              role: m.role,
              content: m.content
            })),
            userEmail
          }),
        }
      );

      const data = await response.json();

      // Handle fallback mode (service temporarily unavailable)
      if (data.isFallback || !response.ok) {
        const fallbackMessage: Message = {
          role: 'assistant',
          content: data.fallbackMessage || "I apologize, but I'm having trouble connecting right now. Please try again in a moment, or browse profiles manually in the meantime.",
          timestamp: new Date()
        };
        setMessages(prev => [...prev, fallbackMessage]);
        
        // Log error details for debugging
        console.error('AI service error:', {
          status: response.status,
          error: data.error,
          details: data.details
        });
        
        return;
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If matches are returned, update the matches list
      if (data.matches && data.matches.length > 0) {
        setMatches(data.matches);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: "I apologize, but I'm experiencing technical difficulties. Please try browsing profiles manually in the Discover section, or try again in a few moments.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickStarters = [
    "I'm looking for someone who loves adventure and travel",
    "I want someone who understands co-parenting challenges",
    "Family values and stability are most important to me",
    "I'm seeking a partner who's emotionally mature and ready",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-pink-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back
            </button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              <span className="text-gray-900">AI Matchmaker</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Chat Section */}
          <div className="lg:col-span-2">
            <Card className="shadow-xl border-gray-200 overflow-hidden h-[calc(100vh-200px)] flex flex-col">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-purple-600 to-violet-600 px-6 py-4 text-white">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Bot className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl">Your AI Matchmaker</h2>
                    <p className="text-purple-100 text-sm">Powered by intelligent conversation</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6" ref={scrollAreaRef}>
                <div className="space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                    >
                      <Avatar className={`w-10 h-10 flex-shrink-0 ${message.role === 'user' ? 'bg-purple-600' : 'bg-gradient-to-br from-violet-500 to-purple-500'}`}>
                        {message.role === 'user' ? (
                          <User className="w-5 h-5 text-white m-auto" />
                        ) : (
                          <Bot className="w-5 h-5 text-white m-auto" />
                        )}
                      </Avatar>
                      <div
                        className={`flex-1 max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}
                      >
                        <div
                          className={`inline-block p-4 rounded-2xl ${
                            message.role === 'user'
                              ? 'bg-purple-600 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 px-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex gap-3">
                      <Avatar className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-500">
                        <Bot className="w-5 h-5 text-white m-auto" />
                      </Avatar>
                      <div className="bg-gray-100 p-4 rounded-2xl">
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Quick Starters (shown before conversation starts) */}
              {!conversationStarted && (
                <div className="px-6 pb-4">
                  <p className="text-sm text-gray-600 mb-3">Quick starters:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {quickStarters.map((starter, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setInputMessage(starter);
                        }}
                        className="text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 border border-purple-200 transition-colors text-sm text-gray-700"
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Describe what you're looking for..."
                    className="flex-1 bg-white"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isLoading}
                    className="bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send • Be specific about what matters to you
                </p>
              </div>
            </Card>
          </div>

          {/* Matches Section */}
          <div className="lg:col-span-1">
            <Card className="shadow-xl border-gray-200 p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-rose-500" />
                <h3 className="text-lg text-gray-900">Your Matches</h3>
              </div>

              {matches.length === 0 ? (
                <div className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 text-sm mb-2">No matches yet</p>
                  <p className="text-gray-500 text-xs">
                    Tell me what you're looking for and I'll find compatible matches for you!
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[calc(100vh-300px)]">
                  <div className="space-y-4">
                    {matches.map((match) => (
                      <div
                        key={match.id}
                        className="border border-gray-200 rounded-xl p-4 hover:border-purple-300 hover:shadow-md transition-all cursor-pointer"
                        onClick={() => setSelectedMatch(match)}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={match.photos[0]}
                            alt={match.name}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-gray-900 truncate">{match.name}</h4>
                              <Badge className="bg-purple-100 text-purple-700 text-xs">
                                {match.compatibilityScore}% match
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {match.age} • {match.location}
                            </p>
                            <p className="text-xs text-gray-700 line-clamp-2">
                              {match.bio}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {match.interests.slice(0, 3).map((interest, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {interest}
                            </Badge>
                          ))}
                        </div>
                        <button className="w-full mt-3 text-sm text-purple-600 hover:text-purple-700 flex items-center justify-center gap-1">
                          View Profile
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </Card>
          </div>
        </div>
      </div>

      {/* Match Detail Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSelectedMatch(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
            <div className="relative">
              <img
                src={selectedMatch.photos[0]}
                alt={selectedMatch.name}
                className="w-full h-64 object-cover"
              />
              <button
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/95 backdrop-blur-sm rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-2xl text-gray-900">{selectedMatch.name}</h2>
                      <p className="text-gray-600">{selectedMatch.age} • {selectedMatch.location}</p>
                    </div>
                    <Badge className="bg-purple-600 text-white">
                      {selectedMatch.compatibilityScore}% Match
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h3 className="text-lg text-gray-900 mb-2">About</h3>
                <p className="text-gray-700">{selectedMatch.bio}</p>
              </div>

              <div>
                <h3 className="text-lg text-gray-900 mb-3">Why You Match</h3>
                <div className="space-y-2">
                  {selectedMatch.matchReasons.map((reason, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <Heart className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700">{reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg text-gray-900 mb-3">Interests</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedMatch.interests.map((interest, idx) => (
                    <Badge key={idx} variant="outline">
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="flex-1 bg-purple-600 hover:bg-purple-700 text-white">
                  <Heart className="w-5 h-5 mr-2" />
                  Like
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Message
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}