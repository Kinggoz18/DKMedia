import { useAppDispatch, useAppSelector } from '@/lib/hooks/reduxHook';
import { setIsNewsletterPopupOpen } from '@/lib/redux/NewsletterSlice';
import { Link, useLocation, useNavigate } from '@remix-run/react';
import { useState } from 'react';

export default function Header() {
  const [isHeaderOpen, setIsHeaderOpen] = useState(false);
  const newsletterStore = useAppSelector(state => state.newsletter);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const path = location.pathname;
  const isContactUs = path.includes("/contact")
  const isMediaPage = path.includes("/media");
  const navigate = useNavigate();

  function toggleMobileOptions() {
    if (newsletterStore?.isOpen) return;
    if (isHeaderOpen) {
      document.documentElement.style.overflow = '';
      setIsHeaderOpen(false)
    } else {
      document.documentElement.style.overflow = 'hidden';
      setIsHeaderOpen(true)
    }
  }

  function onSubscribeClick() {
    if (!newsletterStore?.isOpen) setIsHeaderOpen(false)
    dispatch(setIsNewsletterPopupOpen(true))
  }

  function onLogoClick() {
    navigate("/")
  }

  // Handle navigation to sections on home page
  const handleSectionNavigate = (sectionId: string) => {
    setIsHeaderOpen(false);
    
    if (path !== '/') {
      // If not on home page, navigate to home first
      navigate('/');
      // Wait for navigation to complete, then scroll to section
      setTimeout(() => {
        const element = document.getElementById(sectionId.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 300);
    } else {
      // Already on home page, just scroll to section
      const element = document.getElementById(sectionId.replace('#', ''));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Navigation link styling
  const navLinkClass = "text-luxury-sm text-xs tracking-[0.2em] uppercase transition-all duration-500 hover:text-[#c9a962] hover:tracking-[0.3em] cursor-pointer";
  const mobileNavClass = "text-luxury-sm text-sm tracking-[0.15em] uppercase py-4 border-b border-[#1a1a1a] w-full text-center transition-all duration-500 hover:text-[#c9a962] hover:tracking-[0.25em] cursor-pointer";

  return (
    <>
      {/* Luxury Glass Header */}
      <header className="fixed top-0 w-full px-6 lg:px-12 py-5 lg:py-6 flex items-center justify-between glass-dark z-40">
        {/* Logo */}
        <img 
          src="/dkMediaLogo.png" 
          alt="DKMEDIA" 
          className="h-8 lg:h-10 cursor-pointer transition-opacity duration-500 hover:opacity-80" 
          onClick={onLogoClick} 
        />
        
        {/* Mobile Menu Toggle */}
        <button
          onClick={toggleMobileOptions}
          className="w-8 h-8 flex flex-col justify-center items-center gap-1.5 lg:hidden"
          aria-label="Toggle menu"
        >
          <span className={`block w-6 h-[1px] bg-[#c9a962] transition-all duration-300 ${isHeaderOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
          <span className={`block w-6 h-[1px] bg-[#c9a962] transition-all duration-300 ${isHeaderOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-6 h-[1px] bg-[#c9a962] transition-all duration-300 ${isHeaderOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
        </button>

        {/* Desktop Navigation */}
        {!isContactUs && !isMediaPage ? (
          <nav className="hidden lg:flex items-center gap-10">
            <a href="#events" className={navLinkClass}>Events</a>
            <Link to="/media" className={navLinkClass}>Recaps</Link>
            <a href="#about-us" className={navLinkClass}>About</a>
            <a href="#articles" className={navLinkClass}>Press</a>
            <Link to="/contact" className={navLinkClass}>Contact</Link>
          </nav>
        ) : isContactUs ? (
          <nav className="hidden lg:flex items-center gap-10">
            <Link to="/media" className={navLinkClass}>Recaps</Link>
            <Link to="/" className={navLinkClass}>Home</Link>
          </nav>
        ) : (
          <nav className="hidden lg:flex items-center gap-10">
            <Link to="/contact" className={navLinkClass}>Contact</Link>
            <Link to="/" className={navLinkClass}>Home</Link>
          </nav>
        )}
      </header>

      {/* Mobile Menu Overlay */}
      {isHeaderOpen && (
        <nav className="fixed inset-0 top-[68px] bg-[#050505]/98 backdrop-blur-xl z-30 flex flex-col items-center pt-12 lg:hidden animate-fade-in">
          {!isContactUs && !isMediaPage ? (
            <>
              <button onClick={() => handleSectionNavigate('events')} className={mobileNavClass}>Events</button>
              <Link to="/media" onClick={toggleMobileOptions} className={mobileNavClass}>Recaps</Link>
              <button onClick={() => handleSectionNavigate('about-us')} className={mobileNavClass}>About Us</button>
              <button onClick={() => handleSectionNavigate('articles')} className={mobileNavClass}>Press</button>
              <Link to="/contact" onClick={toggleMobileOptions} className={mobileNavClass}>Contact</Link>
              <button onClick={onSubscribeClick} className="btn-outline-luxury mt-10">
                Join the Circle
              </button>
            </>
          ) : isContactUs ? (
            <>
              <Link to="/media" onClick={toggleMobileOptions} className={mobileNavClass}>Recaps</Link>
              <Link to="/" onClick={toggleMobileOptions} className={mobileNavClass}>Home</Link>
            </>
          ) : (
            <>
              <Link to="/contact" onClick={toggleMobileOptions} className={mobileNavClass}>Contact</Link>
              <Link to="/" onClick={toggleMobileOptions} className={mobileNavClass}>Home</Link>
            </>
          )}
        </nav>
      )}
    </>
  )
}
