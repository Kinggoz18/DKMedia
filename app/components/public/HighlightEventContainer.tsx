import { forwardRef } from 'react';
import EventContainerProps from '@/lib/interfaces/props/EventContainerProps';
import { formatTimeInTimezone, formatDateInTimezone } from '@/lib/utils/timezones';

const formatStartTime = (startDate: string, timezone?: string): string => {
  try {
    const tz = timezone || 'UTC';
    return formatTimeInTimezone(startDate, tz);
  } catch {
    return '';
  }
}

const formatEndTime = (endTime: string, timezone?: string): string => {
  try {
    const tz = timezone || 'UTC';
    return formatTimeInTimezone(endTime, tz);
  } catch {
    return '';
  }
}

const HighlightEventContainer = forwardRef<HTMLDivElement, EventContainerProps>((props, ref) => {
  const {
    title,
    date,
    endTime,
    timezone,
    location,
    image,
    organizer,
    ticketLink
  } = props;

  // Format date in the event's timezone (or UTC if not specified)
  const eventTimezone = timezone || 'UTC';
  const formattedDate = formatDateInTimezone(date, eventTimezone, 'long');
  const startTime = formatStartTime(date, timezone);
  const endTimeFormatted = endTime ? formatEndTime(endTime, timezone) : null;

  return (
    <div className="relative flex flex-col lg:flex-row w-full max-w-[1000px] mx-auto items-center gap-4 md:gap-6 lg:gap-12 min-h-0 flex-1 transition-all duration-700 ease-in-out opacity-100" ref={ref}>
      {/* Event Image - Luxury Frame */}
      <div className="relative flex-shrink-0 hover-slow-zoom w-full max-w-[240px] md:max-w-[280px] lg:max-w-[380px]">
        <div className="relative overflow-hidden w-full">
          <img
            src={image}
            alt={title}
            className="w-full aspect-[3/4] object-cover max-h-[300px] md:max-h-[360px] lg:max-h-[480px]"
          />
          {/* Vignette overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/60 via-transparent to-transparent" />
          {/* Film grain */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
          />
        </div>
        {/* Gold corner accent */}
        <div className="absolute -top-2 -left-2 w-8 h-8 border-l border-t border-[#c9a962]/40" />
        <div className="absolute -bottom-2 -right-2 w-8 h-8 border-r border-b border-[#c9a962]/40" />
      </div>

      {/* Event Info - Luxury Typography */}
      <div className="flex flex-col gap-4 md:gap-5 lg:gap-8 flex-1 text-center lg:text-left min-h-0 justify-center">
        {/* Date and Time Info with dark blurry background */}
        <div className="backdrop-blur-md bg-black/60 rounded-lg px-5 py-4 border border-white/10 relative z-[5]">
          <div className="text-luxury-sm text-xs tracking-[0.15em] text-white space-y-2">
            <div className="flex items-center gap-3 justify-center lg:justify-start">
              <span className="text-[#c9a962] text-[10px] font-medium">DATE:</span>
              <span>{formattedDate}</span>
            </div>
            {startTime && (
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="text-[#c9a962] text-[10px] font-medium">START:</span>
                <span>{startTime}</span>
              </div>
            )}
            {endTimeFormatted && (
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <span className="text-[#c9a962] text-[10px] font-medium">END:</span>
                <span>{endTimeFormatted}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-3 justify-center lg:justify-start">
                <svg className="w-4 h-4 text-[#c9a962] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="lowercase">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Title */}
        <h2 className="h1-luxury text-xl md:text-2xl lg:text-5xl xl:text-6xl leading-tight text-white relative z-[5]">
          {title}
        </h2>


        {/* Organizer */}
        {organizer && (
          <div className="flex items-center gap-4 justify-center lg:justify-start relative z-[5]">
            <img
              src={organizer?.logo}
              alt={organizer?.name}
              className="w-12 h-12 rounded-full object-cover border border-[#2a2a2a]"
            />
            <div className="text-left">
              <p className="text-luxury-sm text-[10px] tracking-[0.2em] text-[#666]">PRESENTED BY</p>
              <p className="text-white text-sm tracking-wide">{organizer?.name}</p>
            </div>
          </div>
        )}

        {/* CTA Button - Outline Luxury - Ensure visible on mobile */}
        {ticketLink && (
          <a
            href={ticketLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-outline-luxury inline-flex items-center justify-center gap-4 self-center lg:self-start mt-2 relative z-[5] pointer-events-auto text-xs md:text-sm px-6 py-3 md:px-8 md:py-4"
          >
            Get Your Tickets
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  )
});

HighlightEventContainer.displayName = 'HighlightEventContainer';

export default HighlightEventContainer;
