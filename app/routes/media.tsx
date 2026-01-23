import { useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import Header from '@/components/public/Header';
import Newsletter from '@/components/public/Newsletter';
import Contact from '@/components/public/Contact';
import Media from '@/components/public/Media';
import { ContactService } from '@/services/ContactService';
import { generateSEOMeta } from '@/lib/utils/seo';

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  // Extract tag from URL for SEO purposes (server-side)
  // Use URLSearchParams directly instead of constructing URL from path
  const searchParams = new URLSearchParams(location.search);
  const tag = searchParams.get('tag') || null;
  
  const title = tag 
    ? `${tag.charAt(0).toUpperCase() + tag.slice(1)} Recaps | DKMEDIA305 Media Gallery`
    : "Media Gallery & Event Recaps | DKMEDIA305";
  
  const description = tag
    ? `Browse ${tag} recaps and photos from DKMEDIA305 events. Relive the best moments from premier nightlife experiences across Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more.`
    : `Explore our media gallery featuring photos and recaps from exclusive DKMEDIA305 events. Experience premier nightlife across Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more through our curated collection.`;

  return generateSEOMeta({
    title,
    description,
    keywords: [
      "DKMEDIA305 recaps",
      "Miami event photos",
      "Atlanta nightlife photos",
      "Houston party recaps",
      "Dallas event gallery",
      "Texas nightlife photos",
      "Philadelphia event recaps",
      "Florida party photos",
      "nightlife gallery",
      "event recaps",
      "party photos",
      "DKMEDIA305 media",
      "afrobeats photos",
      "afro stripclub party photos",
      "and more"
    ],
    url: location.pathname + (tag ? `?tag=${tag}` : ""),
    type: "website",
  });
};

// Server-side loader: Only return minimal SEO data, no API calls
export async function loader({ request }: LoaderFunctionArgs) {
  // Get tag from URL params for SEO
  const url = new URL(request.url);
  const initialTag = url.searchParams.get('tag') || null;

  // Return minimal data for SEO meta tags only
  // All data fetching moved to clientLoader
  return { initialTag };
}

// Client-side loader: Perform all API calls in the browser
export async function clientLoader({ request }: ClientLoaderFunctionArgs) {
  const contactService = new ContactService();
  
  // Get tag from URL params
  const url = new URL(request.url);
  const initialTag = url.searchParams.get('tag') || null;

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
    const [contact] = await Promise.allSettled([
      safeApiCall(() => contactService.getContacts(), null),
    ]);

    // Extract values from Promise.allSettled results
    const contactResult = contact.status === 'fulfilled' ? contact.value : null;

    return { 
      contact: contactResult,
      initialTag
    };
  } catch (error) {
    // Final fallback if something unexpected happens
    console.error('Error loading media page data:', error);
    return { contact: null, initialTag: null };
  }
}
// Enable clientLoader to run on initial page load/hydration
clientLoader.hydrate = true;

// HydrateFallback: Show loading state while clientLoader runs
export function HydrateFallback() {
  return (
    <>
      <Header />
      <main className="bg-[#0a0a0a] w-full min-h-screen relative">
        <Newsletter />
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      </main>
    </>
  );
}

export default function MediaPage() {
  const { contact, initialTag } = useLoaderData<typeof clientLoader>();

  return (
    <>
      <Header />
      <main className="bg-[#0a0a0a] w-full min-h-screen relative">
        <Newsletter />
        <Media initialTag={initialTag} />
      </main>
      {contact && <Contact contact={contact} />}
    </>
  );
}

