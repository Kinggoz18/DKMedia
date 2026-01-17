import { forwardRef } from 'react';
import EventContainerProps from '@/lib/interfaces/props/EventContainerProps';

const formatDate = (date: string): string => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  try {
    const newDate = new Date(date);
    const day = newDate.getDate();
    const month = months[newDate.getMonth()];
    return `${month} ${day}`
  } catch {
    return date;
  }
}

const EventContainer = forwardRef<HTMLDivElement, EventContainerProps>((props, ref) => {
  const {
    title,
    date,
    image,
    organizer,
    ticketLink
  } = props;

  const [newDate, time] = date.split("T");
  const formatedDate = formatDate(newDate);

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
        {/* Date Badge */}
        <div className="absolute top-6 left-6 text-luxury-sm text-xs tracking-[0.2em] text-[#a8a8a8]">
          {formatedDate} {time && `• ${time}`}
        </div>

        {/* Event Title */}
        <h3 className="h3-luxury text-xl lg:text-2xl mb-4 line-clamp-2 leading-snug text-white">
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
