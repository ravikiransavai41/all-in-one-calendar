import * as React from 'react';
import { format, addDays, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, generateWeekDays, getEventsForDay } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';

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
  
  // Debug logs
  console.log('CalendarWeek - Received events:', events);
  console.log('CalendarWeek - Current date:', currentDate);
  
  // Generate time slots (24 hours)
  const timeSlots = Array.from({ length: 24 }, (_, i) => i);
  
  // Get all events for the week
  const weekEvents = days.flatMap(day => getEventsForDay(events, day));

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-8 gap-1 py-2 border-b border-border">
        <div className="text-center font-medium text-sm"></div>
        {days.map((day, index) => (
          <div 
            key={index} 
            className={cn(
              "text-center font-medium text-sm cursor-pointer",
              isToday(day) && "text-blue-600 font-bold",
              isSameDay(day, currentDate) && "bg-blue-100 rounded"
            )}
            onClick={() => onDateClick(day)}
          >
            <div>{format(day, 'EEE')}</div>
            <div>{format(day, 'd')}</div>
          </div>
        ))}
      </div>
      
      <div className="week-grid flex-grow overflow-auto">
        <div className="grid grid-cols-[60px_repeat(7,1fr)]">
          {/* Time slots column */}
          <div className="border-r border-border">
            {timeSlots.map(hour => (
              <div key={hour} className="week-time-slot h-[60px] flex items-center justify-end pr-2 text-sm text-muted-foreground">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
            ))}
          </div>
          
          {/* Day columns */}
          {days.map((day, dayIndex) => (
            <div key={dayIndex} className="relative border-r border-border last:border-r-0">
              {/* Time slot cells */}
              {timeSlots.map(hour => (
                <div key={hour} className="week-day-cell h-[60px] border-b border-border relative">
                  {/* Empty cell for time slot */}
                </div>
              ))}
              
              {/* Events for this day */}
              {getEventsForDay(events, day).map(event => {
                const startHour = event.start.getHours();
                const startMinutes = event.start.getMinutes();
                const endHour = event.end.getHours();
                const endMinutes = event.end.getMinutes();
                
                // Calculate position and height
                const startPosition = startHour * 60 + startMinutes;
                const endPosition = endHour * 60 + endMinutes;
                const duration = endPosition - startPosition;
                
                // Ensure minimum height for visibility
                const height = Math.max(duration, 30);
                
                return (
                  <div
                    key={event.id}
                    className="week-event absolute left-1 right-1 rounded-md p-1 text-xs overflow-hidden cursor-pointer"
                    style={{ 
                      backgroundColor: event.color || '#2196f3',
                      color: '#ffffff',
                      top: `${startPosition}px`,
                      height: `${height}px`,
                      zIndex: 10
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    <div className="font-medium">{format(event.start, 'h:mm a')} - {event.title}</div>
                    {event.location && <div className="text-xs opacity-80">{event.location}</div>}
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
