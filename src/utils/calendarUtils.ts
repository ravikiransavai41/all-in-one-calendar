
import { addDays, addMonths, format, getDay, getDaysInMonth, isSameDay, isSameMonth, parseISO, startOfMonth, subMonths } from 'date-fns';

// Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  isVirtual?: boolean;
  isRecurring?: boolean;
  recurringPattern?: string;
  attendees?: string[];
  attachments?: string[];
  color?: string;
  source?: 'teams' | 'outlook' | 'manual';
}

export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

// Mock data for initial development
export const generateMockEvents = (baseDate: Date, count: number): CalendarEvent[] => {
  const events: CalendarEvent[] = [];
  const startOfMonthDate = startOfMonth(baseDate);
  
  for (let i = 0; i < count; i++) {
    const eventDate = addDays(startOfMonthDate, Math.floor(Math.random() * getDaysInMonth(baseDate)));
    const startHour = 9 + Math.floor(Math.random() * 8); // Between 9 AM and 5 PM
    const durationHours = 1 + Math.floor(Math.random() * 3); // 1-3 hours
    
    const start = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      startHour,
      0,
      0
    );
    
    const end = new Date(
      eventDate.getFullYear(),
      eventDate.getMonth(),
      eventDate.getDate(),
      startHour + durationHours,
      0,
      0
    );
    
    const sources = ['teams', 'outlook', 'manual'] as const;
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    events.push({
      id: `event-${i}`,
      title: `Event ${i + 1}`,
      start,
      end,
      description: `Description for event ${i + 1}`,
      isVirtual: Math.random() > 0.5,
      source,
      color: source === 'teams' ? '#7b83eb' : source === 'outlook' ? '#71afe5' : '#3aa0f3',
    });
  }
  
  return events;
};

// Calendar generation utilities
export const generateCalendarMonth = (date: Date) => {
  const firstDayOfMonth = startOfMonth(date);
  const daysInMonth = getDaysInMonth(date);
  const startingDayOfWeek = getDay(firstDayOfMonth); // 0 = Sunday, 1 = Monday, etc.
  
  const calendarDays: Date[] = [];
  
  // Fill in days from previous month
  const previousMonth = subMonths(date, 1);
  const daysInPreviousMonth = getDaysInMonth(previousMonth);
  for (let i = startingDayOfWeek - 1; i >= 0; i--) {
    const day = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), daysInPreviousMonth - i);
    calendarDays.push(day);
  }
  
  // Fill in days from current month
  for (let i = 1; i <= daysInMonth; i++) {
    const day = new Date(date.getFullYear(), date.getMonth(), i);
    calendarDays.push(day);
  }
  
  // Fill in days from next month
  const totalDaysToShow = 42; // 6 rows of 7 days
  const remainingDays = totalDaysToShow - calendarDays.length;
  const nextMonth = addMonths(date, 1);
  for (let i = 1; i <= remainingDays; i++) {
    const day = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), i);
    calendarDays.push(day);
  }
  
  return calendarDays;
};

// Filter events for a specific day
export const getEventsForDay = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  return events.filter(event => isSameDay(parseISO(event.start.toString()), date));
};

// Generate week days
export const generateWeekDays = (date: Date): Date[] => {
  const days: Date[] = [];
  const dayOfWeek = getDay(date);
  
  // Get the start of the week (Sunday)
  const startDate = addDays(date, -dayOfWeek);
  
  // Generate 7 days starting from Sunday
  for (let i = 0; i < 7; i++) {
    days.push(addDays(startDate, i));
  }
  
  return days;
};

// Format date for display
export const formatEventTime = (date: Date): string => {
  return format(date, 'h:mm a');
};

// Check if a date is in the current month
export const isCurrentMonth = (date: Date, currentDate: Date): boolean => {
  return isSameMonth(date, currentDate);
};
