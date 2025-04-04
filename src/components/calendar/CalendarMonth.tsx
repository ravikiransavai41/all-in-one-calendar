import * as React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, generateCalendarMonth, getEventsForDay, isCurrentMonth } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';
import { Video, MapPin } from 'lucide-react';

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
  
  // Debug logs
  console.log('CalendarMonth - Received events:', events);
  console.log('CalendarMonth - Current date:', currentDate);
  
  // Day name headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventColor = (event: CalendarEvent) => {
    if (event.source === 'teams') {
      return 'rgba(98, 100, 167, 0.85)'; // Microsoft Teams color with transparency
    } else if (event.source === 'outlook') {
      return 'rgba(0, 120, 212, 0.85)'; // Microsoft Outlook color with transparency
    } else if (event.source === 'google') {
      return 'rgba(66, 133, 244, 0.85)'; // Google Calendar color with transparency
    }
    return event.color || 'rgba(33, 150, 243, 0.85)';
  };

  return (
    <div className="h-full flex flex-col bg-transparent">
      {/* Day headers with fixed width to ensure alignment */}
      <div className="grid grid-cols-7 gap-1 py-3 border-b border-border/30 bg-white/30 backdrop-blur-md rounded-t-lg">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-sm text-gray-700">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid with fixed column widths */}
      <div className="calendar-grid flex-grow grid grid-cols-7 grid-rows-6 gap-1 p-1 bg-white/20 backdrop-blur-sm rounded-b-lg">
        {days.map((day, index) => {
          const isCurrentMonthDay = isCurrentMonth(day, currentDate);
          const dayEvents = getEventsForDay(events, day);
          const isSelected = isSameDay(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "calendar-cell p-2 min-h-[80px] border border-border/20 rounded-md bg-white/40 backdrop-blur-sm",
                "transition-all duration-300 ease-in-out hover:bg-white/60 hover:shadow-md",
                isCurrentMonthDay ? "opacity-100" : "opacity-40",
                isTodayDate && "bg-blue-50/80",
                isSelected && "bg-blue-100/80"
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                    "transition-all duration-300 ease-in-out",
                    isTodayDate && "font-bold bg-blue-600 text-white"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto">
                {dayEvents.length > 0 ? (
                  dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "calendar-event text-xs p-1 rounded cursor-pointer",
                        "hover:opacity-90 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-lg",
                        "animate-fadeIn"
                      )}
                      style={{ 
                        backgroundColor: getEventColor(event),
                        color: '#ffffff',
                        backdropFilter: 'blur(4px)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEventClick(event);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {event.source === 'teams' && (
                          <Video className="h-3 w-3" />
                        )}
                        <span className="truncate">
                          {format(new Date(event.start), 'h:mm a')} - {event.title}
                        </span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-1 text-[10px] mt-0.5">
                          <MapPin className="h-2 w-2" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-muted-foreground pl-1">
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
