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
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRateLimited, setIsRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [cachedMonths, setCachedMonths] = useState<Set<string>>(new Set());
  const { msAccount } = useMsAuth();
  const { user } = useAuth();

  const fetchEvents = useCallback(async (targetDate: Date = date, isAdjacentMonth: boolean = false) => {
    try {
      // Only show loading state on initial load
      if (initialLoad && !isAdjacentMonth) {
        setLoading(true);
      }
      
      setError(null);
      setIsRateLimited(false);
      setRetryAfter(null);

      // Calculate date range for just the target month
      const startDate = startOfMonth(targetDate);
      const endDate = endOfMonth(targetDate);
      
      // Check if we've already cached this month
      const monthKey = startDate.toISOString().slice(0, 7); // YYYY-MM format
      if (cachedMonths.has(monthKey)) {
        console.log('Using cached events for month:', monthKey);
        return;
      }

      // If not authenticated, show mock events immediately
      if (!msAccount) {
        console.log('User not authenticated with Microsoft, using mock events');
        const mockEvents = generateMockEvents(startDate, 5);
        setEvents(prev => [...prev, ...mockEvents]);
        setCachedMonths(prev => new Set(prev).add(monthKey));
        setInitialLoad(false);
        setLoading(false);
        if (!isAdjacentMonth) {
          toast.info('Using mock events (not connected to Microsoft)');
        }
        return;
      }

      try {
        const msEvents = await fetchMsCalendarEvents(startDate, endDate);
        
        if (msEvents && msEvents.length > 0) {
          setEvents(prev => [...prev, ...msEvents]);
          if (!isAdjacentMonth) {
            toast.success(`Loaded ${msEvents.length} events`);
          }
        }
        setCachedMonths(prev => new Set(prev).add(monthKey));
        setRetryCount(0);
      } catch (msError) {
        console.error('Error fetching Microsoft events:', msError);
        
        if (msError instanceof Error) {
          if (msError.message.includes('not authenticated') || 
              msError.message.includes('Access token not found') ||
              msError.message.includes('Authentication error')) {
            toast.error('Microsoft authentication error. Please sign in again.');
            setError('Microsoft authentication error. Please sign in again.');
            return;
          }
          
          if (msError.message.includes('Rate limit exceeded')) {
            setIsRateLimited(true);
            const waitTime = parseInt(msError.message.match(/\d+/)?.[0] || '60', 10);
            setRetryAfter(waitTime);
            setRetryCount(prev => prev + 1);
            
            if (retryCount < 2) {
              toast.warning(`Rate limit exceeded. Retrying in ${waitTime} seconds...`);
            } else {
              toast.error(`Rate limit exceeded. Please try again later.`);
            }
            
            // Show mock events as fallback after 3 retries
            if (retryCount >= 3) {
              const mockEvents = generateMockEvents(startDate, 5);
              setEvents(prev => [...prev, ...mockEvents]);
              setCachedMonths(prev => new Set(prev).add(monthKey));
              if (!isAdjacentMonth) {
                toast.info('Using mock events due to rate limiting');
              }
            }
          } else {
            setError(msError.message);
            if (!isAdjacentMonth) {
              toast.error(`Failed to load events: ${msError.message}`);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchEvents:', error);
      if (error instanceof Error) {
        setError(error.message);
        if (!isAdjacentMonth) {
          toast.error(`Failed to load events: ${error.message}`);
        }
      }
    } finally {
      setInitialLoad(false);
      setLoading(false);
    }
  }, [date, msAccount, retryCount, cachedMonths, initialLoad]);

  // Fetch current month immediately
  useEffect(() => {
    let isMounted = true;
    
    const loadEvents = async () => {
      if (!isMounted) return;
      await fetchEvents();
      
      // Wait a bit longer before loading adjacent months
      if (!isMounted) return;
      const prevMonth = subMonths(date, 1);
      await fetchEvents(prevMonth, true);
      
      if (!isMounted) return;
      const nextMonth = addMonths(date, 1);
      await fetchEvents(nextMonth, true);
    };

    loadEvents();
    
    return () => {
      isMounted = false;
    };
  }, [fetchEvents]);

  const refreshEvents = useCallback(async () => {
    setInitialLoad(true);
    setCachedMonths(new Set());
    setEvents([]);
    await fetchEvents();
  }, [fetchEvents]);

  return {
    events,
    loading: loading || initialLoad,
    error,
    isRateLimited,
    retryAfter,
    retryCount,
    refreshEvents,
  };
};

export default useCalendarEvents;
