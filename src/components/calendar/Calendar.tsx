
import React, { useState, useEffect } from 'react';
import { CalendarEvent, CalendarView, generateMockEvents } from '@/utils/calendarUtils';
import CalendarHeader from './CalendarHeader';
import CalendarMonth from './CalendarMonth';
import CalendarWeek from './CalendarWeek';
import CalendarDay from './CalendarDay';
import CalendarAgenda from './CalendarAgenda';
import EventDialog from './EventDialog';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { fetchMsCalendarEvents } from '@/utils/msGraphUtils';
import { useAuth } from '@/hooks/useAuth';
import { addMonths, subMonths } from 'date-fns';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);
  const { user } = useAuth();

  // Fetch Microsoft events when the component mounts or date changes
  useEffect(() => {
    const fetchEvents = async () => {
      if (user?.microsoftAccount) {
        try {
          setIsLoading(true);
          // Calculate a date range of 6 months before and after the current date
          const startDate = subMonths(currentDate, 6);
          const endDate = addMonths(currentDate, 6);
          
          const msEvents = await fetchMsCalendarEvents(startDate, endDate);
          if (msEvents.length > 0) {
            setEvents(msEvents);
            toast.success(`Loaded ${msEvents.length} events from Microsoft`);
          } else {
            // If no real events, use mock data temporarily
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

    fetchEvents();
  }, [currentDate, user?.microsoftAccount]);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const handleCloseEventDialog = () => {
    setIsEventDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    // For now, just close the dialog and show a toast
    toast.info('Event editing will be implemented in a future update');
    setIsEventDialogOpen(false);
  };

  const handleDeleteEvent = (event: CalendarEvent) => {
    // Remove the event
    setEvents(events.filter(e => e.id !== event.id));
    toast.success('Event deleted successfully');
  };

  const handleCreateEvent = () => {
    // For now, just show a toast
    toast.info('Event creation will be implemented in a future update');
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
          setEvents(msEvents);
          toast.success(`Refreshed ${msEvents.length} events from Microsoft`);
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

  return (
    <div className="flex flex-col h-full border border-border rounded-md overflow-hidden bg-white">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
      />

      <div className="p-2 border-b border-border flex justify-between">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshEvents} 
          disabled={isLoading || !user?.microsoftAccount}
          className="flex items-center gap-1"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
        
        <Button onClick={handleCreateEvent} className="bg-calendar-primary hover:bg-calendar-secondary">
          <Plus className="mr-1 h-4 w-4" /> New Event
        </Button>
      </div>

      <div className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <div className="flex flex-col items-center">
              <RefreshCw className="h-8 w-8 animate-spin text-calendar-primary mb-2" />
              <p>Loading events from Microsoft...</p>
            </div>
          </div>
        ) : (
          <>
            {view === 'month' && (
              <CalendarMonth
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
                onDateClick={handleDateChange}
              />
            )}
            {view === 'week' && (
              <CalendarWeek
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
                onDateClick={handleDateChange}
              />
            )}
            {view === 'day' && (
              <CalendarDay
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
              />
            )}
            {view === 'agenda' && (
              <CalendarAgenda
                currentDate={currentDate}
                events={events}
                onEventClick={handleEventClick}
                onDateClick={handleDateChange}
              />
            )}
          </>
        )}
      </div>

      <EventDialog
        event={selectedEvent}
        isOpen={isEventDialogOpen}
        onClose={handleCloseEventDialog}
        onEdit={handleEditEvent}
        onDelete={handleDeleteEvent}
      />
    </div>
  );
};

export default Calendar;
