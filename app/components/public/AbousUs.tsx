import useIntersectionObserverHook from '@/lib/hooks/IntersectionObserverHook';
import { useAppDispatch, useAppSelector } from '@/lib/hooks/reduxHook';
import { AboutUsProps } from '@/lib/interfaces/props/AboutUsProps';
import { setIsNewsletterPopupOpen } from '@/lib/redux/NewsletterSlice';

export default function AbousUs(props: AboutUsProps) {
  const { aboutUs } = props;

  const newsletterStore = useAppSelector(state => state.newsletter);
  const dispatch = useAppDispatch();

  const { elementRef, isVisible } = useIntersectionObserverHook({ threshold: 0.1 })

  function onSubscribeClick() {
    if (!newsletterStore?.isOpen) {
      dispatch(setIsNewsletterPopupOpen(true))
    }
  }

  return (
    <section 
      ref={elementRef} 
      id='about-us' 
      className={`relative w-full py-20 lg:py-32 overflow-hidden ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
      style={{
        background: 'linear-gradient(180deg, #050505 0%, #0a0808 50%, #050505 100%)'
      }}
    >
      {/* Decorative elements */}
      <div className="absolute top-1/2 -translate-y-1/2 right-0 w-[400px] h-[600px] bg-[#c9a962]/3 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/20 to-transparent" />
      
      <div className="max-w-4xl mx-auto px-6 lg:px-16 relative z-10">
        {/* Section Label */}
        <p className="text-luxury-sm text-[10px] tracking-[0.3em] mb-6 text-[#666]">ABOUT US</p>
        
        {/* Title */}
        <h2 className='h1-luxury text-3xl lg:text-5xl mb-10 text-white leading-tight'>
          {aboutUs?.title || "𝐆𝐨𝐨𝐝 𝐦𝐮𝐬𝐢𝐜. 𝐆𝐫𝐞𝐚𝐭 𝐩𝐞𝐨𝐩𝐥𝐞. 𝐔𝐧𝐟𝐨𝐫𝐠𝐞𝐭𝐭𝐚𝐛𝐥𝐞 𝐧𝐢𝐠𝐡𝐭𝐬. ✨"}
        </h2>

        {/* Content */}
        <article className='flex flex-col gap-y-6 lg:gap-y-8'>
          {aboutUs?.paragraphs?.map((element, index) => (
            <p 
              key={index} 
              className='text-luxury text-base lg:text-lg leading-[1.8] text-[#888]'
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {element}
            </p>
          )) ?? []}
        </article>

        {/* CTA */}
        <button 
          onClick={onSubscribeClick}
          className='btn-outline-luxury mt-12 inline-flex items-center gap-4 text-xs'
        >
          Join The Inner Circle
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#c9a962]/10 to-transparent" />
    </section>
  )
}
