import { UpcomingEventProps } from '@/lib/interfaces/props/UpcomingEventProps';
import { useCallback, useEffect, useRef, useState } from 'react';
import EventContainer from './EventContainer';
import HighlightEventContainer from './HighlightEventContainer';
import useIntersectionObserverHook from '@/lib/hooks/IntersectionObserverHook';

export default function UpcomingEvent(props: UpcomingEventProps) {
  const { upcomingEvents, upcomingHighlights } = props;

  const mobileEventContainerRef = useRef<HTMLDivElement>(null);
  const highlightEventContainerRef = useRef<HTMLDivElement>(null);
  const autoAdvanceIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const [mobileIndex, setMobileIndex] = useState(0);
  const [currentMobileEvent, setCurrentMobileEvent] = useState(
    upcomingEvents && upcomingEvents.length > 0 ? upcomingEvents[mobileIndex] : null
  );

  const [highlighyIndex, setHighlighyIndex] = useState(0);
  const [currentHighlightEvent, setCurrentHighlighEvent] = useState(
    upcomingHighlights && upcomingHighlights.length > 0 ? upcomingHighlights[highlighyIndex] : null
  );

  const { elementRef, isVisible } = useIntersectionObserverHook({ threshold: 0.1 })
  /******************************************** { Methods }  ********************************************************************/
  /**
   * Show the next event
   */
  function onNextMobileEvent() {
    if (!upcomingEvents || upcomingEvents.length === 0) return;

    setMobileIndex((prevIndex) => {
      const updatedIndex = (prevIndex + 1) % upcomingEvents.length;
      const mobileEventContainer = mobileEventContainerRef.current;
      if (mobileEventContainer) {
        // mobileEventContainer.style.opacity = "0";
        mobileEventContainer.classList.add("!opacity-0");
        setTimeout(() => {
          setCurrentMobileEvent(upcomingEvents[updatedIndex]);
        }, 800);
        mobileEventContainer.classList.add("!opacity-0");
      }

      return updatedIndex;
    });
  }

  /**
   * Show the previous event
   */
  function onPrevMobileEvent() {
    if (!upcomingEvents || upcomingEvents.length === 0) return;

    setMobileIndex((prevIndex) => {
      let updatedIndex = (prevIndex - 1) % upcomingEvents.length;
      const mobileEventContainer = mobileEventContainerRef.current;

      if (updatedIndex < 0) {
        let newStart = upcomingEvents.length - 1;
        if (mobileEventContainer) {
          mobileEventContainer.classList.add("!opacity-0");
          setTimeout(() => {
            setCurrentMobileEvent(upcomingEvents[newStart]);
          }, 1000);
          mobileEventContainer.classList.add("!opacity-0");
        }
        return newStart;
      } else {
        if (mobileEventContainer) {
          mobileEventContainer.classList.add("!opacity-0");
          setTimeout(() => {
            setCurrentMobileEvent(upcomingEvents[updatedIndex]);
          }, 1000);
          mobileEventContainer.classList.add("!opacity-0");
        }
        return updatedIndex;
      }
    });


  }

  /**
   * Show the next highlight event
   */
  function onNextHighlightEvent() {
    if (!upcomingHighlights || upcomingHighlights.length === 0) return;

    // Reset auto-advance timer when user interacts
    resetAutoAdvance();

    setHighlighyIndex((prevIndex) => {
      const updatedIndex = (prevIndex + 1) % upcomingHighlights.length;
      setCurrentHighlighEvent(upcomingHighlights[updatedIndex]);
      return updatedIndex;
    });
  }

  /**
   * Show the previous highlight event
   */
  function onPrevHighlightEvent() {
    if (!upcomingHighlights || upcomingHighlights.length === 0) return;

    // Reset auto-advance timer when user interacts
    resetAutoAdvance();

    setHighlighyIndex((prevIndex) => {
      let updatedIndex = (prevIndex - 1) % upcomingHighlights.length;

      if (updatedIndex < 0) {
        let newStart = upcomingHighlights.length - 1;
        setCurrentHighlighEvent(upcomingHighlights[newStart]);
        return newStart;
      } else {
        setCurrentHighlighEvent(upcomingHighlights[updatedIndex]);
        return updatedIndex;
      }
    });
  }

  /**
   * Start auto-advance functionality
   */
  const startAutoAdvance = useCallback(() => {
    if (!upcomingHighlights || upcomingHighlights.length <= 1) return;

    // Clear any existing interval
    if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current);
    }

    autoAdvanceIntervalRef.current = setInterval(() => {
      setHighlighyIndex((prevIndex) => {
        const updatedIndex = (prevIndex + 1) % upcomingHighlights.length;
        setCurrentHighlighEvent(upcomingHighlights[updatedIndex]);
        return updatedIndex;
      });
    }, 4000); // 4 seconds
  }, [upcomingHighlights]);

  /**
   * Reset auto-advance timer
   */
  const resetAutoAdvance = useCallback(() => {
    if (autoAdvanceIntervalRef.current) {
      clearInterval(autoAdvanceIntervalRef.current);
      autoAdvanceIntervalRef.current = null;
    }
    startAutoAdvance();
  }, [startAutoAdvance]);

  /************************************ { UseEffect hooks } ********************************************************************/

  /************** Auto-advance for highlights (mobile & desktop) *********************/
  useEffect(() => {
    if (!upcomingHighlights || upcomingHighlights.length <= 1) return;

    // Start auto-advance on mount
    startAutoAdvance();

    // Cleanup on unmount or when highlights change
    return () => {
      if (autoAdvanceIntervalRef.current) {
        clearInterval(autoAdvanceIntervalRef.current);
        autoAdvanceIntervalRef.current = null;
      }
    };
  }, [upcomingHighlights, startAutoAdvance]);

  const hasHighlights = upcomingHighlights && upcomingHighlights.length > 0;
  const hasMultipleHighlights = upcomingHighlights && upcomingHighlights.length > 1;
  const hasMultipleEvents = upcomingEvents && upcomingEvents.length > 1;

  return (
    <section id='events' className="w-full relative overflow-hidden bg-[#050505]">
      {/**************** Hero / Highlight Section ****************/}
      <div className="relative h-screen w-full flex items-center justify-center overflow-hidden pt-[68px] lg:pt-0">
        {/* Background Image with slow zoom */}
        <div className="absolute inset-0 hover-slow-zoom">
          <img
            src={currentHighlightEvent?.image || "/highlight_background1.JPG"}
            alt="Featured Event"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/60 to-[#050505]/30 z-[1]" />

        {/* Film grain texture */}
        <div className="absolute inset-0 z-[2] opacity-[0.03] pointer-events-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 z-[2] pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 40%, rgba(5, 5, 5, 0.7) 100%)' }}
        />

        {/* Hero Content */}
        {hasHighlights ? (
          <div className="relative z-[3] w-full max-w-7xl mx-auto px-4 pb-8 md:px-6 lg:px-16 lg:pb-12 h-full flex flex-col justify-center">
            {/* Navigation Arrows - Desktop - Only show if more than 1 highlight */}
            {hasMultipleHighlights && (
              <button
                onClick={onPrevHighlightEvent}
                className="hidden lg:flex absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 z-[50] w-12 h-12 border border-[#c9a962]/30 hover:border-[#c9a962] bg-[#050505]/60 backdrop-blur-sm items-center justify-center transition-all duration-500 group pointer-events-auto"
                aria-label="Previous event"
              >
                <svg className="w-5 h-5 text-[#c9a962] group-hover:-translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Content Container - Lower z-index to ensure buttons are clickable */}
            <div className="relative z-[10] w-full">
              {currentHighlightEvent && (
                <div key={currentHighlightEvent?._id} className="animate-fade-in-smooth">
                  <HighlightEventContainer
                    title={currentHighlightEvent?.title}
                    date={currentHighlightEvent?.date}
                    endTime={currentHighlightEvent?.endTime}
                    timezone={currentHighlightEvent?.timezone}
                    location={currentHighlightEvent?.location}
                    image={currentHighlightEvent?.image}
                    priority={currentHighlightEvent?.priority}
                    organizer={currentHighlightEvent?.organizer}
                    ticketLink={currentHighlightEvent?.ticketLink}
                    ref={highlightEventContainerRef}
                  />
                </div>
              )}
            </div>

            {/* Next Button - Desktop - Only show if more than 1 highlight */}
            {hasMultipleHighlights && (
              <button
                onClick={onNextHighlightEvent}
                className="hidden lg:flex absolute right-4 lg:right-8 top-1/2 -translate-y-1/2 z-[50] w-12 h-12 border border-[#c9a962]/30 hover:border-[#c9a962] bg-[#050505]/60 backdrop-blur-sm items-center justify-center transition-all duration-500 group pointer-events-auto"
                aria-label="Next event"
              >
                <svg className="w-5 h-5 text-[#c9a962] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Mobile Navigation - Only show if more than 1 highlight */}
            {hasMultipleHighlights && (
              <div className="flex lg:hidden justify-center gap-4 mt-auto mb-8 z-[50] relative pointer-events-auto">
                <button
                  onClick={onPrevHighlightEvent}
                  className="w-12 h-12 border border-[#c9a962]/30 hover:border-[#c9a962] bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center transition-all duration-500"
                  aria-label="Previous event"
                >
                  <svg className="w-5 h-5 text-[#c9a962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={onNextHighlightEvent}
                  className="w-12 h-12 border border-[#c9a962]/30 hover:border-[#c9a962] bg-[#050505]/80 backdrop-blur-sm flex items-center justify-center transition-all duration-500"
                  aria-label="Next event"
                >
                  <svg className="w-5 h-5 text-[#c9a962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* No Highlights - Luxury Brand Hero */
          <div className="relative z-[3] text-center px-6">
            <p className="text-luxury-sm text-[10px] tracking-[0.4em] mb-6 text-[#c9a962]">THE PREMIER</p>
            <h1 className="h1-luxury text-5xl md:text-7xl lg:text-8xl mb-6 text-white">
              DKMEDIA<span className="text-[#c9a962]">305</span>
            </h1>
            <p className="text-luxury text-sm lg:text-base max-w-md mx-auto text-[#777]">
              Curating exclusive nightlife experiences for the discerning few
            </p>
          </div>
        )}

        {/* Scroll Indicator - Hidden on mobile to avoid overlap */}
        <div className="hidden lg:flex absolute bottom-8 left-1/2 -translate-x-1/2 z-[3] flex-col items-center gap-3">
          <span className="text-luxury-sm text-[8px] tracking-[0.3em] text-[#555]">SCROLL</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-[#c9a962]/50 to-transparent" />
        </div>
      </div>

      {/**************** Upcoming Events Section ****************/}
      <div
        ref={elementRef}
        className={`relative w-full py-16 lg:py-24 bg-[#050505] ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
      >
        {/* Section Header */}
        <div className="px-6 lg:px-16 mb-10">
          <p className="text-luxury-sm text-[10px] tracking-[0.3em] mb-4 text-[#666]">UPCOMING</p>
          <h2 className='h2-luxury text-3xl lg:text-5xl text-white'>Featured Events</h2>
        </div>

        {/* Mobile Carousel */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className='relative w-full lg:hidden flex flex-col items-center px-6 gap-6'>
            {/* Navigation - Only show if more than 1 event */}
            {hasMultipleEvents && (
              <div className="flex gap-4 mb-4">
                <button
                  onClick={onPrevMobileEvent}
                  className="w-12 h-12 border border-[#2a2a2a] hover:border-[#c9a962]/50 flex items-center justify-center transition-all duration-500"
                >
                  <svg className="w-4 h-4 text-[#c9a962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button
                  onClick={onNextMobileEvent}
                  className="w-12 h-12 border border-[#2a2a2a] hover:border-[#c9a962]/50 flex items-center justify-center transition-all duration-500"
                >
                  <svg className="w-4 h-4 text-[#c9a962]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}

            {currentMobileEvent && (
              <EventContainer
                key={currentMobileEvent?._id}
                title={currentMobileEvent?.title}
                date={currentMobileEvent?.date}
                endTime={currentMobileEvent?.endTime}
                timezone={currentMobileEvent?.timezone}
                location={currentMobileEvent?.location}
                image={currentMobileEvent?.image}
                priority={currentMobileEvent?.priority}
                organizer={currentMobileEvent?.organizer}
                ticketLink={currentMobileEvent?.ticketLink}
                ref={mobileEventContainerRef}
              />
            )}
          </div>
        )}

        {/* Desktop Horizontal Scroll */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <div className='hidden lg:block overflow-hidden'>
            {/* Fade edges */}
            <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />

            <div className='flex gap-8 overflow-x-auto px-16 pb-4 scrollbar-thin'>
              {upcomingEvents.map((element, index) => (
                <div
                  key={element?._id}
                  className="flex-shrink-0 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <EventContainer
                    title={element?.title}
                    date={element?.date}
                    endTime={element?.endTime}
                    timezone={element?.timezone}
                    location={element?.location}
                    image={element?.image}
                    priority={element?.priority}
                    organizer={element?.organizer}
                    ticketLink={element?.ticketLink}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}