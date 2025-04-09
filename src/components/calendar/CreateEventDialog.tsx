import React, { useState } from 'react';
import { format } from 'date-fns';
import { CalendarEvent } from '@/types/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { createMsCalendarEvent } from '@/utils/msGraphUtils';
import { useMsAuth } from '@/hooks/useMsAuth';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface CreateEventDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateEvent: (event: CalendarEvent) => void;
  defaultDate?: Date;
}

const CreateEventDialog: React.FC<CreateEventDialogProps> = ({
  isOpen,
  onClose,
  onCreateEvent,
  defaultDate = new Date(),
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(format(defaultDate, 'HH:mm'));
  const [endDate, setEndDate] = useState(format(defaultDate, 'yyyy-MM-dd'));
  const [endTime, setEndTime] = useState(format(defaultDate, 'HH:mm'));
  const [isAllDay, setIsAllDay] = useState(false);
  const [isTeamsMeeting, setIsTeamsMeeting] = useState(false);
  const [attendees, setAttendees] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { msAccount } = useMsAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title) {
      toast.error('Please enter a title for the event');
      return;
    }
    
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    
    if (end < start) {
      toast.error('End time must be after start time');
      return;
    }
    
    setIsCreating(true);
    
    try {
      // Parse attendees
      const attendeeList = attendees
        .split(',')
        .map(email => email.trim())
        .filter(email => email)
        .map(email => ({
          name: email.split('@')[0],
          email,
          response: 'none' as const
        }));
      
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        title,
        description,
        location,
        start,
        end,
        source: isTeamsMeeting ? 'teams' : 'outlook',
        color: isTeamsMeeting ? '#7b83eb' : '#71afe5',
        isAllDay,
        attendees: attendeeList.length > 0 ? attendeeList : undefined
      };
      
      // If user is logged in with Microsoft, create the event in Teams/Outlook
      if (msAccount) {
        try {
          console.log('Creating event in Microsoft with source:', newEvent.source);
          const createdEvent = await createMsCalendarEvent(newEvent);
          onCreateEvent(createdEvent);
          toast.success(`Event created in Microsoft ${isTeamsMeeting ? 'Teams' : 'Outlook'}`);
          onClose();
          
          // Reset form
          setTitle('');
          setDescription('');
          setLocation('');
          setStartDate(format(defaultDate, 'yyyy-MM-dd'));
          setStartTime(format(defaultDate, 'HH:mm'));
          setEndDate(format(defaultDate, 'yyyy-MM-dd'));
          setEndTime(format(defaultDate, 'HH:mm'));
          setIsAllDay(false);
          setIsTeamsMeeting(false);
          setAttendees('');
        } catch (error: any) {
          console.error('Error creating event in Microsoft:', error);
          
          // Handle specific error cases
          if (error.message?.includes('Authentication')) {
            toast.error('Authentication error. Please sign in again.');
          } else if (error.message?.includes('Rate limit')) {
            toast.error('Too many requests. Please wait a moment and try again.');
          } else {
            toast.error('Failed to create event in Microsoft. Please try again.');
          }
        }
      } else {
        // Create event locally
        onCreateEvent(newEvent);
        toast.success('Event created locally');
        onClose();
        
        // Reset form
        setTitle('');
        setDescription('');
        setLocation('');
        setStartDate(format(defaultDate, 'yyyy-MM-dd'));
        setStartTime(format(defaultDate, 'HH:mm'));
        setEndDate(format(defaultDate, 'yyyy-MM-dd'));
        setEndTime(format(defaultDate, 'HH:mm'));
        setIsAllDay(false);
        setIsTeamsMeeting(false);
        setAttendees('');
      }
    } catch (error) {
      console.error('Error creating event:', error);
      toast.error('Failed to create event. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Event description"
                rows={3}
              />
            </div>
            
            <div className="grid gap-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Event location"
              />
            </div>
            
            {msAccount && (
              <div className="grid gap-2">
                <label htmlFor="attendees" className="text-sm font-medium">
                  Attendees (comma-separated emails)
                </label>
                <Input
                  id="attendees"
                  value={attendees}
                  onChange={(e) => setAttendees(e.target.value)}
                  placeholder="john@example.com, jane@example.com"
                />
              </div>
            )}
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="isAllDay" 
                checked={isAllDay} 
                onCheckedChange={(checked) => setIsAllDay(checked as boolean)} 
              />
              <Label htmlFor="isAllDay">All day event</Label>
            </div>
            
            {msAccount && (
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="isTeamsMeeting" 
                  checked={isTeamsMeeting} 
                  onCheckedChange={(checked) => setIsTeamsMeeting(checked as boolean)} 
                />
                <Label htmlFor="isTeamsMeeting">Teams Meeting</Label>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="startDate" className="text-sm font-medium">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              
              {!isAllDay && (
                <div className="grid gap-2">
                  <label htmlFor="startTime" className="text-sm font-medium">
                    Start Time
                  </label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label htmlFor="endDate" className="text-sm font-medium">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
              
              {!isAllDay && (
                <div className="grid gap-2">
                  <label htmlFor="endTime" className="text-sm font-medium">
                    End Time
                  </label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create Event'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateEventDialog; 