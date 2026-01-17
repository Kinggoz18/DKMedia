import OrganizerProps from "@/lib/interfaces/OrganizerProps";

export default function Organizations(props: OrganizerProps) {
  const { name, logo, onDeleteClick } = props;

  return (
    <div className='glass-card rounded-xl overflow-hidden group hover:border-primary-500/30 transition-all duration-300 flex flex-col'>
      {/* Logo Section */}
      <div className="relative pt-6 pb-4 flex justify-center bg-gradient-to-b from-neutral-800/50 to-transparent">
        <div className="relative">
          <img 
            src={logo} 
            alt={name}
            className="w-20 h-20 rounded-full object-cover border-3 border-neutral-700 group-hover:border-primary-500/50 transition-colors shadow-lg"
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
        
        {/* Delete Button */}
        {onDeleteClick && (
          <button 
            onClick={onDeleteClick}
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 w-8 h-8 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all text-red-400 hover:text-red-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>
      
      {/* Name */}
      <div className="p-4 pt-2 text-center">
        <h3 className="font-semibold text-white truncate">{name}</h3>
        <p className="text-xs text-neutral-500 mt-1">Event Organizer</p>
      </div>
    </div>
  )
}
