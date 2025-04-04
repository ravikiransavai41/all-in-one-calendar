
import { CalendarEvent } from "./calendarUtils";
import { getMsGraphToken } from "./msAuthUtils";

// Fetch calendar events from Microsoft Graph API
export const fetchMsCalendarEvents = async (
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    const accessToken = await getMsGraphToken();
    
    // Format dates for Microsoft Graph API
    const start = startDate.toISOString();
    const end = endDate.toISOString();
    
    // Fetch calendar events
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${start}&endDateTime=${end}&$select=id,subject,organizer,start,end,location,bodyPreview,isOnlineMeeting,onlineMeetingUrl,onlineMeetingProvider&$top=100`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Prefer: 'outlook.timezone="UTC"',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch calendar events: ${response.status}`);
    }

    const data = await response.json();
    console.log("MS Graph calendar events:", data);

    // Transform Microsoft events to our app's format
    return data.value.map((msEvent: any) => {
      // Detect Teams meetings more accurately
      const isTeamsMeeting = 
        msEvent.isOnlineMeeting && (
          (msEvent.onlineMeetingProvider && msEvent.onlineMeetingProvider === 'teamsForBusiness') ||
          (msEvent.onlineMeetingUrl && msEvent.onlineMeetingUrl.includes("teams.microsoft.com")) ||
          (msEvent.bodyPreview && msEvent.bodyPreview.toLowerCase().includes("teams"))
        );
      
      // Fix date parsing - don't add 'Z' as it's already in ISO format
      const startDate = new Date(msEvent.start.dateTime);
      const endDate = new Date(msEvent.end.dateTime);
      
      return {
        id: msEvent.id,
        title: msEvent.subject || 'Untitled Event',
        start: startDate,
        end: endDate,
        description: msEvent.bodyPreview,
        location: msEvent.location?.displayName,
        isVirtual: msEvent.isOnlineMeeting,
        source: isTeamsMeeting ? 'teams' : 'outlook',
        color: isTeamsMeeting ? '#7b83eb' : '#71afe5',
      };
    });
  } catch (error) {
    console.error("Error fetching Microsoft calendar events:", error);
    throw error; // Let the Calendar component handle the error
  }
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
