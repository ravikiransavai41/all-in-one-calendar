import * as React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, generateCalendarMonth, getEventsForDay, isCurrentMonth } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';
import { Link2 } from 'lucide-react';

interface CalendarMonthProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

const CalendarMonth: React.FC<CalendarMonthProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}) => {
  const days = generateCalendarMonth(currentDate);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b dark:border-gray-800">
        {dayNames.map((day) => (
          <div key={day} className="p-4 text-sm font-medium text-gray-600 dark:text-gray-400 text-center border-r dark:border-gray-800 last:border-r-0">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="flex-grow grid grid-cols-7 grid-rows-6">
        {days.map((day, index) => {
          const isCurrentMonthDay = isCurrentMonth(day, currentDate);
          const dayEvents = getEventsForDay(events, day);
          const isSelected = isSameDay(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-2 border-r border-b dark:border-gray-800 last:border-r-0",
                "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer",
                isCurrentMonthDay ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800/50",
                isTodayDate && "bg-blue-50 dark:bg-blue-900/20",
                isSelected && "ring-2 ring-blue-200 dark:ring-blue-500 ring-inset"
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex items-center h-6">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                    isTodayDate && "bg-blue-600 text-white font-medium",
                    !isTodayDate && !isCurrentMonthDay && "text-gray-400 dark:text-gray-600",
                    !isTodayDate && isCurrentMonthDay && "text-gray-900 dark:text-gray-300"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="mt-1 space-y-1">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs px-2 py-1 rounded",
                        "hover:opacity-90 cursor-pointer",
                        "flex items-center gap-1"
                      )}
                      style={getEventStyle(event)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <span className="truncate flex-1">
                        {format(new Date(event.start), 'HH:mm')} {event.title}
                      </span>
                      {event.isOnline && <Link2 className="h-3 w-3 flex-shrink-0" />}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-gray-400 dark:text-gray-600 pl-1">
                    No events
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarMonth;
