import { mediaType } from '@/lib/enums/mediaType';
import useIntersectionObserverHook from '@/lib/hooks/IntersectionObserverHook';
import { RecapsProps } from '@/lib/interfaces/props/RecapsProps'
import { Link } from '@remix-run/react';
import { useMemo } from 'react'

export default function Recaps(props: RecapsProps) {
  const { allRecaps } = props;

  const safeRecaps = Array.isArray(allRecaps) ? allRecaps : [];
  const displayRecaps = safeRecaps.slice(0, 8);

  const { elementRef, isVisible } = useIntersectionObserverHook({ threshold: 0.1 });

  const topTags = useMemo(() => {
    const tagCounts: Record<string, number> = {};
    safeRecaps.forEach(recap => {
      recap?.hashtags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
    return Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [safeRecaps]);

  // Masonry sizing patterns for visual interest
  const getMasonryClass = (index: number) => {
    const patterns = [
      'col-span-1 row-span-1',
      'col-span-1 row-span-2',
      'col-span-1 row-span-1',
      'col-span-2 row-span-1',
      'col-span-1 row-span-1',
      'col-span-1 row-span-1',
      'col-span-1 row-span-2',
      'col-span-1 row-span-1',
    ];
    return patterns[index % patterns.length];
  };

  return (
    <section 
      id='recaps' 
      ref={elementRef} 
      className={`relative w-full bg-[#050505] py-16 lg:py-24 overflow-hidden ${isVisible ? "animate-fade-in-up" : "opacity-0"}`}
    >
      {/* Decorative gradient */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#c9a962]/5 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Header */}
      <div className='px-6 lg:px-16 mb-12 relative z-10'>
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-luxury-sm text-[10px] tracking-[0.3em] mb-4 text-[#666]">GALLERY</p>
            <h2 className='h2-luxury text-3xl lg:text-5xl text-white'>Moments Captured</h2>
          </div>
          
          {/* Tags - Luxury Style */}
          {topTags.length > 0 && (
            <div className="flex flex-wrap gap-3">
              {topTags.map(tag => (
                <Link 
                  key={tag}
                  to={`/media?tag=${encodeURIComponent(tag)}`}
                  className="text-luxury-sm text-[10px] tracking-[0.15em] px-4 py-2 border border-[#2a2a2a] hover:border-[#c9a962]/50 hover:text-[#c9a962] transition-all duration-500"
                >
                  {tag.toUpperCase()}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Masonry Grid */}
      <div className="px-6 lg:px-16">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[200px] lg:auto-rows-[240px] gap-3 lg:gap-4">
          {displayRecaps.map((element, index) => (
            <div 
              key={element?._id || index}
              className={`relative overflow-hidden group cursor-pointer hover-slow-zoom film-grain ${getMasonryClass(index)} animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {element?.mediaType === mediaType.Image ? (
                <img 
                  src={element?.mediaLink} 
                  alt={element?.caption || `Recap ${index}`} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              ) : (
                <video
                  preload="metadata"
                  playsInline
                  muted
                  loop
                  className="w-full h-full object-cover"
                  onMouseEnter={(e) => e.currentTarget.play()}
                  onMouseLeave={(e) => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                >
                  <source src={`${element?.mediaLink}#t=0.1`} type="video/mp4" />
                </video>
              )}

              {/* Vignette overlay - always visible */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#050505]/70 via-transparent to-transparent pointer-events-none" />

              {/* Hover overlay with info */}
              <div className="absolute inset-0 bg-[#050505]/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                {element?.hashtags && element.hashtags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {element.hashtags.slice(0, 3).map((tag: string) => (
                      <span key={tag} className="text-luxury-sm text-[9px] tracking-[0.15em] text-[#c9a962]">
                        #{tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Video Indicator */}
              {element?.mediaType === mediaType.Video && (
                <div className="absolute top-3 right-3 text-white/60">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* View All Link - Luxury Style */}
      <div className='mt-16 flex justify-center'>
        <Link 
          to='/media' 
          className='btn-outline-luxury inline-flex items-center gap-4 text-xs'
        >
          View Full Archive
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </Link>
      </div>
    </section>
  )
}
