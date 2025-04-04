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
    <div className="h-full min-h-screen flex flex-col">
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-4 flex justify-between items-center shadow-lg backdrop-blur-md">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white hover:bg-white/20 mr-2 transition-all duration-300"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm animate-pulse">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-bold">All in One Calendar</h1>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm mr-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">{user?.email}</span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-white/20 flex items-center gap-1 transition-all duration-300"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden bg-gradient-to-br from-gray-50 to-blue-50">
        {showSidebar && (
          <div className={`${isMobile ? 'absolute z-10 h-full' : 'w-64'} transition-all duration-300 ease-in-out`}>
            <CalendarSidebar onToggleSource={handleToggleSource} />
          </div>
        )}
        
        <div className="flex-1 p-4 overflow-auto">
          <CalendarComponent />
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
