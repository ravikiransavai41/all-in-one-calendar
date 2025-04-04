
import React from 'react';
import { RefreshCw } from 'lucide-react';

interface CalendarLoadingProps {
  message?: string;
}

const CalendarLoading: React.FC<CalendarLoadingProps> = ({ message = 'Loading events from Microsoft...' }) => {
  return (
    <div className="h-full flex items-center justify-center">
      <div className="flex flex-col items-center">
        <RefreshCw className="h-8 w-8 animate-spin text-calendar-primary mb-2" />
        <p>{message}</p>
      </div>
    </div>
  );
};

export default CalendarLoading;
