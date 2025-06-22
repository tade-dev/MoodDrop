
import React from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();

  // Don't show sidebar on landing page or auth pages
  const showSidebar = user && location.pathname !== '/' && !location.pathname.includes('/auth');

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <main className="relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-10 left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-float" />
              <div className="absolute top-40 right-20 w-24 h-24 bg-pink-500/20 rounded-full blur-2xl animate-float-delayed" />
              <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl animate-float-slow" />
            </div>
            <div className="relative z-10">
              {children}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
