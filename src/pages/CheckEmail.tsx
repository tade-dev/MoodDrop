
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CheckEmail = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <Card className="w-full max-w-md bg-black/40 backdrop-blur-xl border-white/10 shadow-2xl">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Mail className="w-16 h-16 text-purple-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            Check Your Email
          </CardTitle>
          <CardDescription className="text-gray-300">
            We've sent you a confirmation link
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <p className="text-gray-300">
              Please check your email inbox and click the confirmation link to complete your account setup.
            </p>
            <p className="text-sm text-gray-400">
              Don't see the email? Check your spam folder or try signing up again.
            </p>
          </div>

          <Button 
            onClick={() => navigate('/auth')}
            variant="outline"
            className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckEmail;
