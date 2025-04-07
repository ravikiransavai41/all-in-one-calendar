import * as React from 'react';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent, getEventsForDay } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';

interface CalendarDayProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
}

const CalendarDay: React.FC<CalendarDayProps> = ({
  currentDate,
  events,
  onEventClick,
}) => {
  // Debug logs
  console.log('CalendarDay - Received events:', events);
  console.log('CalendarDay - Current date:', currentDate);
  
  // Get events for the current day
  const dayEvents = getEventsForDay(events, currentDate);
  
  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  const getEventStyle = (event: CalendarEvent) => {
    // Default style for meetings/interviews
    const defaultStyle = {
      backgroundColor: '#5B5FC7',
      color: 'white',
      borderLeft: '3px solid #4548A8'
    };

    // Style for public holidays or special events
    if (event.title.toLowerCase().includes('holiday')) {
      return {
        backgroundColor: '#E8356D',
        color: 'white',
        borderLeft: '3px solid #C42A5C'
      };
    }

    return defaultStyle;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      <div className="border-b dark:border-gray-800 p-4">
        <div className={cn(
          "text-lg font-semibold",
          "flex items-center gap-2"
        )}>
          <span className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-full text-base",
            "bg-blue-600 text-white font-medium"
          )}>
            {format(currentDate, 'd')}
          </span>
          <span className="text-gray-900 dark:text-gray-100">
            {format(currentDate, 'EEEE, MMMM yyyy')}
          </span>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {/* Time slots column */}
          <div className="border-r dark:border-gray-800">
            {timeSlots.map(hour => (
              <div key={hour} className="h-[60px] flex items-center justify-end pr-2 text-sm text-gray-500 dark:text-gray-400">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
            ))}
          </div>
          
          {/* Events column */}
          <div className="relative">
            {timeSlots.map(hour => (
              <div key={hour} className="h-[60px] border-b dark:border-gray-800 relative hover:bg-gray-50 dark:hover:bg-gray-800/50">
              </div>
            ))}
            
            {/* Events positioned absolutely */}
            {dayEvents.map(event => {
              const startHour = event.start.getHours();
              const startMinutes = event.start.getMinutes();
              const endHour = event.end.getHours();
              const endMinutes = event.end.getMinutes();
              
              const startPosition = startHour * 60 + startMinutes;
              const endPosition = endHour * 60 + endMinutes;
              const duration = endPosition - startPosition;
              const height = Math.max(duration, 30);
              
              return (
                <div
                  key={event.id}
                  className={cn(
                    "absolute left-1 right-1 rounded px-2 py-1",
                    "text-xs overflow-hidden cursor-pointer",
                    "hover:opacity-90",
                    "flex items-center gap-1"
                  )}
                  style={{ 
                    ...getEventStyle(event),
                    top: `${startPosition}px`,
                    height: `${height}px`,
                    zIndex: 10
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEventClick(event);
                  }}
                >
                  <span className="truncate flex-1">
                    {format(event.start, 'HH:mm')} {event.title}
                  </span>
                  {event.isOnline && <Link2 className="h-3 w-3 flex-shrink-0" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarDay;
