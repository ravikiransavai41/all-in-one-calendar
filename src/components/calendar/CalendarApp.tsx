
import React, { useState } from 'react';
import Calendar from './Calendar';
import CalendarSidebar from './CalendarSidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const CalendarApp: React.FC = () => {
  const [showSidebar, setShowSidebar] = useState(true);
  const isMobile = useIsMobile();
  
  // If on mobile, hide sidebar by default
  React.useEffect(() => {
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

  return (
    <div className="h-full min-h-screen flex flex-col">
      <header className="bg-calendar-header text-white p-4 flex justify-between items-center">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar}
            className="text-white hover:bg-calendar-secondary mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Horizon Calendar</h1>
        </div>
        <div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-white hover:bg-calendar-secondary"
          >
            Sign In
          </Button>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {showSidebar && (
          <div className={`${isMobile ? 'absolute z-10 h-full' : 'w-64'}`}>
            <CalendarSidebar onToggleSource={handleToggleSource} />
          </div>
        )}
        
        <div className="flex-1 p-4 overflow-auto">
          <Calendar />
        </div>
      </div>
    </div>
  );
};

export default CalendarApp;
