import * as React from 'react';
import { useState, useEffect } from 'react';
import CalendarComponent from './Calendar';
import CalendarSidebar from './CalendarSidebar';
import { Button } from '@/components/ui/button';
import { Menu, LogOut, Calendar as CalendarIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import SignIn from '@/components/auth/SignIn';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { cn } from '@/lib/utils';

const CalendarApp: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();
  const { user, isAuthenticated, logout } = useAuth();
  
  // If on mobile, hide sidebar by default
  useEffect(() => {
    if (isMobile) {
      setShowSidebar(false);
    } else {
      setShowSidebar(true);
    }
  }, [isMobile]);

  const toggleSidebar = () => {
    setShowSidebar(!showSidebar);
  };

  const handleToggleSource = (source: string, checked: boolean) => {
    // In the future, this will filter events based on source
    console.log(`Toggle ${source}: ${checked}`);
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
  };

  // If not authenticated, show the sign-in form
  if (!isAuthenticated) {
    return <SignIn />;
  }

  return (
    <div className="h-full min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <header className="border-b border-gray-200 dark:border-gray-800 px-4 py-2 flex justify-between items-center bg-white dark:bg-gray-900">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">All in One Calendar</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">{user?.email}</span>
            <Button 
              variant="ghost" 
              size="sm" 
              className="hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 flex items-center gap-1"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <div className={cn(
            isMobile ? 'absolute z-10 h-full' : 'w-60',
            'border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900'
          )}>
            <CalendarSidebar onToggleSource={handleToggleSource} />
          </div>
        )}
        
        <div className="flex-1 overflow-auto">
          <CalendarComponent />
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
