import NavBarSectionProps from '@/lib/interfaces/NavBarSectionProps'

export default function SideNavbarOptions(props: NavBarSectionProps) {
  const { title, onClick, isActive = false } = props;
  
  return (
    <button 
      onClick={onClick} 
      className={`w-full text-left cursor-pointer text-base font-medium py-3 px-4 mx-2 rounded-xl transition-all duration-300 relative overflow-hidden group ${
        isActive
          ? "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-500/20"
          : "text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
      }`}
    >
      <span className="relative z-10">{title}</span>
      {isActive && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-500 opacity-0 group-hover:opacity-100 transition-opacity" />
      )}
    </button>
  )
}
