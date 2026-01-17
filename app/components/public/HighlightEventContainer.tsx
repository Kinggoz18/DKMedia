import { forwardRef } from 'react';
import EventContainerProps from '@/lib/interfaces/props/EventContainerProps';

const formatDate = (date: string): string => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  try {
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = months[newDate.getMonth()];
    return `${month} ${day}`
  } catch {
    return date;
  }
}

const formatTime = (date: string): string => {
  try {
    const newDate = new Date(date);
    return newDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  } catch {
    return '';
  }
}

const HighlightEventContainer = forwardRef<HTMLDivElement, EventContainerProps>((props, ref) => {
  const {
    title,
    date,
    image,
    organizer,
    ticketLink
  } = props;

  const formattedDate = formatDate(date);
  const formattedTime = formatTime(date);

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
        {/* Date */}
        <div className="text-luxury-sm text-xs tracking-[0.25em] text-[#a8a8a8] relative z-[5]">
          {formattedDate} {formattedTime && `• ${formattedTime}`}
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
