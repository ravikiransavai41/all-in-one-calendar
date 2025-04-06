import * as React from 'react';
import { format, isSameDay } from 'date-fns';
import { CalendarEvent, getEventsForDay } from '@/utils/calendarUtils';

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
  
  // Group events by hour
  const eventsByHour: { [hour: number]: CalendarEvent[] } = {};
  
  dayEvents.forEach(event => {
    const startHour = event.start.getHours();
    if (!eventsByHour[startHour]) {
      eventsByHour[startHour] = [];
    }
    eventsByHour[startHour].push(event);
  });

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-2xl font-bold">{format(currentDate, 'EEEE, MMMM d, yyyy')}</h2>
      </div>
      
      <div className="day-grid flex-grow overflow-auto">
        <div className="grid grid-cols-[60px_1fr]">
          {/* Time slots column */}
          <div className="border-r border-border">
            {timeSlots.map(hour => (
              <div key={hour} className="day-time-slot h-[60px] flex items-center justify-end pr-2 text-sm text-muted-foreground">
                {format(new Date().setHours(hour, 0), 'h a')}
              </div>
            ))}
          </div>
          
          {/* Events column */}
          <div className="relative">
            {timeSlots.map(hour => (
              <div key={hour} className="day-event-cell h-[60px] border-b border-border relative">
                {/* Empty cell for time slot */}
              </div>
            ))}
            
            {/* Events positioned absolutely */}
            {dayEvents.map(event => {
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
                  className="day-event absolute left-1 right-1 rounded-md p-1 text-xs overflow-hidden cursor-pointer"
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
        </div>
      </div>
    </div>
  );
};

export default CalendarDay;
