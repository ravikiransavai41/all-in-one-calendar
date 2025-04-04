import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CalendarDays, MessageSquare, Users, Mail, Filter, User, Video, MapPin, Settings } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import useCalendarEvents from '@/hooks/useCalendarEvents';
import { format, isToday, isTomorrow, isAfter, isBefore, startOfDay } from 'date-fns';
import { CalendarEvent } from '@/utils/calendarUtils';

interface CalendarSidebarProps {
  onToggleSource: (source: string, checked: boolean) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ onToggleSource }) => {
  const { user } = useAuth();
  const { events } = useCalendarEvents(new Date());
  const [recentEvents, setRecentEvents] = useState<CalendarEvent[]>([]);
  
  const sources = [
    { id: 'teams', name: 'Microsoft Teams', icon: <Users className="h-4 w-4" />, color: 'rgba(98, 100, 167, 0.85)' },
    { id: 'outlook', name: 'Outlook', icon: <Mail className="h-4 w-4" />, color: 'rgba(0, 120, 212, 0.85)' },
    { id: 'custom', name: 'Manual Entries', icon: <CalendarDays className="h-4 w-4" />, color: 'rgba(33, 150, 243, 0.85)' },
  ];

  // Get recent events (upcoming and today's events)
  useEffect(() => {
    if (events.length > 0) {
      const now = new Date();
      const today = startOfDay(now);
      
      // Filter events that are today or in the future
      const upcomingEvents = events
        .filter(event => event.start >= today)
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(0, 5); // Get the next 5 events
      
      setRecentEvents(upcomingEvents);
    }
  }, [events]);

  const formatEventTime = (date: Date) => {
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isTomorrow(date)) {
      return `Tomorrow at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'EEEE, MMM d at h:mm a');
    }
  };

  const getEventIcon = (source: string) => {
    switch (source) {
      case 'teams':
        return <Video className="h-3 w-3" />;
      case 'outlook':
        return <Mail className="h-3 w-3" />;
      default:
        return <CalendarDays className="h-3 w-3" />;
    }
  };

  const getEventColor = (source: string) => {
    switch (source) {
      case 'teams':
        return 'rgba(98, 100, 167, 0.85)';
      case 'outlook':
        return 'rgba(0, 120, 212, 0.85)';
      default:
        return 'rgba(33, 150, 243, 0.85)';
    }
  };

  return (
    <div className="w-full h-full bg-white/40 backdrop-blur-md border-r border-border/30 p-4 flex flex-col rounded-lg shadow-sm">
      <div className="flex items-center space-x-2 mb-6">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-full">
          <CalendarDays className="h-5 w-5 text-white" />
        </div>
        <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">All in One Calendar</h1>
      </div>

      {/* User profile section */}
      <div className="mb-6 p-3 bg-white/60 backdrop-blur-sm rounded-lg flex items-center shadow-sm transition-all duration-300 hover:shadow-md">
        <Avatar className="h-10 w-10 mr-3 border-2 border-white/50">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white">{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      <Button 
        className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 mb-6 w-full flex items-center justify-center transition-all duration-300 hover:scale-105 hover:shadow-md"
      >
        <span>Connect Microsoft Account</span>
      </Button>

      <div className="flex items-center mb-3">
        <Filter className="h-4 w-4 mr-2 text-blue-600" />
        <h2 className="font-medium">Filters</h2>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center space-x-2 p-2 rounded-md transition-all duration-300 hover:bg-white/40">
            <Checkbox 
              id={`source-${source.id}`} 
              defaultChecked 
              onCheckedChange={(checked) => {
                onToggleSource(source.id, !!checked);
              }}
              className="border-blue-600 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <Label 
              htmlFor={`source-${source.id}`}
              className="flex items-center cursor-pointer"
            >
              <span className="flex items-center">
                <span className="mr-2" style={{ color: source.color }}>{source.icon}</span>
                {source.name}
              </span>
            </Label>
          </div>
        ))}
      </div>

      <Separator className="my-6 bg-border/30" />

      <div className="flex items-center mb-3">
        <MessageSquare className="h-4 w-4 mr-2 text-blue-600" />
        <h2 className="font-medium">Recent Events</h2>
      </div>

      <div className="space-y-2 text-sm">
        {recentEvents.length > 0 ? (
          recentEvents.map((event) => (
            <div 
              key={event.id} 
              className="p-2 border border-border/30 rounded-md hover:bg-white/60 cursor-pointer transition-all duration-300 hover:shadow-md animate-fadeIn"
              style={{ 
                borderLeftColor: getEventColor(event.source), 
                borderLeftWidth: '3px',
                backgroundColor: 'rgba(255, 255, 255, 0.4)',
                backdropFilter: 'blur(4px)'
              }}
            >
              <div className="flex items-center gap-1">
                {getEventIcon(event.source)}
                <div className="font-medium truncate">{event.title}</div>
              </div>
              <div className="text-xs text-muted-foreground">
                {formatEventTime(event.start)}
              </div>
              {event.location && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate">{event.location}</span>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-xs text-muted-foreground p-2 bg-white/40 backdrop-blur-sm rounded-md">
            No upcoming events
          </div>
        )}
      </div>

      <div className="mt-auto pt-6">
        <Button 
          variant="outline" 
          className="w-full bg-white/40 backdrop-blur-sm border-border/30 hover:bg-white/60 transition-all duration-300 hover:shadow-md"
        >
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>
    </div>
  );
};

export default CalendarSidebar;
