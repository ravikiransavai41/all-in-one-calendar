import { addDays, addMonths, format, getDay, getDaysInMonth, isSameDay, isSameMonth, parseISO, startOfMonth, subMonths, subDays } from 'date-fns';

// Types
export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  source: 'teams' | 'outlook' | 'google' | 'manual';
  color?: string;
  isAllDay?: boolean;
  attendees?: {
    name: string;
    email: string;
    response: 'accepted' | 'declined' | 'tentative' | 'none';
  }[];
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

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
    
    const sources = ['teams', 'outlook', 'google', 'manual'] as const;
    const source = sources[Math.floor(Math.random() * sources.length)];
    
    events.push({
      id: `event-${i}`,
      title: `Event ${i + 1}`,
      start,
      end,
      description: `Description for event ${i + 1}`,
      source,
      color: source === 'teams' ? '#7b83eb' : source === 'outlook' ? '#71afe5' : source === 'google' ? '#4285f4' : '#3aa0f3',
      isAllDay: Math.random() > 0.8, // 20% chance of being an all-day event
      attendees: Math.random() > 0.5 ? [
        { name: 'John Doe', email: 'john@example.com', response: 'accepted' },
        { name: 'Jane Smith', email: 'jane@example.com', response: 'tentative' }
      ] : undefined
    });
  }
  
  return events;
};

// Generate calendar days for a month
export const generateCalendarMonth = (date: Date): Date[] => {
  console.log('generateCalendarMonth - Input date:', date);
  
  // Ensure date is a Date object
  const currentDate = date instanceof Date ? date : new Date(date);
  
  // Get the first day of the month
  const firstDayOfMonth = startOfMonth(currentDate);
  console.log('generateCalendarMonth - First day of month:', firstDayOfMonth);
  
  // Get the number of days in the month
  const daysInMonth = getDaysInMonth(currentDate);
  console.log('generateCalendarMonth - Days in month:', daysInMonth);
  
  // Get the day of the week for the first day (0 = Sunday, 1 = Monday, etc.)
  const startingDay = getDay(firstDayOfMonth);
  console.log('generateCalendarMonth - Starting day:', startingDay);
  
  // Calculate the number of days to show from the previous month
  const daysFromPrevMonth = startingDay;
  
  // Calculate the total number of days to show (previous month + current month + next month)
  const totalDays = 42; // 6 rows * 7 days
  
  const calendarDays: Date[] = [];
  
  // Add days from the previous month
  for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
    calendarDays.push(subDays(firstDayOfMonth, i + 1));
  }
  
  // Add days from the current month
  for (let i = 0; i < daysInMonth; i++) {
    calendarDays.push(addDays(firstDayOfMonth, i));
  }
  
  // Add days from the next month
  const remainingDays = totalDays - calendarDays.length;
  for (let i = 1; i <= remainingDays; i++) {
    calendarDays.push(addDays(firstDayOfMonth, daysInMonth + i - 1));
  }
  
  console.log('generateCalendarMonth - Total calendar days:', calendarDays.length);
  console.log('generateCalendarMonth - First day:', calendarDays[0]);
  console.log('generateCalendarMonth - Last day:', calendarDays[calendarDays.length - 1]);
  
  return calendarDays;
};

// Filter events for a specific day
export const getEventsForDay = (events: CalendarEvent[], date: Date): CalendarEvent[] => {
  console.log('getEventsForDay - Filtering events for date:', date);
  console.log('getEventsForDay - Total events:', events.length);
  
  // Ensure date is a Date object
  const targetDate = date instanceof Date ? date : new Date(date);
  
  // Format the target date to YYYY-MM-DD for comparison
  const targetDateStr = format(targetDate, 'yyyy-MM-dd');
  
  const filteredEvents = events.filter(event => {
    // Ensure event.start is a Date object
    const eventStart = event.start instanceof Date ? event.start : new Date(event.start);
    
    // Format the event start date to YYYY-MM-DD for comparison
    const eventStartStr = format(eventStart, 'yyyy-MM-dd');
    
    // Compare the date strings
    const isSameDayEvent = eventStartStr === targetDateStr;
    
    console.log('getEventsForDay - Event:', event.title, 'Start:', eventStartStr, 'Target:', targetDateStr, 'Is same day:', isSameDayEvent);
    return isSameDayEvent;
  });
  
  console.log('getEventsForDay - Filtered events count:', filteredEvents.length);
  return filteredEvents;
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
