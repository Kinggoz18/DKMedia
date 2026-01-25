import { json, useLoaderData } from "@remix-run/react";
import type { ActionFunctionArgs, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import Header from '@/components/public/Header';
import Newsletter from '@/components/public/Newsletter';
import AbousUs from '@/components/public/AbousUs';
import Articles from '@/components/public/Articles';
import Contact from '@/components/public/Contact';
import Recaps from '@/components/public/Recaps';
import UpcomingEvent from '@/components/public/UpcomingEvent';
import AboutUsService from '@/services/AboutUsService';
import { ArticleService } from '@/services/ArticleService';
import EventService from '@/services/EventService';
import { ContactService } from '@/services/ContactService';
import IAboutUs from '@/lib/interfaces/IAboutUs';
import IArticle from '@/lib/interfaces/IArticle';
import IEvent from '@/lib/interfaces/IEvent';
import { EventPriority } from '@/lib/enums/eventPriority';
import { generateSEOMeta, generateEventStructuredData, generateOrganizationStructuredData, generateWebsiteStructuredData } from '@/lib/utils/seo';

export const action = async ({ request }: ActionFunctionArgs) => {
  // This satisfies the Remix requirement for POST requests to "/"
  return Response.json({ ok: true });
};

// Helper functions moved outside loader for better structure
function sortFunction(a: IEvent, b: IEvent): number {
  if (a.date < b.date) return -1;
  else if (a.date > b.date) return 1;
  else return 0;
}

function isUpcoming(event: IEvent): boolean {
  return new Date(event.date).getTime() > new Date().getTime();
}

function getHighlight(events: IEvent[]) {
  return events.filter(e => e.priority === EventPriority.Highlight).sort((a, b) => sortFunction(a, b));
}

function getUpcomingEvents(events: IEvent[]) {
  const upcoming: IEvent[] = [];
  events.forEach((element) => {
    if (isUpcoming(element)) {
      upcoming.push(element);
    }
  });
  return upcoming;
}

export const meta: MetaFunction<typeof loader> = ({ location }) => {
  // Meta function for SEO - minimal server-side data only
  // We don't have data from loader anymore, so use default values
  const description = "DKMEDIA305 - Curating exclusive nightlife experiences for the discerning few across Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more. Discover upcoming events, recaps, and join the premier entertainment community.";

  return generateSEOMeta({
    title: "DKMEDIA305 - Premier Nightlife & Event Management Across Major US Cities",
    description,
    keywords: [
      "Dkmedia",
      "Dkmedia305",
      "Dkmedia305 events",
      "Dkmedia305 recaps",
      "Dkmedia305 media",
      "Dkmedia305 contact",
      "Dkmedia305 about us",
      "Dkmedia305 press",
      "Dkmedia305 newsletter",
      "Dkmedia305 join the circle",
      "DKMEDIA",
      "DKMEDIA305",
      "Miami nightlife",
      "Miami Afrobeats",
      "Miami Afro stripclub party",
      "Miami Afro strip club party",
      "Atlanta nightlife",
      "Atlanta Afrobeats",
      "Atlanta Afro stripclub party",
      "Atlanta Afro strip club party",
      "Houston events",
      "Houston Afrobeats",
      "Houston Afro stripclub party",
      "Houston Afro strip club party",
      "Dallas nightlife",
      "Dallas Afrobeats",
      "Dallas Afro stripclub party",
      "Dallas Afro strip club party",
      "Texas events",
      "Philadelphia nightlife",
      "Philadelphia Afrobeats",
      "Philadelphia Afro stripclub party",
      "Philadelphia Afro strip club party",
      "Florida nightlife",
      "Florida Afrobeats",
      "Florida Afro stripclub party",
      "Florida Afro strip club party",
      "Miami events",
      "Atlanta events",
      "Houston events",
      "Dallas events",
      "Texas events",
      "Philadelphia events",
      "Florida events",
      "nightlife Miami",
      "Miami parties",
      "Floria afrobeats events",
      "Atlanta afrobeats events",
      "Houston afrobeats events",
      "Dallas afrobeats events",
      "Texas afrobeats events",
      "Philadelphia afrobeats events",
      "Florida afrobeats events",
      "Miami entertainment",
      "and more",
      "Nightlife party",
      "Afro party",
      "Strip club party",
      "Afrobeats party",
      "Afrobeats stripclub party",
      "Afrobeats strip club party",
      "Stripclub party",
    ],
    url: location.pathname,
    type: "website",
  });
};

// Server-side loader: Only return minimal SEO data, no API calls
export async function loader({ request }: LoaderFunctionArgs) {
  // Return minimal data for SEO meta tags only
  // All data fetching moved to clientLoader
  return {};
}

// Client-side loader: Perform all API calls in the browser
export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const aboutUsService = new AboutUsService();
  const articlesService = new ArticleService();
  const eventService = new EventService();
  const contactService = new ContactService();

  // Handle API errors gracefully - return empty/default data if API fails
  async function safeApiCall<T>(apiCall: () => Promise<T>, fallback: T): Promise<T> {
    try {
      return await apiCall();
    } catch (error: any) {
      // Log error but don't throw - return fallback instead
      console.error('API call failed:', error?.message || error);
      return fallback;
    }
  }

  try {
    const [aboutUs, articles, allEvents, contact] = await Promise.allSettled([
      safeApiCall(() => aboutUsService.getAboutUs(), null),
      safeApiCall(() => articlesService.getAllArticle(1, 100), { articles: [] as IArticle[], pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } }),
      safeApiCall(() => eventService.getAllEvents(), [] as IEvent[]),
      safeApiCall(() => contactService.getContacts(), null),
    ]);

    // Extract values from Promise.allSettled results
    const aboutUsResult = aboutUs.status === 'fulfilled' ? aboutUs.value : null;
    // Handle both old format (array) and new format (object with articles and pagination)
    const articlesResponse = articles.status === 'fulfilled' ? articles.value : { articles: [] as IArticle[], pagination: { page: 1, limit: 100, total: 0, totalPages: 1 } };
    const articlesResult = Array.isArray(articlesResponse) ? articlesResponse : articlesResponse.articles;
    const allEventsResult = allEvents.status === 'fulfilled' ? allEvents.value : [] as IEvent[];
    const contactResult = contact.status === 'fulfilled' ? contact.value : null;

    const upcomingEvents = getUpcomingEvents(allEventsResult || []);
    const upcomingHighlights = getHighlight(upcomingEvents);

    return {
      aboutUs: aboutUsResult,
      articles: Array.isArray(articlesResult) ? articlesResult : [],
      upcomingEvents: Array.isArray(upcomingEvents) ? upcomingEvents : [],
      upcomingHighlights: Array.isArray(upcomingHighlights) ? upcomingHighlights : [],
      contact: contactResult,
    };
  } catch (error) {
    // Final fallback if something unexpected happens
    console.error('Error loading home page data:', error);
    return {
      aboutUs: null,
      articles: [],
      upcomingEvents: [],
      upcomingHighlights: [],
      contact: null,
    };
  }
}
// Enable clientLoader to run on initial page load/hydration
clientLoader.hydrate = true;

// HydrateFallback: Show loading state while clientLoader runs
export function HydrateFallback() {
  return (
    <>
      <Header />
      <main className="bg-[#0a0a0a] w-full min-h-screen relative grid grid-flow-row pt-[100px]">
        <Newsletter />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      </main>
    </>
  );
}

export default function HomePage() {
  const { aboutUs, articles, upcomingEvents, upcomingHighlights, contact } = useLoaderData<typeof clientLoader>();
  const highlightEvent = upcomingHighlights?.[0];

  // Generate structured data
  const organizationStructuredData = generateOrganizationStructuredData(undefined, contact);
  const websiteStructuredData = generateWebsiteStructuredData();
  const eventStructuredData = highlightEvent ? generateEventStructuredData({
    title: highlightEvent.title,
    description: `Join us for ${highlightEvent.title} on ${new Date(highlightEvent.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`,
    date: highlightEvent.date,
    image: highlightEvent.image,
    location: "Miami, FL",
    organizer: highlightEvent.organizer ? {
      name: highlightEvent.organizer.name,
      logo: highlightEvent.organizer.logo,
    } : undefined,
    ticketLink: highlightEvent.ticketLink,
  }) : null;

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationStructuredData),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteStructuredData),
        }}
      />
      {eventStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(eventStructuredData),
          }}
        />
      )}

      <Header />
      <main className="bg-[#0a0a0a] w-full min-h-screen relative grid grid-flow-row pt-[100px]">
        <Newsletter />
        <UpcomingEvent
          upcomingEvents={upcomingEvents}
          upcomingHighlights={upcomingHighlights}
        />
        <Recaps />
        {aboutUs && <AbousUs aboutUs={aboutUs} />}
        <Articles articles={articles} />
      </main>
      {contact && <Contact contact={contact} />}
    </>
  );
}

