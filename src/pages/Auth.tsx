
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    if (user) {
      navigate('/home');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast({
            title: "Error signing in",
            description: error.message,
            variant: "destructive"
          });
        } else {
          toast({
            title: "Welcome back!",
            description: "Successfully signed in to MoodDrop"
          });
          navigate('/home');
        }
      } else {
        const { error } = await signUp(email, password, username);
        if (error) {
          toast({
            title: "Error signing up",
            description: error.message,
            variant: "destructive"
          });
        } else {
          setEmailSent(true);
          toast({
            title: "Check your email!",
            description: "We've sent you a confirmation link to verify your account"
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
          
          {/* Floating Musical Notes */}
          <div className="absolute top-1/4 left-1/4 text-white/10 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>♪</div>
          <div className="absolute top-3/4 right-1/4 text-white/10 text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}>♫</div>
          <div className="absolute top-1/2 left-1/6 text-white/10 text-3xl animate-bounce" style={{ animationDelay: '3s', animationDuration: '5s' }}>♬</div>
        </div>

        <div className={`bg-black/30 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl text-center relative z-10 transition-all duration-700 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
          <div className="mb-6">
            <div className="text-8xl mb-6 animate-bounce">📧</div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 animate-pulse">
              Check Your Email
            </h1>
            <p className="text-gray-300 mb-4 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              We've sent a confirmation link to:
            </p>
            <p className="text-white font-semibold mb-6 animate-fade-in" style={{ animationDelay: '0.5s' }}>{email}</p>
            <p className="text-gray-400 text-sm mb-6 animate-fade-in" style={{ animationDelay: '0.7s' }}>
              Click the link in your email to verify your account and start sharing your musical vibes!
            </p>
          </div>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '0.9s' }}>
            <Button
              onClick={() => {
                setEmailSent(false);
                setIsLogin(true);
              }}
              variant="outline"
              className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 hover:scale-105 transition-all duration-300"
            >
              Back to Sign In
            </Button>
            
            <div className="text-center">
              <p className="text-gray-400 text-sm">
                Didn't receive the email? Check your spam folder or{' '}
                <button
                  onClick={() => {
                    setEmailSent(false);
                    toast({
                      title: "Try again",
                      description: "You can resend the confirmation email by signing up again"
                    });
                  }}
                  className="text-purple-400 hover:text-purple-300 underline transition-colors"
                >
                  try again
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-purple-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500/20 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        
        {/* Floating Musical Notes */}
        <div className="absolute top-1/4 left-1/4 text-white/10 text-4xl animate-bounce" style={{ animationDelay: '1s', animationDuration: '3s' }}>♪</div>
        <div className="absolute top-3/4 right-1/4 text-white/10 text-5xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '4s' }}>♫</div>
        <div className="absolute top-1/2 left-1/6 text-white/10 text-3xl animate-bounce" style={{ animationDelay: '3s', animationDuration: '5s' }}>♬</div>
        <div className="absolute bottom-1/4 right-1/6 text-white/10 text-4xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '6s' }}>🎵</div>
        
        {/* Background Waveform Animation */}
        <div className="absolute bottom-0 left-0 right-0 h-32 opacity-5">
          <div className="flex items-end justify-center h-full space-x-1">
            {[...Array(50)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-full animate-pulse"
                style={{
                  width: '4px',
                  height: `${Math.random() * 80 + 20}px`,
                  animationDelay: `${i * 0.1}s`,
                  animationDuration: `${Math.random() * 2 + 1}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className={`bg-black/30 backdrop-blur-xl rounded-3xl p-8 w-full max-w-md border border-white/20 shadow-2xl relative z-10 transition-all duration-700 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}>
        <div className="text-center mb-8">
          <h1 className={`text-5xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-4 transition-all duration-700 ${mounted ? 'animate-pulse' : ''}`}>
            MoodDrop
          </h1>
          <p className={`text-xl text-gray-300 mb-2 transition-all duration-700 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
            Drop the vibe. Feel the mood.
          </p>
          <p className={`text-gray-400 transition-all duration-700 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.5s' }}>
            Share your musical vibes
          </p>
        </div>

        {/* Auth Toggle */}
        <div className={`flex bg-white/10 rounded-2xl p-1 mb-8 transition-all duration-700 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.7s' }}>
          <button
            onClick={() => setIsLogin(true)}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              isLogin 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsLogin(false)}
            className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
              !isLogin 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white shadow-lg transform scale-105' 
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className={`transition-all duration-500 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '0.9s' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              placeholder="Enter your email"
              required
            />
          </div>

          {!isLogin && (
            <div className={`transition-all duration-500 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1.1s' }}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
                placeholder="Choose a username"
                required
              />
            </div>
          )}

          <div className={`transition-all duration-500 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1.3s' }}>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 hover:bg-white/15"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className={`w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:hover:scale-100 disabled:opacity-50 ${mounted ? 'animate-fade-in' : 'opacity-0'}`}
            style={{ animationDelay: '1.5s' }}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Loading...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Sign Up'
            )}
          </Button>
        </form>

        <div className={`text-center mt-8 transition-all duration-500 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1.7s' }}>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-purple-400 hover:text-purple-300 transition-colors duration-300 font-medium"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
