
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, generateCalendarMonth, getEventsForDay, isCurrentMonth } from '@/utils/calendarUtils';
import { cn } from '@/lib/utils';

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
  
  // Day name headers
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="h-full flex flex-col">
      <div className="grid grid-cols-7 gap-1 py-2 border-b border-border">
        {dayNames.map((day) => (
          <div key={day} className="text-center font-medium text-sm">
            {day}
          </div>
        ))}
      </div>
      
      <div className="calendar-grid flex-grow">
        {days.map((day, index) => {
          const isCurrentMonthDay = isCurrentMonth(day, currentDate);
          const dayEvents = getEventsForDay(events, day);
          const isSelected = isSameDay(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={cn(
                "calendar-cell",
                isCurrentMonthDay ? "opacity-100" : "opacity-40",
                isTodayDate && "today",
                isSelected && "selected"
              )}
              onClick={() => onDateClick(day)}
            >
              <div className="flex justify-between items-start">
                <span
                  className={cn(
                    "inline-flex items-center justify-center w-6 h-6 text-sm rounded-full",
                    isTodayDate && "font-bold bg-calendar-primary text-white"
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
              
              <div className="mt-1 max-h-20 overflow-y-auto">
                {dayEvents.slice(0, 3).map((event) => (
                  <div
                    key={event.id}
                    className="calendar-event"
                    style={{ backgroundColor: event.color }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEventClick(event);
                    }}
                  >
                    {format(new Date(event.start), 'h:mm a')} - {event.title}
                  </div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-1">
                    + {dayEvents.length - 3} more
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
