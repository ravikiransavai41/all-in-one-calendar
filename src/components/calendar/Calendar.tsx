
import React, { useState } from 'react';
import { CalendarEvent, CalendarView, generateMockEvents } from '@/utils/calendarUtils';
import CalendarHeader from './CalendarHeader';
import CalendarMonth from './CalendarMonth';
import CalendarWeek from './CalendarWeek';
import CalendarDay from './CalendarDay';
import CalendarAgenda from './CalendarAgenda';
import EventDialog from './EventDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [events, setEvents] = useState<CalendarEvent[]>(generateMockEvents(new Date(), 20));
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState<boolean>(false);

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

  return (
    <div className="flex flex-col h-full border border-border rounded-md overflow-hidden bg-white">
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={handleDateChange}
        onViewChange={handleViewChange}
      />

      <div className="p-2 border-b border-border flex justify-end">
        <Button onClick={handleCreateEvent} className="bg-calendar-primary hover:bg-calendar-secondary">
          <Plus className="mr-1 h-4 w-4" /> New Event
        </Button>
      </div>

      <div className="flex-grow overflow-auto">
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
