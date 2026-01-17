import { JSX, useState } from "react";
import dkMediaLogo from "/dkMediaLogo.png";
import SideNavbarOptions from "./SideNavbarOptions";
import NavBarProps from "@/lib/interfaces/NavBarProps";
import { useNavigate } from "@remix-run/react";
import { LogoutUser } from "@/lib/redux/Auth/AuthSlice";
import { useDispatch } from "react-redux";
import { AuthService } from "@/lib/redux/Auth/AuthService";

interface NabarOptions {
  title: string;
  isActive: boolean;
  onClick: () => void;
}

interface SectionProps {
  options: NabarOptions[];
  onItemClick?: () => void;
}

/**
 * Render the side navbar options
 */
function RenderSections(props: SectionProps): JSX.Element[] {
  const { options, onItemClick } = props;
  return options.map((section, index) => (
    <SideNavbarOptions 
      key={index} 
      title={section.title} 
      isActive={section.isActive} 
      onClick={() => {
        section.onClick();
        onItemClick?.();
      }} 
    />
  ))
}

export function SideNavBar(props: NavBarProps): JSX.Element {
  const { currentPage, setCurrentPage } = props;
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const authService = new AuthService();

  /**
   * Handle navigation with authorization check
   */
  async function handleNavigation(newPage: string) {
    try {
      // Check authorization before navigating
      await authService.confirmAuthorizedUser();
      setCurrentPage(newPage);
    } catch (error: any) {
      // If unauthorized, redirect to login (handled in AuthService)
      console.error('Authorization check failed:', error);
    }
  }

  /**
   * Side navbar options
   */
  const options: NabarOptions[] = [
    {
      title: "Manage events",
      isActive: currentPage === "Manage events",
      onClick: () => handleNavigation("Manage events")
    },
    {
      title: "Manage media",
      isActive: currentPage === "Manage media",
      onClick: () => handleNavigation("Manage media")
    },
    {
      title: "Manage organizations",
      isActive: currentPage === "Manage organizations",
      onClick: () => handleNavigation("Manage organizations")
    },
    {
      title: "Manage articles",
      isActive: currentPage === "Manage articles",
      onClick: () => handleNavigation("Manage articles")
    },
    {
      title: "Manage contact us",
      isActive: currentPage === "Manage contact us",
      onClick: () => handleNavigation("Manage contact us")
    },
    {
      title: "About us",
      isActive: currentPage === "About us",
      onClick: () => handleNavigation("About us")
    },
    {
      title: "Subscription",
      isActive: currentPage === "Subscription",
      onClick: () => handleNavigation("Subscription")
    }
  ]

  const onLogoClick = async () => {
    if (currentPage !== "home") {
      try {
        await authService.confirmAuthorizedUser();
        setCurrentPage("home");
      } catch (error: any) {
        console.error('Authorization check failed:', error);
      }
    }
    setIsMobileMenuOpen(false);
  }

  const onLogoutClick = async () => {
    dispatch(LogoutUser());
    navigate("/auth")
  }

  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <>
      {/* Mobile Header Bar */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-dark flex items-center justify-between px-4 z-30 lg:hidden">
        <img 
          src={dkMediaLogo} 
          alt="DKMEDIA Logo" 
          className="h-10 cursor-pointer" 
          onClick={onLogoClick} 
        />
        
        {/* Current Page Title */}
        <span className="text-sm font-medium text-neutral-300 truncate max-w-[150px]">
          {currentPage === "home" ? "Dashboard" : currentPage}
        </span>

        {/* Burger Menu Button */}
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg bg-neutral-800/50 hover:bg-neutral-700/50 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      {/* Mobile Slide-out Menu */}
      <aside className={`fixed top-0 right-0 w-[280px] h-full glass-dark z-50 transform transition-transform duration-300 ease-out lg:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-800/50">
            <span className="text-lg font-semibold text-white">Menu</span>
            <button 
              onClick={closeMobileMenu}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-neutral-700/50 transition-colors"
            >
              <svg className="w-5 h-5 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Mobile Nav Items */}
          <nav className="flex-1 overflow-y-auto py-4">
            <RenderSections options={options} onItemClick={closeMobileMenu} />
          </nav>

          {/* Mobile Logout */}
          <button 
            onClick={onLogoutClick} 
            className="flex items-center gap-3 m-4 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex fixed top-0 left-0 w-[240px] h-screen glass-dark flex-col z-20 shadow-2xl">
        <div className="p-4">
          <img 
            src={dkMediaLogo} 
            alt="DKMEDIA Logo" 
            className="w-[80%] cursor-pointer transition-all hover:opacity-80 hover:scale-105" 
            onClick={onLogoClick} 
          />
        </div>

        <nav className="flex-1 mt-6 overflow-y-auto">
          <RenderSections options={options} />
        </nav>

        <button 
          onClick={onLogoutClick} 
          className="flex items-center gap-3 text-neutral-400 cursor-pointer text-base font-medium py-5 px-4 hover:bg-red-600/20 hover:text-red-400 transition-all border-t border-neutral-800/50 group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </aside>
    </>
  )
}