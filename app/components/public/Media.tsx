import { mediaType } from "@/lib/enums/mediaType";
import MediaPageProps from "@/lib/interfaces/props/MediaPageProps";
import { useState, useMemo, useEffect } from "react";
import MediaService from "@/services/MediaService";
import IMedia from "@/lib/interfaces/IMedia";

export default function Media(props: MediaPageProps) {
  const { initialTag } = props;

  const [allMedia, setAllMedia] = useState<IMedia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [selectedTag, setSelectedTag] = useState<string | null>(initialTag || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMedia, setTotalMedia] = useState(0);

  // Fetch media client-side
  useEffect(() => {
    async function fetchMedia() {
      try {
        setIsLoading(true);
        const mediaService = new MediaService();
        const response = await mediaService.getAllMedia(currentPage, itemsPerPage);
        // Handle both old format (array) and new format (object with media and pagination)
        if (Array.isArray(response)) {
          setAllMedia(response);
          setTotalMedia(response.length);
          setTotalPages(1);
        } else {
          setAllMedia(response.media || []);
          setTotalMedia(response.pagination?.total || 0);
          setTotalPages(response.pagination?.totalPages || 1);
        }
      } catch (error: any) {
        console.error('Failed to fetch media:', error);
        setAllMedia([]);
        setTotalMedia(0);
        setTotalPages(1);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMedia();
  }, [currentPage]);

  // Ensure allMedia is always an array to prevent crashes
  const safeMedia = Array.isArray(allMedia) ? allMedia : [];

  // Update selected tag when initialTag changes (from URL)
  useEffect(() => {
    if (initialTag) {
      setSelectedTag(initialTag);
    }
  }, [initialTag]);

  // Extract all unique hashtags from media
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    safeMedia.forEach(media => {
      media?.hashtags?.forEach((tag: string) => tags.add(tag));
    });
    return Array.from(tags);
  }, [safeMedia]);

  // Filter media based on active filter and selected tag
  const filteredMedia = useMemo(() => {
    return safeMedia.filter(media => {
      // Type filter
      if (activeFilter === 'images' && media?.mediaType !== mediaType.Image) return false;
      if (activeFilter === 'videos' && media?.mediaType !== mediaType.Video) return false;
      
      // Tag filter
      if (selectedTag && !media?.hashtags?.includes(selectedTag)) return false;
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCaption = media?.caption?.toLowerCase().includes(query);
        const matchesTags = media?.hashtags?.some((tag: string) => tag.toLowerCase().includes(query));
        if (!matchesCaption && !matchesTags) return false;
      }
      
      return true;
    });
  }, [safeMedia, activeFilter, selectedTag, searchQuery]);

  const filterButtons = [
    { key: 'all' as const, label: 'All', icon: '🎬' },
    { key: 'images' as const, label: 'Photos', icon: '📷' },
    { key: 'videos' as const, label: 'Videos', icon: '🎥' },
  ];

  return (
    <section className="bg-[#0a0a0a] w-full min-h-screen relative pt-[100px] pb-20">
      {/* Header */}
      <div className="px-4 lg:px-10 mb-8">
        <h1 className='text-4xl lg:text-6xl font-bold text-white mb-2'>Our Recaps</h1>
        <p className="text-neutral-400 text-lg">Relive the best moments from our events</p>
      </div>

      {/* Filters Section */}
      <div className="sticky top-0 z-10 bg-[#0a0a0a]/95 backdrop-blur-md border-y border-neutral-800/50 py-4 px-4 lg:px-10 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between">
          {/* Type Filters */}
          <div className="flex gap-2">
            {filterButtons.map(btn => (
              <button
                key={btn.key}
                onClick={() => setActiveFilter(btn.key)}
                className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 ${
                  activeFilter === btn.key 
                    ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25' 
                    : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50 hover:text-white'
                }`}
              >
                <span className="mr-1.5">{btn.icon}</span>
                {btn.label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by tags or caption..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full lg:w-80 pl-10 pr-4 py-2.5 bg-neutral-800/50 border border-neutral-700/50 rounded-xl text-white placeholder:text-neutral-500 focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20 transition-all"
            />
          </div>
        </div>

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                !selectedTag 
                  ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                  : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50'
              }`}
            >
              All Tags
            </button>
            {allTags.slice(0, 10).map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  selectedTag === tag 
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30' 
                    : 'bg-neutral-800/50 text-neutral-400 hover:bg-neutral-700/50'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="px-4 lg:px-10 mb-4">
        <p className="text-neutral-500 text-sm">
          Showing {filteredMedia.length} of {totalMedia} items
          {selectedTag && <span className="text-primary-400"> • Filtered by #{selectedTag}</span>}
        </p>
      </div>

      {/* Media Grid */}
      <div className="px-4 lg:px-10">
        {filteredMedia.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 lg:gap-4">
            {filteredMedia.map((element, index) => (
              <div 
                key={element?._id || index} 
                className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-neutral-900"
              >
                {element?.mediaType === mediaType.Image ? (
                  <img 
                    src={element?.mediaLink} 
                    alt={element?.caption || `Recap ${index}`} 
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                    loading="lazy"
                  />
                ) : (
                  <video
                    controls
                    preload="metadata"
                    playsInline
                    className="w-full h-full object-cover"
                  >
                    <source src={`${element?.mediaLink}#t=0.1`} type="video/mp4" />
                  </video>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  {element?.caption && (
                    <p className="text-white text-sm font-medium line-clamp-2 mb-2">{element.caption}</p>
                  )}
                  {element?.hashtags && element.hashtags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {element.hashtags.slice(0, 3).map((tag: string) => (
                        <span key={tag} className="text-xs text-primary-400">#{tag}</span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Video Indicator */}
                {element?.mediaType === mediaType.Video && (
                  <div className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-neutral-800/50 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 text-neutral-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No media found</h3>
            <p className="text-neutral-500">Try adjusting your filters or search query</p>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8 pt-8 border-t border-neutral-800/50">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-6 py-2.5 rounded-xl bg-neutral-800/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700/50 transition-colors font-medium"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-neutral-400 text-sm">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-6 py-2.5 rounded-xl bg-neutral-800/50 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-700/50 transition-colors font-medium"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
