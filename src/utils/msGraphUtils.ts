import { CalendarEvent } from "./calendarUtils";
import { getMsGraphToken } from "./msAuthUtils";
import { format } from 'date-fns';

// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 60, // Maximum requests per minute
  windowMs: 60 * 1000, // 1 minute window
  retryAfter: 60 * 1000, // Default retry after 1 minute
};

let requestCount = 0;
let windowStart = Date.now();
let lastRequestTime = 0;

// Helper function to handle rate limiting with exponential backoff
const handleRateLimit = async (retryAfter: number, retryCount: number) => {
  // Calculate exponential backoff: base delay * 2^retryCount
  // Add some jitter to prevent all clients from retrying at the same time
  const jitter = Math.random() * 1000; // Random jitter between 0-1000ms
  const backoffDelay = Math.min(retryAfter * Math.pow(2, retryCount) + jitter, 30000); // Cap at 30 seconds
  
  console.log(`Rate limited. Waiting ${Math.round(backoffDelay / 1000)} seconds before retry ${retryCount + 1}...`);
  await new Promise(resolve => setTimeout(resolve, backoffDelay));
  
  // Reset rate limit counters after waiting
  requestCount = 0;
  windowStart = Date.now();
};

// Helper function to check and update rate limit
const checkRateLimit = () => {
  const now = Date.now();
  
  // Reset window if it's been more than windowMs
  if (now - windowStart >= RATE_LIMIT.windowMs) {
    requestCount = 0;
    windowStart = now;
  }
  
  // Check if we're over the limit
  if (requestCount >= RATE_LIMIT.maxRequests) {
    const timeToWait = RATE_LIMIT.windowMs - (now - windowStart);
    if (timeToWait > 0) {
      throw new Error(`Rate limit exceeded. Please wait ${Math.ceil(timeToWait / 1000)} seconds.`);
    }
  }
  
  // Update request count and last request time
  requestCount++;
  lastRequestTime = now;
};

// Fetch calendar events from Microsoft Graph API
export const fetchMsCalendarEvents = async (
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  const maxRetries = 5; // Increased from 3 to 5
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      // Check rate limit before making request
      checkRateLimit();
      
      const formattedStartDate = format(startDate, "yyyy-MM-dd'T'HH:mm:ss");
      const formattedEndDate = format(endDate, "yyyy-MM-dd'T'HH:mm:ss");
      
      console.log('Fetching Microsoft calendar events...');
      console.log('Date range:', { startDate: formattedStartDate, endDate: formattedEndDate });
      
      // Get the access token from the user object in localStorage
      const userJson = localStorage.getItem('calendar_user');
      if (!userJson) {
        throw new Error('User not authenticated');
      }
      
      const user = JSON.parse(userJson);
      const accessToken = user.accessToken;
      
      if (!accessToken) {
        throw new Error('Access token not found');
      }
      
      console.log('Using access token for Microsoft Graph API');
      
    const response = await fetch(
        `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${formattedStartDate}&endDateTime=${formattedEndDate}&$select=id,subject,start,end,location,bodyPreview,isOnlineMeeting,onlineMeetingUrl,onlineMeetingProvider&$top=100`,
      {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
      }
    );

      // Handle rate limiting (429)
      if (response.status === 429) {
        const retryAfter = parseInt(response.headers.get('Retry-After') || '60', 10) * 1000;
        await handleRateLimit(retryAfter, retryCount);
        retryCount++;
        continue;
      }
      
      // Handle other error status codes
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Microsoft Graph API error:', {
          status: response.status,
          statusText: response.statusText,
          error: errorData
        });
        
        if (response.status === 401) {
          throw new Error('Authentication error. Please sign in again.');
        } else if (response.status === 403) {
          throw new Error('Permission denied. Please check your Microsoft account permissions.');
        } else {
          throw new Error(`Failed to fetch calendar events: ${response.status} ${response.statusText}`);
        }
    }

    const data = await response.json();
      console.log('Microsoft calendar events response:', data);
      
      if (!data.value || !Array.isArray(data.value)) {
        console.warn('Unexpected response format from Microsoft Graph API');
        return [];
      }
      
      const events: CalendarEvent[] = data.value.map((event: any) => ({
        id: event.id,
        title: event.subject || 'Untitled Event',
        start: new Date(event.start.dateTime),
        end: new Date(event.end.dateTime),
        location: event.location?.displayName || '',
        description: event.bodyPreview || '',
        source: 'teams',
        isOnlineMeeting: event.isOnlineMeeting || false,
        onlineMeetingUrl: event.onlineMeetingUrl || '',
        onlineMeetingProvider: event.onlineMeetingProvider || '',
      }));
      
      console.log('Processed Microsoft calendar events:', events);
      return events;
      
  } catch (error) {
      console.error('Error fetching Microsoft calendar events:', error);
      
      // If it's a rate limit error and we haven't exceeded max retries, try again
      if (error instanceof Error && error.message.includes('Rate limit exceeded') && retryCount < maxRetries - 1) {
        retryCount++;
        const waitTime = RATE_LIMIT.retryAfter * Math.pow(2, retryCount);
        console.log(`Rate limit error. Retrying in ${waitTime / 1000} seconds... (Attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }
      
      // For other errors or if we've exceeded max retries, throw the error
      throw error;
    }
  }
  
  // If we've exhausted all retries, throw an error
  throw new Error('Failed to fetch calendar events after multiple retries');
};

// Fetch Teams meetings specifically
export const fetchTeamsMeetings = async (
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    const events = await fetchMsCalendarEvents(startDate, endDate);
    return events.filter(event => event.source === 'teams');
  } catch (error) {
    console.error("Error fetching Teams meetings:", error);
    throw error;
  }
};

// Fetch Outlook events
export const fetchOutlookEvents = async (
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    const events = await fetchMsCalendarEvents(startDate, endDate);
    return events.filter(event => event.source === 'outlook');
  } catch (error) {
    console.error("Error fetching Outlook events:", error);
    throw error;
  }
};

// Transform Microsoft Graph event to CalendarEvent
export const transformMsEvent = (msEvent: any): CalendarEvent => {
  console.log('transformMsEvent - Transforming event:', msEvent.subject);
  
  // Parse dates while preserving timezone information
  const startDate = new Date(msEvent.start.dateTime);
  const endDate = new Date(msEvent.end.dateTime);
  
  console.log('transformMsEvent - Original start date:', msEvent.start.dateTime);
  console.log('transformMsEvent - Parsed start date:', startDate);
  
  // Detect if this is a Teams meeting
  const isTeamsMeeting = 
    msEvent.isOnlineMeeting && 
    (msEvent.onlineMeetingProvider === 'teamsForBusiness' || 
     (msEvent.onlineMeetingUrl && msEvent.onlineMeetingUrl.includes('teams.microsoft.com')));
  
  console.log('transformMsEvent - Is Teams meeting:', isTeamsMeeting);
  console.log('transformMsEvent - Online meeting provider:', msEvent.onlineMeetingProvider);
  console.log('transformMsEvent - Online meeting URL:', msEvent.onlineMeetingUrl);
  
  const event: CalendarEvent = {
    id: msEvent.id,
    title: msEvent.subject,
    start: startDate,
    end: endDate,
    description: msEvent.body?.content || '',
    location: msEvent.location?.displayName || '',
    source: isTeamsMeeting ? 'teams' : 'outlook',
    color: isTeamsMeeting ? '#6264A7' : '#0078D4', // Teams purple or Outlook blue
    isAllDay: msEvent.isAllDay || false,
    attendees: msEvent.attendees?.map((attendee: any) => ({
      name: attendee.emailAddress.name,
      email: attendee.emailAddress.address,
      response: attendee.status?.response || 'none'
    })) || []
  };
  
  console.log('transformMsEvent - Transformed event:', event);
  return event;
};

// Create a new event in Microsoft Teams/Outlook
export const createMsCalendarEvent = async (event: CalendarEvent): Promise<CalendarEvent> => {
  try {
    const accessToken = await getMsGraphToken();
    
    // Format the event data for Microsoft Graph API
    const msEvent = {
      subject: event.title,
      start: {
        dateTime: event.start.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      end: {
        dateTime: event.end.toISOString(),
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
      },
      location: event.location ? {
        displayName: event.location
      } : undefined,
      body: {
        contentType: "text",
        content: event.description || ""
      },
      isAllDay: event.isAllDay || false,
      attendees: event.attendees?.map(attendee => ({
        emailAddress: {
          address: attendee.email,
          name: attendee.name
        },
        type: "required"
      })),
      // Add Teams meeting properties if this is a Teams meeting
      isOnlineMeeting: event.source === 'teams',
      onlineMeetingProvider: event.source === 'teams' ? 'teamsForBusiness' : undefined
    };
    
    console.log('Creating Microsoft event:', msEvent);
    
    // Create the event using Microsoft Graph API
    const response = await fetch(
      'https://graph.microsoft.com/v1.0/me/events',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(msEvent),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error creating Microsoft event:', errorData);
      throw new Error(`Failed to create event: ${response.status} - ${errorData.error?.message || 'Unknown error'}`);
    }
    
    const createdEvent = await response.json();
    console.log('Created Microsoft event:', createdEvent);
    
    // Transform the created event to our app's format
    return transformMsEvent(createdEvent);
  } catch (error) {
    console.error("Error creating Microsoft calendar event:", error);
    throw error;
  }
};
