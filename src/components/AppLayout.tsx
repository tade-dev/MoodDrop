
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { user } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();

  // Don't show sidebar on landing page or auth pages
  const showSidebar = user && location.pathname !== '/' && !location.pathname.includes('/auth');

  // Reset scroll position when route changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <AppSidebar />
        <SidebarInset className="flex-1 min-w-0">
          <div className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b border-white/10 bg-black/20 backdrop-blur-lg px-4">
            <SidebarTrigger className="text-white hover:bg-white/10" />
            <div className="h-4 w-px bg-white/20" />
            <h1 className="text-lg font-semibold text-white">MoodDrop</h1>
          </div>
          <main className="relative overflow-hidden">
            {/* Animated background elements - hidden on mobile for performance */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none hidden sm:block">
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
