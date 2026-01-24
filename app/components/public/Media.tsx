import { mediaType } from "@/lib/enums/mediaType";
import MediaPageProps from "@/lib/interfaces/props/MediaPageProps";
import { useState, useMemo, useEffect } from "react";
import MediaService from "@/services/MediaService";
import IMedia from "@/lib/interfaces/IMedia";
import VideoPlayer from "@/components/shared/VideoPlayer";

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
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);
  const [focusedMedia, setFocusedMedia] = useState<IMedia | null>(null);

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

  // Handle ESC key to close focus mode
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && focusedMedia) {
        setFocusedMedia(null);
        setPlayingVideoId(null);
      }
    };

    if (focusedMedia) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [focusedMedia]);

  const handleMediaClick = (media: IMedia) => {
    setFocusedMedia(media);
    // If this video is already playing, keep it playing in focus mode
    if (media.mediaType === mediaType.Video) {
      const videoId = media._id || media.mediaLink;
      // Only set playing if it's already playing
      if (playingVideoId === videoId) {
        // Already playing, keep it that way
      } else {
        // Not playing, don't auto-start
        setPlayingVideoId(null);
      }
    }
  };

  const handleCloseFocus = () => {
    setFocusedMedia(null);
    setPlayingVideoId(null);
  };

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
            {filteredMedia.map((element, index) => {
              const videoId = element?._id || element?.mediaLink || `video-${index}`;
              const isPlaying = playingVideoId === videoId;

              return (
                <div 
                  key={element?._id || index} 
                  className="relative aspect-square rounded-xl overflow-hidden group cursor-pointer bg-neutral-900"
                  onClick={() => handleMediaClick(element)}
                >
                  {element?.mediaType === mediaType.Image ? (
                    <img 
                      src={element?.mediaLink} 
                      alt={element?.caption || `Recap ${index}`} 
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                      loading="lazy"
                    />
                  ) : (
                    <VideoPlayer
                      videoSrc={element?.mediaLink}
                      videoId={videoId}
                      isPlaying={isPlaying}
                      onPlay={(id) => setPlayingVideoId(id)}
                      onPause={() => setPlayingVideoId(null)}
                      className="w-full h-full z-30"
                    />
                  )}

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 z-20">
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
                </div>
              );
            })}
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

      {/* Focus Mode Modal */}
      {focusedMedia && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 lg:p-8"
          onClick={handleCloseFocus}
        >
          {/* Close Button */}
          <button
            onClick={handleCloseFocus}
            className="absolute top-4 right-4 lg:top-8 lg:right-8 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm flex items-center justify-center transition-all duration-300 hover:scale-110"
            aria-label="Close focus mode"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Media Container */}
          <div 
            className="relative w-full h-full max-w-7xl max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {focusedMedia.mediaType === mediaType.Image ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <img 
                  src={focusedMedia.mediaLink} 
                  alt={focusedMedia.caption || "Focused media"} 
                  className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                />
                {/* Caption and Tags */}
                {(focusedMedia.caption || (focusedMedia.hashtags && focusedMedia.hashtags.length > 0)) && (
                  <div className="mt-6 max-w-4xl text-center">
                    {focusedMedia.caption && (
                      <p className="text-white text-lg lg:text-xl font-medium mb-3">{focusedMedia.caption}</p>
                    )}
                    {focusedMedia.hashtags && focusedMedia.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center text-primary-500">
                        {focusedMedia.hashtags.map((tag: string) => (
                          <p key={tag} className="px-3 py-1.5 rounded-full text-sm bg-primary-500/10 border border-primary-500/30 text-primary-500">
                            #{tag}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                <div className="relative w-full max-w-6xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl">
                  <VideoPlayer
                    videoSrc={focusedMedia.mediaLink}
                    videoId={focusedMedia._id || focusedMedia.mediaLink}
                    isPlaying={playingVideoId === (focusedMedia._id || focusedMedia.mediaLink)}
                    onPlay={(id) => setPlayingVideoId(id)}
                    onPause={() => setPlayingVideoId(null)}
                    className="w-full h-full"
                  />
                </div>
                {/* Caption and Tags */}
                {(focusedMedia.caption || (focusedMedia.hashtags && focusedMedia.hashtags.length > 0)) && (
                  <div className="mt-6 max-w-4xl text-center">
                    {focusedMedia.caption && (
                      <p className="text-white text-lg lg:text-xl font-medium mb-3">{focusedMedia.caption}</p>
                    )}
                    {focusedMedia.hashtags && focusedMedia.hashtags.length > 0 && (
                      <div className="flex flex-wrap gap-2 justify-center text-primary-500">
                        {focusedMedia.hashtags.map((tag: string) => (
                          <p key={tag} className="px-3 py-1.5 rounded-full text-sm bg-primary-500/10 border border-primary-500/30 text-primary-500">
                            #{tag}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  )
}
