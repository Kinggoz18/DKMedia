import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import type { ClientLoaderFunctionArgs } from "@remix-run/react";
import Header from '@/components/public/Header';
import ContactUs from '@/components/public/ContactUs';
import Contact from '@/components/public/Contact';
import { ContactService } from '@/services/ContactService';
import { generateSEOMeta } from '@/lib/utils/seo';

export const meta: MetaFunction<typeof loader> = ({ location }) => {
  return generateSEOMeta({
    title: "Contact Us | DKMEDIA305 - Get in Touch",
    description: "Contact DKMEDIA305 for event inquiries, partnerships, or general questions. We're here to help you experience premier nightlife across Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more.",
    keywords: [
      "contact Afrobeats",
      "contact DKmedia",
      "contact DKmedia305",
      "contact DKMEDIA",
      "contact DKMEDIA305",
      "Miami event inquiries",
      "Miami events contact",
      "Atlanta event contact",
      "Atlanta events contact",
      "Houston nightlife inquiries",
      "Houston events contact",
      "Dallas event partnership",
      "Dallas events contact",
      "Texas party contact",
      "Texas events contact",
      "Philadelphia event inquiries",
      "Philadelphia event partnership",
      "Florida nightlife contact",
      "Florida events contact",
      "nightlife contact",
      "event partnership",
      "DKMEDIA305 contact",
      "and more"
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
    const contact = await safeApiCall(() => contactService.getContacts(), null);
    return { contact };
  } catch (error) {
    // Final fallback if something unexpected happens
    console.error('Error loading contact data:', error);
    return { contact: null };
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
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold"></div>
        </div>
      </main>
    </>
  );
}

export default function ContactPage() {
  const { contact } = useLoaderData<typeof clientLoader>();

  return (
    <>
      <Header />
      <main className="bg-[#0a0a0a] w-full min-h-screen relative">
        <ContactUs />
      </main>
      {contact && <Contact contact={contact} />}
    </>
  );
}

