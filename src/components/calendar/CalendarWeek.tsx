
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarEvent, formatEventTime, generateWeekDays, getEventsForDay } from '@/utils/calendarUtils';
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
  const weekDays = generateWeekDays(currentDate);
  
  // Generate hour slots (from 7am to 9pm)
  const hours = Array.from({ length: 15 }, (_, i) => i + 7);

  return (
    <div className="flex flex-col h-full">
      {/* Day headers */}
      <div className="grid grid-cols-8 border-b border-border">
        <div className="p-2 text-center border-r border-border"></div>
        {weekDays.map((day, index) => {
          const isCurrentDay = isSameDay(day, currentDate);
          const isTodayDate = isToday(day);
          
          return (
            <div
              key={index}
              className={cn(
                "p-2 text-center border-r border-border cursor-pointer",
                isCurrentDay && "bg-calendar-selected",
                isTodayDate && "font-bold"
              )}
              onClick={() => onDateClick(day)}
            >
              <div>{format(day, 'EEE')}</div>
              <div className={cn(
                "inline-flex items-center justify-center w-7 h-7 rounded-full",
                isTodayDate && "bg-calendar-primary text-white"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Time grid */}
      <div className="flex-grow overflow-y-auto">
        {hours.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-border min-h-[60px]">
            <div className="p-1 text-xs text-right pr-2 border-r border-border">
              {format(new Date().setHours(hour, 0, 0), 'h a')}
            </div>
            
            {weekDays.map((day, dayIndex) => {
              const hourStart = new Date(day);
              hourStart.setHours(hour, 0, 0, 0);
              
              const hourEnd = new Date(day);
              hourEnd.setHours(hour + 1, 0, 0, 0);
              
              // Find events that start in this hour block
              const hourEvents = events.filter(event => {
                const eventStart = new Date(event.start);
                return (
                  isSameDay(eventStart, day) && 
                  eventStart.getHours() === hour
                );
              });
              
              return (
                <div 
                  key={dayIndex} 
                  className={cn(
                    "p-1 border-r border-border relative",
                    isToday(day) && "bg-calendar-today bg-opacity-30"
                  )}
                >
                  {hourEvents.map((event) => (
                    <div
                      key={event.id}
                      className="calendar-event absolute inset-x-1"
                      style={{ backgroundColor: event.color }}
                      onClick={() => onEventClick(event)}
                    >
                      {formatEventTime(new Date(event.start))} - {event.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarWeek;
