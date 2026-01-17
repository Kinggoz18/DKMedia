import { useAppDispatch, useAppSelector } from '@/lib/hooks/reduxHook';
import { useEffect, useRef, useState } from 'react'
import { setIsNewsletterPopupOpen } from '@/lib/redux/NewsletterSlice';
import { CheckboxCheckOtions } from '@/lib/interfaces/props/CheckboxContainerProps';
import SubscriptionService from '@/services/SubscriptionService';
import { ISubscriptionUpdate } from '@/lib/interfaces/ISubscription';
import ThrowAsyncError, { toggleError } from './ThrowAsyncError';
import FeedbackPopup, { toggleFeedback } from './FeedbackPopup';

export default function Newsletter() {
  const newsletterStore = useAppSelector(state => state.newsletter);
  const subscriptionService = new SubscriptionService();
  const dispatch = useAppDispatch();

  const errorRef = useRef(null);
  const feedbackRef = useRef(null);

  const [responseError, setResponseError] = useState("");
  const [isAgreed, setIsAgreed] = useState(false);

  const [firstname, setFirstname] = useState("");
  const [lastname, setLastName] = useState("");
  const [email, setEmail] = useState("");

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    if (!isValid) {
      handleThrowError("Please enter a valid email address");
    }
    return isValid;
  };

  const isBtnActive = () => {
    return isAgreed && firstname !== "" && email !== "";
  }

  const onSubscribeClick = async () => {
    if (!isBtnActive() || !isValidEmail(email)) return;

    try {
      const data: ISubscriptionUpdate = {
        firstName: firstname,
        lastName: lastname,
        email: email,
      }

      const response = await subscriptionService.addSubscription(data)
      if (!response?._id) {
        throw new Error("Something went wrong");
      }

      setFirstname("")
      setLastName("");
      setEmail("")
      setIsAgreed(false);
      handleShowFeedback("Welcome to the Circle")
      setTimeout(() => {
        dispatch(setIsNewsletterPopupOpen(false));
      }, 2500)
    } catch (error: any) {
      setEmail("")
      handleThrowError(error?.message)
    }
  }

  const handleThrowError = (errorMsg: string) => {
    setResponseError(errorMsg);
    setTimeout(() => toggleError(errorRef), 400);
  };

  const handleShowFeedback = (errorMsg: string) => {
    setResponseError(errorMsg);
    setTimeout(() => toggleFeedback(feedbackRef), 400);
  };

  useEffect(() => {
    if (newsletterStore?.isOpen)
      document.documentElement.style.overflow = 'hidden';
    else
      document.documentElement.style.overflow = '';
  }, [newsletterStore?.isOpen])

  if (!newsletterStore?.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-[#050505]/90 backdrop-blur-xl z-50 flex items-center justify-center p-4">
      {/* Decorative Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#c9a962]/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#c9a962]/3 rounded-full blur-[120px]" />
      
      {/* Invite Card */}
      <section className="relative w-full max-w-[480px] glass-luxury rounded-sm overflow-hidden animate-scale-in">
        {/* Gold border accent */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/50 to-transparent" />
        
        {/* Close Button */}
        <button 
          onClick={() => dispatch(setIsNewsletterPopupOpen(false))}
          className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-[#a8a8a8] hover:text-white transition-colors z-10"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-8 lg:p-12">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="text-luxury-sm text-[10px] tracking-[0.3em] mb-4 text-[#a8a8a8]">EXCLUSIVE UPDATES</p>
            <h2 className="h2-luxury text-3xl lg:text-4xl mb-3">Join The Circle</h2>
            <p className="text-luxury text-sm leading-relaxed max-w-[300px] mx-auto text-[#777]">
              Receive curated invitations to the most exclusive nightlife experiences.
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={firstname}
                placeholder="First name"
                onChange={(e) => setFirstname(e.target.value)}
                className="w-full bg-transparent border-b border-[#2a2a2a] focus:border-[#c9a962]/50 px-0 py-3 text-white text-sm tracking-wide placeholder:text-[#555] focus:outline-none transition-colors"
              />
              <input
                type="text"
                value={lastname}
                placeholder="Last name"
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-transparent border-b border-[#2a2a2a] focus:border-[#c9a962]/50 px-0 py-3 text-white text-sm tracking-wide placeholder:text-[#555] focus:outline-none transition-colors"
              />
            </div>

            <input
              type="email"
              value={email}
              placeholder="Email address"
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b border-[#2a2a2a] focus:border-[#c9a962]/50 px-0 py-3 text-white text-sm tracking-wide placeholder:text-[#555] focus:outline-none transition-colors"
            />

            {/* Agreement */}
            <label className="flex items-start gap-3 cursor-pointer group mt-6">
              <div 
                onClick={() => setIsAgreed(!isAgreed)}
                className={`w-5 h-5 border flex-shrink-0 flex items-center justify-center transition-all ${
                  isAgreed ? 'bg-[#c9a962] border-[#c9a962]' : 'border-[#2a2a2a] group-hover:border-[#444]'
                }`}
              >
                {isAgreed && (
                  <svg className="w-3 h-3 text-[#050505]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-xs text-[#666] leading-relaxed">
                I agree to receive exclusive updates and accept the{' '}
                <a href="/privacy-policy" className="text-[#c9a962]/70 hover:text-[#c9a962] transition-colors">
                  privacy policy
                </a>
              </span>
            </label>

            {/* Submit Button */}
            <button 
              onClick={onSubscribeClick}
              disabled={!isBtnActive()}
              className={`w-full mt-6 py-4 text-sm uppercase tracking-[0.2em] font-medium transition-all duration-500 ${
                isBtnActive() 
                  ? 'btn-solid-luxury cursor-pointer' 
                  : 'bg-[#1a1a1a] text-[#444] cursor-not-allowed'
              }`}
            >
              SIGN UP
            </button>
          </div>
        </div>

        {/* Bottom accent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/30 to-transparent" />
      </section>

      {/* Error/Feedback Popups */}
      <ThrowAsyncError responseError={responseError} errorRef={errorRef} className="!bottom-[10%]" />
      <FeedbackPopup responseError={responseError} errorRef={feedbackRef} className="!bottom-[20%]" />
    </div>
  )
}
