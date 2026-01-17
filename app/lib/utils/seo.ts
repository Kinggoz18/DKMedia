import type { MetaFunction } from "@remix-run/node";

export interface SEOConfig {
  title: string;
  description: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: "website" | "article" | "event";
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  noindex?: boolean;
  nofollow?: boolean;
}

/**
 * Get the base URL for the site
 */
export function getBaseUrl(request?: Request): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  if (request) {
    const url = new URL(request.url);
    return `${url.protocol}//${url.host}`;
  }

  // Fallback to environment variable or default
  return process.env.SITE_URL || "https://dkmedia305.com";
}

/**
 * Generate full URL from path
 */
export function getFullUrl(path: string, request?: Request): string {
  const baseUrl = getBaseUrl(request);
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
}

/**
 * Generate SEO meta tags
 */
export function generateSEOMeta(config: SEOConfig, request?: Request): ReturnType<MetaFunction> {
  const baseUrl = getBaseUrl(request);
  const fullUrl = config.url || baseUrl;
  const imageUrl = config.image
    ? (config.image.startsWith("http") ? config.image : getFullUrl(config.image, request))
    : getFullUrl("/dkMediaLogoBackground.png", request);

  const keywords = config.keywords?.join(", ") || "DKMEDIA305, Miami nightlife, Atlanta nightlife, Houston events, Dallas nightlife, Texas events, Philadelphia nightlife, Florida nightlife, luxury events, event management, nightlife experiences, and more";

  const metaTags: ReturnType<MetaFunction> = [
    // Basic Meta Tags
    { title: config.title },
    { name: "description", content: config.description },
    { name: "keywords", content: keywords },
    { name: "author", content: config.author || "DKMEDIA305" },

    // Open Graph Tags
    { property: "og:title", content: config.title },
    { property: "og:description", content: config.description },
    { property: "og:type", content: config.type || "website" },
    { property: "og:url", content: fullUrl },
    { property: "og:image", content: imageUrl },
    { property: "og:site_name", content: "DKMEDIA305" },
    { property: "og:locale", content: "en_US" },

    // Twitter Card Tags
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: config.title },
    { name: "twitter:description", content: config.description },
    { name: "twitter:image", content: imageUrl },

    // Canonical URL
    { tagName: "link", rel: "canonical", href: fullUrl },
  ];

  // Add article-specific meta tags
  if (config.type === "article") {
    if (config.publishedTime) {
      metaTags.push({ property: "article:published_time", content: config.publishedTime });
    }
    if (config.modifiedTime) {
      metaTags.push({ property: "article:modified_time", content: config.modifiedTime });
    }
    if (config.author) {
      metaTags.push({ property: "article:author", content: config.author });
    }
  }

  // Add event-specific meta tags
  if (config.type === "event") {
    metaTags.push({ property: "og:type", content: "event" });
  }

  return metaTags;
}

/**
 * Generate structured data (JSON-LD) for events
 */
export function generateEventStructuredData(event: {
  title: string;
  description: string;
  date: string;
  image?: string;
  location?: string;
  organizer?: { name: string; logo?: string };
  ticketLink?: string;
  url?: string;
}, request?: Request) {
  const baseUrl = getBaseUrl(request);
  const eventUrl = event.url || baseUrl;
  const imageUrl = event.image
    ? (event.image.startsWith("http") ? event.image : getFullUrl(event.image, request))
    : getFullUrl("/dkMediaLogoBackground.png", request);

  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: new Date(event.date).toISOString(),
    image: imageUrl,
    url: eventUrl,
    ...(event.location && {
      location: {
        "@type": "Place",
        name: event.location,
      },
    }),
    ...(event.organizer && {
      organizer: {
        "@type": "Organization",
        name: event.organizer.name,
        ...(event.organizer.logo && {
          logo: event.organizer.logo.startsWith("http")
            ? event.organizer.logo
            : getFullUrl(event.organizer.logo, request),
        }),
      },
    }),
    ...(event.ticketLink && {
      offers: {
        "@type": "Offer",
        url: event.ticketLink,
        availability: "https://schema.org/InStock",
        price: "0",
        priceCurrency: "USD",
      },
    }),
  };
}

/**
 * Generate structured data (JSON-LD) for organization
 */
export function generateOrganizationStructuredData(
  request?: Request,
  contact?: { instagramLink?: string; tiktokLink?: string; email?: string } | null
) {
  const baseUrl = getBaseUrl(request);
  
  // Build sameAs array from contact data, filtering out empty strings
  const sameAs: string[] = [];
  if (contact?.instagramLink) {
    sameAs.push(contact.instagramLink);
  }
  if (contact?.tiktokLink) {
    sameAs.push(contact.tiktokLink);
  }
  
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DKMEDIA305",
    url: baseUrl,
    logo: getFullUrl("/dkMediaLogoBackground.png", request),
    description: "Curating exclusive nightlife experiences for the discerning few across Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more",
    ...(sameAs.length > 0 && { sameAs }),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: "English",
      ...(contact?.email && { email: contact.email }),
    },
  };
}

/**
 * Generate structured data (JSON-LD) for website
 */
export function generateWebsiteStructuredData(request?: Request) {
  const baseUrl = getBaseUrl(request);

  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DKMEDIA305",
    url: baseUrl,
    description: "Premier nightlife and event management company serving major US party cities including Miami, Atlanta, Houston, Dallas, Texas, Philadelphia, Florida, and more",
    publisher: {
      "@type": "Organization",
      name: "DKMEDIA305",
    },
  };
}

