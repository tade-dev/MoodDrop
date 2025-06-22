import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import Landing from './pages/Landing';
import Home from './pages/Home';
import CreateDrop from './pages/CreateDrop';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import MoodFeed from './pages/MoodFeed';
import Explore from './pages/Explore';
import Admin from './pages/Admin';
import GoPremium from './pages/GoPremium';
import PremiumSuccess from './pages/PremiumSuccess';
import { Toaster } from '@/components/ui/toaster';
import AppLayout from './components/AppLayout';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <AppLayout>
              <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/home" element={<Home />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/create" element={<CreateDrop />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/mood/:moodId" element={<MoodFeed />} />
                <Route path="/go-premium" element={<GoPremium />} />
                <Route path="/premium-success" element={<PremiumSuccess />} />
              </Routes>
            </AppLayout>
            <Toaster />
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
