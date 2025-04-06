
import { useState, useEffect } from 'react';
import { CalendarEvent, generateMockEvents } from '@/utils/calendarUtils';
import { fetchMsCalendarEvents } from '@/utils/msGraphUtils';
import { useAuth } from '@/hooks/useAuth';
import { addMonths, subMonths } from 'date-fns';
import { toast } from 'sonner';

export const useCalendarEvents = (currentDate: Date) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { user } = useAuth();

  // Fetch Microsoft events when the component mounts or date changes
  useEffect(() => {
    fetchEvents();
  }, [currentDate, user?.microsoftAccount]);

  const fetchEvents = async () => {
    if (user?.microsoftAccount) {
      try {
        setIsLoading(true);
        // Calculate a date range of 6 months before and after the current date
        const startDate = subMonths(currentDate, 6);
        const endDate = addMonths(currentDate, 6);
        
        const msEvents = await fetchMsCalendarEvents(startDate, endDate);
        if (msEvents.length > 0) {
          console.log('Retrieved MS events:', msEvents);
          setEvents(msEvents);
          
          // Count Teams meetings
          const teamsMeetings = msEvents.filter(event => event.source === 'teams');
          console.log(`Found ${teamsMeetings.length} Teams meetings out of ${msEvents.length} total events`);
          
          toast.success(`Loaded ${msEvents.length} events from Microsoft (${teamsMeetings.length} Teams meetings)`);
        } else {
          // If no real events, use mock data temporarily
          console.log('No Microsoft events found, using mock data');
          setEvents(generateMockEvents(currentDate, 20));
          toast.info('No Microsoft events found for this time period. Showing mock data.');
        }
      } catch (error) {
        console.error('Error fetching Microsoft events:', error);
        toast.error('Failed to load Microsoft events. Showing mock data instead.');
        setEvents(generateMockEvents(currentDate, 20));
      } finally {
        setIsLoading(false);
      }
    } else {
      // For non-Microsoft users, just use mock data
      setEvents(generateMockEvents(currentDate, 20));
    }
  };

  const refreshEvents = async () => {
    if (user?.microsoftAccount) {
      try {
        setIsLoading(true);
        toast.info('Refreshing events from Microsoft...');
        
        const startDate = subMonths(currentDate, 6);
        const endDate = addMonths(currentDate, 6);
        
        const msEvents = await fetchMsCalendarEvents(startDate, endDate);
        if (msEvents.length > 0) {
          console.log('Refreshed MS events:', msEvents);
          setEvents(msEvents);
          
          // Count Teams meetings
          const teamsMeetings = msEvents.filter(event => event.source === 'teams');
          console.log(`Found ${teamsMeetings.length} Teams meetings out of ${msEvents.length} total events`);
          
          toast.success(`Refreshed ${msEvents.length} events from Microsoft (${teamsMeetings.length} Teams meetings)`);
        } else {
          toast.info('No Microsoft events found for this time period.');
        }
      } catch (error) {
        console.error('Error refreshing Microsoft events:', error);
        toast.error('Failed to refresh Microsoft events.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return {
    events,
    isLoading,
    fetchEvents,
    refreshEvents,
    setEvents
  };
};
