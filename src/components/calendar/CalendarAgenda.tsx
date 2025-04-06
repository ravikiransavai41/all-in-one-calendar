
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, formatEventTime } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';

interface CalendarAgendaProps {
  currentDate: Date;
  events: CalendarEvent[];
  onEventClick: (event: CalendarEvent) => void;
  onDateClick: (date: Date) => void;
}

const CalendarAgenda: React.FC<CalendarAgendaProps> = ({
  currentDate,
  events,
  onEventClick,
  onDateClick,
}) => {
  // Group events by date
  const eventsByDate: Record<string, CalendarEvent[]> = {};
  
  events.forEach(event => {
    const dateStr = format(new Date(event.start), 'yyyy-MM-dd');
    if (!eventsByDate[dateStr]) {
      eventsByDate[dateStr] = [];
    }
    eventsByDate[dateStr].push(event);
  });
  
  // Sort dates
  const sortedDates = Object.keys(eventsByDate).sort();

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      {sortedDates.length === 0 ? (
        <div className="flex items-center justify-center h-full text-muted-foreground">
          No events to display
        </div>
      ) : (
        sortedDates.map(dateStr => {
          const date = new Date(dateStr);
          const isCurrentDay = isSameDay(date, currentDate);
          const isTodayDate = isToday(date);
          const dayEvents = eventsByDate[dateStr];
          
          return (
            <div key={dateStr} className="mb-4">
              <div 
                className={cn(
                  "p-2 sticky top-0 bg-white z-10 border-b border-border",
                  isCurrentDay && "bg-calendar-selected"
                )}
                onClick={() => onDateClick(date)}
              >
                <div className={cn(
                  "font-medium flex items-center gap-2 cursor-pointer",
                  isTodayDate && "text-calendar-primary"
                )}>
                  <span className={cn(
                    "inline-flex items-center justify-center w-8 h-8 rounded-full",
                    isTodayDate && "bg-calendar-primary text-white"
                  )}>
                    {format(date, 'd')}
                  </span>
                  <span>{format(date, 'EEEE, MMMM yyyy')}</span>
                </div>
              </div>
              
              <div className="divide-y divide-border">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className="p-3 hover:bg-muted cursor-pointer flex"
                    onClick={() => onEventClick(event)}
                  >
                    <div className="w-16 text-sm mr-4">
                      {formatEventTime(new Date(event.start))}
                    </div>
                    
                    <div className="flex-grow">
                      <div className="font-medium">{event.title}</div>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <span>{formatEventTime(new Date(event.start))} - {formatEventTime(new Date(event.end))}</span>
                        {event.source && (
                          <span className="ml-2 px-2 py-0.5 bg-muted text-xs rounded-full">
                            {event.source === 'teams' ? 'Teams' : 
                             event.source === 'outlook' ? 'Outlook' : 'Manual'}
                          </span>
                        )}
                      </div>
                      {event.location && (
                        <div className="text-sm text-muted-foreground">
                          {event.isVirtual ? '🖥️ Virtual' : '📍'} {event.location}
                        </div>
                      )}
                    </div>
                    
                    <div 
                      className="w-1 self-stretch rounded"
                      style={{ backgroundColor: event.color }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CalendarAgenda;
