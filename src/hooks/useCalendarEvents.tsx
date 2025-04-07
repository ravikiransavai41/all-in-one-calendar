import { useState, useEffect, useCallback } from 'react';
import { CalendarEvent, generateMockEvents } from '@/utils/calendarUtils';
import { fetchMsCalendarEvents } from '@/utils/msGraphUtils';
import { useAuth } from '@/hooks/useAuth';
import { startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { toast } from 'sonner';
import { useMsAuth } from '@/hooks/useMsAuth';

// Change from named export to default export for Fast Refresh compatibility
const useCalendarEvents = (date: Date) => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { msAccount } = useMsAuth();
  const { user } = useAuth();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setIsRateLimited(false);
      setRetryAfter(null);

      // Calculate date range (2 months before and 2 months after the current date)
      const startDate = startOfMonth(subMonths(date, 2));
      const endDate = endOfMonth(addMonths(date, 2));

      console.log('Fetching events for date range:', {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      });

      // Check if user is authenticated with Microsoft
      if (!msAccount) {
        console.log('User not authenticated with Microsoft, using mock events');
        // Generate 10 mock events for the date range
        const mockEvents = generateMockEvents(startDate, 10);
        setEvents(mockEvents);
        toast.info('Using mock events (not connected to Microsoft)');
        setLoading(false);
        return;
      }

      try {
        const msEvents = await fetchMsCalendarEvents(startDate, endDate);
        
        if (msEvents && msEvents.length > 0) {
          console.log('Setting Microsoft events:', msEvents);
          setEvents(msEvents);
          toast.success(`Loaded ${msEvents.length} events`);
          setRetryCount(0); // Reset retry count on success
        } else {
          console.log('No Microsoft events found');
          setEvents([]);
          toast.info('No events found for the selected period');
          setRetryCount(0); // Reset retry count on success
        }
      } catch (msError) {
        console.error('Error fetching Microsoft events:', msError);
        
        if (msError instanceof Error) {
          // Check if it's an authentication error
          if (msError.message.includes('not authenticated') || 
              msError.message.includes('Access token not found') ||
              msError.message.includes('Authentication error')) {
            toast.error('Microsoft authentication error. Please sign in again.');
            setError('Microsoft authentication error. Please sign in again.');
            setEvents([]);
            setLoading(false);
            return;
          }
          
          // Check if it's a rate limit error
          if (msError.message.includes('Rate limit exceeded')) {
            setIsRateLimited(true);
            const waitTime = parseInt(msError.message.match(/\d+/)?.[0] || '60', 10);
            setRetryAfter(waitTime);
            setRetryCount(prev => prev + 1);
            
            // Show different messages based on retry count
            if (retryCount < 2) {
              toast.warning(`Rate limit exceeded. Retrying in ${waitTime} seconds...`);
            } else {
              toast.error(`Rate limit exceeded. Please try again later.`);
            }
            
            // If we've retried too many times, use mock events as fallback
            if (retryCount >= 3) {
              console.log('Too many retries, using mock events as fallback');
              const mockEvents = generateMockEvents(startDate, 10);
              setEvents(mockEvents);
              toast.info('Using mock events due to rate limiting');
              setLoading(false);
              return;
            }
          } else {
            setError(msError.message);
            toast.error(`Failed to load events: ${msError.message}`);
          }
        } else {
          setError('An unknown error occurred');
          toast.error('Failed to load events');
        }
        
        setEvents([]);
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      
      if (error instanceof Error) {
        setError(error.message);
        toast.error(`Failed to load events: ${error.message}`);
      } else {
        setError('An unknown error occurred');
        toast.error('Failed to load events');
      }
      
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [date, msAccount, retryCount]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const refreshEvents = useCallback(async () => {
    await fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading,
    error,
    isRateLimited,
    retryAfter,
    retryCount,
    refreshEvents,
  };
};

export default useCalendarEvents;
