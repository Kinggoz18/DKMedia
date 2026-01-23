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

const EventContainer = forwardRef<HTMLDivElement, EventContainerProps>((props, ref) => {
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
  const formatedDate = formatDateInTimezone(date, eventTimezone, 'short');
  const startTime = formatStartTime(date, timezone);
  const endTimeFormatted = endTime ? formatEndTime(endTime, timezone) : null;

  function navigateToTicketLink() {
    window.open(ticketLink, '_blank');
  }

  return (
    <div 
      className="group relative w-[85%] min-w-[300px] md:w-[360px] lg:w-[380px] aspect-[3/4] cursor-pointer hover-slow-zoom vignette" 
      ref={ref}
      onClick={navigateToTicketLink}
    >
      {/* Background Image */}
      <img 
        src={image} 
        alt={title} 
        className="absolute inset-0 w-full h-full object-cover" 
      />
      
      {/* Gradient Overlay - Luxury fade to black */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent z-[2]" />
      
      {/* Film grain effect */}
      <div className="absolute inset-0 z-[3] opacity-[0.03] pointer-events-none" 
           style={{backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`}} 
      />

      {/* Content */}
      <div className="absolute inset-0 z-[4] flex flex-col justify-end p-6 lg:p-8">
        {/* Date Badge with dark blurry background - Positioned to minimize obstruction */}
        <div className="absolute top-4 left-4 right-auto max-w-[200px] sm:max-w-[220px] md:max-w-[240px] backdrop-blur-md bg-black/60 rounded-lg px-3 py-2.5 sm:px-4 sm:py-3 border border-white/10">
          <div className="text-luxury-sm text-xs tracking-[0.2em] text-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[#c9a962] text-[10px]">DATE:</span>
              <span className="text-[10px]">{formatedDate}</span>
            </div>
            {startTime && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#c9a962] text-[10px]">START:</span>
                <span className="text-[10px]">{startTime}</span>
              </div>
            )}
            {endTimeFormatted && (
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[#c9a962] text-[10px]">END:</span>
                <span className="text-[10px]">{endTimeFormatted}</span>
              </div>
            )}
            {location && (
              <div className="flex items-center gap-2">
                <svg className="w-3 h-3 text-[#c9a962] flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-[10px] lowercase">{location}</span>
              </div>
            )}
          </div>
        </div>

        {/* Event Title */}
        <h3 className="h3-luxury text-xl lg:text-2xl mb-2 line-clamp-2 leading-snug text-white">
          {title}
        </h3>


        {/* Organizer */}
        {organizer && (
          <div className="flex items-center gap-3 mb-6">
            <img 
              src={organizer?.logo} 
              alt={organizer?.name} 
              className="w-10 h-10 rounded-full object-cover border border-[#2a2a2a]" 
            />
            <span className="text-luxury-sm text-xs tracking-widest text-[#a8a8a8]">
              {organizer?.name}
            </span>
          </div>
        )}

        {/* CTA Button - Outline Style */}
        <button className="btn-outline-luxury self-start text-xs py-3 px-6">
          Tickets
        </button>
      </div>
    </div>
  )
});

EventContainer.displayName = 'EventContainer';

export default EventContainer;
