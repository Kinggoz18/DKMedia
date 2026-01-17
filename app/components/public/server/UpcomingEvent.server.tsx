import EventService from '@/services/EventService';
import UpcomingEvent from '../UpcomingEvent';
import IEvent from '@/lib/interfaces/IEvent';
import { EventPriority } from '@/lib/enums/eventPriority';

export default async function UpcomingEventPage() {
  const eventService = new EventService();
  let allEvents: IEvent[];

  try {
    allEvents = await eventService.getAllEvents();
  } catch (error) {
    console.error("Error fetching events:", error);
    return <p>Failed to load events. Please try again later.</p>;
  }

  // Ensure allEvents is always an array to prevent crashes
  const safeEvents = Array.isArray(allEvents) ? allEvents : [];
  const upcomingEvents = getUpcomingEvents(safeEvents);
  const upcomingHighlights = getHighlight(upcomingEvents)

  /**
   * Sorter function for sorting events by date. If it is less than return -1, if it is greater return 1 else return 0;
   * @param a 
   * @param b 
   */
  function sortFunction(a: IEvent, b: IEvent): number {
    if (a.date < b.date) return -1;
    else if (a.date > b.date) return 1;
    else return 0
  }

  /**
   * Check if an event is upcoming. If it is return true, else return false.
   * @param a 
   * @param b 
   */
  function isUpcoming(event: IEvent): boolean {
    return new Date(event.date).getTime() > new Date().getTime();
  }

  /**
   * Get highlights
   */
  function getHighlight(events: IEvent[]) {
    return events.filter(e => e.priority === EventPriority.Highlight).sort((a, b) => sortFunction(a, b))
  }

  /**
   * Get all upcoming events
   */
  function getUpcomingEvents(events: IEvent[]) {
    const upcoming: IEvent[] = [];
    events.forEach((element) => {
      if (isUpcoming(element)) {
        upcoming.push(element);
      }
    })
    return upcoming;
  }

  return (
    <UpcomingEvent
      upcomingEvents={upcomingEvents}
      upcomingHighlights={upcomingHighlights}
    />
  );
}