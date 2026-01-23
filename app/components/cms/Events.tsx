import EventsProps from "@/lib/interfaces/EventsProps";
import { formatDateInTimezone, formatTimeInTimezone } from "@/lib/utils/timezones";

export default function Events(props: EventsProps) {
  const {
    _id,
    title,
    date,
    endTime,
    timezone,
    image,
    organizer,
    isUpcoming,
    onDeleteClick,
  } = props;

  if (!_id || _id === "") {
    return null;
  }
  
  // Format date and time in the event's timezone (or UTC if not specified)
  const eventTimezone = timezone || 'UTC';
  const formattedDate = formatDateInTimezone(date, eventTimezone, 'short');
  const formattedStartTime = formatTimeInTimezone(date, eventTimezone);
  const formattedEndTime = endTime ? formatTimeInTimezone(endTime, eventTimezone) : null;
  const timeDisplay = formattedEndTime ? `${formattedStartTime} - ${formattedEndTime}` : formattedStartTime;

  return (
    <div className='relative h-[280px] min-w-[260px] rounded-xl overflow-hidden group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-primary-500/20'>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
      
      {/* Content */}
      <div className="absolute inset-0 z-20 text-white p-4 flex flex-col justify-end">
        <div className="mb-auto pt-2 flex justify-between items-start">
          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${isUpcoming ? 'bg-primary-500/90' : 'bg-neutral-600/90'}`}>
            {isUpcoming ? 'Upcoming' : 'Past'}
          </span>
          
          {/* Delete Button - ALWAYS VISIBLE */}
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDeleteClick?.();
            }}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-red-500/80 hover:bg-red-500 text-white transition-all shadow-lg"
            title="Delete event"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-bold leading-tight line-clamp-2">{title}</h3>
          
          <div className="flex items-center gap-2 text-sm text-neutral-300">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{formattedDate}</span>
            <span className="text-neutral-500">•</span>
            <span>{timeDisplay}</span>
          </div>

          {organizer && (
            <div className='flex items-center gap-3 pt-2 border-t border-white/10'>
              <img 
                src={organizer?.logo} 
                className="w-9 h-9 rounded-full object-cover border-2 border-white/20" 
                alt={organizer?.name} 
              />
              <span className="text-sm font-medium text-neutral-200 truncate flex-1">{organizer?.name}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Background image */}
      <img 
        src={image || undefined} 
        alt={title || "Event"} 
        className="absolute w-full h-full top-0 object-cover transition-transform duration-500 group-hover:scale-110" 
      />
    </div>
  )
}
