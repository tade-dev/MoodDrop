import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { SubscriptionProvider } from '@/contexts/SubscriptionContext';
import AppLayout from '@/components/AppLayout';
import Home from '@/pages/Home';
import CreateDrop from '@/pages/CreateDrop';
import Profile from '@/pages/Profile';
import Moods from '@/pages/Moods';
import MoodFeed from '@/pages/MoodFeed';
import Explore from '@/pages/Explore';
import GoPremium from '@/pages/GoPremium';
import PremiumSuccess from '@/pages/PremiumSuccess';
import Admin from '@/pages/Admin';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Index from '@/pages/Index';
import Playlists from '@/pages/Playlists';

function App() {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <AuthProvider>
        <SubscriptionProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/home" element={
                  <AppLayout>
                    <Home />
                  </AppLayout>
                } />
                <Route path="/create" element={
                  <AppLayout>
                    <CreateDrop />
                  </AppLayout>
                } />
                <Route path="/profile" element={
                  <AppLayout>
                    <Profile />
                  </AppLayout>
                } />
                <Route path="/moods" element={
                  <AppLayout>
                    <Moods />
                  </AppLayout>
                } />
                <Route path="/mood/:moodId" element={
                  <AppLayout>
                    <MoodFeed />
                  </AppLayout>
                } />
                <Route path="/explore" element={
                  <AppLayout>
                    <Explore />
                  </AppLayout>
                } />
                <Route path="/playlists" element={
                  <AppLayout>
                    <Playlists />
                  </AppLayout>
                } />
                <Route path="/go-premium" element={<GoPremium />} />
                <Route path="/premium-success" element={<PremiumSuccess />} />
                <Route path="/admin" element={
                  <AppLayout>
                    <Admin />
                  </AppLayout>
                } />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </Router>
        </SubscriptionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
