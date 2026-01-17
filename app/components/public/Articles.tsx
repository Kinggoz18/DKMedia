import useIntersectionObserverHook from '@/lib/hooks/IntersectionObserverHook';
import { ArticlesProps } from '@/lib/interfaces/props/ArticlesProps'

export default function Articles(props: ArticlesProps) {
  const { articles } = props;
  const safeArticles = Array.isArray(articles) ? articles : [];
  const { elementRef, isVisible } = useIntersectionObserverHook({ threshold: 0.1 })

  if (safeArticles.length === 0) return null;

  return (
    <section 
      id='articles' 
      ref={elementRef} 
      className={`relative w-full py-16 lg:py-20 bg-[#050505] ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      {/* Header */}
      <div className="px-6 lg:px-16 mb-10">
        <p className="text-luxury-sm text-[10px] tracking-[0.3em] mb-4 text-[#666]">PRESS & MEDIA</p>
        <h2 className='h2-luxury text-2xl lg:text-4xl text-white'>Featured Articles</h2>
      </div>

      {/* Articles Marquee */}
      <div className="relative overflow-hidden">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#050505] to-transparent z-10 pointer-events-none" />
        
        {/* Scrollable articles */}
        <div className="flex gap-6 overflow-x-auto px-6 lg:px-16 py-4 scrollbar-thin">
          {safeArticles.map((element, index) => (
            <a 
              href={element?.link} 
              target="_blank" 
              rel="noopener noreferrer"
              key={element?._id || index}
              className="group flex-shrink-0 w-[280px] lg:w-[320px] glass-luxury p-6 hover-luxury transition-all duration-500"
            >
              {/* Article Number */}
              <span className="text-luxury-sm text-[10px] tracking-[0.2em] text-[#444] mb-4 block">
                {String(index + 1).padStart(2, '0')}
              </span>
              
              {/* Title */}
              <h3 className="text-white text-base lg:text-lg leading-relaxed mb-4 line-clamp-3 group-hover:text-[#c9a962] transition-colors duration-500">
                {element?.title}
              </h3>
              
              {/* Read More */}
              <span className="btn-luxury text-luxury-sm text-[9px] tracking-[0.2em] text-[#666] group-hover:text-[#c9a962] inline-flex items-center gap-2">
                Read Article
                <svg className="w-3 h-3 group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
