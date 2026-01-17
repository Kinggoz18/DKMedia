import { ISubscription } from "@/lib/interfaces/Redux/ISubscription";

interface subscriptionListProps {
  allSubscriptions: ISubscription[]
  onDeleteClick: (id: string) => void
}

export default function SubscriptionList(props: subscriptionListProps) {
  const { allSubscriptions, onDeleteClick } = props;

  // Ensure allSubscriptions is always an array to prevent crashes
  const safeSubscriptions = Array.isArray(allSubscriptions) ? allSubscriptions : [];

  return (
    <div className="space-y-2">
      {safeSubscriptions.map((element) => (
        <div
          key={element?._id}
          className="flex items-center justify-between p-4 bg-neutral-800/30 hover:bg-neutral-800/50 rounded-xl border border-neutral-800/50 transition-all group"
        >
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-semibold">
              {element?.firstName?.charAt(0)?.toUpperCase() || '?'}
            </div>
            
            {/* Info */}
            <div>
              <div className="font-medium text-white">
                {element?.firstName} {element?.lastName}
              </div>
              <div className="text-sm text-neutral-400 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {element?.email}
              </div>
            </div>
          </div>

          {/* Delete Button */}
          <button 
            onClick={() => onDeleteClick(element?._id || "")}
            className="opacity-0 group-hover:opacity-100 w-9 h-9 rounded-lg bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center transition-all text-red-400 hover:text-red-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}