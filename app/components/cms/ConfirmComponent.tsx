import ConfirmComponentProps from "@/lib/interfaces/ConfirmComponentProps";

export default function ConfirmComponent(props: ConfirmComponentProps) {
  const {
    message,
    onNoClick,
    onYesClick
  } = props;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-40 p-4">
      <div className="glass-card flex flex-col w-full max-w-[420px] items-center py-8 lg:py-10 gap-6 lg:gap-8 rounded-2xl font-semibold animate-fade-up animate-duration-300">
        {/* Warning Icon */}
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        
        <div className="text-white text-base lg:text-lg text-center w-[85%] leading-relaxed">
          {message}
        </div>
        
        <div className="flex flex-row gap-4 lg:gap-6 mt-2">
          <button
            onClick={onYesClick}
            className="px-8 py-3 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white rounded-xl cursor-pointer transition-all duration-300 font-semibold shadow-lg shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5">
            Yes, Delete
          </button>
          <button
            onClick={onNoClick}
            className="px-8 py-3 bg-neutral-700/50 hover:bg-neutral-600/50 text-neutral-200 rounded-xl cursor-pointer transition-all duration-300 font-semibold border border-neutral-600/50 hover:border-neutral-500/50">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
