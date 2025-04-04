
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, RefreshCw } from 'lucide-react';

interface CalendarEventActionsProps {
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onCreateEvent: () => void;
  hasMicrosoftAccount: boolean;
}

const CalendarEventActions: React.FC<CalendarEventActionsProps> = ({
  isLoading,
  onRefresh,
  onCreateEvent,
  hasMicrosoftAccount,
}) => {
  return (
    <div className="p-2 border-b border-border flex justify-between">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh} 
        disabled={isLoading || !hasMicrosoftAccount}
        className="flex items-center gap-1"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      
      <Button onClick={onCreateEvent} className="bg-calendar-primary hover:bg-calendar-secondary">
        <Plus className="mr-1 h-4 w-4" /> New Event
      </Button>
    </div>
  );
};

export default CalendarEventActions;
