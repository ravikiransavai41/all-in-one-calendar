import * as React from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, generateWeekDays, getEventsForDay } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';

interface CalendarWeekProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

const CalendarWeek: React.FC<CalendarWeekProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}) => {
  const days = generateWeekDays(currentDate);
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  const HOUR_HEIGHT = 60; // Height of each hour slot in pixels

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

  const calculateEventPosition = (event: CalendarEvent) => {
    const startHour = event.start.getHours();
    const startMinutes = event.start.getMinutes();
    const endHour = event.end.getHours();
    const endMinutes = event.end.getMinutes();
    
    // Calculate position from top (in pixels)
    const startInMinutes = (startHour * 60) + startMinutes;
    const endInMinutes = (endHour * 60) + endMinutes;
    
    // Convert minutes to pixels (1 hour = HOUR_HEIGHT pixels)
    const top = (startInMinutes * HOUR_HEIGHT) / 60;
    const height = Math.max(((endInMinutes - startInMinutes) * HOUR_HEIGHT) / 60, 30);
    
    return { top, height };
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900">
      {/* Fixed width grid for header and content alignment */}
      <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))] border-b dark:border-gray-800">
        {/* Empty cell for time column header */}
        <div className="p-4 text-sm font-medium text-gray-400 dark:text-gray-600 text-center border-r dark:border-gray-800"></div>
        {/* Day headers */}
        {days.map((day, index) => (
          <div 
            key={index} 
            className={cn(
              "p-4 text-center border-r dark:border-gray-800 last:border-r-0 cursor-pointer",
              isToday(day) && "bg-blue-50 dark:bg-blue-900/20",
              isSameDay(day, currentDate) && "ring-2 ring-blue-200 dark:ring-blue-500 ring-inset"
            )}
            onClick={() => onDateClick(day)}
          >
            <div className="text-sm font-medium text-gray-600 dark:text-gray-400">{format(day, 'EEE')}</div>
            <div className={cn(
              "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
              isToday(day) && "bg-blue-600 text-white font-medium",
              !isToday(day) && "text-gray-900 dark:text-gray-300"
            )}>
              {format(day, 'd')}
            </div>
          </div>
        ))}
      </div>
      
      <div className="flex-grow overflow-auto">
        <div className="grid grid-cols-[60px_repeat(7,minmax(0,1fr))]">
          {/* Time slots column */}
          <div className="border-r dark:border-gray-800">
            {timeSlots.map(hour => (
              <div key={hour} className="h-[60px] flex items-center justify-end pr-2 text-sm text-gray-500 dark:text-gray-400">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r dark:border-gray-800 last:border-r-0">
              {/* Time slot cells */}
              {timeSlots.map(hour => (
                <div key={hour} className="h-[60px] border-b dark:border-gray-800 relative hover:bg-gray-50 dark:hover:bg-gray-800/50">
                </div>
              ))}
              
              {/* Events for this day */}
              {getEventsForDay(events, day).map(event => {
                const { top, height } = calculateEventPosition(event);
                
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
                      top: `${top}px`,
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default CalendarWeek;
