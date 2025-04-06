export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  location?: string;
  source: 'teams' | 'outlook' | 'google' | 'manual';
  color?: string;
  isAllDay?: boolean;
  attendees?: {
    name: string;
    email: string;
    response: 'accepted' | 'declined' | 'tentative' | 'none';
  }[];
}

export type CalendarView = 'month' | 'week' | 'day' | 'agenda'; 