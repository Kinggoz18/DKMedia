import { useLoaderData, useSearchParams } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import Header from '@/components/public/Header';
import Newsletter from '@/components/public/Newsletter';
import Contact from '@/components/public/Contact';
import Media from '@/components/public/Media';
import MediaService from '@/services/MediaService';
import { ContactService } from '@/services/ContactService';
import { generateSEOMeta } from '@/lib/utils/seo';

export const meta: MetaFunction<typeof loader> = ({ data, location }) => {
  const tag = data?.initialTag;
  const mediaCount = data?.allMedia?.length || 0;
  
  const title = tag 
    ? `${tag.charAt(0).toUpperCase() + tag.slice(1)} Recaps | DKMEDIA305 Media Gallery`
    : "Media Gallery & Event Recaps | DKMEDIA305";
  
  const description = tag
    ? `Browse ${mediaCount} ${tag} recaps and photos from DKMEDIA305 events. Relive the best moments from premier nightlife experiences across Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more.`
    : `Explore our media gallery featuring ${mediaCount} photos and recaps from exclusive DKMEDIA305 events. Experience premier nightlife across Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more through our curated collection.`;

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

export async function loader({ request }: LoaderFunctionArgs) {
  const mediaService = new MediaService();
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
    const [allMedia, contact] = await Promise.allSettled([
      safeApiCall(() => mediaService.getAllMedia(), [] as any[]),
      safeApiCall(() => contactService.getContacts(), null),
    ]);

    // Extract values from Promise.allSettled results
    const allMediaResult = allMedia.status === 'fulfilled' ? allMedia.value : [] as any[];
    const contactResult = contact.status === 'fulfilled' ? contact.value : null;

    return { 
      allMedia: Array.isArray(allMediaResult) ? allMediaResult : [], 
      contact: contactResult,
      initialTag
    };
  } catch (error) {
    // Final fallback if something unexpected happens
    console.error('Error loading media page data:', error);
    return { allMedia: [] as any[], contact: null, initialTag: null };
  }
}

export default function MediaPage() {
  const { allMedia, contact, initialTag } = useLoaderData<typeof loader>();

  return (
    <>
      <Header />
      <main className="bg-[#0a0a0a] w-full min-h-screen relative">
        <Newsletter />
        <Media allMedia={allMedia} initialTag={initialTag} />
      </main>
      {contact && <Contact contact={contact} />}
    </>
  );
}

