import { useState } from 'react';
import { Button } from './ui/button';
import { Heart, Menu, X } from 'lucide-react';

interface HeaderProps {
  onAuthClick: (type: 'login' | 'signup') => void;
  onGetStarted?: () => void;
  user?: { name: string } | null;
  onLogout?: () => void;
  onLearnMore?: () => void;
  onCommunity?: () => void;
}

export function Header({ onAuthClick, onGetStarted, user, onLogout, onLearnMore, onCommunity }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <svg className="h-8 w-8 text-rose-500" viewBox="0 0 24 24" fill="none">
              <path d="M12 6c-2-4-8-2-8 2s8 10 8 10 8-6 8-10-6-6-8-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" fill="none"/>
              <path d="M6 20c0 0 3-1 6-1s6 1 6 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
            </svg>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Haply</h1>
              <p className="text-xs text-gray-500 -mt-1">Happily Ever After Again</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#home" className="text-gray-700 hover:text-rose-600 transition-colors">Home</a>
            <button 
              onClick={onLearnMore}
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              How it Works
            </button>
            <button 
              onClick={onCommunity}
              className="text-gray-700 hover:text-rose-600 transition-colors"
            >
              Community
            </button>
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Welcome, {user.name}!</span>
                <Button variant="outline" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onAuthClick('login')}>
                  Login
                </Button>
                <Button className="bg-rose-600 hover:bg-rose-700" onClick={onGetStarted}>
                  Sign Up for Free
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col space-y-4">
              <a href="#home" className="text-gray-700 hover:text-rose-600 transition-colors">Home</a>
              <button 
                onClick={onLearnMore}
                className="text-gray-700 hover:text-rose-600 transition-colors text-left"
              >
                How it Works
              </button>
              <button 
                onClick={onCommunity}
                className="text-gray-700 hover:text-rose-600 transition-colors text-left"
              >
                Community
              </button>
              {user ? (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <span className="text-gray-700">Welcome, {user.name}!</span>
                  <Button variant="outline" onClick={onLogout} className="w-full">
                    Logout
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-border">
                  <Button variant="ghost" onClick={() => onAuthClick('login')} className="w-full">
                    Login
                  </Button>
                  <Button className="bg-rose-600 hover:bg-rose-700 w-full" onClick={onGetStarted}>
                    Sign Up for Free
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}