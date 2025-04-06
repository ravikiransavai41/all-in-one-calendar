
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, formatEventTime } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';

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
  // Generate hour slots (from 7am to 9pm)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);
  
  // Get all events for this day
  const dayEvents = events.filter(event => 
    isSameDay(new Date(event.start), currentDate)
  );

  return (
    <div className="flex flex-col h-full">
      {/* Day header */}
      <div className="border-b border-border p-2 text-center">
        <div className={cn(
          "inline-block px-4 py-1 rounded-full",
          isToday(currentDate) && "bg-calendar-primary text-white"
        )}>
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>
      
      {/* Time grid */}
      <div className="flex-grow overflow-y-auto">
        {hours.map((hour) => {
          const hourStart = new Date(currentDate);
          hourStart.setHours(hour, 0, 0, 0);
          
          const hourEnd = new Date(currentDate);
          hourEnd.setHours(hour + 1, 0, 0, 0);
          
          // Find events that start in this hour block
          const hourEvents = dayEvents.filter(event => {
            const eventStart = new Date(event.start);
            return eventStart.getHours() === hour;
          });
          
          return (
            <div key={hour} className="grid grid-cols-12 border-b border-border min-h-[80px]">
              <div className="col-span-1 p-1 text-xs text-right pr-2 border-r border-border">
                {format(new Date().setHours(hour, 0, 0), 'h a')}
              </div>
              
              <div className="col-span-11 p-1 relative">
                {hourEvents.map((event) => (
                  <div
                    key={event.id}
                    className="calendar-event mb-1 cursor-pointer"
                    style={{ backgroundColor: event.color }}
                    onClick={() => onEventClick(event)}
                  >
                    <div className="font-medium">{event.title}</div>
                    <div className="text-xs">
                      {formatEventTime(new Date(event.start))} - {formatEventTime(new Date(event.end))}
                    </div>
                    {event.location && (
                      <div className="text-xs truncate">
                        {event.isVirtual ? '🖥️ Virtual' : '📍'} {event.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarDay;
