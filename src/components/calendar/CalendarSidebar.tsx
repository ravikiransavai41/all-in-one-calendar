
import React from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { CalendarDays, MessageSquare, Users, Mail, Filter, User } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CalendarSidebarProps {
  onToggleSource: (source: string, checked: boolean) => void;
}

const CalendarSidebar: React.FC<CalendarSidebarProps> = ({ onToggleSource }) => {
  const { user } = useAuth();
  
  const sources = [
    { id: 'teams', name: 'Microsoft Teams', icon: <Users className="h-4 w-4" />, color: '#7b83eb' },
    { id: 'outlook', name: 'Outlook', icon: <Mail className="h-4 w-4" />, color: '#71afe5' },
    { id: 'manual', name: 'Manual Entries', icon: <CalendarDays className="h-4 w-4" />, color: '#3aa0f3' },
  ];

  return (
    <div className="w-full h-full bg-white border-r border-border p-4 flex flex-col">
      <div className="flex items-center space-x-2 mb-6">
        <CalendarDays className="h-5 w-5 text-calendar-primary" />
        <h1 className="text-xl font-semibold">Calendar</h1>
      </div>

      {/* User profile section */}
      <div className="mb-6 p-3 bg-gray-50 rounded-lg flex items-center">
        <Avatar className="h-10 w-10 mr-3">
          <AvatarImage src={user?.avatar} alt={user?.name} />
          <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
        </div>
      </div>

      <Button 
        className="bg-calendar-primary hover:bg-calendar-secondary mb-6 w-full flex items-center justify-center"
      >
        <span>Connect Microsoft Account</span>
      </Button>

      <div className="flex items-center mb-3">
        <Filter className="h-4 w-4 mr-2" />
        <h2 className="font-medium">Filters</h2>
      </div>

      <div className="space-y-3">
        {sources.map((source) => (
          <div key={source.id} className="flex items-center space-x-2">
            <Checkbox 
              id={`source-${source.id}`} 
              defaultChecked 
              onCheckedChange={(checked) => {
                onToggleSource(source.id, !!checked);
              }}
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

      <Separator className="my-6" />

      <div className="flex items-center mb-3">
        <MessageSquare className="h-4 w-4 mr-2" />
        <h2 className="font-medium">Recent Events</h2>
      </div>

      <div className="space-y-2 text-sm">
        <div className="p-2 border border-border rounded-md hover:bg-muted">
          <div className="font-medium">Team Weekly Sync</div>
          <div className="text-xs text-muted-foreground">Tomorrow at 10:00 AM</div>
        </div>
        <div className="p-2 border border-border rounded-md hover:bg-muted">
          <div className="font-medium">Product Demo</div>
          <div className="text-xs text-muted-foreground">Friday at 2:30 PM</div>
        </div>
        <div className="p-2 border border-border rounded-md hover:bg-muted">
          <div className="font-medium">1:1 with Manager</div>
          <div className="text-xs text-muted-foreground">Next Monday at 9:00 AM</div>
        </div>
      </div>

      <div className="mt-auto pt-6">
        <Button variant="outline" className="w-full">
          Settings
        </Button>
      </div>
    </div>
  );
};

export default CalendarSidebar;
