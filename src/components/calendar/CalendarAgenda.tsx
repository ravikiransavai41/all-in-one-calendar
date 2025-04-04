import React from 'react';
import { format, isSameDay, startOfDay, endOfDay } from 'date-fns';
import { CalendarEvent, getEventsForDay } from '@/utils/calendarUtils';
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
  // Debug logs
  console.log('CalendarAgenda - Received events:', events);
  console.log('CalendarAgenda - Current date:', currentDate);
  
  // Get events for the next 7 days
  const days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + i);
    return date;
  });
  
  // Group events by day
  const eventsByDay = days.map(date => ({
    date,
    events: getEventsForDay(events, date).sort((a, b) => a.start.getTime() - b.start.getTime())
  }));

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border">
        <h2 className="text-2xl font-bold">Agenda</h2>
      </div>
      
      <div className="agenda-list flex-grow overflow-y-auto">
        {eventsByDay.map(({ date, events }) => (
          <div key={date.toISOString()} className="agenda-day">
            <div className="agenda-day-header">
              {format(date, 'EEEE, MMMM d, yyyy')}
            </div>
            
            {events.length === 0 ? (
              <div className="text-muted-foreground text-sm p-2">No events</div>
            ) : (
              events.map(event => (
                <div
                  key={event.id}
                  className="agenda-event"
                  style={{ 
                    backgroundColor: event.color || '#2196f3',
                    color: '#ffffff'
                  }}
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm">
                    {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                  </div>
                  {event.location && (
                    <div className="text-sm truncate">
                      📍 {event.location}
                    </div>
                  )}
                  <div className="text-xs mt-1">
                    Source: {event.source}
                  </div>
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarAgenda;
