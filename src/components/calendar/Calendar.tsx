import * as React from 'react';
import { useState } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import useCalendarEvents from '@/hooks/useCalendarEvents';
import { useAuth } from '@/hooks/useAuth';
import { useMsAuth } from '@/hooks/useMsAuth';
import CalendarMonth from './CalendarMonth';
import CalendarWeek from './CalendarWeek';
import CalendarDay from './CalendarDay';
import CalendarAgenda from './CalendarAgenda';
import CreateEventDialog from './CreateEventDialog';
import { Button } from '@/components/ui/button';
import { PlusCircle, RefreshCw, ChevronLeft, ChevronRight, Filter, Calendar as CalendarIcon, Plus, AlertTriangle, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarPicker } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

type CalendarView = 'day' | 'week' | 'month' | 'agenda';

const CalendarComponent: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [view, setView] = useState<CalendarView>('month');
  const [isCreateEventDialogOpen, setIsCreateEventDialogOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    teams: true,
    outlook: true,
    custom: true
  });
  const { user } = useAuth();
  const { msAccount } = useMsAuth();
  const { events, loading, error, isRateLimited, retryAfter, refreshEvents, retryCount } = useCalendarEvents(currentDate);

  // Debug logs
  console.log('Calendar component - Current events:', events);
  console.log('Calendar component - Current view:', view);
  console.log('Calendar component - Current date:', currentDate);
  console.log('Calendar component - Rate limited:', isRateLimited);
  console.log('Calendar component - Retry after:', retryAfter);
  console.log('Calendar component - Retry count:', retryCount);

  const handleDateChange = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    console.log('Event clicked:', event);
    // Open event details dialog or navigate to event details page
  };

  const handleCreateEvent = () => {
    setIsCreateEventDialogOpen(true);
  };

  const handleEventCreated = async (newEvent: CalendarEvent) => {
    try {
      // If the event was created in Microsoft Teams/Outlook, refresh the events
      if (newEvent.source === 'teams' || newEvent.source === 'outlook') {
        console.log('Event created in Microsoft, refreshing events...');
        await refreshEvents();
        toast.success(`Event created in Microsoft ${newEvent.source === 'teams' ? 'Teams' : 'Outlook'}`);
      } else {
        // For local events, we need to refresh to get the updated list
        await refreshEvents();
        toast.success('Event created successfully');
      }
    } catch (error) {
      console.error('Error handling created event:', error);
      toast.error('Failed to refresh events');
    }
  };

  const handleFilterChange = (key: string, checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      [key]: checked
    }));
  };

  const filteredEvents = events.filter(event => {
    if (event.source === 'teams' && !filters.teams) return false;
    if (event.source === 'outlook' && !filters.outlook) return false;
    if (event.source === 'manual' && !filters.custom) return false;
    return true;
  });

  return (
    <div className="flex h-full">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-border/30 bg-white/80 backdrop-blur-sm rounded-lg shadow-sm mb-4">
          <div className="flex items-center space-x-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePreviousMonth}
              className="transition-all duration-300 hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleToday}
              className="transition-all duration-300 hover:scale-105"
            >
              Today
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleNextMonth}
              className="transition-all duration-300 hover:scale-105"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <h2 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select value={view} onValueChange={(value) => handleViewChange(value as CalendarView)}>
              <SelectTrigger className="w-[120px] bg-white/80 backdrop-blur-sm border-border/30 transition-all duration-300 hover:bg-white/90">
                <SelectValue placeholder="Select view" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
                <SelectItem value="agenda">Agenda</SelectItem>
              </SelectContent>
            </Select>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-white/80 backdrop-blur-sm border-border/30 transition-all duration-300 hover:bg-white/90"
                >
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {format(currentDate, 'MMM d, yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarPicker
                  mode="single"
                  selected={currentDate}
                  onSelect={(date) => date && handleDateChange(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            
            <Button 
              onClick={handleCreateEvent}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white transition-all duration-300 hover:scale-105 hover:shadow-md"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Event
            </Button>
          </div>
        </div>
        
        {isRateLimited && (
          <div className="bg-yellow-50/80 border-l-4 border-yellow-400 p-4 mb-2 rounded-lg backdrop-blur-sm animate-pulse">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  {retryCount < 3 
                    ? `Rate limit exceeded. Retrying in ${retryAfter} seconds... (Attempt ${retryCount + 1}/3)`
                    : 'Rate limit exceeded. Using mock events as fallback. Please try again later.'}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {error && !isRateLimited && (
          <div className="bg-red-50/80 border-l-4 border-red-400 p-4 mb-2 rounded-lg backdrop-blur-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">
                  {error}
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex-1 overflow-auto p-4 bg-transparent rounded-lg">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-600" />
                <p className="text-gray-600">Loading events...</p>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn h-full">
              {view === 'month' && (
                <CalendarMonth
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateChange}
                />
              )}
              {view === 'week' && (
                <CalendarWeek
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateChange}
                />
              )}
              {view === 'day' && (
                <CalendarDay
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                />
              )}
              {view === 'agenda' && (
                <CalendarAgenda
                  currentDate={currentDate}
                  events={filteredEvents}
                  onEventClick={handleEventClick}
                  onDateClick={handleDateChange}
                />
              )}
            </div>
          )}
        </div>
      </div>
      
      <CreateEventDialog
        isOpen={isCreateEventDialogOpen}
        onClose={() => setIsCreateEventDialogOpen(false)}
        onCreateEvent={handleEventCreated}
        defaultDate={currentDate}
      />
    </div>
  );
};

export default CalendarComponent;
