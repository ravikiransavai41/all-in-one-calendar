
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/utils/calendarUtils';
import { format } from 'date-fns';

interface EventDialogProps {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (event: CalendarEvent) => void;
  onDelete: (event: CalendarEvent) => void;
}

const EventDialog: React.FC<EventDialogProps> = ({
  event,
  isOpen,
  onClose,
  onEdit,
  onDelete,
}) => {
  if (!event) return null;

  const handleEdit = () => {
    onEdit(event);
  };

  const handleDelete = () => {
    onDelete(event);
    onClose();
  };

  const formatDateTime = (date: Date) => {
    return format(new Date(date), 'EEE, MMM d, yyyy h:mm a');
  };

  const getSourceIcon = (source?: 'teams' | 'outlook' | 'manual') => {
    switch (source) {
      case 'teams':
        return '👥';
      case 'outlook':
        return '📧';
      default:
        return '📝';
    }
  };

  const getSourceLabel = (source?: 'teams' | 'outlook' | 'manual') => {
    switch (source) {
      case 'teams':
        return 'Microsoft Teams';
      case 'outlook':
        return 'Outlook';
      default:
        return 'Manual Entry';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl">{event.title}</DialogTitle>
          <DialogDescription className="flex items-center gap-1 text-sm">
            {getSourceIcon(event.source)} {getSourceLabel(event.source)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-[100px_1fr] gap-2">
            <div className="text-muted-foreground">Time:</div>
            <div>
              {formatDateTime(event.start)} - {formatDateTime(event.end)}
            </div>
          </div>
          
          {event.location && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="text-muted-foreground">Location:</div>
              <div>
                {event.isVirtual ? '🖥️ Virtual' : '📍 In Person'} - {event.location}
              </div>
            </div>
          )}
          
          {event.description && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="text-muted-foreground">Description:</div>
              <div>{event.description}</div>
            </div>
          )}
          
          {event.attendees && event.attendees.length > 0 && (
            <div className="grid grid-cols-[100px_1fr] gap-2">
              <div className="text-muted-foreground">Attendees:</div>
              <div>{event.attendees.join(', ')}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EventDialog;
