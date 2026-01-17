import { useAppDispatch, useAppSelector } from '@/lib/hooks/reduxHook';
import { ContactProps } from '@/lib/interfaces/props/ContactProps'
import { setIsNewsletterPopupOpen } from '@/lib/redux/NewsletterSlice';
import { Link, useLocation } from '@remix-run/react';

export default function Contact(props: ContactProps) {
  const { contact } = props;
  const newsletterStore = useAppSelector(state => state.newsletter);
  const dispatch = useAppDispatch();
  const location = useLocation();
  const path = location.pathname;
  
  const contactData = contact || {
    email: '',
    instagramLink: '#',
    tiktokLink: '#',
  };

  function onSubscribeClick() {
    if (!newsletterStore?.isOpen) {
      dispatch(setIsNewsletterPopupOpen(true))
    }
  }

  if (!contact) return null;

  return (
    <footer className="relative bg-[#050505] border-t border-[#1a1a1a]">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 lg:px-16 py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Left - Brand & CTA */}
          <div className="flex flex-col gap-8">
            <img src='/dkMediaLogo.png' alt='DKMEDIA' className="h-10 w-auto self-start" />
            
            <div>
              <h3 className="h3-luxury text-xl lg:text-2xl text-white mb-3">
                Join The Inner Circle
              </h3>
              <p className="text-luxury text-sm text-[#666] max-w-sm">
                Receive exclusive invitations to the most exclusive nightlife experiences.
              </p>
            </div>

            <button 
              onClick={onSubscribeClick}
              className='btn-outline-luxury self-start text-xs'
            >
              Sign Up For Updates
            </button>
          </div>

          {/* Right - Links & Social */}
          <div className="flex flex-col gap-8 lg:items-end">
            {/* Social Icons */}
            <div className="flex gap-4">
              <a 
                href={contactData.instagramLink} 
                target='_blank' 
                rel="noopener noreferrer"
                className='w-12 h-12 border border-[#2a2a2a] hover:border-[#c9a962]/50 flex items-center justify-center transition-all duration-500 group'
              >
                <img src="/instagram-icon.svg" alt="Instagram" className='w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity' />
              </a>
              <a 
                href={contactData.tiktokLink} 
                target='_blank' 
                rel="noopener noreferrer"
                className='w-12 h-12 border border-[#2a2a2a] hover:border-[#c9a962]/50 flex items-center justify-center transition-all duration-500 group'
              >
                <img src="/tiktok-icon.svg" alt="TikTok" className='w-5 h-5 opacity-50 group-hover:opacity-100 transition-opacity' />
              </a>
            </div>

            {/* Contact Email */}
            {contactData.email && (
              <a 
                href={`mailto:${contactData.email}`} 
                className='text-luxury-sm text-xs tracking-[0.15em] text-[#666] hover:text-[#c9a962] transition-colors duration-500'
              >
                {contactData.email}
              </a>
            )}

            {/* Navigation Links */}
            <nav className="flex flex-wrap gap-6 lg:gap-8">
              <Link to="/" className="text-luxury-sm text-[10px] tracking-[0.15em] text-[#555] hover:text-[#c9a962] transition-colors duration-500">
                HOME
              </Link>
              <Link to="/media" className="text-luxury-sm text-[10px] tracking-[0.15em] text-[#555] hover:text-[#c9a962] transition-colors duration-500">
                GALLERY
              </Link>
              <Link to="/contact" className="text-luxury-sm text-[10px] tracking-[0.15em] text-[#555] hover:text-[#c9a962] transition-colors duration-500">
                CONTACT
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#1a1a1a]">
        <div className="max-w-7xl mx-auto px-6 lg:px-16 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-luxury-sm text-[9px] tracking-[0.15em] text-[#444]">
            © {new Date().getFullYear()} DKMEDIA305 HOSPITALITY GROUP
          </span>
          
          <div className="flex gap-6">
            <Link to="/privacy-policy" className="text-luxury-sm text-[9px] tracking-[0.15em] text-[#444] hover:text-[#c9a962] transition-colors duration-500">
              PRIVACY
            </Link>
            <Link to="/unsubscribe" className="text-luxury-sm text-[9px] tracking-[0.15em] text-[#444] hover:text-[#c9a962] transition-colors duration-500">
              UNSUBSCRIBE
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
