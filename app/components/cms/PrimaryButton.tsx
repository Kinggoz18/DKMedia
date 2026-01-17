import ButtonProps from "@/lib/interfaces/ButtonProps";

export default function PrimaryButton(props: ButtonProps) {
  const {
    title,
    onBtnClick,
    className
  } = props;

  return (
    <button 
      onClick={onBtnClick} 
      className={`inline-flex items-center justify-center gap-2 cursor-pointer py-3.5 px-8 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-500 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/25 hover:shadow-primary-500/40 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ${className || ''}`}
    >
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
      {title}
    </button>
  )
}
