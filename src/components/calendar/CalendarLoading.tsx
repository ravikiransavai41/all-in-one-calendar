import React from 'react';
import { RefreshCw } from 'lucide-react';

interface CalendarLoadingProps {
  message?: string;
  count?: number;
}

const CalendarLoading: React.FC<CalendarLoadingProps> = ({ 
  message = 'Loading your calendar...', 
  count 
}) => {
  const [dots, setDots] = React.useState('');

  React.useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-calendar-primary mb-2" />
        <p className="text-lg font-medium">{message}{dots}</p>
        {count !== undefined && (
          <p className="text-sm text-muted-foreground mt-1">
            Found {count} events
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-4 max-w-[300px] text-center">
          First load might take a few seconds while we connect to Microsoft services
        </p>
      </div>
    </div>
  );
};

export default CalendarLoading;
