
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface CalendarLoadingProps {
  message?: string;
  count?: number;
}

const CalendarLoading: React.FC<CalendarLoadingProps> = ({ 
  message = 'Loading events from Microsoft...', 
  count 
}) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-calendar-primary mb-2" />
        <p>{message}</p>
        {count !== undefined && (
          <p className="text-sm text-muted-foreground mt-1">
            Found {count} events so far...
          </p>
        )}
      </div>
    </div>
  );
};

export default CalendarLoading;
