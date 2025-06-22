import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Landing from './pages/Landing';
import Home from './pages/Home';
import Create from './pages/Create';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import MoodFeed from './pages/MoodFeed';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient } from 'react-query';
import AppLayout from './components/AppLayout';

function App() {
  return (
    <Router>
      <QueryClient>
        <AuthProvider>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Home />} />
              <Route path="/create" element={<Create />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/mood/:moodId" element={<MoodFeed />} />
            </Routes>
          </AppLayout>
          <Toaster />
        </AuthProvider>
      </QueryClient>
    </Router>
  );
}

export default App;
